-- ==========================================================
-- Associados v2 — novos campos, unicidade e privacidade
-- ----------------------------------------------------------
-- ATENÇÃO: SUBSTITUÍDO por 20261020170000_banco_completo.sql.
-- Rode aquele arquivo (ele já contém tudo deste). Este foi mantido só
-- como histórico, com a correção da função set_updated_at().
-- ----------------------------------------------------------
-- Rode UMA vez no Supabase (SQL Editor). Pode ser repetido sem erro.
-- Rodar DEPOIS de 20261020150000_quem_somos.sql.
--
-- O que faz:
--  1. Adiciona colunas (cpf, whatsapp, bairro, status, datas, ordem...).
--  2. Limpa textos vazios ('') para NULL em cpf/e-mail (necessário para
--     os índices únicos) e deixa o CPF só com dígitos.
--  3. Índices únicos: cpf, e-mail (sem diferenciar maiúsculas) e slug.
--  4. status ('ativo' | 'inativo' | 'afastado') sincronizado com "ativo".
--  5. PRIVACIDADE: visitantes (anon) e usuários logados comuns passam a
--     ler SOMENTE colunas públicas da tabela. Antes, qualquer visitante
--     conseguia ler e-mail, telefone, endereço e data de nascimento.
--  6. View pública "associados_publicos" (só campos públicos).
--  7. View "associados_admin" com todos os campos, que só retorna linhas
--     para administradores ativos (is_active_admin()).
-- Nenhum dado fictício é inserido.
-- ==========================================================

-- 0. Função do gatilho updated_at (faltava no banco ao vivo: erro 42883)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. Colunas novas (as que já existem são ignoradas)
alter table public.associados add column if not exists cpf text;
alter table public.associados add column if not exists whatsapp text;
alter table public.associados add column if not exists bairro text;
alter table public.associados add column if not exists data_nascimento date;
alter table public.associados add column if not exists data_entrada date;
alter table public.associados add column if not exists facebook text;
alter table public.associados add column if not exists ordem_exibicao integer;
alter table public.associados add column if not exists status text not null default 'ativo';

-- 2. Normalização dos dados existentes
update public.associados set cpf = nullif(regexp_replace(coalesce(cpf, ''), '\D', '', 'g'), '')
  where cpf is not null;
update public.associados set email = nullif(lower(trim(email)), '')
  where email is not null;
update public.associados set status = case when ativo then 'ativo' else 'inativo' end
  where status is null or status not in ('ativo', 'inativo', 'afastado');

-- Regras de formato
alter table public.associados drop constraint if exists associados_status_check;
alter table public.associados add constraint associados_status_check
  check (status in ('ativo', 'inativo', 'afastado'));

alter table public.associados drop constraint if exists associados_cpf_formato_check;
alter table public.associados add constraint associados_cpf_formato_check
  check (cpf is null or cpf ~ '^[0-9]{11}$');

alter table public.associados drop constraint if exists associados_nome_check;
alter table public.associados add constraint associados_nome_check
  check (length(trim(nome)) >= 3) not valid;

-- Cargo: obrigatório, mas texto livre (os cargos atuais variam; o painel
-- oferece uma lista padrão: Presidente, Secretário(a), Tesoureiro(a)...).
alter table public.associados drop constraint if exists associados_cargo_check;
alter table public.associados add constraint associados_cargo_check
  check (cargo is null or length(trim(cargo)) > 0) not valid;

-- 3. Unicidade
create unique index if not exists associados_cpf_unico
  on public.associados (cpf) where cpf is not null;
create unique index if not exists associados_email_unico
  on public.associados (lower(email)) where email is not null;
create unique index if not exists associados_slug_unico
  on public.associados (slug) where slug is not null;

create index if not exists idx_associados_status on public.associados (status);

-- 4. "ativo" acompanha o status (o site público filtra por ativo = true)
create or replace function public.associados_sincronizar_status()
returns trigger
language plpgsql
as $$
begin
  new.ativo := (new.status = 'ativo');
  if new.cpf is not null then
    new.cpf := nullif(regexp_replace(new.cpf, '\D', '', 'g'), '');
  end if;
  if new.email is not null then
    new.email := nullif(lower(trim(new.email)), '');
  end if;
  return new;
end;
$$;

drop trigger if exists associados_sincronizar_status on public.associados;
create trigger associados_sincronizar_status
before insert or update on public.associados
for each row execute function public.associados_sincronizar_status();

drop trigger if exists set_associados_updated_at on public.associados;
create trigger set_associados_updated_at
before update on public.associados
for each row execute function public.set_updated_at();

-- 5. Privacidade por coluna
revoke select on public.associados from anon, authenticated;
grant select (
  id, nome, slug, cargo, tipo_associado, foto_url, bio,
  instagram, linkedin, facebook, destaque, ordem_exibicao, ativo, status
) on public.associados to anon, authenticated;
grant insert, update on public.associados to authenticated;

-- 6. View pública
drop view if exists public.associados_publicos;
create view public.associados_publicos
with (security_invoker = true) as
  select id, nome, slug, cargo, tipo_associado, foto_url, bio,
         instagram, linkedin, facebook, destaque, ordem_exibicao
  from public.associados
  where ativo = true;

grant select on public.associados_publicos to anon, authenticated;

-- 7. View do painel (todos os campos, só para admins ativos).
-- Roda com os privilégios do dono da view, por isso o filtro
-- is_active_admin() é obrigatório aqui.
drop view if exists public.associados_admin;
create view public.associados_admin as
  select *
  from public.associados
  where public.is_active_admin();

revoke all on public.associados_admin from anon;
grant select on public.associados_admin to authenticated;
