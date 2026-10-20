-- ============================================================
-- METAS PÚBLICAS DOS INDICADORES (dashboard_metricas)
-- Idempotente: pode rodar mais de uma vez sem erro.
-- Antes, as metas ficavam fixas no código (5000 kg, 10000 kg CO₂,
-- 300 famílias, 500 árvores). Agora podem ser editadas no banco.
-- Se a coluna ficar nula/0, o site usa a meta padrão do código.
-- ============================================================
alter table public.dashboard_metricas add column if not exists meta_residuos_kg numeric(14, 2);
alter table public.dashboard_metricas add column if not exists meta_co2_kg numeric(14, 2);
alter table public.dashboard_metricas add column if not exists meta_familias integer;
alter table public.dashboard_metricas add column if not exists meta_arvores numeric(14, 2);

comment on column public.dashboard_metricas.meta_residuos_kg is 'Meta pública de resíduos coletados (kg)';
comment on column public.dashboard_metricas.meta_co2_kg is 'Meta pública de CO₂ evitado (kg)';
comment on column public.dashboard_metricas.meta_familias is 'Meta pública de famílias impactadas';
comment on column public.dashboard_metricas.meta_arvores is 'Meta pública de árvores preservadas (equivalente)';
