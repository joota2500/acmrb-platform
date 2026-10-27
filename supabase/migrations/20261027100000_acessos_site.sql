-- ==========================================================
-- ACMRB — Acessos ao site (inclusive de quem NÃO tem cadastro)
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS das migrations anteriores
-- (precisa de public.is_deus(), criada em 20261020180000).
-- Pode ser rodado mais de uma vez.
--
-- O que guarda (sem IP e sem dados pessoais de quem não se cadastrou):
--   * um id aleatório do navegador (anon_id), páginas, tempo de leitura,
--     origem (site de onde veio, utm), aparelho/navegador e a região
--     aproximada (cidade/estado/país vindos dos cabeçalhos da Vercel).
-- Quem grava: SOMENTE o servidor (rota /api/acessos, service role).
-- Quem lê: SOMENTE o ADM DEUS (is_deus()).
--
-- Privacidade / LGPD:
--   * Registros de quem não fez login somem 24 h depois da última
--     atividade (função acessos_limpar, agendada na migration
--     20261027120000). Antes de apagar, viram apenas contagens somadas
--     por dia (tabelas *_diario), que não identificam ninguém.
--   * Quem faz login/cadastro "adota" os próprios acessos (auth_user_id)
--     e esses ficam enquanto a conta existir (apagar a conta apaga tudo).
-- ==========================================================

begin;

-- 1. Sessões (uma por visita/aba)
create table if not exists public.acessos_sessoes (
  id               uuid primary key,                      -- gerado no navegador (sessionStorage)
  anon_id          uuid not null,                         -- id aleatório do navegador (localStorage)
  auth_user_id     uuid references auth.users(id) on delete cascade,
  iniciada_em      timestamptz not null default now(),
  ultima_atividade timestamptz not null default now(),
  encerrada_em     timestamptz,
  duracao_seg      integer not null default 0 check (duracao_seg >= 0),
  paginas          integer not null default 0 check (paginas >= 0),
  pagina_inicial   text check (char_length(pagina_inicial) <= 300),
  referrer         text check (char_length(referrer) <= 300),
  referrer_host    text check (char_length(referrer_host) <= 120),
  origem           text check (char_length(origem) <= 40),   -- direto, busca, rede social, e-mail, outros sites, campanha
  utm_source       text check (char_length(utm_source) <= 80),
  utm_medium       text check (char_length(utm_medium) <= 80),
  utm_campaign     text check (char_length(utm_campaign) <= 80),
  dispositivo      text check (dispositivo in ('celular', 'tablet', 'computador', 'desconhecido')),
  navegador        text check (char_length(navegador) <= 40),
  sistema          text check (char_length(sistema) <= 40),
  tela_largura     integer check (tela_largura between 0 and 20000),
  idioma           text check (char_length(idioma) <= 20),
  cidade           text check (char_length(cidade) <= 80),
  regiao           text check (char_length(regiao) <= 80),
  pais             text check (char_length(pais) <= 80)
);
create index if not exists idx_acessos_sess_atividade on public.acessos_sessoes (ultima_atividade desc);
create index if not exists idx_acessos_sess_inicio    on public.acessos_sessoes (iniciada_em desc);
create index if not exists idx_acessos_sess_anon      on public.acessos_sessoes (anon_id);
create index if not exists idx_acessos_sess_usuario   on public.acessos_sessoes (auth_user_id) where auth_user_id is not null;

-- 2. Páginas vistas dentro da sessão
create table if not exists public.acessos_paginas (
  id          bigint generated always as identity primary key,
  sessao_id   uuid not null references public.acessos_sessoes(id) on delete cascade,
  caminho     text not null check (char_length(caminho) <= 300),
  entrou_em   timestamptz not null default now(),
  duracao_seg integer not null default 0 check (duracao_seg >= 0)
);
create index if not exists idx_acessos_pag_sessao on public.acessos_paginas (sessao_id, id);
create index if not exists idx_acessos_pag_entrou on public.acessos_paginas (entrou_em desc);

