# Progresso da melhoria do site (ACMRB)

Lista para acompanhar o que já foi feito e o que falta, na ordem em que vamos fazendo.
Trabalho feito na branch `branch-oficial` (a `main` e as outras branches não são mexidas).

Responsável: João Victor Rocha Costa

## Feito

- [x] **Nomes atualizados** — créditos e textos com o nome do João Victor, script de início sem caminho fixo
- [x] **Organização das pastas** — `components`, `hooks`, `services`, `utils`, `constants` e `types` cada um no seu lugar
- [x] **Visual padrão (parcial)** — fonte Inter, cores da marca em tokens do Tailwind, cabeçalho, rodapé, login, área do visitante e agendamento de coleta
- [x] **Botões padronizados** — um só componente de botão em todo o site
- [x] **Alertas com SweetAlert2** — todos os `alert()` e `confirm()` trocados
- [x] **Home nova** — visual todo em Tailwind (sem CSS antigo):
  - [x] Hero com título forte, botões, selos de confiança e faixa de números de impacto
  - [x] Quem somos com foto e cards de valores
  - [x] Operação integrada (públicos, passo a passo e compromissos)
  - [x] Coleta seletiva com calendário por bairro
  - [x] Transparência em números (seção escura com metas)
  - [x] Logística reversa
  - [x] Plataforma institucional (links, documentos e dados oficiais)
  - [x] Notícias, denúncia ambiental, mapa de apoiadores e contato
  - [x] Componentes novos reaproveitáveis: `TituloSecao`, `FaixaCta` e o hook `useAparecer`
- [x] **Telas com visual novo (Tailwind, sem CSS antigo)**: Quem somos, lista de notícias, notícia aberta, Transparência, Parceiros, menu (nav), Associados e Mapa
- [x] **Painel admin (parte 1)**: estrutura do painel (menu lateral, gaveta, topo, barra inferior) e Visão geral + Visão do Mapa, sem `admin-shell.css`, `admin-visao-geral.css` e `admin-visao-mapa.css`
- [x] **Logins separados (parte 1)**: atalho dos 5 cliques removido; login do admin e do ADM DEUS em endereços secretos vindos da env, `/admin/login` dá 404, limite de tentativas e verificação em 2 etapas
- [x] **Segurança já pronta**: RLS ligada em todas as tabelas, chave secreta (service_role) só no servidor, `.env` fora do git (nenhum segredo no histórico), cabeçalhos de segurança (CSP, X-Frame-Options, HSTS...), rotas do painel conferem o token (JWT) e o papel, respostas 429 no login

## Lista mestre (fazer um item por vez, nesta ordem)

Combinado: termina um item, marca aqui com [x] e passa para o próximo.

