-- ==========================================================
-- ACMRB — Bloquear / suspender / expulsar APARELHOS (e contas)
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS das migrations anteriores
-- (precisa de public.is_deus() e das tabelas de acessos).
-- Pode ser rodado mais de uma vez.
--
-- O que cria:
--   * dispositivos_bloqueios — bloqueios e suspensões de aparelhos
--     (id aleatório do navegador e, se o deus quiser, o "hash" da rede).
--     NÃO é apagada pela limpeza de 24 h dos anônimos.
--   * dispositivos_expulsoes — pedidos de "expulsar" (derrubar a sessão
--     e gerar um novo id). O navegador recebe o aviso no próximo batimento.
--   * dispositivos_admin — aparelhos de administradores (nunca bloqueáveis).
--   * acessos_sessoes.ip_hash — "impressão digital" da rede (nunca o IP).
--   * aparelhos_lista() — lista para o painel (só is_deus()).
--   * expulsar_usuario_auth() — encerra todas as sessões de uma conta.
-- Quem grava: SOMENTE o servidor (rotas /api, service role).
-- Quem lê: SOMENTE o ADM DEUS (is_deus()).
-- ==========================================================

begin;

-- 1. Impressão digital da rede nas visitas (some junto com a visita anônima, em 24 h)
alter table public.acessos_sessoes add column if not exists ip_hash text check (char_length(ip_hash) <= 64);
create index if not exists idx_acessos_sess_ip on public.acessos_sessoes (ip_hash) where ip_hash is not null;

-- 2. Bloqueios e suspensões
create table if not exists public.dispositivos_bloqueios (
  id                 uuid primary key default gen_random_uuid(),
  tipo               text not null check (tipo in ('bloqueio', 'suspensao')),
  dispositivo_id     uuid,                                        -- id aleatório do navegador (cookie acmrb_did)
  ip_hash            text check (char_length(ip_hash) <= 64),     -- opcional: bloqueia também a rede
  usuario_id         uuid references auth.users(id) on delete set null, -- se o aparelho era de uma conta
  motivo             text not null check (char_length(motivo) between 3 and 300),
  ate                timestamptz,                                 -- suspensão: quando termina (bloqueio: nulo = sem prazo)
  ativo              boolean not null default true,
  criado_em          timestamptz not null default now(),
  criado_por         text not null,                               -- e-mail do deus
  desbloqueado_em    timestamptz,
  desbloqueado_por   text,
  desbloqueio_motivo text check (char_length(desbloqueio_motivo) <= 300),
  tentativas         integer not null default 0,                  -- reservado (contagem de tentativas bloqueadas)
  constraint bloqueio_tem_alvo check (dispositivo_id is not null or ip_hash is not null),
  constraint suspensao_tem_prazo check (tipo <> 'suspensao' or ate is not null)
);
create index if not exists idx_disp_bloq_ativos on public.dispositivos_bloqueios (ativo) where ativo;
create index if not exists idx_disp_bloq_disp   on public.dispositivos_bloqueios (dispositivo_id, criado_em desc);
create index if not exists idx_disp_bloq_ip     on public.dispositivos_bloqueios (ip_hash) where ip_hash is not null;

-- 3. Expulsões (pedido pendente até o navegador receber o aviso)
create table if not exists public.dispositivos_expulsoes (
  id             uuid primary key default gen_random_uuid(),
  dispositivo_id uuid,
  usuario_id     uuid references auth.users(id) on delete cascade,
  motivo         text not null check (char_length(motivo) between 3 and 300),
  criado_em      timestamptz not null default now(),
  criado_por     text not null,
  entregue_em    timestamptz,
  constraint expulsao_tem_alvo check (dispositivo_id is not null or usuario_id is not null)
);
create index if not exists idx_disp_exp_pend_disp on public.dispositivos_expulsoes (dispositivo_id) where entregue_em is null;
create index if not exists idx_disp_exp_pend_user on public.dispositivos_expulsoes (usuario_id) where entregue_em is null;

-- 4. Aparelhos de administradores (o servidor preenche quando um admin navega; nunca são bloqueados)
create table if not exists public.dispositivos_admin (
  dispositivo_id uuid primary key,
  visto_em       timestamptz not null default now()
);

-- 5. RLS: ninguém grava pelo navegador; só o deus lê
alter table public.dispositivos_bloqueios enable row level security;
alter table public.dispositivos_expulsoes enable row level security;
alter table public.dispositivos_admin     enable row level security;

revoke all on public.dispositivos_bloqueios, public.dispositivos_expulsoes, public.dispositivos_admin from anon, authenticated;
grant select on public.dispositivos_bloqueios, public.dispositivos_expulsoes to authenticated;
grant all on public.dispositivos_bloqueios, public.dispositivos_expulsoes, public.dispositivos_admin to service_role;

drop policy if exists dispositivos_bloqueios_deus_le on public.dispositivos_bloqueios;
create policy dispositivos_bloqueios_deus_le on public.dispositivos_bloqueios for select to authenticated using (public.is_deus());
drop policy if exists dispositivos_expulsoes_deus_le on public.dispositivos_expulsoes;
create policy dispositivos_expulsoes_deus_le on public.dispositivos_expulsoes for select to authenticated using (public.is_deus());