-- 3. Totais por dia (o que sobra depois que os anônimos expiram)
create table if not exists public.acessos_diario (
  dia         date not null,
  dispositivo text not null default '',
  pais        text not null default '',
  regiao      text not null default '',
  cidade      text not null default '',
  origem      text not null default '',
  sessoes     integer not null default 0,
  visitantes  integer not null default 0,   -- aproximado (soma de ids distintos por grupo)
  paginas     integer not null default 0,
  duracao_seg bigint  not null default 0,
  primary key (dia, dispositivo, pais, regiao, cidade, origem)
);

create table if not exists public.acessos_paginas_diario (
  dia         date not null,
  caminho     text not null,
  visualizacoes integer not null default 0,
  duracao_seg bigint  not null default 0,
  primary key (dia, caminho)
);

-- 4. RLS: ninguém grava pelo navegador; só o deus lê (e apaga)
alter table public.acessos_sessoes        enable row level security;
alter table public.acessos_paginas        enable row level security;
alter table public.acessos_diario         enable row level security;
alter table public.acessos_paginas_diario enable row level security;

revoke all on public.acessos_sessoes, public.acessos_paginas,
              public.acessos_diario, public.acessos_paginas_diario from anon, authenticated;
grant select, delete on public.acessos_sessoes, public.acessos_paginas,
                        public.acessos_diario, public.acessos_paginas_diario to authenticated;
grant all on public.acessos_sessoes, public.acessos_paginas,
             public.acessos_diario, public.acessos_paginas_diario to service_role;
grant usage, select on sequence public.acessos_paginas_id_seq to service_role;

do $$
declare t text;
begin
  foreach t in array array['acessos_sessoes', 'acessos_paginas', 'acessos_diario', 'acessos_paginas_diario'] loop
    execute format('drop policy if exists %I on public.%I', t || '_deus_le', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.is_deus())', t || '_deus_le', t);
    execute format('drop policy if exists %I on public.%I', t || '_deus_apaga', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_deus())', t || '_deus_apaga', t);
  end loop;
end $$;

-- 5. Limpeza: anônimos com mais de p_horas sem atividade viram totais do dia e são apagados
create or replace function public.acessos_limpar(p_horas integer default 24)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limite timestamptz := now() - make_interval(hours => greatest(p_horas, 1));
  v_ids uuid[];
  v_qtd integer := 0;
begin
  -- Trava as linhas escolhidas para nada mudar entre a soma e a exclusão
  select coalesce(array_agg(id), '{}') into v_ids
  from (
    select id from public.acessos_sessoes
     where auth_user_id is null and ultima_atividade < v_limite
     for update
  ) x;

  if cardinality(v_ids) = 0 then
    return jsonb_build_object('sessoes_apagadas', 0);
  end if;

  insert into public.acessos_diario as d (dia, dispositivo, pais, regiao, cidade, origem, sessoes, visitantes, paginas, duracao_seg)
  select (s.iniciada_em at time zone 'America/Fortaleza')::date,
         coalesce(s.dispositivo, ''), coalesce(s.pais, ''), coalesce(s.regiao, ''),
         coalesce(s.cidade, ''), coalesce(s.origem, ''),
         count(*), count(distinct s.anon_id), coalesce(sum(s.paginas), 0), coalesce(sum(s.duracao_seg), 0)
    from public.acessos_sessoes s
   where s.id = any(v_ids)
   group by 1, 2, 3, 4, 5, 6
  on conflict (dia, dispositivo, pais, regiao, cidade, origem) do update
    set sessoes = d.sessoes + excluded.sessoes,
        visitantes = d.visitantes + excluded.visitantes,
        paginas = d.paginas + excluded.paginas,
        duracao_seg = d.duracao_seg + excluded.duracao_seg;

  insert into public.acessos_paginas_diario as d (dia, caminho, visualizacoes, duracao_seg)
  select (p.entrou_em at time zone 'America/Fortaleza')::date, p.caminho, count(*), coalesce(sum(p.duracao_seg), 0)
    from public.acessos_paginas p
   where p.sessao_id = any(v_ids)
   group by 1, 2
  on conflict (dia, caminho) do update
    set visualizacoes = d.visualizacoes + excluded.visualizacoes,
        duracao_seg = d.duracao_seg + excluded.duracao_seg;

  delete from public.acessos_sessoes where id = any(v_ids);   -- as páginas caem junto (CASCADE)
  v_qtd := cardinality(v_ids);

  -- Totais por dia com mais de 2 anos não precisam ficar
  delete from public.acessos_diario where dia < current_date - 730;
  delete from public.acessos_paginas_diario where dia < current_date - 730;

  return jsonb_build_object('sessoes_apagadas', v_qtd);
