-- ==========================================================
-- ACMRB — Papéis de administrador (deus + admin) e conta própria
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS de 20261020170000_banco_completo.sql.
-- Pode ser rodado mais de uma vez.
--
-- Regras:
--  • Papéis possíveis: 'deus' (único, o programador) e 'admin' (normal).
--  • No máximo 2 administradores: 1 deus + 1 admin (índice único por papel).
--  • O deus não pode ser excluído nem rebaixado.
--  • Só o deus cria/exclui o admin normal (na prática pela rota
--    /api/admin/administradores, que usa a service role no servidor).
--  • Cada admin edita o próprio nome, foto e telefone; papel, situação
--    e e-mail só mudam pelo deus.
--  • Ninguém sem login lê a tabela admins (antes qualquer visitante lia
--    nome, e-mail e último login).
--  • Indicadores manuais (dashboard_metricas): só o deus altera.
--  • Bucket de fotos "admins" no Storage.
-- ==========================================================

begin;

-- 0. Colunas usadas pelo painel
alter table public.admins add column if not exists role text not null default 'admin';
alter table public.admins add column if not exists telefone text;
alter table public.admins add column if not exists ultimo_login timestamptz;
alter table public.admins add column if not exists avatar_url text;
alter table public.admins add column if not exists updated_at timestamptz not null default now();

-- 1. Papéis: Artur (joaovictorrc25@gmail.com) vira 'deus' — era o e-mail
--    que o AuthContext usava para definir o "ADM DEUS".
-- Remove a regra antiga de papéis (não aceitava "deus") antes de atualizar os dados.
alter table public.admins drop constraint if exists admins_role_check;
update public.admins set role = 'deus'
  where lower(email) = 'joaovictorrc25@gmail.com' and role is distinct from 'deus';
update public.admins set role = 'admin'
  where role not in ('deus', 'admin');

-- Trava de segurança: se já houver mais de 1 admin normal, para tudo com
-- uma mensagem clara (o índice único abaixo não conseguiria ser criado).
do $$
begin
  if (select count(*) from public.admins where role = 'admin') > 1 then
    raise exception 'Existem % administradores normais. O limite é 1: desative/exclua os extras antes de rodar esta migration.',
      (select count(*) from public.admins where role = 'admin');
  end if;
  if (select count(*) from public.admins where role = 'deus') > 1 then
    raise exception 'Existe mais de um administrador "deus". Corrija antes de rodar.';
  end if;
end $$;

alter table public.admins add constraint admins_role_check check (role in ('deus', 'admin'));

-- Um registro por papel ⇒ no máximo 1 deus + 1 admin = 2 no total
create unique index if not exists admins_um_por_papel on public.admins (role);

-- 2. Funções auxiliares
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = auth.email() and ativo = true
  );
$$;

create or replace function public.is_deus()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = auth.email() and ativo = true and role = 'deus'
  );
$$;

grant execute on function public.is_active_admin() to anon, authenticated;
grant execute on function public.is_deus() to authenticated;

-- 3. Proteções (gatilho): deus intocável; campos sensíveis só pelo deus.
--    Chamadas da service role (rota do servidor) não têm auth.email();
--    elas só criam/excluem o admin normal, o que é permitido.
-- Sem "security definer" de propósito: current_user precisa ser o papel
-- real (anon/authenticated = site; postgres/service_role = SQL Editor ou
-- rota do servidor, que podem administrar).
create or replace function public.admins_proteger()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  servidor boolean := current_user not in ('anon', 'authenticated');
begin
  if tg_op = 'DELETE' then
    if old.role = 'deus' then
      raise exception 'O administrador deus não pode ser excluído.';
    end if;
    return old;
  end if;

  if tg_op = 'INSERT' then
    if new.role = 'deus' and exists (select 1 from public.admins where role = 'deus') then
      raise exception 'Já existe um administrador deus.';
    end if;
    if (select count(*) from public.admins) >= 2 then
      raise exception 'Limite de 2 administradores atingido (1 deus + 1 admin).';
    end if;
    return new;
  end if;

  -- UPDATE
  if old.role = 'deus' and (new.role is distinct from 'deus' or new.ativo is distinct from true) then
    raise exception 'O administrador deus não pode ser rebaixado nem desativado.';
  end if;

  if not servidor and not public.is_deus() then
    if new.role is distinct from old.role
       or new.ativo is distinct from old.ativo
       or new.email is distinct from old.email
       or new.auth_user_id is distinct from old.auth_user_id then
      raise exception 'Somente o administrador deus pode alterar papel, situação ou e-mail.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists admins_proteger on public.admins;
