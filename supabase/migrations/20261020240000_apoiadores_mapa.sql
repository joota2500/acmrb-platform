-- ============================================================
-- Apoiadores, mapa e logística reversa (20261020240000)
-- ------------------------------------------------------------
-- Pode rodar mais de uma vez (idempotente).
-- Depende de: 20261020180000_admins_papeis.sql (is_deus()) e
-- 20261020160000_associados_v2.sql (set_updated_at()).
--
-- O que faz:
--   1. Funções de validação de CNPJ e CPF (dígitos verificadores)
--   2. Tabela apoiadores (pontos do mapa da home)
--   3. Tabelas empresas_logistica e repasses_logistica
--   4. RLS: tabelas base SÓ para o ADM DEUS (leitura e escrita)
--   5. Views públicas (sem CPF, sem observações internas, coordenadas
--      aproximadas para pessoa física/anônimo)
--   6. Bucket "parceiros" (logos): leitura pública, escrita só deus, 2 MB
--   7. Seed dos parceiros reais citados (sem CNPJ/coordenadas inventados)
-- ============================================================

create extension if not exists pgcrypto;

do $$
begin
  if to_regprocedure('public.is_deus()') is null then
    raise exception 'Função public.is_deus() não encontrada. Rode antes 20261020180000_admins_papeis.sql';
  end if;
end $$;

-- Garante set_updated_at() (mesma definição das migrations anteriores)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- 1. Validação de documentos ----------
create or replace function public.cnpj_valido(doc text)
returns boolean language plpgsql immutable as $$
declare
  d text := regexp_replace(coalesce(doc, ''), '\D', '', 'g');
  pesos1 int[] := array[5,4,3,2,9,8,7,6,5,4,3,2];
  pesos2 int[] := array[6,5,4,3,2,9,8,7,6,5,4,3,2];
  soma int; resto int; dv1 int; dv2 int; i int;
begin
  if length(d) <> 14 or d ~ '^(\d)\1{13}$' then return false; end if;
  soma := 0;
  for i in 1..12 loop soma := soma + substr(d, i, 1)::int * pesos1[i]; end loop;
  resto := soma % 11; dv1 := case when resto < 2 then 0 else 11 - resto end;
  soma := 0;
  for i in 1..13 loop soma := soma + substr(d, i, 1)::int * pesos2[i]; end loop;
  resto := soma % 11; dv2 := case when resto < 2 then 0 else 11 - resto end;
  return dv1 = substr(d, 13, 1)::int and dv2 = substr(d, 14, 1)::int;
end $$;

create or replace function public.cpf_valido(doc text)
returns boolean language plpgsql immutable as $$
declare
  d text := regexp_replace(coalesce(doc, ''), '\D', '', 'g');
  soma int; dv1 int; dv2 int; i int;
begin
  if length(d) <> 11 or d ~ '^(\d)\1{10}$' then return false; end if;
  soma := 0;
  for i in 1..9 loop soma := soma + substr(d, i, 1)::int * (11 - i); end loop;
  dv1 := (soma * 10) % 11; if dv1 = 10 then dv1 := 0; end if;
  soma := 0;
  for i in 1..10 loop soma := soma + substr(d, i, 1)::int * (12 - i); end loop;
  dv2 := (soma * 10) % 11; if dv2 = 10 then dv2 := 0; end if;
  return dv1 = substr(d, 10, 1)::int and dv2 = substr(d, 11, 1)::int;
end $$;

-- ---------- 2. Apoiadores ----------
create table if not exists public.apoiadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

alter table public.apoiadores add column if not exists tipo_pessoa text not null default 'juridica';
alter table public.apoiadores add column if not exists nome_fantasia text;
alter table public.apoiadores add column if not exists cnpj text;
alter table public.apoiadores add column if not exists cpf text;
alter table public.apoiadores add column if not exists categoria text not null default 'Outro';
alter table public.apoiadores add column if not exists tipos_apoio text[] not null default '{}';
alter table public.apoiadores add column if not exists descricao text;
alter table public.apoiadores add column if not exists logo_url text;
alter table public.apoiadores add column if not exists site text;
alter table public.apoiadores add column if not exists instagram text;
alter table public.apoiadores add column if not exists telefone_publico text;
alter table public.apoiadores add column if not exists email_publico text;
alter table public.apoiadores add column if not exists endereco text;
alter table public.apoiadores add column if not exists bairro text;
alter table public.apoiadores add column if not exists latitude double precision;
alter table public.apoiadores add column if not exists longitude double precision;
alter table public.apoiadores add column if not exists mostrar_no_mapa boolean not null default false;
alter table public.apoiadores add column if not exists exibir_publicamente boolean not null default true;
alter table public.apoiadores add column if not exists anonimo boolean not null default false;
alter table public.apoiadores add column if not exists ativo boolean not null default true;
alter table public.apoiadores add column if not exists desde date;
alter table public.apoiadores add column if not exists ordem integer not null default 0;
alter table public.apoiadores add column if not exists observacoes_internas text;
alter table public.apoiadores add column if not exists updated_at timestamptz not null default now();