end;
$$;

revoke all on function public.acessos_limpar(integer) from public, anon, authenticated;
grant execute on function public.acessos_limpar(integer) to service_role;

-- 6. Painel (somente deus): números prontos para os gráficos
create or replace function public.acessos_painel(p_dias integer default 7)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_dias integer := least(greatest(coalesce(p_dias, 7), 1), 90);
  v_ini date := (now() at time zone 'America/Fortaleza')::date - (least(greatest(coalesce(p_dias, 7), 1), 90) - 1);
  v_ini_ts timestamptz;
  v_hoje date := (now() at time zone 'America/Fortaleza')::date;
  r jsonb;
begin
  if not public.is_deus() then
    raise exception 'Somente o ADM DEUS pode ver os acessos.' using errcode = '42501';
  end if;
  v_ini_ts := v_ini::timestamp at time zone 'America/Fortaleza';

  with vivo as (
    select (iniciada_em at time zone 'America/Fortaleza')::date as dia,
           coalesce(dispositivo, '') as dispositivo, coalesce(pais, '') as pais,
           coalesce(regiao, '') as regiao, coalesce(cidade, '') as cidade, coalesce(origem, '') as origem,
           count(*)::int as sessoes,
           count(distinct anon_id)::int as visitantes,
           coalesce(sum(paginas), 0)::int as paginas,
           coalesce(sum(duracao_seg), 0)::bigint as duracao_seg,
           count(*) filter (where auth_user_id is null)::int as anonimas,
           count(*) filter (where auth_user_id is not null)::int as logadas
      from public.acessos_sessoes
     where iniciada_em >= v_ini_ts
     group by 1, 2, 3, 4, 5, 6
  ),
  base as (
    select * from vivo
    union all
    select dia, dispositivo, pais, regiao, cidade, origem, sessoes, visitantes, paginas, duracao_seg, sessoes, 0
      from public.acessos_diario where dia >= v_ini
  ),
  pags as (
    select (entrou_em at time zone 'America/Fortaleza')::date as dia, caminho, count(*)::int as v, coalesce(sum(duracao_seg), 0)::bigint as d
      from public.acessos_paginas where entrou_em >= v_ini_ts group by 1, 2
    union all
    select dia, caminho, visualizacoes, duracao_seg from public.acessos_paginas_diario where dia >= v_ini
  )
  select jsonb_build_object(
    'dias', v_dias,
    'online_agora', (select count(*) from public.acessos_sessoes where encerrada_em is null and ultima_atividade > now() - interval '2 minutes'),
    'logados_agora', (select count(*) from public.acessos_sessoes where encerrada_em is null and ultima_atividade > now() - interval '2 minutes' and auth_user_id is not null),
    'hoje', (select jsonb_build_object(
        'sessoes', coalesce(sum(sessoes), 0), 'visitantes', coalesce(sum(visitantes), 0),
        'paginas', coalesce(sum(paginas), 0), 'duracao_seg', coalesce(sum(duracao_seg), 0),
        'anonimas', coalesce(sum(anonimas), 0), 'logadas', coalesce(sum(logadas), 0))
      from base where dia = v_hoje),
    'periodo', (select jsonb_build_object(
        'sessoes', coalesce(sum(sessoes), 0), 'visitantes', coalesce(sum(visitantes), 0),
        'paginas', coalesce(sum(paginas), 0), 'duracao_seg', coalesce(sum(duracao_seg), 0),
        'anonimas', coalesce(sum(anonimas), 0), 'logadas', coalesce(sum(logadas), 0))
      from base),
    'cadastrados_total', (select count(*) from public.visitantes),
    'cadastrados_ativos', (select count(*) from public.visitantes where ativo),
    'novos_cadastros', (select count(*) from public.visitantes where created_at >= v_ini_ts),
    'serie', coalesce((select jsonb_agg(jsonb_build_object('dia', g.dia, 'sessoes', coalesce(b.sessoes, 0), 'visitantes', coalesce(b.visitantes, 0), 'logadas', coalesce(b.logadas, 0)) order by g.dia)
        from generate_series(v_ini::timestamp, v_hoje::timestamp, interval '1 day') as g(dia)
        left join (select dia, sum(sessoes)::int sessoes, sum(visitantes)::int visitantes, sum(logadas)::int logadas from base group by dia) b on b.dia = g.dia::date), '[]'::jsonb),
    'dispositivos', coalesce((select jsonb_agg(x) from (select case when dispositivo = '' then 'desconhecido' else dispositivo end as nome, sum(sessoes)::int as total from base group by 1 order by 2 desc) x), '[]'::jsonb),
    'origens', coalesce((select jsonb_agg(x) from (select case when origem = '' then 'direto' else origem end as nome, sum(sessoes)::int as total from base group by 1 order by 2 desc limit 10) x), '[]'::jsonb),
    'paises', coalesce((select jsonb_agg(x) from (select case when pais = '' then 'Desconhecido' else pais end as nome, sum(sessoes)::int as total from base group by 1 order by 2 desc limit 10) x), '[]'::jsonb),
    'cidades', coalesce((select jsonb_agg(x) from (select case when cidade = '' then 'Desconhecida' else cidade end as nome, max(regiao) as regiao, sum(sessoes)::int as total from base group by 1 order by 3 desc limit 12) x), '[]'::jsonb),
    'paginas', coalesce((select jsonb_agg(x) from (select caminho as nome, sum(v)::int as total, (sum(d) / greatest(sum(v), 1))::int as media_seg from pags group by 1 order by 2 desc limit 12) x), '[]'::jsonb)
  ) into r;

  return r;
