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

## Falta fazer

### Front (visual)
- [ ] **Telas com visual novo (Tailwind, sem CSS antigo)** — uma por vez, na ordem abaixo:
  - [x] 1. Quem somos (`/quem-somos`)
  - [x] 2. Lista de notícias
  - [x] 3. Notícia aberta
  - [x] 4. Transparência
  - [x] 5. Parceiros
  - [x] Menu (nav): reorganizado com Parceiros, Associados e Calendário, botão "Agendar coleta", página atual destacada e menu mobile novo; ajustado no computador (Associação, Contato com denúncia, mais espaço do logo)
  - [x] 6. Associados
  - [x] 7. Mapa
  - [ ] 8. Admin: estrutura (shell)
  - [ ] 9. Admin: visão geral
  - [ ] 10. Admin: notícias
  - [ ] 11. Admin: apoiadores
  - [ ] 12. Admin: coletas e calendário
  - [ ] 13. Admin: mensagens
  - [ ] 14. Admin: visitantes
  - [ ] 15. Admin: acessos e aparelhos
- [ ] **Responsivo fino** — revisar celular, tablet e notebook em todas as telas
- [ ] **Hooks** — separar a lógica de cada tela do visual
- [ ] **Imagens otimizadas** com `next/image` em todo o site
- [ ] **SEO** — melhorias para aparecer mais rápido no Google
- [ ] **PWA** — app instalável no celular e no tablet (depois, se quiser, Capacitor para as lojas)

### Back (banco e segurança)
- [ ] **Logins separados** — usuário, admin e super admin
  - [x] Atalho dos 5 cliques na logo removido (AdminModal apagado)
  - [x] Login do admin em `/admin/login` e do ADM DEUS em `/acesso-deus` (endereço trocável em `src/constants/rotasAcesso.ts`), conferidos no servidor, com limite de tentativas e verificação em 2 etapas
  - [ ] Falta: separar também as contas no banco (políticas por papel) e exigir o app autenticador para o deus
- [ ] **Segurança do CPF e dos documentos** — criptografia, área privada e LGPD
- [ ] **API v1 + Swagger** — `/api/v1` documentada em `/api-docs`
- [ ] **Testes** com Jest + Supertest
- [ ] **Integração** com outros sistemas

## Observações

- O projeto usa Next.js: as rotas são as pastas de `src/app`, por isso não usamos o react-router-dom.
- O banco é o Supabase (PostgreSQL gerenciado), que já faz hash de senha e JWT no login.
- Atualizar este arquivo a cada tarefa concluída.
