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

Prepare o banco usando o arquivo:

```text
supabase/schema.sql
```

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```