-- Restrições (recriadas para serem idempotentes)
alter table public.apoiadores drop constraint if exists apoiadores_tipo_pessoa_chk;
alter table public.apoiadores add constraint apoiadores_tipo_pessoa_chk
  check (tipo_pessoa in ('juridica', 'fisica'));
alter table public.apoiadores drop constraint if exists apoiadores_categoria_chk;
alter table public.apoiadores add constraint apoiadores_categoria_chk
  check (categoria in ('Comércio','Restaurante','Pousada/Hotel','Residência','Empresa','Indústria','Órgão público','ONG/Associação','Outro'));
alter table public.apoiadores drop constraint if exists apoiadores_tipos_apoio_chk;
alter table public.apoiadores add constraint apoiadores_tipos_apoio_chk
  check (tipos_apoio <@ array['Coleta/Ponto de entrega','Doação em dinheiro','Doação de materiais','Voluntário','Divulgação','Logística reversa','Outro']::text[]);
alter table public.apoiadores drop constraint if exists apoiadores_cnpj_chk;
alter table public.apoiadores add constraint apoiadores_cnpj_chk
  check (cnpj is null or (cnpj ~ '^\d{14}$' and public.cnpj_valido(cnpj)));
alter table public.apoiadores drop constraint if exists apoiadores_cpf_chk;
alter table public.apoiadores add constraint apoiadores_cpf_chk
  check (cpf is null or (cpf ~ '^\d{11}$' and public.cpf_valido(cpf)));
alter table public.apoiadores drop constraint if exists apoiadores_coord_chk;
alter table public.apoiadores add constraint apoiadores_coord_chk
  check ((latitude is null or latitude between -90 and 90) and (longitude is null or longitude between -180 and 180));

create unique index if not exists apoiadores_cnpj_unico on public.apoiadores (cnpj) where cnpj is not null;
create unique index if not exists apoiadores_cpf_unico on public.apoiadores (cpf) where cpf is not null;
create index if not exists apoiadores_publicos_idx on public.apoiadores (ativo, exibir_publicamente, ordem);

drop trigger if exists set_apoiadores_updated_at on public.apoiadores;
create trigger set_apoiadores_updated_at before update on public.apoiadores
for each row execute function public.set_updated_at();