### Segurança rápida
- [x] 1. **Páginas de erro** — 404 própria em português, `error.tsx` e `global-error.tsx` (mensagem amigável, detalhes só no log, nada de stack trace na tela); respostas da API sem texto cru do banco
- [x] 2. **Segredos na Vercel** *(tarefa do João)* — criar `CRON_SECRET` e `HASH_SECRET` (valores aleatórios longos) em Production e Preview e no `.env.local`; fazer Redeploy (hoje a limpeza diária `/api/cron/limpeza` está desligada). Depois tirar do código o valor reserva fixo do hash
- [ ] 3. **Login mais protegido no Supabase** — ligar CAPTCHA (Turnstile) e revisar os limites do Supabase Auth (o bloqueio do site é feito antes do login, mas dá para chamar o Supabase direto)
  - [x] Código pronto: quadrinho "não sou um robô" (Turnstile) no login, cadastro, recuperação, login do painel e troca de senha; liga sozinho com `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - [ ] *(tarefa do João)* criar o Turnstile, pôr as chaves na Vercel e no Supabase e ajustar os limites — passo a passo em `docs/ACESSOS-E-SEGURANCA.md` (seção 7)
- [ ] 4. **Revisão do banco** — rodar `supabase/diagnosticos/revisao_rls.sql` no SQL Editor e corrigir o que aparecer

### Front (visual e componentes)
- [ ] 5. Admin: notícias (Tailwind, apagar `admin-noticias.css`)
- [ ] 6. Admin: apoiadores
- [ ] 7. Admin: coletas e calendário
- [ ] 8. Admin: mensagens
- [ ] 9. Admin: visitantes
- [ ] 10. Admin: acessos e aparelhos (no fim, nenhum `src/styles/admin-*.css` sobrando)
- [ ] 11. **Denúncias** — tirar a seção "em breve" de Denúncias do painel; no site fica só o link para a denúncia ambiental da prefeitura/AMAB (já existe na home)
- [ ] 12. **Componentes que faltam** — `Tooltip` (balão ao passar o mouse ou focar, para botões só com ícone), um toast único para o site todo (apagar, copiar link...) e skeletons (formato do conteúdo enquanto carrega) nas telas que ainda só mostram "carregando"
- [ ] 13. **Página "Para empresas / Compradores"** — materiais que a associação vende, volume aproximado por mês e botão "Solicitar proposta" que abre WhatsApp/e-mail (sem formulário de cotação)
- [ ] 14. **Selo de parceiro** — selo na página de Parceiros e certificado em PDF para cada empresa parceira
- [ ] 15. **Rastreio da coleta** — quem pediu a coleta acompanha: solicitada → confirmada → a caminho → concluída
- [ ] 16. **Projetos e campanhas** — página `/projetos` de verdade (hoje é "em breve") e a seção Projetos do painel
- [ ] 17. **Mapa de pontos de entrega** — locais onde a população pode deixar recicláveis
- [ ] 18. **Doações** — página "em desenvolvimento" com contato dos associados e e-mail (Pix fica para depois)
- [ ] 19. **Catálogo de materiais (só preparar)** — o catálogo com estoque já existe no app do celular; deixar a rota e os tipos prontos para ligar quando os bancos forem unificados
- [ ] 20. **Acabamento** — imagens com `next/image`, SEO (metadados e dados estruturados das páginas novas), PWA (instalar no celular) e revisão do responsivo em celular, tablet e notebook

### Back (servidor e banco)
- [ ] 21. **Validação no servidor** — esquemas `zod` em todas as rotas `/api` (o navegador pode ser burlado) e regras de negócio no servidor
- [ ] 22. **Limite por usuário** — além do limite por rede, limite por conta logada nas rotas
- [ ] 23. **Contas separadas no banco** — políticas por papel (visitante, admin, deus) e app autenticador obrigatório para o deus
- [ ] 24. **CPF e documentos** — criptografia, arquivos em área privada e LGPD
- [ ] 25. **Testes** — Vitest (funções e rotas: 400, 401, 403, 429) e Cypress (login, agendar coleta, painel)
- [ ] 26. **GitHub Actions** — a cada push roda tipos, lint, testes e build

### App do celular (mesmo banco)
- [ ] 27. **API v1 + Swagger** — rotas `/api/v1` documentadas em `/api-docs` e tipos do banco gerados (`supabase gen types`)
- [ ] 28. **Preparar o app** — CORS com a lista de origens do app, deep links (redefinir senha, abrir coleta), notificações push e unificação dos bancos (liga o catálogo do item 19)

### Final
- [ ] 29. **Teste de ataque leve (pentest)** — OWASP ZAP no preview, tentar ver dado de outra conta (IDOR), conferir 429 e a RLS com duas contas

### Fora da lista (decidido não fazer agora)
Formulário de cotação no painel, painel de impacto, área do catador e kit de imprensa. Denúncias com foto/mapa: não, fica só o link da AMAB.

## Observações

- O projeto usa Next.js: as rotas são as pastas de `src/app`, por isso não usamos o react-router-dom.
- O banco é o Supabase (PostgreSQL gerenciado), que já faz hash de senha e JWT no login.
- Estilo: só **Tailwind** (com os tokens de `globals.css`). Não usamos Bootstrap nem PrimeCSS de propósito: misturar bibliotecas de CSS deixa o site mais pesado e com estilos brigando, e o Tailwind já faz tudo isso.
- Back-end: as rotas `src/app/api` do Next já são o servidor (Node.js), por isso não usamos Express.
- Login: o Supabase Auth gera o JWT; as rotas conferem o token no servidor e o banco usa `auth.uid()` na RLS.
- Atualizar este arquivo a cada tarefa concluída.
