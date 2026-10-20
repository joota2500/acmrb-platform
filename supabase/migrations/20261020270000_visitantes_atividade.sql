-- ==========================================================
-- ACMRB — Atividade dos VISITANTES (sessões e eventos) + acesso só do deus
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS de 20261020260000_visitantes_perfil.sql.
-- Pode ser rodado mais de uma vez.
--
-- O que faz:
--  1. visitante_sessoes: cada login/aba do visitante (início, última
--     atividade, fim, duração em segundos, navegador).
--  2. visitante_eventos: páginas vistas e cliques (rótulo, seletor,
--     caminho). NUNCA guarda valores digitados nem senhas.
--  3. RLS: o visitante só INSERE as próprias linhas; só o deus lê e apaga.
--     Admins não são registrados.
--  4. visitante_sessao_ping(): atualiza a última atividade / encerra /
--     retoma a própria sessão (o visitante não tem UPDATE direto).
--  5. View visitantes_atividade_resumo (respeita RLS: só o deus vê).
--  6. Tabela visitantes passa a ser gerenciada SÓ pelo deus no painel
--     (antes qualquer admin ativo).
-- ==========================================================

begin;

-- 1. Sessões
create table if not exists public.visitante_sessoes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  iniciada_em timestamptz not null default now(),
  ultima_atividade timestamptz not null default now(),
  encerrada_em timestamptz,
  duracao_seg integer not null default 0 check (duracao_seg >= 0),
  user_agent text check (char_length(user_agent) <= 400)
);
create index if not exists idx_vis_sessoes_usuario on public.visitante_sessoes(auth_user_id, iniciada_em desc);

-- 2. Eventos
create table if not exists public.visitante_eventos (
  id bigint generated always as identity primary key,
  sessao_id uuid references public.visitante_sessoes(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('pagina', 'clique')),
  caminho text not null check (char_length(caminho) <= 300),
  rotulo text check (char_length(rotulo) <= 120),
  alvo text check (char_length(alvo) <= 200),
  criado_em timestamptz not null default now()
);
create index if not exists idx_vis_eventos_usuario on public.visitante_eventos(auth_user_id, criado_em desc);
create index if not exists idx_vis_eventos_sessao on public.visitante_eventos(sessao_id);

-- 3. RLS
alter table public.visitante_sessoes enable row level security;
alter table public.visitante_eventos enable row level security;

drop policy if exists "visitante insere a propria sessao" on public.visitante_sessoes;
create policy "visitante insere a propria sessao"
on public.visitante_sessoes for insert
to authenticated
with check (auth.uid() = auth_user_id and not public.is_active_admin());

drop policy if exists "deus le sessoes" on public.visitante_sessoes;
create policy "deus le sessoes"
on public.visitante_sessoes for select
to authenticated
using (public.is_deus());

drop policy if exists "deus apaga sessoes" on public.visitante_sessoes;
create policy "deus apaga sessoes"
on public.visitante_sessoes for delete
to authenticated
using (public.is_deus());

drop policy if exists "visitante insere os proprios eventos" on public.visitante_eventos;
create policy "visitante insere os proprios eventos"
on public.visitante_eventos for insert
to authenticated
with check (auth.uid() = auth_user_id and not public.is_active_admin());

drop policy if exists "deus le eventos" on public.visitante_eventos;
create policy "deus le eventos"
on public.visitante_eventos for select
to authenticated
using (public.is_deus());

drop policy if exists "deus apaga eventos" on public.visitante_eventos;
create policy "deus apaga eventos"
on public.visitante_eventos for delete
to authenticated
using (public.is_deus());

-- 4. Ping da sessão: p_acao = 'ping' | 'encerrar' | 'retomar'
--    'retomar' só reabre se a última atividade foi há menos de 30 min.
--    Retorna true se a sessão (do próprio usuário) foi atualizada.
create or replace function public.visitante_sessao_ping(p_id uuid, p_acao text default 'ping')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  linhas int;
begin
  if auth.uid() is null then
    return false;
  end if;

  if p_acao = 'retomar' then
    update public.visitante_sessoes
       set encerrada_em = null,
           ultima_atividade = now(),
           duracao_seg = greatest(0, extract(epoch from now() - iniciada_em)::int)
     where id = p_id and auth_user_id = auth.uid()
       and ultima_atividade > now() - interval '30 minutes';
  else
    update public.visitante_sessoes
       set ultima_atividade = now(),
           duracao_seg = greatest(0, extract(epoch from now() - iniciada_em)::int),
           encerrada_em = case when p_acao = 'encerrar' then now() else encerrada_em end
     where id = p_id and auth_user_id = auth.uid()
       and (encerrada_em is null or p_acao = 'encerrar');
  end if;

  get diagnostics linhas = row_count;
  return linhas > 0;
end;
$$;

revoke all on function public.visitante_sessao_ping(uuid, text) from public, anon;
grant execute on function public.visitante_sessao_ping(uuid, text) to authenticated;

-- 5. Resumo por visitante (security_invoker: aplica a RLS de quem consulta)
create or replace view public.visitantes_atividade_resumo
with (security_invoker = true) as
select
  auth_user_id,
  count(*)::int as total_logins,
  coalesce(sum(duracao_seg), 0)::bigint as total_seg,
  max(ultima_atividade) as ultimo_acesso
from public.visitante_sessoes
group by auth_user_id;

grant select on public.visitantes_atividade_resumo to authenticated;

-- 6. Visitantes: gestão só pelo deus (o visitante continua com a própria linha)
drop policy if exists "authenticated admins can manage visitantes" on public.visitantes;
drop policy if exists "deus gerencia visitantes" on public.visitantes;
create policy "deus gerencia visitantes"
on public.visitantes for all
to authenticated
using (public.is_deus())
with check (public.is_deus());

commit;