-- ---------- 3. Logística reversa ----------
create table if not exists public.empresas_logistica (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

alter table public.empresas_logistica add column if not exists cnpj text;
alter table public.empresas_logistica add column if not exists logo_url text;
alter table public.empresas_logistica add column if not exists responsavel_nome text;
alter table public.empresas_logistica add column if not exists responsavel_cargo text;
alter table public.empresas_logistica add column if not exists telefone_publico text;
alter table public.empresas_logistica add column if not exists email_publico text;
alter table public.empresas_logistica add column if not exists site text;
alter table public.empresas_logistica add column if not exists descricao text;
alter table public.empresas_logistica add column if not exists materiais_aceitos text[] not null default '{}';
alter table public.empresas_logistica add column if not exists parceria_desde date;
alter table public.empresas_logistica add column if not exists status text not null default 'ativa';
alter table public.empresas_logistica add column if not exists exibir_publicamente boolean not null default true;
alter table public.empresas_logistica add column if not exists observacoes_internas text;
alter table public.empresas_logistica add column if not exists ordem integer not null default 0;
alter table public.empresas_logistica add column if not exists updated_at timestamptz not null default now();

alter table public.empresas_logistica drop constraint if exists empresas_logistica_status_chk;
alter table public.empresas_logistica add constraint empresas_logistica_status_chk
  check (status in ('ativa', 'em_negociacao', 'pausada', 'encerrada'));
alter table public.empresas_logistica drop constraint if exists empresas_logistica_cnpj_chk;
alter table public.empresas_logistica add constraint empresas_logistica_cnpj_chk
  check (cnpj is null or (cnpj ~ '^\d{14}$' and public.cnpj_valido(cnpj)));
create unique index if not exists empresas_logistica_cnpj_unico on public.empresas_logistica (cnpj) where cnpj is not null;

drop trigger if exists set_empresas_logistica_updated_at on public.empresas_logistica;
create trigger set_empresas_logistica_updated_at before update on public.empresas_logistica
for each row execute function public.set_updated_at();

create table if not exists public.repasses_logistica (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas_logistica(id) on delete cascade,
  data date not null default current_date,
  material text not null,
  peso_kg numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.repasses_logistica add column if not exists valor numeric(12,2);
alter table public.repasses_logistica add column if not exists documento_url text;
alter table public.repasses_logistica add column if not exists observacao text;
alter table public.repasses_logistica add column if not exists publico boolean not null default true;
alter table public.repasses_logistica add column if not exists updated_at timestamptz not null default now();

alter table public.repasses_logistica drop constraint if exists repasses_logistica_valores_chk;
alter table public.repasses_logistica add constraint repasses_logistica_valores_chk
  check (peso_kg >= 0 and (valor is null or valor >= 0));
create index if not exists repasses_logistica_empresa_idx on public.repasses_logistica (empresa_id, data desc);

drop trigger if exists set_repasses_logistica_updated_at on public.repasses_logistica;
create trigger set_repasses_logistica_updated_at before update on public.repasses_logistica
for each row execute function public.set_updated_at();

-- ---------- 4. RLS: tabelas base exclusivas do ADM DEUS ----------
alter table public.apoiadores enable row level security;
alter table public.empresas_logistica enable row level security;
alter table public.repasses_logistica enable row level security;

-- anon nunca lê a tabela base (CPF e observações ficam protegidos)
revoke all on public.apoiadores from anon;
revoke all on public.empresas_logistica from anon;
revoke all on public.repasses_logistica from anon;
grant select, insert, update, delete on public.apoiadores to authenticated;
grant select, insert, update, delete on public.empresas_logistica to authenticated;
grant select, insert, update, delete on public.repasses_logistica to authenticated;

do $$
declare t text; p record;
begin
  foreach t in array array['apoiadores','empresas_logistica','repasses_logistica'] loop
    -- remove políticas antigas desta tabela (recriadas abaixo)
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy if exists %I on public.%I', p.policyname, t);
    end loop;
    execute format('create policy %I on public.%I for all to authenticated using (public.is_deus()) with check (public.is_deus())', t || '_deus_total', t);
  end loop;
end $$;

-- ---------- 5. Views públicas ----------
-- Executam com o dono (postgres) para ler a tabela base, mas expõem
-- apenas colunas públicas e linhas ativas + exibir_publicamente.
drop view if exists public.apoiadores_publicos;
create view public.apoiadores_publicos as
select
  a.id,
  a.tipo_pessoa,
  case when a.anonimo then 'Apoiador anônimo' else coalesce(nullif(a.nome_fantasia, ''), a.nome) end as nome_exibicao,
  case when a.anonimo then null else a.nome end as nome,
  a.categoria,
  a.tipos_apoio,
  case when a.anonimo then null else a.descricao end as descricao,
  case when a.anonimo then null else a.logo_url end as logo_url,
  case when a.anonimo then null else a.site end as site,
  case when a.anonimo then null else a.instagram end as instagram,
  case when a.anonimo then null else a.telefone_publico end as telefone_publico,
  case when a.anonimo then null else a.email_publico end as email_publico,
  case when a.anonimo or a.tipo_pessoa = 'fisica' then null else a.cnpj end as cnpj,
  -- endereço completo só de pessoa jurídica identificada
  case when a.anonimo or a.tipo_pessoa = 'fisica' then null else a.endereco end as endereco,
  a.bairro,
  -- coordenadas: só se marcado no mapa; aproximadas (~100 m) para pessoa física ou anônimo
  case when not a.mostrar_no_mapa then null
       when a.anonimo or a.tipo_pessoa = 'fisica' then round(a.latitude::numeric, 3)::double precision
       else a.latitude end as latitude,
  case when not a.mostrar_no_mapa then null
       when a.anonimo or a.tipo_pessoa = 'fisica' then round(a.longitude::numeric, 3)::double precision
       else a.longitude end as longitude,
  (a.mostrar_no_mapa and a.latitude is not null and a.longitude is not null) as no_mapa,
  (a.anonimo or a.tipo_pessoa = 'fisica') as localizacao_aproximada,
  a.anonimo,
  a.desde,
  a.ordem
from public.apoiadores a
where a.ativo and a.exibir_publicamente;

drop view if exists public.repasses_logistica_publicos;
drop view if exists public.empresas_logistica_publicas;
create view public.empresas_logistica_publicas as
select
  e.id, e.nome, e.cnpj, e.logo_url, e.responsavel_nome, e.responsavel_cargo,
  e.telefone_publico, e.email_publico, e.site, e.descricao, e.materiais_aceitos,
  e.parceria_desde, e.status, e.ordem,
  coalesce((select sum(r.peso_kg) from public.repasses_logistica r where r.empresa_id = e.id and r.publico), 0)::numeric as total_repassado_kg,
  (select count(*) from public.repasses_logistica r where r.empresa_id = e.id and r.publico)::int as total_repasses,
  (select max(r.data) from public.repasses_logistica r where r.empresa_id = e.id and r.publico) as ultimo_repasse
from public.empresas_logistica e
where e.exibir_publicamente;

create view public.repasses_logistica_publicos as
select r.id, r.empresa_id, r.data, r.material, r.peso_kg, r.valor, r.documento_url, r.observacao
from public.repasses_logistica r
join public.empresas_logistica e on e.id = r.empresa_id
where r.publico and e.exibir_publicamente;

grant select on public.apoiadores_publicos to anon, authenticated;
grant select on public.empresas_logistica_publicas to anon, authenticated;
grant select on public.repasses_logistica_publicos to anon, authenticated;

-- ---------- 6. Storage: bucket "parceiros" (logos) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('parceiros', 'parceiros', true, 2097152, array['image/png','image/jpeg','image/webp','image/svg+xml'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists parceiros_storage_publico_le on storage.objects;
drop policy if exists parceiros_storage_deus_envia on storage.objects;
drop policy if exists parceiros_storage_deus_edita on storage.objects;
drop policy if exists parceiros_storage_deus_exclui on storage.objects;

create policy parceiros_storage_publico_le on storage.objects
  for select to public using (bucket_id = 'parceiros');
create policy parceiros_storage_deus_envia on storage.objects
  for insert to authenticated with check (bucket_id = 'parceiros' and public.is_deus());
create policy parceiros_storage_deus_edita on storage.objects
  for update to authenticated using (bucket_id = 'parceiros' and public.is_deus())
  with check (bucket_id = 'parceiros' and public.is_deus());
create policy parceiros_storage_deus_exclui on storage.objects
  for delete to authenticated using (bucket_id = 'parceiros' and public.is_deus());

-- ---------- 7. Seed (parceiros reais citados; sem CNPJ/coordenadas) ----------
-- Ficam fora do mapa (mostrar_no_mapa = false) até o ADM DEUS marcar o ponto.
insert into public.apoiadores (tipo_pessoa, nome, categoria, tipos_apoio, mostrar_no_mapa, exibir_publicamente, ordem)
select 'juridica', 'Autarquia Municipal do Meio Ambiente de Baturité (AMAB)', 'Órgão público', array['Divulgação']::text[], false, true, 1
where not exists (select 1 from public.apoiadores where nome ilike 'Autarquia Municipal do Meio Ambiente de Baturité%');

insert into public.apoiadores (tipo_pessoa, nome, categoria, tipos_apoio, mostrar_no_mapa, exibir_publicamente, ordem)
select 'juridica', 'EcoJuá', 'Outro', '{}'::text[], false, true, 2
where not exists (select 1 from public.apoiadores where nome ilike 'EcoJuá');

insert into public.empresas_logistica (nome, status, exibir_publicamente, ordem)
select 'Ambipar', 'ativa', true, 1
where not exists (select 1 from public.empresas_logistica where nome ilike 'Ambipar');

insert into public.empresas_logistica (nome, status, exibir_publicamente, ordem)
select 'Clube do Vidro', 'ativa', true, 2
where not exists (select 1 from public.empresas_logistica where nome ilike 'Clube do Vidro');

-- Conferência rápida
select 'apoiadores' as tabela, count(*) from public.apoiadores
union all select 'empresas_logistica', count(*) from public.empresas_logistica
union all select 'repasses_logistica', count(*) from public.repasses_logistica;
