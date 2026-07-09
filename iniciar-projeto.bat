@echo off
cd /d "%~dp0"

echo.
echo ACMRB Platform
echo ==============
echo.

node --version >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale o Node.js LTS, feche e abra o VS Code novamente.
  echo.
  pause
  exit /b 1
)

npm --version >nul 2>nul
if errorlevel 1 (
  echo npm nao foi encontrado.
  echo Reinstale o Node.js LTS marcando a opcao de adicionar ao PATH.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias...
  npm install
)

echo.
echo Iniciando em http://localhost:3000
echo Deixe esta janela aberta enquanto usa o sistema.
echo.
npm run dev

pause
