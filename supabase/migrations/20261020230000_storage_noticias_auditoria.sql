-- ============================================================
-- Auditoria das permissões do Storage: bucket "noticias"
-- ============================================================
-- Pode rodar mais de uma vez (idempotente).
-- Depende de: 20261020180000_admins_papeis.sql (função is_deus())
--             20261020220000_noticias_completo.sql (bucket noticias)
--
-- Como usar: cole tudo no SQL Editor do Supabase e clique em Run.
-- Veja as mensagens na aba "Messages" (o que foi removido/mantido)
-- e a tabela no final (as permissões que ficaram).
--
-- Só mexe em permissões do bucket "noticias". Outros buckets
-- (fotos, documentos etc.) NÃO são tocados.
-- ============================================================

-- ---------- 0. Segurança: a função is_deus() precisa existir ----------
-- Se não existir, paramos aqui para não deixar o bucket sem regra.
do $$
begin
  if to_regprocedure('public.is_deus()') is null then
    raise exception 'Função public.is_deus() não encontrada. Rode antes 20261020180000_admins_papeis.sql';
  end if;
end
$$;

-- ---------- 1. Procura permissões antigas/inseguras ----------
-- Olha todas as permissões da tabela storage.objects que citam o
-- bucket 'noticias' e que NÃO são as 4 criadas pela nossa migration.
--   * Se a permissão deixa enviar, editar ou apagar (INSERT, UPDATE,
--     DELETE ou ALL) -> é removida, pois pode liberar qualquer admin.
--   * Se é só de leitura (SELECT) -> é mantida (imagens são públicas).
do $$
declare
  p record;
  removidas integer := 0;
begin
  for p in
    select policyname, cmd
      from pg_policies
     where schemaname = 'storage'
       and tablename  = 'objects'
       and (coalesce(qual, '') like '%''noticias''%'
            or coalesce(with_check, '') like '%''noticias''%')
       and policyname not in (
             'noticias_storage_publico_le',
             'noticias_storage_deus_envia',
             'noticias_storage_deus_edita',
             'noticias_storage_deus_exclui')
  loop
    if p.cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL') then
      execute format('drop policy %I on storage.objects', p.policyname);
      removidas := removidas + 1;
      raise notice 'Removida: "%" (%)', p.policyname, p.cmd;
    else
      raise notice 'Mantida (leitura): "%" (%)', p.policyname, p.cmd;
    end if;
  end loop;

  if removidas = 0 then
    raise notice 'Tudo certo: nenhuma permissão insegura encontrada';
  end if;
end
$$;

-- ---------- 2. Garante as permissões corretas ----------
-- Cria só as que estiverem faltando (as que já existem ficam como estão):
--   * qualquer pessoa pode VER as imagens do bucket noticias
--   * só o ADM DEUS pode enviar, editar e apagar imagens
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage'
                  and tablename = 'objects' and policyname = 'noticias_storage_publico_le') then
    create policy "noticias_storage_publico_le"
    on storage.objects for select
    using (bucket_id = 'noticias');
    raise notice 'Criada: noticias_storage_publico_le';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage'
                  and tablename = 'objects' and policyname = 'noticias_storage_deus_envia') then
    create policy "noticias_storage_deus_envia"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'noticias' and public.is_deus());
    raise notice 'Criada: noticias_storage_deus_envia';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage'
                  and tablename = 'objects' and policyname = 'noticias_storage_deus_edita') then
    create policy "noticias_storage_deus_edita"
    on storage.objects for update to authenticated
    using (bucket_id = 'noticias' and public.is_deus())
    with check (bucket_id = 'noticias' and public.is_deus());
    raise notice 'Criada: noticias_storage_deus_edita';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage'
                  and tablename = 'objects' and policyname = 'noticias_storage_deus_exclui') then
    create policy "noticias_storage_deus_exclui"
    on storage.objects for delete to authenticated
    using (bucket_id = 'noticias' and public.is_deus());
    raise notice 'Criada: noticias_storage_deus_exclui';
  end if;
end
$$;

-- ---------- 3. Resultado ----------
-- Lista as permissões que ficaram para o bucket noticias.
-- O esperado: 1 de leitura (SELECT) e 3 de escrita com is_deus().
select policyname, cmd, roles, qual, with_check
  from pg_policies
 where schemaname = 'storage'
   and tablename  = 'objects'
   and (coalesce(qual, '') like '%''noticias''%'
        or coalesce(with_check, '') like '%''noticias''%')
 order by cmd, policyname;
