-- ==========================================================
-- ACMRB — Revisão das regras de segurança do banco (RLS e permissões)
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS de todas as outras migrations.
-- Pode ser rodado mais de uma vez (não apaga nenhum dado).
-- No fim aparece uma tabela "conferencia": o certo é vir uma linha só,
-- escrito "tudo certo".
--
-- O que foi achado na revisão (e é corrigido aqui):
--   1. GRAVE — As views públicas apoiadores_publicos e
--      empresas_logistica_publicas rodam com o poder do dono (para
--      mostrar só as colunas seguras). Só que o Supabase dá, por padrão,
--      TODAS as permissões em views novas para anon/authenticated. Como
--      essas views são "simples" (uma tabela só), o Postgres deixa apagar
--      e alterar por elas — e aí a RLS das tabelas não vale.
--      Teste feito em 24/11/2026 com a chave pública (sem login):
--      DELETE em apoiadores_publicos com filtro que não pega nenhuma linha
--      respondeu 204 (permitido). Ou seja: qualquer pessoa conseguia apagar
--      apoiadores e empresas de logística.
--      → Correção: todas as views do schema public ficam SÓ LEITURA.
--   2. ALTO — A view associados_admin (dono) tinha o mesmo problema para
--      quem tem login: uma conta de visitante podia inserir associados por
--      ela. → Mesma correção (só leitura).
--   3. MÉDIO — Pelo padrão do Supabase o anon (visitante sem login) ainda
--      tinha permissão de inserir/alterar/apagar em várias tabelas. Hoje a
--      RLS barra, mas ficava uma camada só. → O anon perde toda escrita
--      direta (o site não usa: quem grava sem login é o servidor, com a
--      service_role). TRUNCATE (que ignora a RLS) sai de anon e authenticated.
--   4. MÉDIO — Tabelas com dados pessoais (visitantes, sessões, eventos,
--      chat, coletas) ainda tinham SELECT liberado para o anon (a RLS
--      escondia as linhas). → O anon perde o SELECT nelas.
--   5. BAIXO — 6 funções sem search_path fixo (aviso do Supabase
--      "function_search_path_mutable"). → search_path fixo.
--   6. BAIXO — Funções de gatilho com SECURITY DEFINER podiam ser chamadas
--      por qualquer um (não fazem nada fora do gatilho, mas é melhor fechar).
--
-- Já estava certo (conferido nas migrations e no banco):
--   * RLS ligada em todas as tabelas; tabelas internas (acessos, aparelhos,
--     limites, tentativas de login, auditoria) sem acesso do anon.
--   * Cada visitante só vê/edita o que é dele (perfil, pedidos de coleta,
--     chat); gatilhos impedem trocar papel, status ou e-mail.
--   * Funções SECURITY DEFINER com search_path fixo e conferindo quem chama.
--   * Bucket de fotos das coletas é privado (cada um na sua pasta).
-- ==========================================================

begin;

-- ---------- 1. RLS ligada em todas as tabelas (garantia) ----------
do $$
declare t record;
begin
  for t in
    select c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
  loop
    execute format('alter table public.%I enable row level security', t.relname);
    raise notice 'RLS ligada em %', t.relname;
  end loop;
end $$;

-- ---------- 2. Views: SÓ LEITURA para o site ----------
do $$
declare v record;
begin
  for v in
    select c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'v'
  loop
    execute format(
      'revoke insert, update, delete, truncate, references, trigger on public.%I from public, anon, authenticated',
      v.relname
    );
  end loop;
end $$;

-- devolve a leitura que o site usa (só se a view existir)
do $$
begin
  if to_regclass('public.apoiadores_publicos') is not null then
    grant select on public.apoiadores_publicos to anon, authenticated;
  end if;
  if to_regclass('public.empresas_logistica_publicas') is not null then
    grant select on public.empresas_logistica_publicas to anon, authenticated;
  end if;
  if to_regclass('public.repasses_logistica_publicos') is not null then
    grant select on public.repasses_logistica_publicos to anon, authenticated;
  end if;
  if to_regclass('public.associados_publicos') is not null then
    grant select on public.associados_publicos to anon, authenticated;
  end if;
  -- views do painel: só quem tem login (e elas mesmas filtram admin/deus)
  if to_regclass('public.associados_admin') is not null then
    revoke all on public.associados_admin from anon;
    grant select on public.associados_admin to authenticated;
  end if;
  if to_regclass('public.visitantes_atividade_resumo') is not null then
    revoke all on public.visitantes_atividade_resumo from anon;
    grant select on public.visitantes_atividade_resumo to authenticated;
  end if;
end $$;

-- ---------- 3. Tabelas: anon sem escrita direta; ninguém com TRUNCATE ----------
do $$
declare t record;
begin
  for t in
    select c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    execute format('revoke insert, update, delete, truncate, references, trigger on public.%I from anon', t.relname);
    execute format('revoke truncate, references, trigger on public.%I from authenticated', t.relname);
  end loop;
end $$;

-- ---------- 4. Dados pessoais: anon não lê nem com a RLS ----------
do $$
declare
  nome text;
  privadas text[] := array[
    'visitantes', 'visitante_sessoes', 'visitante_eventos',
    'chat_conversas', 'chat_mensagens',
    'coleta_solicitacoes', 'coleta_mensagens'
  ];
begin
  foreach nome in array privadas loop
    if to_regclass('public.' || nome) is not null then
      execute format('revoke all on public.%I from anon', nome);
    end if;
  end loop;
end $$;

-- ---------- 5. search_path fixo nas funções que não tinham ----------
-- (pula funções de extensões, que não são nossas)
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as assinatura
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
      and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')
  loop
    execute format('alter function %s set search_path = public, extensions, pg_temp', f.assinatura);
    raise notice 'search_path fixo em %', f.assinatura;
  end loop;
end $$;

-- ---------- 6. Funções de gatilho SECURITY DEFINER: ninguém chama direto ----------
-- (o gatilho continua funcionando: a permissão só é conferida ao criar o gatilho)
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as assinatura
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and p.prorettype = 'trigger'::regtype
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.assinatura);
  end loop;
end $$;

commit;

-- ---------- 7. Conferência (o certo é aparecer só "tudo certo") ----------
with problemas as (
  -- tabela sem RLS
  select 'tabela sem RLS: ' || c.relname as problema
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
  union all
  -- view que ainda aceita escrita do site
  select 'view aceita escrita: ' || c.relname
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'v'
    and (has_table_privilege('anon', c.oid, 'INSERT, UPDATE, DELETE')
         or has_table_privilege('authenticated', c.oid, 'INSERT, UPDATE, DELETE'))
  union all
  -- tabela em que o anon ainda escreve
  select 'anon escreve na tabela: ' || c.relname
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p')
    and has_table_privilege('anon', c.oid, 'INSERT, UPDATE, DELETE, TRUNCATE')
  union all
  -- função nossa sem search_path fixo
  select 'função sem search_path: ' || p.proname
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
    and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
    and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')
)
select problema as conferencia from problemas
union all
select 'tudo certo' where not exists (select 1 from problemas);
