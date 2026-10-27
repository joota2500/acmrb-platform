-- ==========================================================
-- ACMRB — Revisão de segurança do banco (SOMENTE LEITURA)
-- ----------------------------------------------------------
-- Cole no Supabase → SQL Editor e rode. Não altera nada.
-- Cada bloco devolve uma tabela; o ideal é que os blocos 1, 2, 4 e 5
-- venham VAZIOS (ou só com itens que você conhece e aceitou).
-- ==========================================================

-- 1. Tabelas do schema public SEM RLS ligada (qualquer um com a chave
--    pública poderia ler/gravar, se houver permissão)
select c.relname as tabela_sem_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
order by 1;

-- 2. Políticas "abertas": using (true) ou with check (true), ou liberadas
--    para anon/public em escrita
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
  and (
    coalesce(qual, '') in ('true', '(true)') or coalesce(with_check, '') in ('true', '(true)')
    or (cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL') and (roles @> '{anon}' or roles @> '{public}'))
  )
order by tablename, policyname;

-- 3. O que o visitante sem login (anon) pode fazer em cada tabela
select table_name,
       string_agg(privilege_type, ', ' order by privilege_type) as permissoes_do_anon
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon'
group by table_name
order by 1;

-- 4. Funções SECURITY DEFINER liberadas para anon/public (rodam com
--    poder de administrador do banco: confira se cada uma checa quem chama)
select p.proname as funcao,
       has_function_privilege('anon', p.oid, 'execute') as anon_executa
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
  and has_function_privilege('anon', p.oid, 'execute')
order by 1;

-- 5. Views que rodam com o poder do dono (ignoram RLS de quem consulta)
select c.relname as view_sem_security_invoker
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'v'
  and not coalesce((select option_value = 'true' from pg_options_to_table(c.reloptions) where option_name = 'security_invoker'), false)
order by 1;

-- 6. Buckets de arquivos: públicos têm URL aberta para qualquer um
select id as bucket, public as publico, file_size_limit, allowed_mime_types
from storage.buckets
order by 1;

-- 7. Administradores ativos (deve ter no máximo 1 deus e 1 admin)
select email, role, ativo from public.admins order by role;

-- 8. Políticas de INSERT/UPDATE/DELETE por tabela (visão geral para revisar)
select tablename, cmd, count(*) as politicas
from pg_policies where schemaname = 'public'
group by 1, 2 order by 1, 2;