end;
$$;

revoke all on function public.acessos_painel(integer) from public, anon;
grant execute on function public.acessos_painel(integer) to authenticated;

-- 7. Quem está no site agora (somente deus)
create or replace function public.acessos_online()
returns table (
  id uuid, anon_id uuid, auth_user_id uuid, nome text, iniciada_em timestamptz, ultima_atividade timestamptz,
  duracao_seg integer, paginas integer, pagina_atual text, origem text, referrer_host text,
  dispositivo text, navegador text, sistema text, cidade text, regiao text, pais text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_deus() then
    raise exception 'Somente o ADM DEUS pode ver os acessos.' using errcode = '42501';
  end if;
  return query
    select s.id, s.anon_id, s.auth_user_id, v.nome, s.iniciada_em, s.ultima_atividade,
           greatest(s.duracao_seg, extract(epoch from (now() - s.iniciada_em))::int),
           s.paginas,
           (select p.caminho from public.acessos_paginas p where p.sessao_id = s.id order by p.id desc limit 1),
           s.origem, s.referrer_host, s.dispositivo, s.navegador, s.sistema, s.cidade, s.regiao, s.pais
      from public.acessos_sessoes s
      left join public.visitantes v on v.auth_user_id = s.auth_user_id
     where s.encerrada_em is null and s.ultima_atividade > now() - interval '2 minutes'
     order by s.iniciada_em desc
     limit 200;
end;
$$;

revoke all on function public.acessos_online() from public, anon;
grant execute on function public.acessos_online() to authenticated;

commit;

-- Verificação (só leitura)
select item, case when ok then 'ok' else 'FALTANDO' end as situacao
from (values
  ('tabela acessos_sessoes',        to_regclass('public.acessos_sessoes') is not null),
  ('tabela acessos_paginas',        to_regclass('public.acessos_paginas') is not null),
  ('anon sem leitura',              not has_table_privilege('anon', 'public.acessos_sessoes', 'select')),
  ('authenticated sem gravação',    not has_table_privilege('authenticated', 'public.acessos_sessoes', 'insert')),
  ('função acessos_limpar',         to_regprocedure('public.acessos_limpar(integer)') is not null),
  ('função acessos_painel',         to_regprocedure('public.acessos_painel(integer)') is not null)
) as t(item, ok);