create trigger admins_proteger
before insert or update or delete on public.admins
for each row execute function public.admins_proteger();

drop trigger if exists set_admins_updated_at on public.admins;
create trigger set_admins_updated_at
before update on public.admins
for each row execute function public.set_updated_at();

-- 4. RLS da tabela admins: remove TODAS as políticas antigas (nomes
--    desconhecidos no banco ao vivo) e cria as novas.
alter table public.admins enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'admins' loop
    execute format('drop policy %I on public.admins', p.policyname);
  end loop;
end $$;

revoke all on public.admins from anon;
grant select, insert, update, delete on public.admins to authenticated;

-- Leitura: o próprio registro (necessário no login) ou qualquer admin ativo
create policy "admins: leitura por admins"
on public.admins for select
to authenticated
using (email = auth.email() or public.is_active_admin());

-- Atualização: o próprio registro, ou o deus (o gatilho limita os campos)
create policy "admins: atualizar o proprio ou deus"
on public.admins for update
to authenticated
using (email = auth.email() or public.is_deus())
with check (email = auth.email() or public.is_deus());

-- Inserir/excluir: só o deus, e só o admin normal
create policy "admins: deus cria admin"
on public.admins for insert
to authenticated
with check (public.is_deus() and role = 'admin');

create policy "admins: deus exclui admin"
on public.admins for delete
to authenticated
using (public.is_deus() and role = 'admin');

-- 5. Indicadores manuais: só o deus altera (todos os admins leem)
drop policy if exists "authenticated admins can manage dashboard metricas" on public.dashboard_metricas;
drop policy if exists "deus gerencia dashboard metricas" on public.dashboard_metricas;
drop policy if exists "admins leem dashboard metricas" on public.dashboard_metricas;
create policy "admins leem dashboard metricas"
on public.dashboard_metricas for select
to authenticated
using (public.is_active_admin());

create policy "deus gerencia dashboard metricas"
on public.dashboard_metricas for all
to authenticated
using (public.is_deus())
with check (public.is_deus());

-- 6. Storage: bucket público "admins" para fotos de perfil
insert into storage.buckets (id, name, public)
values ('admins', 'admins', true)
on conflict (id) do nothing;

drop policy if exists "admins fotos: leitura publica" on storage.objects;
create policy "admins fotos: leitura publica"
on storage.objects for select
using (bucket_id = 'admins');

drop policy if exists "admins fotos: admins enviam" on storage.objects;
create policy "admins fotos: admins enviam"
on storage.objects for insert
to authenticated
with check (bucket_id = 'admins' and public.is_active_admin());

drop policy if exists "admins fotos: admins alteram" on storage.objects;
create policy "admins fotos: admins alteram"
on storage.objects for update
to authenticated
using (bucket_id = 'admins' and public.is_active_admin());

drop policy if exists "admins fotos: admins removem" on storage.objects;
create policy "admins fotos: admins removem"
on storage.objects for delete
to authenticated
using (bucket_id = 'admins' and public.is_active_admin());

commit;

-- ==========================================================
-- 7. VERIFICAÇÃO (só leitura)
-- ==========================================================
select nome, email, role, ativo from public.admins order by role desc;

select item, case when ok then 'ok' else 'FALTANDO' end as situacao
from (values
  ('coluna admins.role',          exists (select 1 from information_schema.columns where table_schema='public' and table_name='admins' and column_name='role')),
  ('coluna admins.telefone',      exists (select 1 from information_schema.columns where table_schema='public' and table_name='admins' and column_name='telefone')),
  ('índice 1 por papel',          to_regclass('public.admins_um_por_papel') is not null),
  ('função is_deus',              to_regprocedure('public.is_deus()') is not null),
  ('gatilho admins_proteger',     exists (select 1 from pg_trigger where tgname = 'admins_proteger')),
  ('deus definido',               exists (select 1 from public.admins where role = 'deus')),
  ('anon sem acesso a admins',    not has_table_privilege('anon', 'public.admins', 'select')),
  ('bucket admins',               exists (select 1 from storage.buckets where id = 'admins'))
) as t(item, ok);
