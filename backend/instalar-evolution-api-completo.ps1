# Script PowerShell para instalar Evolution API com MongoDB
# Execute: .\backend\instalar-evolution-api-completo.ps1

Write-Host "🚀 Instalando Evolution API com MongoDB..." -ForegroundColor Green
Write-Host ""

# Verificar se Docker está rodando
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker primeiro." -ForegroundColor Red
    exit 1
}

# Parar e remover containers existentes
Write-Host "🧹 Limpando containers existentes..." -ForegroundColor Yellow
docker stop evolution-api 2>$null
docker rm evolution-api 2>$null
docker stop evolution-mongodb 2>$null
docker rm evolution-mongodb 2>$null
Write-Host "✅ Containers antigos removidos" -ForegroundColor Green
Write-Host ""

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

Write-Host "📋 Configurações:" -ForegroundColor Cyan
Write-Host "   Nome: evolution-api"
Write-Host "   Porta: 8080"
Write-Host "   API Key: $($apiKey.Substring(0, [Math]::Min(30, $apiKey.Length)))..." -ForegroundColor Gray
Write-Host "   Database: MongoDB"
Write-Host ""

# Criar MongoDB
Write-Host "🔧 Criando container MongoDB..." -ForegroundColor Yellow
docker run -d `
  --name evolution-mongodb `
  -p 27017:27017 `
  -e MONGO_INITDB_ROOT_USERNAME=admin `
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 `
  mongo:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao criar MongoDB" -ForegroundColor Red
    exit 1
}

Write-Host "✅ MongoDB criado" -ForegroundColor Green
Write-Host "⏳ Aguardando MongoDB iniciar (15 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Criar Evolution API
Write-Host "🔧 Criando container Evolution API..." -ForegroundColor Yellow

docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  --link evolution-mongodb:mongo `
  -e AUTHENTICATION_API_KEY="$apiKey" `
  -e DATABASE_ENABLED=true `
  -e DATABASE_PROVIDER=mongodb `
  -e DATABASE_CONNECTION_URI="mongodb://admin:admin123@evolution-mongodb:27017/evolution?authSource=admin" `
  atendai/evolution-api:latest

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Evolution API instalada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⏳ Aguarde alguns segundos para a API iniciar completamente..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Write-Host ""
    Write-Host "📋 Verificando logs..." -ForegroundColor Cyan
    docker logs evolution-api --tail 20
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Verifique se não há erros de 'Database provider invalid' nos logs acima" -ForegroundColor White
    Write-Host "   2. Acesse: http://localhost:8080" -ForegroundColor White
    Write-Host "   3. Crie uma instância chamada 'webcond'" -ForegroundColor White
    Write-Host "   4. Escaneie o QR Code com seu WhatsApp" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Para ver logs: docker logs evolution-api" -ForegroundColor Gray
    Write-Host "💡 Para parar: docker stop evolution-api evolution-mongodb" -ForegroundColor Gray
    Write-Host "💡 Para iniciar: docker start evolution-mongodb evolution-api" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Erro ao instalar Evolution API" -ForegroundColor Red
    Write-Host "💡 Verifique os logs: docker logs evolution-api" -ForegroundColor Yellow
}

