-- ============================================================
-- Logística reversa no mapa (20261020250000)
-- ------------------------------------------------------------
-- Pode rodar mais de uma vez (idempotente). Não apaga dados.
-- Depende de: 20261020240000_apoiadores_mapa.sql
--
-- O que faz:
--   1. Colunas de localização em empresas_logistica
--      (endereco, bairro, cep, latitude, longitude, mostrar_no_mapa)
--   2. Validação das coordenadas e do CEP
--   3. View pública empresas_logistica_publicas ganha endereço, bairro,
--      coordenadas (só quando mostrar_no_mapa) e no_mapa — empresa é
--      pessoa jurídica, então o endereço comercial pode ser público.
--      As colunas novas entram NO FINAL (create or replace view).
-- ============================================================

do $$
begin
  if to_regclass('public.empresas_logistica') is null then
    raise exception 'Tabela empresas_logistica não encontrada. Rode antes 20261020240000_apoiadores_mapa.sql';
  end if;
end $$;

-- ---------- 1. Colunas ----------
alter table public.empresas_logistica add column if not exists endereco text;
alter table public.empresas_logistica add column if not exists bairro text;
alter table public.empresas_logistica add column if not exists cep text;
alter table public.empresas_logistica add column if not exists latitude double precision;
alter table public.empresas_logistica add column if not exists longitude double precision;
alter table public.empresas_logistica add column if not exists mostrar_no_mapa boolean not null default false;

-- ---------- 2. Validações ----------
alter table public.empresas_logistica drop constraint if exists empresas_logistica_coords_chk;
alter table public.empresas_logistica add constraint empresas_logistica_coords_chk
  check (
    (latitude is null or latitude between -90 and 90)
    and (longitude is null or longitude between -180 and 180)
    and (not mostrar_no_mapa or (latitude is not null and longitude is not null))
  );
alter table public.empresas_logistica drop constraint if exists empresas_logistica_cep_chk;
alter table public.empresas_logistica add constraint empresas_logistica_cep_chk
  check (cep is null or cep ~ '^\d{8}$');

-- ---------- 3. View pública (mesmas colunas + novas no final) ----------
create or replace view public.empresas_logistica_publicas as
select
  e.id, e.nome, e.cnpj, e.logo_url, e.responsavel_nome, e.responsavel_cargo,
  e.telefone_publico, e.email_publico, e.site, e.descricao, e.materiais_aceitos,
  e.parceria_desde, e.status, e.ordem,
  coalesce((select sum(r.peso_kg) from public.repasses_logistica r where r.empresa_id = e.id and r.publico), 0)::numeric as total_repassado_kg,
  (select count(*) from public.repasses_logistica r where r.empresa_id = e.id and r.publico)::int as total_repasses,
  (select max(r.data) from public.repasses_logistica r where r.empresa_id = e.id and r.publico) as ultimo_repasse,
  e.endereco,
  e.bairro,
  case when e.mostrar_no_mapa then e.latitude end as latitude,
  case when e.mostrar_no_mapa then e.longitude end as longitude,
  (e.mostrar_no_mapa and e.latitude is not null and e.longitude is not null) as no_mapa
from public.empresas_logistica e
where e.exibir_publicamente;

grant select on public.empresas_logistica_publicas to anon, authenticated;

-- Conferência rápida
select count(*) filter (where mostrar_no_mapa) as no_mapa,
       count(*) filter (where latitude is null) as sem_localizacao,
       count(*) as total
from public.empresas_logistica;
