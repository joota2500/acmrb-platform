# ACMRB — Acessos, privacidade e segurança (guia do Artur)

Linguagem simples, passo a passo. Tudo aqui foi feito na branch `acmrb-terceira-branch`.

---

## 1. O que existe agora

### Contagem de acessos (com ou sem cadastro)
- Todo visitante recebe um **número aleatório** no navegador (não é nome nem e-mail).
- O site registra: páginas vistas, tempo, de onde veio (Google, Instagram, link direto, utm), aparelho,
  navegador e **cidade/estado/país aproximados** (a Vercel informa isso sozinha; no seu computador fica vazio).
- **O IP não é guardado.** Para limitar abusos usamos só um "hash" (impressão digital que não volta ao IP).
- Quem **não** tem conta: o registro é apagado **24 h** depois da última atividade. Antes disso o banco guarda só
  totais por dia (quantas visitas, aparelhos, origem, cidade), que não identificam ninguém.
- Quem faz login: os acessos passam a ser da conta e ficam enquanto a conta existir (apagar a conta apaga tudo).
- Administradores logados **não** são contados.
- Aviso simples de privacidade na primeira visita + página `/privacidade`. O visitante pode desligar a medição
  (também respeitamos "Do Not Track" do navegador).

### Tela do ADM DEUS: Admin → Usuários / Visitantes (5 abas)
| Aba | O que mostra |
|---|---|
| Tempo real | Quem está no site agora (anônimo ou logado), onde, página atual, aparelho, origem, tempo. Atualiza a cada 10 s. |
| Resumo | Hoje / 7 / 30 / 90 dias: visitas, visitantes, páginas, tempo médio, anônimos × logados × cadastrados, conversão, gráfico por dia, aparelhos, origens, países, cidades, páginas mais vistas. |
| Visitas | Lista de todas as visitas com filtros (anônimo/logado, período, aparelho, origem, cidade ou id). Clique em "Ver" para ver as páginas e o tempo em cada uma. |
| Cadastrados | CRUD completo: **criar**, **editar**, **ativar/desativar**, **redefinir senha** (por e-mail ou gerando um link), **excluir**, com histórico de atividade e de logins de cada pessoa. |
| Segurança | Tentativas de login (certas/erradas, e-mail parcialmente escondido), botão **Liberar** bloqueio, **auditoria** (quem fez o quê no painel) e **limpeza** manual. |

### Segurança extra
- **Limite de tentativas de login**: 5 senhas erradas do mesmo e-mail na mesma rede = bloqueio de 15 min;
  20 erros de uma rede = bloqueio dessa rede. Cadastro: 8 por hora por rede. Nova senha: 6 por hora por rede e 3 por hora por e-mail.
- **Limite de uso das rotas /api** (CNPJ, geocodificação, painel, acessos) contado no banco, vale para todas as instâncias da Vercel.
- **Anti-flood no banco** (chat, mensagens de coleta, pedidos de coleta, eventos): mesmo quem ignorar o site e falar direto com a API do Supabase é limitado.
- **Auditoria automática**: o banco anota quem criou/alterou/excluiu notícias, associados, apoiadores, logística,
  parceiros, Quem Somos, transparência, calendário, métricas, pedidos de coleta e administradores.
- **Cabeçalhos de segurança** (CSP, X-Frame-Options, HSTS etc.) em `next.config.js`. Testado nas páginas públicas: nenhuma violação.

> **Honestidade sobre o bloqueio de login:** ele vale para o formulário do site. Quem chamar a API do Supabase
> diretamente só é contido pelas proteções do próprio Supabase (veja o passo 6 abaixo). Por isso mantenha ligadas
> as proteções do Supabase Auth.

---

## 2. Variáveis de ambiente

| Variável | Onde | Para quê | Obrigatória? |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` e Vercel | endereço do Supabase | já existe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` e Vercel | chave pública | já existe |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` e Vercel | chave **secreta** do servidor (excluir/desativar visitantes, gravar acessos, logs) | **sim** |
| `NEXT_PUBLIC_SITE_URL` | Vercel | endereço oficial (ex.: `https://acmrb.com.br`) para links de compartilhamento e e-mails | recomendada |
| `CRON_SECRET` | Vercel | senha da limpeza diária (`/api/cron/limpeza`) | só se não usar pg_cron |
| `HASH_SECRET` | Vercel (opcional) | texto aleatório longo para os "hashes" de IP/e-mail. Se faltar, usa a chave do servidor | opcional |

Regras de ouro:
- `SUPABASE_SERVICE_ROLE_KEY` **nunca** começa com `NEXT_PUBLIC_` (senão iria para o navegador).
  No código ela só é lida em `src/lib/supabaseServidor.ts`, usada apenas pelas rotas `/api`.
- Nunca cole a chave em chat, e-mail, print ou GitHub.
- Depois de mudar variáveis na Vercel, faça **novo Deploy** (Deployments → ⋯ → Redeploy). No computador, pare e rode `npm run dev` de novo.

---

## 3. Migrations (rode nesta ordem no Supabase → SQL Editor)

Cole o arquivo inteiro e clique em **Run**. Todas podem ser rodadas mais de uma vez.

1. `supabase/migrations/20261027100000_acessos_site.sql` — tabelas de acessos, limpeza, painel.
2. `supabase/migrations/20261027110000_seguranca_limites_auditoria.sql` — limites, log de login, auditoria, anti-flood.
3. `supabase/migrations/20261027120000_agenda_limpeza.sql` — agenda a limpeza (pg_cron).

(As migrations antigas até `20261021230000_chat_geral.sql` precisam já ter sido rodadas.)

