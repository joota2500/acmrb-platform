# Como rodar o projeto

Guia curto para ligar o site no computador (Linux/Ubuntu e VS Code).
No Windows dá para usar o atalho `INICIAR_ACMRB.ps1`, na raiz do projeto.

## 1. Instalar o Node (uma vez só)

Só precisa em computador novo ou depois de formatar:

```bash
sudo apt update
sudo apt install -y curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts
```

Para conferir: `node -v` e `npm -v` têm que mostrar uma versão.
Se o terminal não achar o `nvm` depois de reiniciar o PC, rode `source ~/.bashrc`.

## 2. Abrir a pasta certa

No VS Code: `File > Open Folder` e escolha
`~/Documentos/1 - Meus Projetos Programação/acmrb-platform-oficial`
(o `package.json` tem que aparecer na raiz).

O projeto usa só a branch `branch-oficial`. Para conferir: `git branch`.

## 3. Arquivo `.env.local`

Precisa existir na raiz. Copie o `.env.example` e preencha os valores
(eles ficam só no computador e na Vercel, nunca no GitHub).

## 4. Ligar o site

```bash
npm install     # só na primeira vez ou quando mudar o package.json
npm run dev
```

Depois abra http://localhost:3000. Deixe o terminal aberto enquanto usa.
Se aparecer "localhost recusou a conexão", o servidor não está ligado: rode `npm run dev` de novo.

## 5. Comandos úteis

```bash
npm run typecheck   # procura erros de TypeScript
npm run build       # gera a versão de produção (o mesmo que a Vercel faz)
npm run start       # roda a versão gerada pelo build
```

Se der erro estranho de dependência (ex.: lightningcss):

```bash
rm -rf node_modules
npm install
```
