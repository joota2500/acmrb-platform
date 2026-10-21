-- ============================================================
-- OPCIONAL (correção de dados, rodar uma vez no SQL Editor)
-- Os 6 apoiadores cadastrados em 21/10/2026 têm ponto (lat/lng) mas
-- ficaram com mostrar_no_mapa = false (a caixa "Mostrar no mapa da
-- página inicial" não foi marcada), por isso não aparecem na home.
-- Alternativa sem SQL: no painel > Apoiadores, clicar no ícone de
-- pino de cada um.
-- Só liga quem tem coordenadas, está ativo e é público.
-- ============================================================
update public.apoiadores
   set mostrar_no_mapa = true
 where id in (
   '2c68e1c6-05f0-4363-9eb0-87631841b9fc', -- FARMACIA NATURALE
   '0ab04fca-a3d8-4b12-afb8-33e58bf413aa', -- C & E COSMETICOS
   'cfedca40-2826-446b-a8a9-3b5a60909b49', -- JP FARMA POPULAR
   '4ddd86d7-43a4-48e3-8941-61f937d8a066', -- FELLIPE SUPERMERCADO
   '248565cd-83d7-492a-bd6e-0a2b32f2e746', -- AURENIR LAUREANO BESSA PIMENTEL
   '73876c01-b1f6-417f-acdb-e5627e966223'  -- FROSTY
 )
   and latitude is not null and longitude is not null
   and ativo and exibir_publicamente;
