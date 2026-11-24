# Pasta supabase

Tudo que é do banco de dados (Supabase / PostgreSQL) fica aqui.

| O que | Para que serve |
|---|---|
| `schema.sql` | Base antiga do banco: cria as primeiras tabelas (admins, notícias, associados, materiais, denúncias, contatos...). |
| `migrations/` | Histórico de tudo que mudou no banco depois da base, em ordem de data. **Não apague nem renomeie** — é com elas que dá para recriar o banco (testes, app mobile). |
| `diagnosticos/` | Consultas só de leitura para conferir a segurança (RLS). Não alteram nada. |

## Montar um banco do zero

1. No Supabase → SQL Editor, rode o `schema.sql`.
2. Depois rode os arquivos de `migrations/` **na ordem do nome** (a data no começo do nome é a ordem).
   - Obs.: `20261020170000_banco_completo.sql` refaz o que as duas anteriores
     (`..150000_quem_somos` e `..160000_associados_v2`) tentaram; pode rodar as três, elas não duplicam nada.
3. Para conferir a segurança no final, rode `diagnosticos/revisao_rls.sql`.

## Mudança nova no banco

Crie um arquivo novo em `migrations/` com a data e hora na frente
(ex.: `20261201100000_nome_curto.sql`). Nunca edite uma migration que já foi rodada no banco de verdade.