-- 6. Lista de aparelhos para o painel (anônimos e logados) com a situação de cada um
create or replace function public.aparelhos_lista(
  p_filtro  text default 'todos',    -- todos | ativos | bloqueados | suspensos | online
  p_quem    text default 'todos',    -- todos | anonimos | logados
  p_busca   text default null,       -- id completo, parte do id, cidade ou nome
  p_limite  integer default 20,
  p_desloc  integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_resultado jsonb;
begin
  if not public.is_deus() then
    raise exception 'Somente o ADM DEUS pode ver os aparelhos.' using errcode = '42501';
  end if;

  with ult as (
    select distinct on (s.anon_id)
           s.anon_id, s.auth_user_id, s.ultima_atividade, s.encerrada_em, s.dispositivo, s.navegador, s.sistema,
           s.cidade, s.regiao, s.pais, (s.ip_hash is not null) as tem_rede
      from public.acessos_sessoes s
     order by s.anon_id, s.ultima_atividade desc
  ),
  tot as (
    select s.anon_id, count(*)::int as sessoes, coalesce(sum(s.paginas), 0)::int as paginas,
           coalesce(sum(s.duracao_seg), 0)::bigint as duracao_seg, min(s.iniciada_em) as primeira,
           bool_or(s.auth_user_id is not null) as logado
      from public.acessos_sessoes s
     group by s.anon_id
  ),
  bl as (
    select distinct on (b.dispositivo_id)
           b.dispositivo_id, b.id as bloqueio_id, b.tipo, b.motivo, b.ate, b.criado_em as bloqueado_em, b.criado_por, (b.ip_hash is not null) as com_rede
      from public.dispositivos_bloqueios b
     where b.ativo and b.dispositivo_id is not null and (b.tipo = 'bloqueio' or b.ate > now())
     order by b.dispositivo_id, b.criado_em desc
  ),
  base as (
    select coalesce(u.anon_id, b.dispositivo_id) as anon_id,
           u.auth_user_id, v.nome, u.ultima_atividade, u.encerrada_em, u.dispositivo, u.navegador, u.sistema,
           u.cidade, u.regiao, u.pais, t.sessoes, t.paginas, t.duracao_seg, t.primeira, coalesce(t.logado, false) as logado,
           b.bloqueio_id, b.tipo as bloqueio_tipo, b.motivo, b.ate, b.bloqueado_em, b.criado_por as bloqueado_por, coalesce(b.com_rede, false) as com_rede,
           case when b.tipo = 'bloqueio' then 'bloqueado' when b.tipo = 'suspensao' then 'suspenso' else 'ativo' end as situacao,
           (u.ultima_atividade > now() - interval '2 minutes' and u.encerrada_em is null) as online
      from ult u
      full join bl b on b.dispositivo_id = u.anon_id
      left join tot t on t.anon_id = coalesce(u.anon_id, b.dispositivo_id)
      left join public.visitantes v on v.auth_user_id = u.auth_user_id
  ),
  filtrada as (
    select * from base x
     where (p_filtro = 'todos' or p_filtro is null
            or (p_filtro = 'ativos' and x.situacao = 'ativo')
            or (p_filtro = 'bloqueados' and x.situacao = 'bloqueado')
            or (p_filtro = 'suspensos' and x.situacao = 'suspenso')
            or (p_filtro = 'online' and x.online))
       and (p_quem = 'todos' or p_quem is null
            or (p_quem = 'anonimos' and not x.logado)
            or (p_quem = 'logados' and x.logado))
       and (coalesce(trim(p_busca), '') = ''
            or x.anon_id::text ilike '%' || trim(p_busca) || '%'
            or x.cidade ilike '%' || trim(p_busca) || '%'
            or x.nome ilike '%' || trim(p_busca) || '%')
  )
  select jsonb_build_object(
           'total', (select count(*) from filtrada),
           'itens', coalesce((
             select jsonb_agg(to_jsonb(f) order by f.ultima_atividade desc nulls last)
               from (select * from filtrada order by ultima_atividade desc nulls last
                      limit greatest(least(p_limite, 100), 1) offset greatest(p_desloc, 0)) f
           ), '[]'::jsonb)
         )
    into v_resultado;

  return v_resultado;
end;
$$;

revoke all on function public.aparelhos_lista(text, text, text, integer, integer) from public, anon;
grant execute on function public.aparelhos_lista(text, text, text, integer, integer) to authenticated;

-- 7. Encerra todas as sessões de login de uma conta (só o servidor chama)
create or replace function public.expulsar_usuario_auth(p_usuario uuid)
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_qtd integer := 0;
begin
  -- apagar a sessão apaga junto os refresh tokens (cascata do Auth): o login não renova mais
  delete from auth.sessions where user_id = p_usuario;
  get diagnostics v_qtd = row_count;
  return v_qtd;
end;
$$;

revoke all on function public.expulsar_usuario_auth(uuid) from public, anon, authenticated;
grant execute on function public.expulsar_usuario_auth(uuid) to service_role;

commit;

-- Verificação (só leitura)
select item, case when ok then 'ok' else 'FALTANDO' end as situacao
from (values
  ('tabela dispositivos_bloqueios',  to_regclass('public.dispositivos_bloqueios') is not null),
  ('tabela dispositivos_expulsoes',  to_regclass('public.dispositivos_expulsoes') is not null),
  ('tabela dispositivos_admin',      to_regclass('public.dispositivos_admin') is not null),
  ('anon sem leitura',               not has_table_privilege('anon', 'public.dispositivos_bloqueios', 'select')),
  ('authenticated sem gravação',     not has_table_privilege('authenticated', 'public.dispositivos_bloqueios', 'insert')),
  ('função aparelhos_lista',         to_regprocedure('public.aparelhos_lista(text,text,text,integer,integer)') is not null),
  ('função expulsar_usuario_auth',   to_regprocedure('public.expulsar_usuario_auth(uuid)') is not null)
) as t(item, ok);
