-- ==========================================================
-- ACMRB — Dados de contato do visitante (/minha-conta)
-- ----------------------------------------------------------
-- Rode DEPOIS de 20261021210000_visitantes_cadastro_corrige.sql.
-- Pode ser rodado mais de uma vez.
--  - bairro (opcional) e canal preferido de contato
--  - o gatilho visitantes_proteger continua impedindo o visitante de
--    trocar role, ativo, email e auth_user_id (não muda aqui)
-- ==========================================================

begin;

alter table public.visitantes add column if not exists bairro text;
alter table public.visitantes add column if not exists contato_preferido text;

alter table public.visitantes drop constraint if exists visitantes_contato_preferido_check;
alter table public.visitantes add constraint visitantes_contato_preferido_check
  check (contato_preferido is null or contato_preferido in ('whatsapp', 'ligacao', 'email'));

-- Tamanhos razoáveis (evita textos gigantes vindos do navegador)
alter table public.visitantes drop constraint if exists visitantes_tamanhos_check;
alter table public.visitantes add constraint visitantes_tamanhos_check
  check (
    char_length(coalesce(nome, '')) <= 120
    and char_length(coalesce(telefone, '')) <= 30
    and char_length(coalesce(cidade, '')) <= 80
    and char_length(coalesce(bairro, '')) <= 80
  ) not valid;

commit;
