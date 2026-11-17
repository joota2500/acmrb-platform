# ACMRB — Estrutura de pastas

Projeto em **Next.js (App Router)**. As rotas são as pastas dentro de `src/app`,
então não usamos `react-router-dom` (o próprio Next já cuida das páginas).

```text
src/
├── app/            páginas (page.tsx), layouts, rotas da API (api/) e SEO (sitemap, robots, manifest)
├── components/     componentes de tela, agrupados por assunto
│   ├── ui/         peças reutilizáveis (Button, Card, Toast, ConfirmDialog, Contador...)
│   ├── layout/     Header, Footer, menus
│   ├── home/       seções da página inicial
│   ├── admin/      tudo do painel (sections, layout, acessos, aparelhos, visitantes...)
│   ├── auth/       login do administrador (AdminModal)
│   └── ...         noticias, transparencia, coletas, mapa, chat, conta etc.
├── contexts/       contextos do React (AuthContext)
├── hooks/          hooks próprios (useQuemSomos, useTransparencia, useInatividade...)
├── services/       acesso a dados: consultas ao Supabase e chamadas às rotas /api
├── lib/            configuração e base técnica (clientes do Supabase, SEO, segurança do servidor)
├── utils/          funções auxiliares sem tela (formatadores, validação de CPF, mapas, textos)
├── constants/      dados fixos (contato, menus, permissões, textos de reserva)
├── types/          tipos do TypeScript
├── styles/         CSS antigo que ainda falta migrar para Tailwind (cai aos poucos)
└── middleware.ts   bloqueio de aparelhos (roda antes das páginas)
```

## Regras que seguimos

- Imports sempre com o alias `@/` (ex.: `@/services/associados`), nunca `../../`.
- Componente de tela fica em `components/<assunto>`; se serve para o site todo, vai para `components/ui`.
- Quem fala com o banco fica em `services/` (os hooks chamam os services).
- Função que não usa React nem banco vai para `utils/`.
- Textos e listas que não mudam vão para `constants/`.

## Padrão visual (Tailwind v4)

- Cores, fontes, raios e sombras ficam no `@theme` de `src/app/globals.css`
  (ex.: `bg-brand`, `text-brand-dark`, `rounded-card`, `shadow-card`, `text-display`).
- Peças reutilizáveis em `src/components/ui/` (`Button`, `Card`, `Badge`, `Container`,
  `PageHero`, `SectionTitle`, `Campo`, `Input`, `Spinner`...). Use elas antes de criar classe nova.
- Páginas internas do visitante usam `components/layout/PaginaInterna`.
- Classes juntas com `cn()` (`src/utils/cn.ts`).
- Cuidado: CSS antigo (sem `@layer`) ganha do Tailwind. Ao migrar um componente,
  migre junto o que usa as mesmas classes e apague o `.css`.
