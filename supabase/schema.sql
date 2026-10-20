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

-- is_active_admin() é criada logo após a tabela admins (precisa dela).


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

-- true se o usuário logado for administrador ativo (usada nas políticas RLS)
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

-- ==========================================================
-- Página /quem-somos — conteúdo institucional editável
-- ----------------------------------------------------------
-- Cada linha é um bloco de conteúdo, identificado por "secao":
--   hero        → título e textos de abertura (subtitulo = selo)
--   citacao     → frase em destaque
--   historia    → introdução da seção "Nossa história"
--   timeline    → marcos da linha do tempo (rotulo = período/data)
--   missao      → missão (vazio por enquanto: preencher no admin)
--   visao       → visão  (vazio por enquanto: preencher no admin)
--   valor       → um valor por linha (icone = nome do ícone Lucide)
--   atuacao     → "O que fazemos": uma frente de atuação por linha
--   futuro      → "Próximos passos"
-- "ordem" define a sequência na página. "ativo = false" esconde a linha.
-- Seguro para rodar mais de uma vez (não duplica o conteúdo inicial).
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
