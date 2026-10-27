-- ==========================================================
-- ACMRB — Segurança: limite de tentativas, log de logins,
--          auditoria automática e limite de envio
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS de 20261027100000_acessos_site.sql.
-- Pode ser rodado mais de uma vez.
--
-- 1. rate_limit_contadores + rate_limit_hit(): contador por janela de
--    tempo, usado pelas rotas /api do site (no servidor, service role).
-- 2. login_tentativas: registro de logins (certos e errados), cadastros e
--    pedidos de nova senha. Sem IP cru: só "hash" (impressão digital que
--    não volta ao IP) e e-mail mascarado (j***@gmail.com). Só o deus lê.
-- 3. login_bloqueio(): bloqueio temporário após falhas seguidas.
-- 4. Auditoria automática (admin_auditoria) de tudo que um administrador
--    cria/altera/apaga nas tabelas do painel: feita pelo próprio banco,
--    então não depende do navegador.
-- 5. Limite de envio no banco para mensagens de chat/coleta, pedidos de
--    coleta e registros de atividade (anti-flood), mesmo se alguém ignorar o site e falar direto
--    com a API do Supabase.
-- ==========================================================

begin;

-- 1. Contador de limite de uso ------------------------------------------
create table if not exists public.rate_limit_contadores (
  chave    text not null,
  janela   timestamptz not null,
  contagem integer not null default 0,
  primary key (chave, janela)
);
alter table public.rate_limit_contadores enable row level security;
revoke all on public.rate_limit_contadores from anon, authenticated;
grant all on public.rate_limit_contadores to service_role;

