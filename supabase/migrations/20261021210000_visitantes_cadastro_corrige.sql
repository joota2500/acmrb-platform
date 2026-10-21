-- ==========================================================
-- ACMRB — Corrige "Database error saving new user" no cadastro
-- ----------------------------------------------------------
-- Sintoma: supabase.auth.signUp devolve 500 "Database error saving
-- new user" para QUALQUER e-mail, com ou sem metadados. Isso significa
-- que algum gatilho em auth.users está lançando erro e desfazendo a
-- criação da conta.
--
-- PASSO 1 (diagnóstico, só leitura) — rode antes e guarde o resultado:
--
--   select t.tgname, p.proname, n.nspname
--     from pg_trigger t
--     join pg_proc p on p.oid = t.tgfoid
--     join pg_namespace n on n.oid = p.pronamespace
--    where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal;
--
--   O esperado é UMA linha: ao_criar_usuario_visitante /
--   criar_perfil_visitante. Se aparecer outro gatilho antigo (ex.:
--   on_auth_user_created / handle_new_user, criado pelo painel), ele
--   é o provável culpado: veja o bloco OPCIONAL no fim deste arquivo.
--
-- PASSO 2: rode este arquivo inteiro. Pode rodar mais de uma vez.
--
-- O que muda: o gatilho de perfil passa a NUNCA impedir o cadastro.
-- Se o perfil não puder ser criado (e-mail já existente em visitantes,
-- restrição, etc.), ele tenta vincular a linha existente e, em último
-- caso, só registra um aviso no log. O /login já cria o perfil que
-- faltar no primeiro acesso (reserva no front).
-- ==========================================================

begin;

create or replace function public.criar_perfil_visitante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  nasc date;
begin
  -- Administradores não viram visitantes (tolerante se a tabela mudar)
  begin
    if exists (select 1 from public.admins where lower(email) = lower(new.email)) then
      return new;
    end if;
  exception when others then
    null;
  end;

  begin
    nasc := nullif(meta->>'data_nascimento', '')::date;
    if nasc <= date '1900-01-01' or nasc > current_date then
      nasc := null;
    end if;
  exception when others then
    nasc := null;
  end;

  begin
    insert into public.visitantes (auth_user_id, nome, email, telefone, cidade, data_nascimento, role, ativo)
    values (
      new.id,
      coalesce(nullif(trim(meta->>'nome_completo'), ''), split_part(new.email, '@', 1)),
      lower(new.email),
      nullif(trim(meta->>'telefone'), ''),
      nullif(trim(meta->>'cidade'), ''),
      nasc,
      'visitante',
      true
    );
  exception
    when unique_violation then
      -- Já existe perfil com este e-mail (conta antiga apagada do Auth):
      -- reaproveita a linha, ligando ao novo usuário
      begin
        update public.visitantes
           set auth_user_id = new.id, updated_at = now()
         where lower(email) = lower(new.email)
           and (auth_user_id is null or auth_user_id <> new.id);
      exception when others then
        raise warning 'criar_perfil_visitante: não vinculou % (%)', new.email, sqlerrm;
      end;
    when others then
      raise warning 'criar_perfil_visitante: perfil não criado para % (%)', new.email, sqlerrm;
  end;

  return new;
end;
$$;

-- Garante que o gatilho existe e aponta para a função acima
drop trigger if exists ao_criar_usuario_visitante on auth.users;
create trigger ao_criar_usuario_visitante
after insert on auth.users
for each row execute function public.criar_perfil_visitante();

commit;

-- ----------------------------------------------------------
-- OPCIONAL — só se o PASSO 1 mostrou um gatilho antigo extra.
-- Troque os nomes pelos que apareceram e rode separadamente:
--
--   drop trigger if exists on_auth_user_created on auth.users;
--   -- (a função antiga pode ficar; sem gatilho ela não roda)
-- ----------------------------------------------------------
