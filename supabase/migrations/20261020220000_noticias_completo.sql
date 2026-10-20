-- ============================================================
-- Notícias completas (20261020220000)
-- ------------------------------------------------------------
-- Pode rodar mais de uma vez (idempotente).
-- Depende de: 20261020180000_admins_papeis.sql (funções
-- is_active_admin() e is_deus()).
--
-- O que faz:
--   1. Garante todas as colunas da tabela noticias (antigas e novas)
--   2. Converte "publicado" (boolean) em "status" (rascunho,
--      publicado, agendado, arquivado), mantendo os dois em sincronia
--   3. Trigger: slug automático, updated_at, published_at, publicado
--   4. RLS: público lê só o que já está publicado; só o ADM DEUS
--      cria, edita, exclui e publica
--   5. RPC incrementar_visualizacao_noticia (security definer)
--   6. Bucket "noticias" no Storage (leitura pública, escrita só deus)
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  created_at timestamptz not null default now()
);

-- ---------- 1. Colunas ----------
alter table public.noticias add column if not exists slug text;
alter table public.noticias add column if not exists resumo text;
alter table public.noticias add column if not exists conteudo text;
alter table public.noticias add column if not exists categoria text;
alter table public.noticias add column if not exists imagem_url text;
alter table public.noticias add column if not exists banner_alt text;
alter table public.noticias add column if not exists destaque boolean not null default false;
alter table public.noticias add column if not exists publicado boolean not null default true;
alter table public.noticias add column if not exists fixada boolean not null default false;
alter table public.noticias add column if not exists visualizacoes integer not null default 0;
alter table public.noticias add column if not exists seo_title text;
alter table public.noticias add column if not exists seo_description text;
alter table public.noticias add column if not exists seo_keywords text;
alter table public.noticias add column if not exists autor_nome text not null default 'ACMRB';
alter table public.noticias add column if not exists tempo_leitura integer not null default 1;
alter table public.noticias add column if not exists published_at timestamptz;
alter table public.noticias add column if not exists updated_at timestamptz not null default now();
-- novas
alter table public.noticias add column if not exists status text;
alter table public.noticias add column if not exists ordem_destaque integer;
alter table public.noticias add column if not exists tags text[] not null default '{}';
alter table public.noticias add column if not exists imagem_legenda text;
alter table public.noticias add column if not exists imagem_credito text;
alter table public.noticias add column if not exists fonte_url text;
alter table public.noticias add column if not exists galeria jsonb not null default '[]'::jsonb;

-- ---------- 2. Status a partir do antigo "publicado" ----------
update public.noticias
   set status = case when publicado then 'publicado' else 'rascunho' end
 where status is null;

update public.noticias
   set published_at = coalesce(published_at, created_at)
 where status = 'publicado' and published_at is null;

alter table public.noticias alter column status set default 'rascunho';
alter table public.noticias alter column status set not null;

alter table public.noticias drop constraint if exists noticias_status_check;
alter table public.noticias add constraint noticias_status_check
  check (status in ('rascunho', 'publicado', 'agendado', 'arquivado'));

-- slugs vazios recebem um valor a partir do título + parte do id
update public.noticias
   set slug = trim(both '-' from regexp_replace(lower(translate(titulo,
         'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
         'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN')), '[^a-z0-9]+', '-', 'g'))
         || '-' || left(id::text, 6)
 where slug is null or slug = '';

create unique index if not exists idx_noticias_slug on public.noticias(slug) where slug is not null;
create index if not exists idx_noticias_status_data on public.noticias(status, published_at desc);
create index if not exists idx_noticias_destaque on public.noticias(destaque, ordem_destaque);
create index if not exists idx_noticias_tags on public.noticias using gin(tags);
create index if not exists idx_noticias_categoria on public.noticias(categoria);