-- Soma 1 e diz se ainda está dentro do limite
create or replace function public.rate_limit_hit(p_chave text, p_janela_seg integer, p_max integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seg integer := greatest(p_janela_seg, 1);
  v_janela timestamptz := to_timestamp(floor(extract(epoch from now()) / v_seg) * v_seg);
  v_n integer;
begin
  insert into public.rate_limit_contadores as c (chave, janela, contagem)
  values (left(p_chave, 200), v_janela, 1)
  on conflict (chave, janela) do update set contagem = c.contagem + 1
  returning contagem into v_n;

  return jsonb_build_object(
    'permitido', v_n <= p_max,
    'contagem', v_n,
    'restante_seg', greatest(1, ceil(extract(epoch from (v_janela + make_interval(secs => v_seg) - now())))::int)
  );
end;
$$;
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

-- 2. Log de tentativas de login/cadastro ---------------------------------
create table if not exists public.login_tentativas (
  id              bigint generated always as identity primary key,
  criado_em       timestamptz not null default now(),
  tipo            text not null default 'login' check (tipo in ('login', 'cadastro', 'recuperar')),
  sucesso         boolean not null,
  motivo          text check (char_length(motivo) <= 80),
  email_hash      text not null,
  email_mascarado text check (char_length(email_mascarado) <= 120),
  ip_hash         text,
  auth_user_id    uuid references auth.users(id) on delete set null,
  dispositivo     text check (char_length(dispositivo) <= 20),
  navegador       text check (char_length(navegador) <= 40),
  cidade          text check (char_length(cidade) <= 80),
  regiao          text check (char_length(regiao) <= 80),
  pais            text check (char_length(pais) <= 80)
);
create index if not exists idx_login_tent_criado on public.login_tentativas (criado_em desc);
create index if not exists idx_login_tent_email  on public.login_tentativas (email_hash, criado_em desc);
create index if not exists idx_login_tent_ip     on public.login_tentativas (ip_hash, criado_em desc);
create index if not exists idx_login_tent_usuario on public.login_tentativas (auth_user_id, criado_em desc) where auth_user_id is not null;

alter table public.login_tentativas enable row level security;
revoke all on public.login_tentativas from anon, authenticated;
grant select, delete on public.login_tentativas to authenticated;
grant all on public.login_tentativas to service_role;
grant usage, select on sequence public.login_tentativas_id_seq to service_role;

drop policy if exists login_tentativas_deus_le on public.login_tentativas;
create policy login_tentativas_deus_le on public.login_tentativas for select to authenticated using (public.is_deus());
drop policy if exists login_tentativas_deus_apaga on public.login_tentativas;
create policy login_tentativas_deus_apaga on public.login_tentativas for delete to authenticated using (public.is_deus());

-- 3. Bloqueio temporário: segundos que faltam (0 = liberado)
--    Regras (janela de 15 min, contando só as falhas DEPOIS do último acerto):
--      • 5 falhas do mesmo e-mail vindas do mesmo aparelho/rede → bloqueia
--      • 20 falhas da mesma rede com e-mails diferentes → bloqueia a rede
create or replace function public.login_bloqueio(p_email_hash text, p_ip_hash text)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_janela interval := interval '15 minutes';
  v_ultimo_ok timestamptz;
  v_n_par integer;
  v_ult_par timestamptz;
  v_n_ip integer;
  v_ult_ip timestamptz;
  v_fim timestamptz;
begin
  select max(criado_em) into v_ultimo_ok
    from public.login_tentativas
   where tipo = 'login' and sucesso and email_hash = p_email_hash and ip_hash is not distinct from p_ip_hash;

  select count(*), max(criado_em) into v_n_par, v_ult_par
    from public.login_tentativas
   where tipo = 'login' and not sucesso and email_hash = p_email_hash and ip_hash is not distinct from p_ip_hash
     and criado_em > now() - v_janela and criado_em > coalesce(v_ultimo_ok, '-infinity');

  select count(*), max(criado_em) into v_n_ip, v_ult_ip
    from public.login_tentativas
   where tipo = 'login' and not sucesso and p_ip_hash is not null and ip_hash = p_ip_hash
     and criado_em > now() - v_janela;

  v_fim := greatest(
    case when v_n_par >= 5 then v_ult_par + v_janela end,
    case when v_n_ip >= 20 then v_ult_ip + v_janela end
  );
  if v_fim is null or v_fim <= now() then
    return 0;
  end if;
  return ceil(extract(epoch from (v_fim - now())))::int;
end;
$$;
revoke all on function public.login_bloqueio(text, text) from public, anon, authenticated;
grant execute on function public.login_bloqueio(text, text) to service_role;

-- 4. Manutenção dos logs de segurança
create or replace function public.seguranca_limpar()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a integer; b integer;
begin
  delete from public.rate_limit_contadores where janela < now() - interval '1 day';
  get diagnostics a = row_count;
  delete from public.login_tentativas where criado_em < now() - interval '90 days';
  get diagnostics b = row_count;
  return jsonb_build_object('contadores_apagados', a, 'tentativas_apagadas', b);
end;
$$;
revoke all on function public.seguranca_limpar() from public, anon, authenticated;
grant execute on function public.seguranca_limpar() to service_role;

-- 5. Auditoria automática de ações de administradores --------------------
-- Grava em admin_auditoria QUEM (e-mail do login) fez O QUÊ (criar/editar/
-- excluir + tabela) e quais colunas mudaram. Nunca grava o conteúdo dos
-- campos (só um rótulo curto: título ou nome), para não duplicar dados
-- pessoais. Só registra quando quem agiu é administrador ativo.
create or replace function public.auditar_alteracao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_novo jsonb;
  v_velho jsonb;
  v_ref jsonb;
  v_campos jsonb;
begin
  begin
    if auth.uid() is null or not public.is_active_admin() then
      return null;
    end if;

    if tg_op = 'DELETE' then
      v_velho := to_jsonb(old);
    elsif tg_op = 'INSERT' then
      v_novo := to_jsonb(new);
    else
      v_velho := to_jsonb(old);
      v_novo := to_jsonb(new);
    end if;
    v_ref := coalesce(v_novo, v_velho);

    if tg_op = 'UPDATE' then
      select coalesce(jsonb_agg(n.key order by n.key), '[]'::jsonb) into v_campos
        from jsonb_each(v_novo) n
       where n.key not in ('updated_at', 'atualizado_em')
         and n.value is distinct from (v_velho -> n.key);
      -- Nada mudou de verdade: não registra
      if jsonb_array_length(v_campos) = 0 then
        return null;
      end if;
    end if;

    insert into public.admin_auditoria (ator_email, acao, alvo_email, detalhes)
    values (
      coalesce(auth.email(), 'desconhecido'),
      lower(tg_op) || ':' || tg_table_name,
      null,
      jsonb_strip_nulls(jsonb_build_object(
        'tabela', tg_table_name,
        'registro', v_ref ->> 'id',
        'rotulo', left(coalesce(v_ref ->> 'titulo', v_ref ->> 'nome', v_ref ->> 'razao_social', v_ref ->> 'bairro', v_ref ->> 'email'), 80),
        'campos', v_campos
      ))
    );
  exception when others then
    -- A auditoria nunca pode impedir o trabalho do administrador
    raise warning 'auditar_alteracao falhou em %: %', tg_table_name, sqlerrm;
  end;
  return null;   -- gatilho AFTER: o retorno é ignorado
end;
$$;
revoke all on function public.auditar_alteracao() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'noticias', 'associados', 'apoiadores', 'empresas_logistica', 'repasses_logistica',
    'parceiros', 'quem_somos_conteudo', 'transparencia_documentos', 'coleta_calendario',
    'dashboard_metricas', 'coleta_solicitacoes', 'admins'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists auditar_%1$s on public.%1$I', t);
      execute format('create trigger auditar_%1$s after insert or update or delete on public.%1$I for each row execute function public.auditar_alteracao()', t);
    end if;
  end loop;
end $$;

-- 6. Limite de envio (anti-flood) no banco -------------------------------
-- Administradores ficam de fora. Ajuste os números se precisar.
create or replace function public.limitar_envio()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_autor uuid;
  v_n integer;
begin
  if public.is_active_admin() then
    return new;
  end if;

  if tg_table_name = 'chat_mensagens' then
    v_autor := new.autor_id;
    select count(*) into v_n from public.chat_mensagens where autor_id = v_autor and created_at > now() - interval '1 minute';
    if v_n >= 15 then raise exception 'Muitas mensagens seguidas. Aguarde um minuto.' using errcode = 'P0001'; end if;
    select count(*) into v_n from public.chat_mensagens where autor_id = v_autor and created_at > now() - interval '1 day';
    if v_n >= 300 then raise exception 'Limite diário de mensagens atingido.' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'coleta_mensagens' then
    v_autor := new.autor_id;
    select count(*) into v_n from public.coleta_mensagens where autor_id = v_autor and created_at > now() - interval '1 minute';
    if v_n >= 15 then raise exception 'Muitas mensagens seguidas. Aguarde um minuto.' using errcode = 'P0001'; end if;
    select count(*) into v_n from public.coleta_mensagens where autor_id = v_autor and created_at > now() - interval '1 day';
    if v_n >= 300 then raise exception 'Limite diário de mensagens atingido.' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'visitante_eventos' then
    -- o site envia no máximo ~20 eventos a cada 10 s; 600 por minuto já é abuso
    select count(*) into v_n from public.visitante_eventos where auth_user_id = new.auth_user_id and criado_em > now() - interval '1 minute';
    if v_n >= 600 then raise exception 'Muitos registros de atividade. Aguarde um minuto.' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'visitante_sessoes' then
    select count(*) into v_n from public.visitante_sessoes where auth_user_id = new.auth_user_id and iniciada_em > now() - interval '1 hour';
    if v_n >= 60 then raise exception 'Muitas sessões abertas em pouco tempo.' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'coleta_solicitacoes' then
    v_autor := new.auth_user_id;
    select count(*) into v_n from public.coleta_solicitacoes where auth_user_id = v_autor and created_at > now() - interval '1 day';
    if v_n >= 10 then raise exception 'Limite de pedidos de coleta por dia atingido. Tente amanhã.' using errcode = 'P0001'; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.limitar_envio() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['chat_mensagens', 'coleta_mensagens', 'coleta_solicitacoes', 'visitante_eventos', 'visitante_sessoes'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists limitar_envio_%1$s on public.%1$I', t);
      execute format('create trigger limitar_envio_%1$s before insert on public.%1$I for each row execute function public.limitar_envio()', t);
    end if;
  end loop;
end $$;

commit;

-- Verificação (só leitura)
select item, case when ok then 'ok' else 'FALTANDO' end as situacao
from (values
  ('rate_limit_hit',               to_regprocedure('public.rate_limit_hit(text,integer,integer)') is not null),
  ('tabela login_tentativas',      to_regclass('public.login_tentativas') is not null),
  ('login_bloqueio',               to_regprocedure('public.login_bloqueio(text,text)') is not null),
  ('anon sem acesso ao log',       not has_table_privilege('anon', 'public.login_tentativas', 'select')),
  ('gatilho de auditoria (noticias)', exists (select 1 from pg_trigger where tgname = 'auditar_noticias')),
  ('gatilho anti-flood (chat)',    exists (select 1 from pg_trigger where tgname = 'limitar_envio_chat_mensagens'))
) as t(item, ok);
