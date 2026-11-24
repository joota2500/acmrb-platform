-- =====================================================================
-- Item 17 — Pontos de entrega no mapa
-- ---------------------------------------------------------------------
-- Nova categoria "Ponto de entrega" nos apoiadores. O ponto aparece no
-- mapa público com marcador vermelho e o botão "como chegar".
-- RLS: não muda nada (leitura pública pela view apoiadores_publicos,
-- escrita só pelo admin, como já era).
-- Rode uma vez no Supabase (SQL Editor). Pode rodar de novo sem problema.
-- =====================================================================

-- 1) aceita a categoria nova
alter table public.apoiadores drop constraint if exists apoiadores_categoria_chk;
alter table public.apoiadores add constraint apoiadores_categoria_chk
  check (categoria in ('Ponto de entrega','Comércio','Restaurante','Pousada/Hotel','Residência','Empresa','Indústria','Órgão público','ONG/Associação','Outro'));

-- 2) o ponto da CMR (sem coordenadas: marque o local pelo painel,
--    Apoiadores e Mapa → editar → buscar endereço / clicar no mapa)
insert into public.apoiadores (tipo_pessoa, nome, categoria, tipos_apoio, descricao, mostrar_no_mapa, exibir_publicamente, ativo)
select 'juridica', 'CMR – Ponto de entrega ACMRB', 'Ponto de entrega', array['Coleta/Ponto de entrega'],
       'Próximo ao CMTR, perto do antigo lixão', true, true, true
where not exists (select 1 from public.apoiadores where nome = 'CMR – Ponto de entrega ACMRB');
