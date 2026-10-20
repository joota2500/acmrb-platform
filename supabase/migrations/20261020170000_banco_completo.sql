-- ==========================================================
-- ACMRB — BANCO COMPLETO (substitui 20261020150000 e 20261020160000)
-- ----------------------------------------------------------
-- Arquivo único e autossuficiente. Rode no Supabase → SQL Editor.
-- Pode ser rodado mais de uma vez sem erro e sem duplicar dados.
--
-- Por que existe: no banco ao vivo as funções set_updated_at() e
-- is_active_admin() não existem (o banco não foi criado pelo
-- schema.sql), e a migration associados_v2 falhou com o erro 42883.
--
-- Ordem:
--   0. Funções auxiliares (set_updated_at, is_active_admin)
--   1. Tabela parceiros + RLS + gatilho
--   2. Tabela quem_somos_conteudo + RLS + conteúdo inicial real
--   3. Associados v2 (campos, unicidade, privacidade, views)
--   4. Consultas de verificação (resultado aparece no final)
-- Nenhum dado fictício é inserido.
-- ==========================================================

begin;

create extension if not exists pgcrypto;

-- ==========================================================
-- 0. FUNÇÕES AUXILIARES
-- ==========================================================

-- Atualiza a coluna updated_at em todo UPDATE (usada pelos gatilhos)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- A função abaixo lê public.admins; em SQL a tabela precisa existir
-- antes. No banco ao vivo ela já existe (nada muda); num banco novo é criada.
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

-- true se o usuário logado for um administrador ativo (tabela admins).
-- Mesma regra do schema.sql: e-mail do login = admins.email e ativo = true.
-- security definer: consegue ler admins mesmo com RLS.
create or replace function public.is_active_admin()
returns boolean
language sql
stable
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

grant execute on function public.is_active_admin() to anon, authenticated;

-- ==========================================================
-- 1. PARCEIROS
-- ==========================================================

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

alter table public.parceiros add column if not exists categoria text;
alter table public.parceiros add column if not exists descricao text;
alter table public.parceiros add column if not exists logo_url text;
alter table public.parceiros add column if not exists site_url text;
alter table public.parceiros add column if not exists ativo boolean not null default true;
alter table public.parceiros add column if not exists destaque boolean not null default false;
alter table public.parceiros add column if not exists updated_at timestamptz not null default now();

drop trigger if exists set_parceiros_updated_at on public.parceiros;
create trigger set_parceiros_updated_at
before update on public.parceiros
for each row execute function public.set_updated_at();

alter table public.parceiros enable row level security;

drop policy if exists "public can read active parceiros" on public.parceiros;
create policy "public can read active parceiros"
on public.parceiros for select
using (ativo = true);

drop policy if exists "authenticated admins can manage parceiros" on public.parceiros;
create policy "authenticated admins can manage parceiros"
on public.parceiros for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

-- ==========================================================
-- 2. QUEM SOMOS — conteúdo institucional editável
--    secao: hero, citacao, historia, timeline, missao, visao,
--    valor, atuacao, futuro. "ordem" = sequência na página.
-- ==========================================================

create table if not exists public.quem_somos_conteudo (
  id uuid primary key default gen_random_uuid(),
  secao text not null check (secao in (
    'hero', 'citacao', 'historia', 'timeline', 'missao', 'visao',
    'valor', 'atuacao', 'futuro'
  )),
  ordem integer not null default 0,
  rotulo text,
  titulo text,
  subtitulo text,
  texto text,
  icone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (secao, ordem)
);

create index if not exists idx_quem_somos_conteudo_secao
  on public.quem_somos_conteudo(secao, ordem);

drop trigger if exists set_quem_somos_conteudo_updated_at on public.quem_somos_conteudo;
create trigger set_quem_somos_conteudo_updated_at
before update on public.quem_somos_conteudo
for each row execute function public.set_updated_at();

alter table public.quem_somos_conteudo enable row level security;

drop policy if exists "public can read active quem somos conteudo" on public.quem_somos_conteudo;
create policy "public can read active quem somos conteudo"
on public.quem_somos_conteudo for select
using (ativo = true);

drop policy if exists "authenticated admins can manage quem somos conteudo" on public.quem_somos_conteudo;
create policy "authenticated admins can manage quem somos conteudo"
on public.quem_somos_conteudo for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

