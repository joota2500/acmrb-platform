# ACMRB - Inicializador Automático Avançado
Write-Host "================================================" -ForegroundColor Green
Write-Host "     ACMRB - Plataforma de Gestão" -ForegroundColor Green
Write-Host "     Inicializador Automático" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Força PATH
$env:Path += ";C:\Program Files\nodejs"

Set-Location "C:\Users\User\Desktop\MeusProjetos\acmrb-platform"

Write-Host "[1/4] Abrindo VS Code..." -ForegroundColor Cyan
Start-Process code "."

Write-Host "[2/4] Iniciando servidor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "[3/4] Aguardando servidor (10s)..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "[4/4] Abrindo navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "Abrindo Supabase..." -ForegroundColor Cyan
Start-Process "https://supabase.com/dashboard/project/mvjyfxayvbwkrluaogzc"

Write-Host ""
Write-Host "Projeto iniciado com sucesso!" -ForegroundColor Green

# Pergunta para Commit
$commit = Read-Host "Deseja fazer commit das alterações? (S/N)"
if ($commit -eq "S" -or $commit -eq "s") {
    $msg = Read-Host "Mensagem do commit (ou Enter para padrão)"
    if ([string]::IsNullOrEmpty($msg)) { $msg = "Atualização automática - $(Get-Date)" }
    git add .
    git commit -m $msg
    Write-Host "Commit realizado!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null