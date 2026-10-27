-- ==========================================================
-- ACMRB — Bloqueios com prazo livre + consulta rápida do estado do aparelho
-- ----------------------------------------------------------
-- Rode no Supabase → SQL Editor DEPOIS de 20261027130000_dispositivos_bloqueios.sql.
-- Pode ser rodado mais de uma vez.
--
-- O que muda:
--   * Bloqueio E suspensão agora podem ter prazo ou ficar indeterminados
--     (antes a suspensão sempre precisava de prazo e o bloqueio nunca expirava).
--     Regra única: vale enquanto "ate" for nulo (indeterminado) ou estiver no futuro.
--   * Guarda quem/quando editou um bloqueio (editado_em / editado_por).
--   * Expulsão pode "impedir o retorno" até uma data (impede_ate).
--   * dispositivo_estado(): uma única chamada que diz se o aparelho está
--     protegido, bloqueado/suspenso (com motivo e prazo) ou foi expulso.
--     Usada pelo site (verificação a cada ~10 s) para trocar a página aberta
--     pela tela de bloqueio sem recarregar. Só o servidor (service_role) chama.
-- ==========================================================

begin;

alter table public.dispositivos_bloqueios drop constraint if exists suspensao_tem_prazo;
alter table public.dispositivos_bloqueios add column if not exists editado_em  timestamptz;
alter table public.dispositivos_bloqueios add column if not exists editado_por text;
alter table public.dispositivos_expulsoes add column if not exists impede_ate  timestamptz;

