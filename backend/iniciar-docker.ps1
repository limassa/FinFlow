# Script para iniciar o Docker Desktop
# Execute: .\backend\iniciar-docker.ps1

Write-Host "🔍 Verificando Docker..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
try {
    docker ps | Out-Null
    Write-Host "✅ Docker já está rodando!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Você pode executar o script de instalação agora:" -ForegroundColor Cyan
    Write-Host "   bash instalar-evolution-api.sh" -ForegroundColor Gray
    Write-Host "   ou" -ForegroundColor Gray
    Write-Host "   .\instalar-evolution-api.ps1" -ForegroundColor Gray
    exit 0
} catch {
    Write-Host "⚠️ Docker não está rodando" -ForegroundColor Yellow
    Write-Host ""
}

# Tentar encontrar Docker Desktop
$dockerPaths = @(
    "C:\Program Files\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
    "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
)

$dockerPath = $null
foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        $dockerPath = $path
        break
    }
}

if ($dockerPath) {
    Write-Host "📋 Docker Desktop encontrado em:" -ForegroundColor Cyan
    Write-Host "   $dockerPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 Iniciando Docker Desktop..." -ForegroundColor Yellow
    
    try {
        Start-Process $dockerPath
        Write-Host "✅ Docker Desktop iniciado!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏳ Aguarde alguns segundos para o Docker iniciar completamente..." -ForegroundColor Yellow
        Write-Host "💡 Verifique o ícone do Docker na bandeja do sistema" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Após o Docker iniciar, execute:" -ForegroundColor Cyan
        Write-Host "   bash instalar-evolution-api.sh" -ForegroundColor Gray
        Write-Host "   ou" -ForegroundColor Gray
        Write-Host "   .\instalar-evolution-api.ps1" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Erro ao iniciar Docker Desktop" -ForegroundColor Red
        Write-Host "💡 Tente abrir o Docker Desktop manualmente" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Docker Desktop não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Você precisa instalar o Docker Desktop:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    Write-Host "   2. Baixe e instale o Docker Desktop para Windows" -ForegroundColor Cyan
    Write-Host "   3. Após instalar, execute este script novamente" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Ou abra o Docker Desktop manualmente:" -ForegroundColor Yellow
    Write-Host "   - Pressione Windows + S" -ForegroundColor Gray
    Write-Host "   - Digite Docker Desktop" -ForegroundColor Gray
    Write-Host "   - Clique para abrir" -ForegroundColor Gray
}

