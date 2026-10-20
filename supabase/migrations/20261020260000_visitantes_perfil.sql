-- ==========================================================
-- ACMRB — Perfil de VISITANTE (área /login só para visitantes)
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS de 20261020250000_logistica_localizacao.sql.
-- Pode ser rodado mais de uma vez. NÃO mexe na tabela admins.
--
-- O que faz:
--  1. Garante a tabela public.visitantes (já usada pelo site/AuthContext)
--     e acrescenta data_nascimento. Campos: nome (nome completo), email,
--     telefone, cidade, data_nascimento, role='visitante', ativo, created_at.
--  2. Gatilho no auth.users: ao criar conta, cria o perfil de visitante
--     com os dados de raw_user_meta_data (nome_completo, telefone, cidade,
--     data_nascimento). E-mails de administradores são ignorados.
--  3. RLS: cada visitante lê e atualiza SÓ a própria linha; admins
--     ativos continuam gerenciando tudo.
--  4. Proteção: o visitante não consegue trocar role, ativo, email
--     nem auth_user_id da própria linha.
-- ==========================================================

begin;

-- 1. Tabela (no banco ao vivo já existe; num banco novo é criada)
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

alter table public.visitantes add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
alter table public.visitantes add column if not exists telefone text;
alter table public.visitantes add column if not exists cidade text;
alter table public.visitantes add column if not exists data_nascimento date;
alter table public.visitantes add column if not exists role text not null default 'visitante';
alter table public.visitantes add column if not exists ativo boolean not null default true;
alter table public.visitantes add column if not exists created_at timestamptz not null default now();
alter table public.visitantes add column if not exists updated_at timestamptz not null default now();

create unique index if not exists idx_visitantes_auth_user_id on public.visitantes(auth_user_id);
create index if not exists idx_visitantes_email on public.visitantes(email);

-- Idade mínima simbólica e data no passado
alter table public.visitantes drop constraint if exists visitantes_nascimento_check;
alter table public.visitantes add constraint visitantes_nascimento_check
  check (data_nascimento is null or (data_nascimento > date '1900-01-01' and data_nascimento <= current_date));

-- 2. Gatilho: cria o perfil no cadastro (security definer = ignora RLS)
create or replace function public.criar_perfil_visitante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  nasc date;
begin
  -- Administradores não viram visitantes
  if exists (select 1 from public.admins where lower(email) = lower(new.email)) then
    return new;
  end if;

  begin
    nasc := nullif(meta->>'data_nascimento', '')::date;
  exception when others then
    nasc := null;
  end;

  insert into public.visitantes (auth_user_id, nome, email, telefone, cidade, data_nascimento, role, ativo)
  values (
    new.id,
    coalesce(nullif(trim(meta->>'nome_completo'), ''), split_part(new.email, '@', 1)),
    lower(new.email),
    nullif(trim(meta->>'telefone'), ''),
    nullif(trim(meta->>'cidade'), ''),
    nasc,
    'visitante',
    true
  )
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists ao_criar_usuario_visitante on auth.users;
create trigger ao_criar_usuario_visitante
after insert on auth.users
for each row execute function public.criar_perfil_visitante();

-- 3. RLS
alter table public.visitantes enable row level security;

-- Remove a regra antiga "for all" (permitia apagar a própria linha)
drop policy if exists "authenticated can upsert own visitante profile" on public.visitantes;
drop policy if exists "authenticated can read own visitante profile" on public.visitantes;
drop policy if exists "visitante le o proprio perfil" on public.visitantes;
drop policy if exists "visitante atualiza o proprio perfil" on public.visitantes;
drop policy if exists "visitante cria o proprio perfil" on public.visitantes;

create policy "visitante le o proprio perfil"
on public.visitantes for select
to authenticated
using (auth.uid() = auth_user_id);

create policy "visitante atualiza o proprio perfil"
on public.visitantes for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

-- Reserva: contas antigas sem perfil podem criar o próprio (só como visitante)
create policy "visitante cria o proprio perfil"
on public.visitantes for insert
to authenticated
with check (auth.uid() = auth_user_id and role = 'visitante' and lower(email) = lower(auth.email()));

-- A política de admins ("authenticated admins can manage visitantes") é mantida.

-- 4. Proteção de campos sensíveis
create or replace function public.visitantes_proteger()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- SQL Editor / service role podem tudo; admins ativos também
  if current_user not in ('anon', 'authenticated') or public.is_active_admin() then
    return new;
  end if;
  new.role := old.role;
  new.ativo := old.ativo;
  new.email := old.email;
  new.auth_user_id := old.auth_user_id;
  return new;
end;
$$;

drop trigger if exists visitantes_proteger on public.visitantes;
create trigger visitantes_proteger
before update on public.visitantes
for each row execute function public.visitantes_proteger();

commit;