-- Lista de aparelhos do painel: mesma função, agora com a regra de prazo unificada
create or replace function public.aparelhos_lista(
  p_filtro  text default 'todos',
  p_quem    text default 'todos',
  p_busca   text default null,
  p_limite  integer default 20,
  p_desloc  integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_resultado jsonb;
begin
  if not public.is_deus() then
    raise exception 'Somente o ADM DEUS pode ver os aparelhos.' using errcode = '42501';
  end if;

  with ult as (
    select distinct on (s.anon_id)
           s.anon_id, s.auth_user_id, s.ultima_atividade, s.encerrada_em, s.dispositivo, s.navegador, s.sistema,
           s.cidade, s.regiao, s.pais, (s.ip_hash is not null) as tem_rede
      from public.acessos_sessoes s
     order by s.anon_id, s.ultima_atividade desc
  ),
  tot as (
    select s.anon_id, count(*)::int as sessoes, coalesce(sum(s.paginas), 0)::int as paginas,
           coalesce(sum(s.duracao_seg), 0)::bigint as duracao_seg, min(s.iniciada_em) as primeira,
           bool_or(s.auth_user_id is not null) as logado
      from public.acessos_sessoes s
     group by s.anon_id
  ),
  bl as (
    select distinct on (b.dispositivo_id)
           b.dispositivo_id, b.id as bloqueio_id, b.tipo, b.motivo, b.ate, b.criado_em as bloqueado_em, b.criado_por, (b.ip_hash is not null) as com_rede
      from public.dispositivos_bloqueios b
     where b.ativo and b.dispositivo_id is not null and (b.ate is null or b.ate > now())
     order by b.dispositivo_id, b.criado_em desc
  ),
  base as (
    select coalesce(u.anon_id, b.dispositivo_id) as anon_id,
           u.auth_user_id, v.nome, u.ultima_atividade, u.encerrada_em, u.dispositivo, u.navegador, u.sistema,
           u.cidade, u.regiao, u.pais, t.sessoes, t.paginas, t.duracao_seg, t.primeira, coalesce(t.logado, false) as logado,
           b.bloqueio_id, b.tipo as bloqueio_tipo, b.motivo, b.ate, b.bloqueado_em, b.criado_por as bloqueado_por, coalesce(b.com_rede, false) as com_rede,
           case when b.tipo = 'bloqueio' then 'bloqueado' when b.tipo = 'suspensao' then 'suspenso' else 'ativo' end as situacao,
           (u.ultima_atividade > now() - interval '2 minutes' and u.encerrada_em is null) as online
      from ult u
      full join bl b on b.dispositivo_id = u.anon_id
      left join tot t on t.anon_id = coalesce(u.anon_id, b.dispositivo_id)
      left join public.visitantes v on v.auth_user_id = u.auth_user_id
  ),
  filtrada as (
    select * from base x
     where (p_filtro = 'todos' or p_filtro is null
            or (p_filtro = 'ativos' and x.situacao = 'ativo')
            or (p_filtro = 'bloqueados' and x.situacao = 'bloqueado')
            or (p_filtro = 'suspensos' and x.situacao = 'suspenso')
            or (p_filtro = 'online' and x.online))
       and (p_quem = 'todos' or p_quem is null
            or (p_quem = 'anonimos' and not x.logado)
            or (p_quem = 'logados' and x.logado))
       and (coalesce(trim(p_busca), '') = ''
            or x.anon_id::text ilike '%' || trim(p_busca) || '%'
            or x.cidade ilike '%' || trim(p_busca) || '%'
            or x.nome ilike '%' || trim(p_busca) || '%')
  )
  select jsonb_build_object(
           'total', (select count(*) from filtrada),
           'itens', coalesce((
             select jsonb_agg(to_jsonb(f) order by f.ultima_atividade desc nulls last)
               from (select * from filtrada order by ultima_atividade desc nulls last
                      limit greatest(least(p_limite, 100), 1) offset greatest(p_desloc, 0)) f
           ), '[]'::jsonb)
         )
    into v_resultado;

  return v_resultado;
end;
$$;

revoke all on function public.aparelhos_lista(text, text, text, integer, integer) from public, anon;
grant execute on function public.aparelhos_lista(text, text, text, integer, integer) to authenticated;

-- Estado do aparelho para o site (uma chamada só). Marca a expulsão como entregue (vale uma vez).
create or replace function public.dispositivo_estado(p_did uuid, p_ip_hash text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_protegido boolean;
  v_bloq jsonb;
  v_exp  jsonb;
begin
  select exists (select 1 from public.dispositivos_admin where dispositivo_id = p_did) into v_protegido;
  if v_protegido then
    return jsonb_build_object('protegido', true, 'bloqueio', null, 'expulsao', null);
  end if;

  select jsonb_build_object('id', b.id, 'tipo', b.tipo, 'motivo', b.motivo, 'ate', b.ate)
    into v_bloq
    from public.dispositivos_bloqueios b
   where b.ativo
     and (b.ate is null or b.ate > now())
     and (b.dispositivo_id = p_did or (p_ip_hash is not null and b.ip_hash = p_ip_hash))
   order by (b.dispositivo_id = p_did) desc, b.criado_em desc
   limit 1;

  with entregues as (
    update public.dispositivos_expulsoes e
       set entregue_em = now()
     where e.dispositivo_id = p_did and e.entregue_em is null
    returning e.id, e.motivo, e.criado_em
  )
  select jsonb_build_object('id', id, 'motivo', motivo)
    into v_exp
    from entregues
   order by criado_em desc
   limit 1;

  return jsonb_build_object('protegido', false, 'bloqueio', v_bloq, 'expulsao', v_exp);
end;
$$;

revoke all on function public.dispositivo_estado(uuid, text) from public, anon, authenticated;
grant execute on function public.dispositivo_estado(uuid, text) to service_role;

commit;

-- Verificação (só leitura)
select item, case when ok then 'ok' else 'FALTANDO' end as situacao
from (values
  ('função dispositivo_estado',      to_regprocedure('public.dispositivo_estado(uuid,text)') is not null),
  ('coluna editado_em',              exists (select 1 from information_schema.columns where table_schema='public' and table_name='dispositivos_bloqueios' and column_name='editado_em')),
  ('coluna impede_ate',              exists (select 1 from information_schema.columns where table_schema='public' and table_name='dispositivos_expulsoes' and column_name='impede_ate')),
  ('suspensão sem prazo permitida',  not exists (select 1 from pg_constraint where conname = 'suspensao_tem_prazo'))
) as t(item, ok);
