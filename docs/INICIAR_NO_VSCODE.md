# Como iniciar o sistema no Visual Studio Code

## 1. Verifique o Node.js

O projeto precisa do Node.js para ligar o servidor local.

No terminal do VS Code, rode:

```bash
node -v
npm -v
```

Se aparecer uma versão, pode seguir. Se aparecer erro dizendo que `node` ou
`npm` não existe, instale o Node.js LTS e feche/abra o VS Code novamente.

## 2. Abra a pasta correta

No VS Code, use:

```text
File > Open Folder
```

Escolha esta pasta:

```text
C:\Users\User\Desktop\MeusProjetos\acmrb-platform
```

Confirme que o arquivo `package.json` aparece na raiz da pasta aberta.

## 3. Instale as dependências

No terminal do VS Code:

```bash
npm install
```

## 4. Confira o Supabase

O arquivo `.env.local` precisa existir na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

Neste projeto o arquivo já existe e as duas variáveis estão preenchidas.

## 5. Ligue o projeto

No terminal do VS Code:

```bash
npm run dev
```

Depois abra:

```text
http://localhost:3000
```

## 6. Se a prévia mostrar "localhost recusou a conexão"

Isso significa que o servidor não está ligado. Volte ao terminal do VS Code e
rode novamente:

```bash
npm run dev
```

Deixe esse terminal aberto enquanto usa o sistema.

## 7. Comandos úteis

Verificar erros de TypeScript:

```bash
npm run typecheck
```

Gerar build de produção:

```bash
npm run build
```

Rodar o build:

```bash
npm run start
```