No fim de cada arquivo aparece uma tabela de conferência com `ok`. Se algo disser `FALTANDO`, avise.

### Limpeza de 24 h — duas opções (pode usar as duas)
- **A) pg_cron (dentro do Supabase):** a migration 3 tenta ativar e agendar sozinha (de hora em hora).
  Se aparecer a mensagem "pg_cron não está disponível/ativo": Supabase → **Database → Extensions** → procure **pg_cron** → **Enable**, e rode a migration 3 de novo.
  Para conferir: `select jobname, schedule, active from cron.job where jobname like 'acmrb_%';`
- **B) Vercel Cron (já configurado em `vercel.json`):** chama `/api/cron/limpeza` todo dia às 03h (horário de Brasília).
  Precisa da variável `CRON_SECRET` (um texto longo aleatório). A Vercel envia essa senha sozinha. Sem a variável, a rota fica desligada.
  *(No plano grátis da Vercel o cron roda no máximo 1 vez por dia — por isso o pg_cron é melhor.)*

Se a limpeza não rodar, nada quebra: só os anônimos ficam mais de 24 h. Na aba **Segurança → Limpeza** há um botão para rodar na hora.

---

## 4. Passo a passo do Artur (bem simples)

1. **Chave do servidor**
   - Supabase → *Project Settings → API Keys*. Copie a chave **secret** (`sb_secret_…`) ou a **service_role**.
   - No computador: abra `.env.local`, linha `SUPABASE_SERVICE_ROLE_KEY=...`, salve, pare o servidor e rode `npm run dev`.
   - Na Vercel: *Project → Settings → Environment Variables → Add* → nome `SUPABASE_SERVICE_ROLE_KEY`, valor = a chave,
     marque Production (e Preview se quiser) → Save → **Redeploy**.
2. **Endereço do site:** na Vercel adicione `NEXT_PUBLIC_SITE_URL` com o domínio oficial. Redeploy.
3. **Migrations:** rode as 3 acima, na ordem.
4. **(Se usar Vercel Cron)** crie `CRON_SECRET` (qualquer texto longo e aleatório) na Vercel e faça Redeploy.
5. **Link de "esqueci a senha" funcionar:** Supabase → *Authentication → URL Configuration* → em *Redirect URLs* adicione
   `https://SEU-DOMINIO/redefinir-senha` (e `http://localhost:3000/redefinir-senha`).
6. **Proteções do próprio Supabase (importante):** *Authentication →*
   - **Providers → Email:** deixe **Confirm email** ligado e senha mínima de 8.
   - **Rate Limits:** mantenha os limites padrão (não aumente).
   - **Attack Protection / CAPTCHA:** ative o CAPTCHA (hCaptcha ou Turnstile) se começar a ter cadastros falsos.
   - **MFA:** ative para as contas de administrador.
7. **Teste:** abra o site em uma janela anônima, navegue um pouco; depois entre no Admin → Usuários / Visitantes → *Tempo real*.
   (Em `localhost` a cidade fica vazia — só aparece publicado na Vercel.)

---

## 5. Revisão de RLS (brechas e pontos de atenção)

Rode `supabase/diagnosticos/revisao_rls.sql` (só leitura) e compare. Resultado da leitura do código das migrations:

**Já está bom**
- Todas as tabelas criadas pelas migrations têm RLS ligada; escrita de conteúdo só por `is_active_admin()`/`is_deus()`.
- `associados`: o público só enxerga colunas liberadas (sem CPF/contato); a visão `associados_admin` filtra por admin.
- Bucket `coletas` é privado (cada visitante só vê a própria pasta); `visitantes` só altera o próprio perfil e um gatilho protege `role`, `ativo`, `email`.
- Tabelas novas (acessos, login_tentativas, rate limit): ninguém grava pelo navegador; só o deus lê.

**Pontos de atenção (não alterei, decida você)**
1. `incrementar_visualizacao_noticia` é aberta para qualquer visitante: dá para inflar o contador de visualizações com chamadas repetidas. Risco baixo (só número). Correção futura: contar pela rota do servidor com limite.
2. Buckets públicos (`noticias`, `parceiros`, `admins`) permitem **listar os nomes dos arquivos** pela API. Não guarde documentos privados neles.
3. A tabela `admins` permite que cada admin atualize a **própria** linha; confira no bloco 7 do diagnóstico que existe só 1 deus e 1 admin e que o gatilho `admins_proteger` está ativo (impede trocar o próprio papel).
4. `is_active_admin()`/`is_deus()` comparam e-mail com diferença de maiúsculas/minúsculas: mantenha os e-mails dos admins em minúsculas.
5. Qualquer pessoa com a chave pública pode tentar `signUp`: sem CAPTCHA e sem "Confirm email" dá para criar contas falsas em massa (o limite do Supabase e o nosso limite por rede ajudam, mas não substituem).
6. O bloqueio de login do site não impede ataque direto à API do Supabase Auth (veja a nota no começo).
7. Se rodar o diagnóstico e o bloco 1 listar tabelas sem RLS (criadas pelo painel do Supabase), ligue a RLS e crie políticas antes de usar.

---

## 6. Se algo der errado

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| "A chave secreta do servidor não está configurada" | falta `SUPABASE_SERVICE_ROLE_KEY` no ambiente onde você está (computador ou Vercel) | passo 1 acima + reiniciar/Redeploy |
| Aba mostra "A estrutura do banco ainda não existe" | migration não rodada | rode a migration indicada na mensagem |
| Cidade/estado vazios | normal no `localhost` | só aparece na Vercel |
| Excluir visitante falha com motivo do Supabase | algo no banco impede apagar a conta | a conta é só bloqueada e o motivo aparece na tela; me mande a mensagem |
