-- ACMRB Platform database schema
-- Safe to run on a fresh Supabase project. Existing tables are preserved.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where email = auth.email()
      and ativo = true
  );
$$;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  email text not null unique,
  role text not null default 'admin',
  avatar_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visitantes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  telefone text,
  cidade text,
  role text not null default 'visitante',
  avatar_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.associados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique,
  cargo text,
  tipo_associado text,
  foto_url text,
  bio text,
  telefone text,
  email text,
  endereco text,
  instagram text,
  linkedin text,
  ativo boolean not null default true,
  destaque boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  resumo text,
  conteudo text,
  categoria text,
  imagem_url text,
  destaque boolean not null default false,
  publicado boolean not null default true,
  fixada boolean not null default false,
  visualizacoes integer not null default 0,
  seo_title text,
  seo_description text,
  seo_keywords text,
  autor_nome text not null default 'ACMRB',
  banner_alt text,
  tempo_leitura integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parceiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  descricao text,
  logo_url text,
  site_url text,
  ativo boolean not null default true,
  destaque boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboard_metricas (
  id uuid primary key default gen_random_uuid(),
  residuos_reciclados numeric(14, 2) not null default 0,
  co2_evitado numeric(14, 2) not null default 0,
  familias_impactadas integer not null default 0,
  catadores_ativos integer not null default 0,
  renda_gerada numeric(14, 2) not null default 0,
  empresas_parceiras integer not null default 0,
  coletas_realizadas integer not null default 0,
  bairros_atendidos integer not null default 0,
  residuos_desviados_aterro numeric(14, 2) not null default 0,
  educacao_ambiental_acoes integer not null default 0,
  pessoas_impactadas integer not null default 0,
  toneladas_papelao numeric(14, 2) not null default 0,
  toneladas_plastico numeric(14, 2) not null default 0,
  toneladas_vidro numeric(14, 2) not null default 0,
  toneladas_metal numeric(14, 2) not null default 0,
  toneladas_eletronicos numeric(14, 2) not null default 0,
  arvores_preservadas numeric(14, 2) not null default 0,
  agua_economizada numeric(14, 2) not null default 0,
  energia_economizada numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.materiais_tipos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  descricao text,
  cor text not null default '#0f766e',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.materiais_registros (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materiais_tipos(id) on delete restrict,
  peso numeric(14, 3) not null default 0 check (peso >= 0),
  valor_kg numeric(14, 2) not null default 0 check (valor_kg >= 0),
  subtotal numeric(14, 2) not null default 0 check (subtotal >= 0),
  quantidade numeric(14, 3),
  unidade text not null default 'kg',
  tipo_armazenamento text,
  origem text,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.denuncias (
  id uuid primary key default gen_random_uuid(),
  nome text,
  email text,
  telefone text,
  assunto text not null,
  mensagem text not null,
  status text not null default 'nova',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contatos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefone text,
  assunto text,
  mensagem text not null,
  status text not null default 'novo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admins add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
alter table public.admins add column if not exists role text not null default 'admin';
alter table public.admins add column if not exists avatar_url text;
alter table public.admins add column if not exists ativo boolean not null default true;
alter table public.admins add column if not exists updated_at timestamptz not null default now();

alter table public.visitantes add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
alter table public.visitantes add column if not exists telefone text;
alter table public.visitantes add column if not exists cidade text;
alter table public.visitantes add column if not exists role text not null default 'visitante';
alter table public.visitantes add column if not exists avatar_url text;
alter table public.visitantes add column if not exists ativo boolean not null default true;
alter table public.visitantes add column if not exists updated_at timestamptz not null default now();

alter table public.associados add column if not exists slug text;
alter table public.associados add column if not exists cargo text;
alter table public.associados add column if not exists tipo_associado text;
alter table public.associados add column if not exists foto_url text;
alter table public.associados add column if not exists bio text;
alter table public.associados add column if not exists email text;
alter table public.associados add column if not exists endereco text;
alter table public.associados add column if not exists instagram text;
alter table public.associados add column if not exists linkedin text;
alter table public.associados add column if not exists ativo boolean not null default true;
alter table public.associados add column if not exists destaque boolean not null default false;
alter table public.associados add column if not exists updated_at timestamptz not null default now();

alter table public.noticias add column if not exists slug text;
alter table public.noticias add column if not exists resumo text;
alter table public.noticias add column if not exists categoria text;
alter table public.noticias add column if not exists imagem_url text;
alter table public.noticias add column if not exists destaque boolean not null default false;
alter table public.noticias add column if not exists publicado boolean not null default true;
alter table public.noticias add column if not exists fixada boolean not null default false;
alter table public.noticias add column if not exists visualizacoes integer not null default 0;
alter table public.noticias add column if not exists seo_title text;
alter table public.noticias add column if not exists seo_description text;
alter table public.noticias add column if not exists seo_keywords text;
alter table public.noticias add column if not exists autor_nome text not null default 'ACMRB';
alter table public.noticias add column if not exists banner_alt text;
alter table public.noticias add column if not exists tempo_leitura integer not null default 1;
alter table public.noticias add column if not exists published_at timestamptz;
alter table public.noticias add column if not exists updated_at timestamptz not null default now();

alter table public.parceiros add column if not exists descricao text;
alter table public.parceiros add column if not exists logo_url text;
alter table public.parceiros add column if not exists site_url text;
alter table public.parceiros add column if not exists ativo boolean not null default true;
alter table public.parceiros add column if not exists destaque boolean not null default false;
alter table public.parceiros add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_admins_email on public.admins(email);
create index if not exists idx_visitantes_email on public.visitantes(email);
create unique index if not exists idx_admins_auth_user_id on public.admins(auth_user_id);
create unique index if not exists idx_visitantes_auth_user_id on public.visitantes(auth_user_id);
create unique index if not exists idx_associados_slug on public.associados(slug) where slug is not null;
create unique index if not exists idx_noticias_slug on public.noticias(slug) where slug is not null;
create index if not exists idx_noticias_publicadas on public.noticias(publicado, fixada, created_at desc);
create index if not exists idx_materiais_registros_created_at on public.materiais_registros(created_at desc);
create index if not exists idx_materiais_registros_material_id on public.materiais_registros(material_id);

drop trigger if exists set_admins_updated_at on public.admins;
create trigger set_admins_updated_at
before update on public.admins
for each row execute function public.set_updated_at();

drop trigger if exists set_visitantes_updated_at on public.visitantes;
create trigger set_visitantes_updated_at
before update on public.visitantes
for each row execute function public.set_updated_at();

drop trigger if exists set_associados_updated_at on public.associados;
create trigger set_associados_updated_at
before update on public.associados
for each row execute function public.set_updated_at();

drop trigger if exists set_noticias_updated_at on public.noticias;
create trigger set_noticias_updated_at
before update on public.noticias
for each row execute function public.set_updated_at();

drop trigger if exists set_parceiros_updated_at on public.parceiros;
create trigger set_parceiros_updated_at
before update on public.parceiros
for each row execute function public.set_updated_at();

drop trigger if exists set_dashboard_metricas_updated_at on public.dashboard_metricas;
create trigger set_dashboard_metricas_updated_at
before update on public.dashboard_metricas
for each row execute function public.set_updated_at();

drop trigger if exists set_materiais_tipos_updated_at on public.materiais_tipos;
create trigger set_materiais_tipos_updated_at
before update on public.materiais_tipos
for each row execute function public.set_updated_at();

drop trigger if exists set_materiais_registros_updated_at on public.materiais_registros;
create trigger set_materiais_registros_updated_at
before update on public.materiais_registros
for each row execute function public.set_updated_at();

drop trigger if exists set_denuncias_updated_at on public.denuncias;
create trigger set_denuncias_updated_at
before update on public.denuncias
for each row execute function public.set_updated_at();

drop trigger if exists set_contatos_updated_at on public.contatos;
create trigger set_contatos_updated_at
before update on public.contatos
for each row execute function public.set_updated_at();

alter table public.admins enable row level security;
alter table public.visitantes enable row level security;
alter table public.associados enable row level security;
alter table public.noticias enable row level security;
alter table public.parceiros enable row level security;
alter table public.dashboard_metricas enable row level security;
alter table public.materiais_tipos enable row level security;
alter table public.materiais_registros enable row level security;
alter table public.denuncias enable row level security;
alter table public.contatos enable row level security;

drop policy if exists "public can read active associados" on public.associados;
create policy "public can read active associados"
on public.associados for select
using (ativo = true);

drop policy if exists "public can read published noticias" on public.noticias;
create policy "public can read published noticias"
on public.noticias for select
using (publicado = true);

drop policy if exists "public can read active parceiros" on public.parceiros;
create policy "public can read active parceiros"
on public.parceiros for select
using (ativo = true);

drop policy if exists "public can read dashboard metricas" on public.dashboard_metricas;
create policy "public can read dashboard metricas"
on public.dashboard_metricas for select
using (true);

drop policy if exists "public can read materiais tipos" on public.materiais_tipos;
create policy "public can read materiais tipos"
on public.materiais_tipos for select
using (ativo = true);

drop policy if exists "public can read materiais registros" on public.materiais_registros;
create policy "public can read materiais registros"
on public.materiais_registros for select
using (true);

drop policy if exists "authenticated can read own visitante profile" on public.visitantes;
create policy "authenticated can read own visitante profile"
on public.visitantes for select
to authenticated
using (auth.uid() = auth_user_id or email = auth.email());

drop policy if exists "authenticated can upsert own visitante profile" on public.visitantes;
create policy "authenticated can upsert own visitante profile"
on public.visitantes for all
to authenticated
using (auth.uid() = auth_user_id or email = auth.email())
with check (auth.uid() = auth_user_id or email = auth.email());

drop policy if exists "authenticated admins can manage visitantes" on public.visitantes;
create policy "authenticated admins can manage visitantes"
on public.visitantes for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "authenticated admins can manage data" on public.admins;
create policy "authenticated admins can manage data"
on public.admins for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "authenticated admins can manage associados" on public.associados;
create policy "authenticated admins can manage associados"
on public.associados for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "authenticated admins can manage noticias" on public.noticias;
create policy "authenticated admins can manage noticias"
on public.noticias for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "authenticated admins can manage parceiros" on public.parceiros;
create policy "authenticated admins can manage parceiros"
on public.parceiros for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "authenticated admins can manage dashboard metricas" on public.dashboard_metricas;
create policy "authenticated admins can manage dashboard metricas"
on public.dashboard_metricas for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "authenticated admins can manage materiais tipos" on public.materiais_tipos;
create policy "authenticated admins can manage materiais tipos"
on public.materiais_tipos for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "authenticated admins can manage materiais registros" on public.materiais_registros;
create policy "authenticated admins can manage materiais registros"
on public.materiais_registros for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "authenticated admins can manage denuncias" on public.denuncias;
create policy "authenticated admins can manage denuncias"
on public.denuncias for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "authenticated admins can manage contatos" on public.contatos;
create policy "authenticated admins can manage contatos"
on public.contatos for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());
