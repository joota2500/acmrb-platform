-- ==========================================================
-- ACMRB — Calendário de coleta por bairro
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS de 20261020270000_visitantes_atividade.sql.
-- Pode ser rodado mais de uma vez.
--
-- Uma linha = um bairro (ou trecho) com dias da semana, janela de
-- horário e materiais recolhidos. Público lê só os ativos; admins
-- (deus e normal) gerenciam tudo.
-- ==========================================================

begin;

create table if not exists public.coleta_calendario (
  id uuid primary key default gen_random_uuid(),
  bairro text not null check (char_length(trim(bairro)) between 2 and 80),
  -- 0 = domingo … 6 = sábado
  dias_semana smallint[] not null default '{}'
    check (dias_semana <@ array[0,1,2,3,4,5,6]::smallint[]),
  hora_inicio time,
  hora_fim time,
  materiais text[] not null default '{}',
  observacoes text check (char_length(observacoes) <= 500),
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coleta_calendario_horas check (hora_inicio is null or hora_fim is null or hora_fim > hora_inicio)
);

create index if not exists idx_coleta_calendario_bairro on public.coleta_calendario (lower(bairro));

drop trigger if exists set_coleta_calendario_updated_at on public.coleta_calendario;
create trigger set_coleta_calendario_updated_at
before update on public.coleta_calendario
for each row execute function public.set_updated_at();

alter table public.coleta_calendario enable row level security;

drop policy if exists "publico le calendario ativo" on public.coleta_calendario;
create policy "publico le calendario ativo"
on public.coleta_calendario for select
to anon, authenticated
using (ativo = true or public.is_active_admin());

drop policy if exists "admins gerenciam calendario" on public.coleta_calendario;
create policy "admins gerenciam calendario"
on public.coleta_calendario for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

grant select on public.coleta_calendario to anon, authenticated;
grant insert, update, delete on public.coleta_calendario to authenticated;

commit;
