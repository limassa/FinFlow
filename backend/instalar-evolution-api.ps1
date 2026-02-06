# Script PowerShell para instalar Evolution API
# Execute: .\backend\instalar-evolution-api.ps1

Write-Host "🚀 Instalando Evolution API..." -ForegroundColor Green
Write-Host ""

# Verificar se Docker está rodando
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se container já existe
$containerExists = docker ps -a --filter "name=evolution-api" --format "{{.Names}}"
if ($containerExists -eq "evolution-api") {
    Write-Host "⚠️ Container 'evolution-api' já existe" -ForegroundColor Yellow
    $response = Read-Host "Deseja remover e recriar? (s/n)"
    if ($response -eq "s" -or $response -eq "S") {
        Write-Host "🗑️ Removendo container existente..." -ForegroundColor Yellow
        docker stop evolution-api 2>$null
        docker rm evolution-api 2>$null
        Write-Host "✅ Container removido" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Mantendo container existente" -ForegroundColor Cyan
        Write-Host "💡 Para iniciar: docker start evolution-api" -ForegroundColor Cyan
        exit 0
    }
}

# Ler chave do config.env
$configPath = Join-Path $PSScriptRoot "config.env"
$apiKey = "WebCond_2025_Evolution_API_Chave_Secreta_123!@#"

if (Test-Path $configPath) {
    $configContent = Get-Content $configPath
    $keyLine = $configContent | Where-Object { $_ -match "^EVOLUTION_API_KEY=" }
    if ($keyLine) {
        $apiKey = $keyLine -replace "^EVOLUTION_API_KEY=", "" -replace '"', ''
        Write-Host "📋 Usando chave do config.env" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "📋 Configurações:" -ForegroundColor Cyan
Write-Host "   Nome: evolution-api"
Write-Host "   Porta: 8080"
Write-Host "   API Key: $($apiKey.Substring(0, [Math]::Min(30, $apiKey.Length)))..." -ForegroundColor Gray
Write-Host ""

# Instalar Evolution API
Write-Host "🔧 Criando container..." -ForegroundColor Yellow

docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY="$apiKey" `
  atendai/evolution-api:latest

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Evolution API instalada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Aguarde alguns segundos para a API iniciar"
    Write-Host "   2. Acesse: http://localhost:8080"
    Write-Host "   3. Crie uma instância chamada 'webcond'"
    Write-Host "   4. Escaneie o QR Code com seu WhatsApp"
    Write-Host ""
    Write-Host "💡 Para ver logs: docker logs evolution-api" -ForegroundColor Gray
    Write-Host "💡 Para parar: docker stop evolution-api" -ForegroundColor Gray
    Write-Host "💡 Para iniciar: docker start evolution-api" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Erro ao instalar Evolution API" -ForegroundColor Red
    Write-Host "💡 Verifique os logs: docker logs evolution-api" -ForegroundColor Yellow
}

