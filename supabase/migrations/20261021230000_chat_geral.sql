-- ==========================================================
-- ACMRB — Chat geral visitante ↔ equipe (separado das coletas)
-- ----------------------------------------------------------
-- Rode DEPOIS de 20261021220000_visitantes_contato.sql.
-- Pode ser rodado mais de uma vez.
--
--  1. chat_conversas: UMA conversa por visitante (auth_user_id único),
--     com resumo da última mensagem (atualizado por gatilho).
--  2. chat_mensagens: autor_tipo 'visitante' | 'admin', lida_em
--     (✓ enviada / ✓✓ entregue / ✓✓ azul "Visualizada").
--  3. RLS: visitante só a própria conversa; is_active_admin() vê tudo.
--  4. Funções:
--     - chat_minha_conversa(): devolve (e cria se faltar) a conversa
--       do visitante logado
--     - chat_marcar_lidas(conversa): marca como lidas as do OUTRO lado
--     - chat_nao_lidas(): total não lido para quem chama (admin: de
--       todos os visitantes; visitante: respostas da equipe)
--     - chat_admin_conversas(): lista para o painel com nome, telefone,
--       cidade, bairro e canal preferido do visitante (só esses campos;
--       admin normal não lê a tabela visitantes diretamente)
--  5. Realtime em chat_mensagens e chat_conversas (se disponível).
-- ==========================================================

begin;

-- 1. Conversas
create table if not exists public.chat_conversas (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  ultima_msg_em timestamptz,
  ultima_msg_texto text,
  ultima_msg_autor text check (ultima_msg_autor is null or ultima_msg_autor in ('visitante', 'admin'))
);
create index if not exists idx_chat_conversas_ultima on public.chat_conversas (ultima_msg_em desc nulls last);

-- 2. Mensagens
create table if not exists public.chat_mensagens (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references public.chat_conversas(id) on delete cascade,
  autor_id uuid not null default auth.uid(),
  autor_tipo text not null check (autor_tipo in ('visitante', 'admin')),
  autor_nome text,
  texto text not null check (char_length(trim(texto)) between 1 and 2000),
  created_at timestamptz not null default now(),
  lida_em timestamptz
);
create index if not exists idx_chat_mensagens_conversa on public.chat_mensagens (conversa_id, created_at);
create index if not exists idx_chat_mensagens_nao_lidas on public.chat_mensagens (conversa_id, autor_tipo) where lida_em is null;

-- Resumo da última mensagem na conversa (para a lista do painel)
create or replace function public.chat_msg_apos_inserir()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_conversas
     set ultima_msg_em = new.created_at,
         ultima_msg_texto = left(new.texto, 140),
         ultima_msg_autor = new.autor_tipo
   where id = new.conversa_id;
  return new;
end;
$$;
drop trigger if exists chat_msg_apos_inserir on public.chat_mensagens;
create trigger chat_msg_apos_inserir
after insert on public.chat_mensagens
for each row execute function public.chat_msg_apos_inserir();

-- Ninguém edita mensagem pelo navegador (lida_em só pela função)
create or replace function public.chat_msg_antes_inserir()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.lida_em := null;
  new.created_at := now();
  new.texto := trim(new.texto);
  return new;
end;
$$;
drop trigger if exists chat_msg_antes_inserir on public.chat_mensagens;
create trigger chat_msg_antes_inserir
before insert on public.chat_mensagens
for each row execute function public.chat_msg_antes_inserir();

-- 3. RLS
alter table public.chat_conversas enable row level security;
alter table public.chat_mensagens enable row level security;

drop policy if exists "chat conversa le" on public.chat_conversas;
create policy "chat conversa le"
on public.chat_conversas for select to authenticated
using (auth_user_id = auth.uid() or public.is_active_admin());

drop policy if exists "chat conversa cria a propria" on public.chat_conversas;
create policy "chat conversa cria a propria"
on public.chat_conversas for insert to authenticated
with check (auth_user_id = auth.uid() and not public.is_active_admin());

drop policy if exists "chat mensagem le" on public.chat_mensagens;
create policy "chat mensagem le"
on public.chat_mensagens for select to authenticated
using (
  public.is_active_admin()
  or exists (select 1 from public.chat_conversas c where c.id = conversa_id and c.auth_user_id = auth.uid())
);

