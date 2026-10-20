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
