-- ==========================================================
-- ACMRB — Auditoria das ações sobre administradores
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS de 20261020180000_admins_papeis.sql.
-- Pode ser rodado mais de uma vez.
--
-- Quem grava: somente as rotas do servidor (/api/admin/*), com a
-- service role (que ignora RLS). Ninguém grava pelo navegador.
-- Quem lê: somente o administrador deus.
-- ==========================================================

begin;

create table if not exists public.admin_auditoria (
  id          bigint generated always as identity primary key,
  ator_email  text not null,           -- quem fez
  acao        text not null,           -- ex.: criar_admin, trocar_email
  alvo_email  text,                    -- sobre quem
  detalhes    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists admin_auditoria_criado_idx on public.admin_auditoria (created_at desc);

alter table public.admin_auditoria enable row level security;

-- Sem políticas de insert/update/delete: só a service role escreve.
revoke all on public.admin_auditoria from anon, authenticated;
grant select on public.admin_auditoria to authenticated;
grant all on public.admin_auditoria to service_role;

drop policy if exists "auditoria: somente deus le" on public.admin_auditoria;
create policy "auditoria: somente deus le"
on public.admin_auditoria for select
to authenticated
using (public.is_deus());

commit;

-- Verificação (só leitura)
select item, case when ok then 'ok' else 'FALTANDO' end as situacao
from (values
  ('tabela admin_auditoria',      to_regclass('public.admin_auditoria') is not null),
  ('RLS ligada',                  (select relrowsecurity from pg_class where oid = 'public.admin_auditoria'::regclass)),
  ('anon sem leitura',            not has_table_privilege('anon', 'public.admin_auditoria', 'select')),
  ('authenticated sem gravação',  not has_table_privilege('authenticated', 'public.admin_auditoria', 'insert'))
) as t(item, ok);