drop policy if exists "chat mensagem envia" on public.chat_mensagens;
create policy "chat mensagem envia"
on public.chat_mensagens for insert to authenticated
with check (
  autor_id = auth.uid()
  and (
    (autor_tipo = 'admin' and public.is_active_admin())
    or (
      autor_tipo = 'visitante' and not public.is_active_admin()
      and exists (select 1 from public.chat_conversas c where c.id = conversa_id and c.auth_user_id = auth.uid())
    )
  )
);

grant select, insert on public.chat_conversas to authenticated;
grant select, insert on public.chat_mensagens to authenticated;

-- 4. Funções
create or replace function public.chat_minha_conversa()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  if auth.uid() is null or public.is_active_admin() then return null; end if;
  select id into cid from public.chat_conversas where auth_user_id = auth.uid();
  if cid is null then
    insert into public.chat_conversas (auth_user_id) values (auth.uid())
    on conflict (auth_user_id) do nothing
    returning id into cid;
    if cid is null then
      select id into cid from public.chat_conversas where auth_user_id = auth.uid();
    end if;
  end if;
  return cid;
end;
$$;

create or replace function public.chat_marcar_lidas(p_conversa uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  admin boolean := public.is_active_admin();
  n integer;
begin
  if auth.uid() is null then return 0; end if;
  if not admin and not exists (
    select 1 from public.chat_conversas where id = p_conversa and auth_user_id = auth.uid()
  ) then
    return 0;
  end if;
  update public.chat_mensagens
     set lida_em = now()
   where conversa_id = p_conversa
     and lida_em is null
     and autor_tipo = case when admin then 'visitante' else 'admin' end;
  get diagnostics n = row_count;
  return n;
end;
$$;

create or replace function public.chat_nao_lidas()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then 0
    when public.is_active_admin() then (
      select count(*)::int from public.chat_mensagens where autor_tipo = 'visitante' and lida_em is null
    )
    else (
      select count(*)::int
        from public.chat_mensagens m
        join public.chat_conversas c on c.id = m.conversa_id
       where c.auth_user_id = auth.uid() and m.autor_tipo = 'admin' and m.lida_em is null
    )
  end;
$$;

-- Lista do painel: só os campos de contato necessários do visitante
create or replace function public.chat_admin_conversas()
returns table (
  conversa_id uuid,
  auth_user_id uuid,
  nome text,
  telefone text,
  cidade text,
  bairro text,
  contato_preferido text,
  email text,
  ultima_msg_em timestamptz,
  ultima_msg_texto text,
  ultima_msg_autor text,
  nao_lidas integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_active_admin() then
    return;
  end if;
  return query
  select c.id, c.auth_user_id, v.nome, v.telefone, v.cidade, v.bairro, v.contato_preferido, v.email,
         c.ultima_msg_em, c.ultima_msg_texto, c.ultima_msg_autor,
         (select count(*)::int from public.chat_mensagens m
           where m.conversa_id = c.id and m.autor_tipo = 'visitante' and m.lida_em is null)
    from public.chat_conversas c
    left join public.visitantes v on v.auth_user_id = c.auth_user_id
   where c.ultima_msg_em is not null
   order by c.ultima_msg_em desc;
end;
$$;

revoke all on function public.chat_minha_conversa() from public, anon;
revoke all on function public.chat_marcar_lidas(uuid) from public, anon;
revoke all on function public.chat_nao_lidas() from public, anon;
revoke all on function public.chat_admin_conversas() from public, anon;
grant execute on function public.chat_minha_conversa() to authenticated;
grant execute on function public.chat_marcar_lidas(uuid) to authenticated;
grant execute on function public.chat_nao_lidas() to authenticated;
grant execute on function public.chat_admin_conversas() to authenticated;

commit;

-- 5. Realtime (fora da transação: se não houver publicação, só avisa)
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['chat_mensagens', 'chat_conversas'] loop
      if not exists (
        select 1 from pg_publication_tables
         where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
exception when others then
  raise notice 'Realtime não configurado (%). O chat usa atualização a cada 12 s.', sqlerrm;
end $$;