-- Conteúdo inicial: os textos reais que já estavam na página.
insert into public.quem_somos_conteudo (secao, ordem, rotulo, titulo, subtitulo, texto, icone) values
  ('hero', 1, null,
   'Transformando vidas por meio da reciclagem, da dignidade e da inclusão social',
   'Associação Reciclaê • ACMRB',
   'A Associação dos Catadores de Materiais Recicláveis de Baturité nasceu da luta diária de trabalhadores que, durante anos, sobreviveram em condições extremamente difíceis no antigo lixão municipal.',
   null),
  ('hero', 2, null, null, null,
   'Hoje, a ACMRB representa uma nova oportunidade para dezenas de famílias que buscam renda, reconhecimento, estrutura, inclusão social e valorização do trabalho ambiental.',
   null),
  ('citacao', 1, null, null, null,
   'A reciclagem mudou não apenas o meio ambiente, mas também a história de dezenas de famílias em Baturité.',
   null),
  ('historia', 1, null, 'Da luta no lixão à construção de um futuro digno', null,
   'Uma trajetória marcada pela resistência, pela organização e pela esperança dos catadores de Baturité.',
   null),
  ('timeline', 1, 'Décadas anteriores', 'Trabalho no lixão a céu aberto', null,
   'Por muitos anos, dezenas de famílias sobreviveram coletando materiais recicláveis no antigo lixão municipal de Baturité, enfrentando condições precárias, riscos à saúde e falta de estrutura.',
   null),
  ('timeline', 2, 'Processo de organização', 'A união dos catadores', null,
   'Com o apoio da Secretaria de Meio Ambiente, da Autarquia Municipal e de parceiros, os catadores começaram a se organizar em busca de reconhecimento, dignidade e melhores condições de trabalho.',
   null),
  ('timeline', 3, '2024 – 2025', 'Fechamento do lixão e transição', null,
   'Com a inauguração do Aterro Sanitário Regional do Maciço de Baturité (2024) e a desativação do antigo lixão, os catadores iniciaram a transição para um modelo de coleta e triagem mais organizado e sustentável.',
   null),
  ('timeline', 4, '10 de julho de 2025', 'Fundação oficial da ACMRB', null,
   'Nasce formalmente a Associação dos Catadores de Materiais Recicláveis de Baturité (ACMRB – Reciclaê), consolidando a luta por inclusão social, renda digna e valorização do trabalho ambiental.',
   null),
  ('timeline', 5, 'Hoje e amanhã', 'Construindo o futuro', null,
   'A ACMRB segue fortalecendo a coleta seletiva, a educação ambiental, as parcerias ESG e a geração de renda para as famílias associadas, transformando a realidade de Baturité.',
   null),
  ('valor', 1, null, 'Dignidade', null, 'Valorizamos cada trabalhador e a sua história de vida.', 'Heart'),
  ('valor', 2, null, 'Sustentabilidade', null, 'Cuidamos do meio ambiente e do futuro das próximas gerações.', 'Leaf'),
  ('valor', 3, null, 'Inclusão', null, 'Promovemos oportunidades reais de renda e reconhecimento.', 'Handshake'),
  ('valor', 4, null, 'Transparência', null, 'Atuamos com clareza, ética e responsabilidade social.', 'Scale'),
  ('valor', 5, null, 'Trabalho coletivo', null, 'A união dos catadores é a base de toda a nossa força.', 'Users'),
  ('valor', 6, null, 'Educação ambiental', null, 'Conscientizamos a comunidade sobre a importância da reciclagem.', 'Sun'),
  ('atuacao', 1, null, 'Reciclagem e coleta seletiva', null, 'Coleta, triagem e destinação correta de materiais recicláveis em Baturité.', 'Recycle'),
  ('atuacao', 2, null, 'Logística reversa', null, 'Retorno de materiais e embalagens ao ciclo produtivo, fortalecendo a economia circular.', 'Building2'),
  ('atuacao', 3, null, 'Educação ambiental', null, 'Ações de conscientização da comunidade sobre o descarte correto dos resíduos.', 'Sun'),
  ('atuacao', 4, null, 'Valorização humana', null, 'Geração de renda, inclusão social e reconhecimento do trabalho dos catadores.', 'HeartHandshake'),
  ('futuro', 1, 'Próximos passos', 'Expansão institucional e novas ações ambientais', null,
   'A ACMRB busca ampliar sua atuação com educação ambiental, coleta seletiva, novas parcerias ESG, capacitações técnicas, profissionalização operacional e fortalecimento da economia circular em Baturité.',
   null)
on conflict (secao, ordem) do nothing;

-- ==========================================================
-- 3. ASSOCIADOS v2
-- ==========================================================

-- Garante a tabela e a coluna updated_at (usada pelo gatilho)
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

alter table public.associados add column if not exists updated_at timestamptz not null default now();

-- RLS: público lê só ativos; administradores ativos gerenciam tudo
alter table public.associados enable row level security;

drop policy if exists "public can read active associados" on public.associados;
create policy "public can read active associados"
on public.associados for select
using (ativo = true);

drop policy if exists "authenticated admins can manage associados" on public.associados;
create policy "authenticated admins can manage associados"
on public.associados for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

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
  check (cpf is null or cpf ~ '^[0-9]{11}$') not valid;

alter table public.associados drop constraint if exists associados_nome_check;
alter table public.associados add constraint associados_nome_check
  check (length(trim(nome)) >= 3) not valid; -- not valid: não reprova linhas antigas

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

commit;

-- ==========================================================
-- 4. VERIFICAÇÃO (só leitura) — confira o resultado abaixo
-- ==========================================================

-- Colunas da tabela associados (deve incluir cpf, whatsapp, bairro, status)
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'associados'
order by ordinal_position;

-- Tabelas, views e funções criadas (todas devem aparecer como "ok")
select item, case when existe then 'ok' else 'FALTANDO' end as situacao
from (values
  ('tabela parceiros',            to_regclass('public.parceiros') is not null),
  ('tabela quem_somos_conteudo',  to_regclass('public.quem_somos_conteudo') is not null),
  ('view associados_publicos',    to_regclass('public.associados_publicos') is not null),
  ('view associados_admin',       to_regclass('public.associados_admin') is not null),
  ('função set_updated_at',       to_regprocedure('public.set_updated_at()') is not null),
  ('função is_active_admin',      to_regprocedure('public.is_active_admin()') is not null),
  ('conteúdo quem somos (linhas)', (select count(*) > 0 from public.quem_somos_conteudo))
) as t(item, existe);