-- ---------- 3. Trigger antes de salvar ----------
create or replace function public.noticias_antes_salvar()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := trim(both '-' from regexp_replace(lower(translate(new.titulo,
      'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
      'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN')), '[^a-z0-9]+', '-', 'g'))
      || '-' || left(new.id::text, 6);
  end if;

  if new.status is null then
    new.status := case when new.publicado then 'publicado' else 'rascunho' end;
  end if;

  -- "publicado" (antigo) acompanha o status
  new.publicado := new.status in ('publicado', 'agendado');

  if new.status in ('publicado', 'agendado') and new.published_at is null then
    new.published_at := now();
  end if;

  if not new.destaque then
    new.ordem_destaque := null;
  end if;

  -- updated_at não muda quando só a contagem de visualizações muda
  if tg_op = 'INSERT' then
    new.updated_at := now();
  elsif (to_jsonb(new) - 'visualizacoes' - 'updated_at')
        is distinct from (to_jsonb(old) - 'visualizacoes' - 'updated_at') then
    new.updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists set_noticias_updated_at on public.noticias;
drop trigger if exists noticias_antes_salvar on public.noticias;
create trigger noticias_antes_salvar
before insert or update on public.noticias
for each row execute function public.noticias_antes_salvar();

-- ---------- 4. RLS ----------
alter table public.noticias enable row level security;

drop policy if exists "public can read published noticias" on public.noticias;
drop policy if exists "authenticated admins can manage noticias" on public.noticias;
drop policy if exists "noticias_publico_le" on public.noticias;
drop policy if exists "noticias_admins_leem" on public.noticias;
drop policy if exists "noticias_deus_insere" on public.noticias;
drop policy if exists "noticias_deus_edita" on public.noticias;
drop policy if exists "noticias_deus_exclui" on public.noticias;

create policy "noticias_publico_le"
on public.noticias for select
using (status in ('publicado', 'agendado') and coalesce(published_at, created_at) <= now());

create policy "noticias_admins_leem"
on public.noticias for select to authenticated
using (public.is_active_admin());

create policy "noticias_deus_insere"
on public.noticias for insert to authenticated
with check (public.is_deus());

create policy "noticias_deus_edita"
on public.noticias for update to authenticated
using (public.is_deus())
with check (public.is_deus());

create policy "noticias_deus_exclui"
on public.noticias for delete to authenticated
using (public.is_deus());

-- ---------- 5. Visualizações ----------
create or replace function public.incrementar_visualizacao_noticia(p_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  total integer;
begin
  update public.noticias
     set visualizacoes = coalesce(visualizacoes, 0) + 1
   where id = p_id
     and status in ('publicado', 'agendado')
     and coalesce(published_at, created_at) <= now()
  returning visualizacoes into total;
  return total;
end;
$$;

revoke all on function public.incrementar_visualizacao_noticia(uuid) from public;
grant execute on function public.incrementar_visualizacao_noticia(uuid) to anon, authenticated;

-- ---------- 6. Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('noticias', 'noticias', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "noticias_storage_publico_le" on storage.objects;
drop policy if exists "noticias_storage_deus_envia" on storage.objects;
drop policy if exists "noticias_storage_deus_edita" on storage.objects;
drop policy if exists "noticias_storage_deus_exclui" on storage.objects;

create policy "noticias_storage_publico_le"
on storage.objects for select
using (bucket_id = 'noticias');

create policy "noticias_storage_deus_envia"
on storage.objects for insert to authenticated
with check (bucket_id = 'noticias' and public.is_deus());

create policy "noticias_storage_deus_edita"
on storage.objects for update to authenticated
using (bucket_id = 'noticias' and public.is_deus())
with check (bucket_id = 'noticias' and public.is_deus());

create policy "noticias_storage_deus_exclui"
on storage.objects for delete to authenticated
using (bucket_id = 'noticias' and public.is_deus());

-- ---------- Conferência ----------
select 'coluna status' as item, exists (
         select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'noticias' and column_name = 'status') as ok
union all
select 'coluna galeria', exists (
         select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'noticias' and column_name = 'galeria')
union all
select 'função incrementar_visualizacao_noticia',
       to_regprocedure('public.incrementar_visualizacao_noticia(uuid)') is not null
union all
select 'bucket noticias', exists (select 1 from storage.buckets where id = 'noticias');
