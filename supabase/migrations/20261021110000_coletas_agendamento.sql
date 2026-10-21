-- ==========================================================
-- ACMRB — Agendamento de coleta + chat (visitante ↔ admins)
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS de 20261021100000_calendario_coleta.sql.
-- Pode ser rodado mais de uma vez.
--
-- 1. coleta_solicitacoes: pedido do visitante (endereço, ponto no mapa,
--    materiais, quantidade, data/período preferidos, foto) + status:
--    enviado → recebido → agendado → concluido | cancelado.
-- 2. coleta_mensagens: chat do pedido, com lida_em (confirmação de leitura).
-- 3. RLS: visitante vê/cria só o que é dele (e só pode CANCELAR o
--    próprio pedido); admins ativos (is_active_admin) veem e alteram tudo.
-- 4. coleta_marcar_lidas(): marca como lidas as mensagens do outro lado.
-- 5. Bucket privado "coletas" (fotos) — pasta = id do usuário.
-- 6. Realtime nas mensagens (se a publicação existir).
-- ==========================================================

begin;

-- 1. Pedidos
create table if not exists public.coleta_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  endereco text not null check (char_length(endereco) between 5 and 200),
  bairro text not null check (char_length(bairro) between 2 and 80),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  materiais text[] not null default '{}' check (cardinality(materiais) between 1 and 15),
  quantidade text not null check (char_length(quantidade) between 1 and 60),
  data_preferida date,
  periodo text not null default 'qualquer' check (periodo in ('manha', 'tarde', 'qualquer')),
  observacoes text check (char_length(observacoes) <= 1000),
  foto_path text check (char_length(foto_path) <= 300),
  status text not null default 'enviado'
    check (status in ('enviado', 'recebido', 'agendado', 'concluido', 'cancelado')),
  data_agendada date,
  janela_agendada text check (char_length(janela_agendada) <= 60),
  recebido_em timestamptz,
  agendado_em timestamptz,
  concluido_em timestamptz,
  cancelado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_coleta_sol_usuario on public.coleta_solicitacoes (auth_user_id, created_at desc);
create index if not exists idx_coleta_sol_status on public.coleta_solicitacoes (status, created_at desc);
create index if not exists idx_coleta_sol_agenda on public.coleta_solicitacoes (data_agendada);

drop trigger if exists set_coleta_sol_updated_at on public.coleta_solicitacoes;
create trigger set_coleta_sol_updated_at
before update on public.coleta_solicitacoes
for each row execute function public.set_updated_at();

-- Datas de cada etapa + trava do visitante (só pode cancelar)
create or replace function public.coleta_sol_antes_salvar()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  admin boolean := current_user not in ('anon', 'authenticated') or public.is_active_admin();
begin
  if tg_op = 'INSERT' then
    if not admin then
      new.auth_user_id := auth.uid();
      new.status := 'enviado';
      new.data_agendada := null;
      new.janela_agendada := null;
    end if;
    return new;
  end if;

  -- UPDATE feito pelo visitante: só cancelar enquanto não concluído
  if not admin then
    if new.status is distinct from 'cancelado' or old.status in ('concluido', 'cancelado') then
      raise exception 'Você só pode cancelar um pedido em andamento.';
    end if;
    new := old;
    new.status := 'cancelado';
  end if;

  if new.status is distinct from old.status then
    case new.status
      when 'recebido' then new.recebido_em := coalesce(new.recebido_em, now());
      when 'agendado' then new.agendado_em := now(); new.recebido_em := coalesce(new.recebido_em, now());
      when 'concluido' then new.concluido_em := now();
      when 'cancelado' then new.cancelado_em := now();
      else null;
    end case;
  end if;
  return new;
end;
$$;

drop trigger if exists coleta_sol_antes_salvar on public.coleta_solicitacoes;
create trigger coleta_sol_antes_salvar
before insert or update on public.coleta_solicitacoes
for each row execute function public.coleta_sol_antes_salvar();

