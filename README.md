# ACMRB Platform

Plataforma institucional e operacional da ACMRB para reciclagem, logística
reversa, transparência ESG e gestão de materiais recicláveis em Baturité.

## Módulos

- Site público institucional com seções de impacto, materiais, notícias,
  parceiros, projetos e contato.
- Central de transparência ESG com indicadores ambientais e operacionais.
- Painel administrativo para associados, notícias, materiais, métricas,
  parceiros e configurações.
- Integração com Supabase para autenticação, banco de dados e arquivos.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Framer Motion
- Lucide React

## Configuração

Crie um arquivo `.env.local` com as chaves do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

As outras variáveis (servidor, cron, captcha, rotas) estão explicadas no `.env.example`.

Para montar o banco do zero, veja `supabase/README.md`.

## Desenvolvimento

```bash
npm install
npm run dev
```

Guia passo a passo (Linux e VS Code): `docs/COMO-RODAR.md`.
No Windows, o atalho `INICIAR_ACMRB.ps1` faz tudo sozinho.

## Estrutura de pastas

O resumo de cada pasta do `src` está em `docs/ESTRUTURA.md`.

Se a prévia mostrar `localhost recusou a conexão`, o servidor local não está
ligado. Rode `npm run dev` e mantenha o terminal aberto.

## Build

```bash
npm run build
npm run start
```

## Autor

Desenvolvido por **João Victor Rocha Costa** ([@joota2500](https://github.com/joota2500)).
