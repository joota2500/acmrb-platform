-- ============================================================
-- TRANSPARÊNCIA COMPLETA (página /transparencia)
-- Idempotente: pode rodar mais de uma vez sem erro.
-- Rode DEPOIS de 20261020200000_metas_transparencia.sql
-- (este arquivo também garante as colunas meta_*, então funciona
-- mesmo que aquele ainda não tenha sido rodado).
--
-- 1. Campos públicos extras em dashboard_metricas (preenchidos à mão
--    pelo ADM DEUS em Painel › Indicadores ESG).
-- 2. Tabela transparencia_documentos (relatórios, prestações de
--    contas, certificados) + RLS: público lê só os publicados;
--    qualquer admin ativo cria/edita (Painel › Relatórios).
-- 3. Subtotal de materiais_registros calculado pelo banco
--    (peso × valor_kg), para o "Valor operacional" sempre bater.
-- ============================================================

-- 1. dashboard_metricas -------------------------------------------------
alter table public.dashboard_metricas add column if not exists co2_evitado numeric(14, 2) not null default 0;
alter table public.dashboard_metricas add column if not exists familias_impactadas integer not null default 0;
alter table public.dashboard_metricas add column if not exists catadores_ativos integer not null default 0;
alter table public.dashboard_metricas add column if not exists empresas_parceiras integer not null default 0;
alter table public.dashboard_metricas add column if not exists coletas_realizadas integer not null default 0;
alter table public.dashboard_metricas add column if not exists bairros_atendidos integer not null default 0;
alter table public.dashboard_metricas add column if not exists residuos_desviados_aterro numeric(14, 2) not null default 0;
alter table public.dashboard_metricas add column if not exists educacao_ambiental_acoes integer not null default 0;
alter table public.dashboard_metricas add column if not exists pessoas_impactadas integer not null default 0;
alter table public.dashboard_metricas add column if not exists arvores_preservadas numeric(14, 2) not null default 0;
alter table public.dashboard_metricas add column if not exists agua_economizada numeric(14, 2) not null default 0;
alter table public.dashboard_metricas add column if not exists energia_economizada numeric(14, 2) not null default 0;
alter table public.dashboard_metricas add column if not exists meta_residuos_kg numeric(14, 2);
alter table public.dashboard_metricas add column if not exists meta_co2_kg numeric(14, 2);
alter table public.dashboard_metricas add column if not exists meta_familias integer;
alter table public.dashboard_metricas add column if not exists meta_arvores numeric(14, 2);
-- Novos
alter table public.dashboard_metricas add column if not exists escolas_atendidas integer not null default 0;
alter table public.dashboard_metricas add column if not exists pontos_coleta integer not null default 0;
alter table public.dashboard_metricas add column if not exists periodo_referencia text;
alter table public.dashboard_metricas add column if not exists observacao_publica text;
alter table public.dashboard_metricas add column if not exists updated_at timestamptz not null default now();

comment on column public.dashboard_metricas.agua_economizada is 'Água economizada (litros) — informada manualmente';
comment on column public.dashboard_metricas.energia_economizada is 'Energia economizada (kWh) — informada manualmente';
comment on column public.dashboard_metricas.residuos_desviados_aterro is 'Resíduos desviados do aterro (kg) — informado manualmente';
comment on column public.dashboard_metricas.escolas_atendidas is 'Escolas atendidas por ações de educação ambiental';
comment on column public.dashboard_metricas.pontos_coleta is 'Pontos de coleta / entrega voluntária ativos';
comment on column public.dashboard_metricas.periodo_referencia is 'Texto público do período dos dados (ex.: "Jan–Out/2026")';
comment on column public.dashboard_metricas.observacao_publica is 'Nota pública exibida na página de transparência';

-- 2. transparencia_documentos ------------------------------------------
create table if not exists public.transparencia_documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  categoria text not null default 'relatorio',
  url_arquivo text not null,
  ano integer,
  publicado boolean not null default false,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transp_docs_publicado on public.transparencia_documentos (publicado, ano desc);

alter table public.transparencia_documentos enable row level security;

drop policy if exists "publico le documentos publicados" on public.transparencia_documentos;
create policy "publico le documentos publicados"
on public.transparencia_documentos for select
to anon, authenticated
using (publicado = true or public.is_active_admin());

drop policy if exists "admins gerenciam documentos" on public.transparencia_documentos;
create policy "admins gerenciam documentos"
on public.transparencia_documentos for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

grant select on public.transparencia_documentos to anon, authenticated;
grant insert, update, delete on public.transparencia_documentos to authenticated;

drop trigger if exists set_transparencia_documentos_updated_at on public.transparencia_documentos;
create trigger set_transparencia_documentos_updated_at
before update on public.transparencia_documentos
for each row execute function public.set_updated_at();

-- 3. Subtotal automático ------------------------------------------------
create or replace function public.calcular_subtotal_material()
returns trigger
language plpgsql
as $$
begin
  new.valor_kg := coalesce(new.valor_kg, 0);
  new.subtotal := round(coalesce(new.peso, 0) * new.valor_kg, 2);
  return new;
end;
$$;

drop trigger if exists calcular_subtotal_materiais_registros on public.materiais_registros;
create trigger calcular_subtotal_materiais_registros
before insert or update of peso, valor_kg on public.materiais_registros
for each row execute function public.calcular_subtotal_material();

-- Corrige registros antigos (subtotal fora de peso × valor_kg)
update public.materiais_registros
set subtotal = round(peso * coalesce(valor_kg, 0), 2)
where subtotal is distinct from round(peso * coalesce(valor_kg, 0), 2);

-- Conferência
select 'transparencia_documentos' as item, to_regclass('public.transparencia_documentos') is not null as ok
union all
select 'coluna observacao_publica', exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'dashboard_metricas' and column_name = 'observacao_publica');