-- 2. Mensagens
create table if not exists public.coleta_mensagens (
  id bigint generated always as identity primary key,
  solicitacao_id uuid not null references public.coleta_solicitacoes(id) on delete cascade,
  autor_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  autor_tipo text not null check (autor_tipo in ('visitante', 'admin')),
  autor_nome text check (char_length(autor_nome) <= 80),
  texto text not null check (char_length(trim(texto)) between 1 and 2000),
  lida_em timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_coleta_msg_sol on public.coleta_mensagens (solicitacao_id, created_at);

-- 3. RLS
alter table public.coleta_solicitacoes enable row level security;
alter table public.coleta_mensagens enable row level security;

drop policy if exists "visitante le os proprios pedidos" on public.coleta_solicitacoes;
create policy "visitante le os proprios pedidos"
on public.coleta_solicitacoes for select to authenticated
using (auth_user_id = auth.uid() or public.is_active_admin());

drop policy if exists "visitante cria pedido" on public.coleta_solicitacoes;
create policy "visitante cria pedido"
on public.coleta_solicitacoes for insert to authenticated
with check (
  auth_user_id = auth.uid()
  and exists (select 1 from public.visitantes v where v.auth_user_id = auth.uid() and v.ativo = true)
);

drop policy if exists "visitante cancela o proprio pedido" on public.coleta_solicitacoes;
create policy "visitante cancela o proprio pedido"
on public.coleta_solicitacoes for update to authenticated
using (auth_user_id = auth.uid() or public.is_active_admin())
with check (auth_user_id = auth.uid() or public.is_active_admin());

drop policy if exists "admins excluem pedidos" on public.coleta_solicitacoes;
create policy "admins excluem pedidos"
on public.coleta_solicitacoes for delete to authenticated
using (public.is_active_admin());

drop policy if exists "le mensagens do pedido" on public.coleta_mensagens;
create policy "le mensagens do pedido"
on public.coleta_mensagens for select to authenticated
using (
  public.is_active_admin()
  or exists (select 1 from public.coleta_solicitacoes s where s.id = solicitacao_id and s.auth_user_id = auth.uid())
);

drop policy if exists "envia mensagem no pedido" on public.coleta_mensagens;
create policy "envia mensagem no pedido"
on public.coleta_mensagens for insert to authenticated
with check (
  autor_id = auth.uid()
  and (
    (autor_tipo = 'admin' and public.is_active_admin())
    or (
      autor_tipo = 'visitante' and not public.is_active_admin()
      and exists (
        select 1 from public.coleta_solicitacoes s
        where s.id = solicitacao_id and s.auth_user_id = auth.uid() and s.status <> 'cancelado'
      )
    )
  )
);

grant select, insert, update, delete on public.coleta_solicitacoes to authenticated;
grant select, insert on public.coleta_mensagens to authenticated;

-- 4. Confirmação de leitura: marca as mensagens do OUTRO lado como lidas
create or replace function public.coleta_marcar_lidas(p_solicitacao uuid)
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
    select 1 from public.coleta_solicitacoes where id = p_solicitacao and auth_user_id = auth.uid()
  ) then
    return 0;
  end if;
  update public.coleta_mensagens
     set lida_em = now()
   where solicitacao_id = p_solicitacao
     and lida_em is null
     and autor_tipo = case when admin then 'visitante' else 'admin' end;
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke all on function public.coleta_marcar_lidas(uuid) from public, anon;
grant execute on function public.coleta_marcar_lidas(uuid) to authenticated;

-- 5. Storage: bucket privado de fotos (até 5 MB, só imagens)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('coletas', 'coletas', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "coletas_foto_envia_dono" on storage.objects;
create policy "coletas_foto_envia_dono"
on storage.objects for insert to authenticated
with check (bucket_id = 'coletas' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "coletas_foto_le" on storage.objects;
create policy "coletas_foto_le"
on storage.objects for select to authenticated
using (bucket_id = 'coletas' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_active_admin()));

drop policy if exists "coletas_foto_apaga" on storage.objects;
create policy "coletas_foto_apaga"
on storage.objects for delete to authenticated
using (bucket_id = 'coletas' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_active_admin()));

commit;

-- 6. Realtime (fora da transação: se a publicação não existir, só avisa)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'coleta_mensagens'
     ) then
    alter publication supabase_realtime add table public.coleta_mensagens;
  end if;
exception when others then
  raise notice 'Realtime não configurado (%). O chat usa atualização a cada 15 s.', sqlerrm;
end $$;
