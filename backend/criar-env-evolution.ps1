# Script para criar/atualizar .env da Evolution API sem database
# Execute: .\backend\criar-env-evolution.ps1

$evolutionPath = Join-Path $PSScriptRoot "..\evolution-api"
$envPath = Join-Path $evolutionPath ".env"

Write-Host "🔧 Configurando .env da Evolution API..." -ForegroundColor Cyan
Write-Host ""

# Verificar se o diretório existe
if (-not (Test-Path $evolutionPath)) {
    Write-Host "❌ Diretório não encontrado: $evolutionPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 O diretório evolution-api deve estar em:" -ForegroundColor Yellow
    Write-Host "   D:\Negocios\Projetos\evolution-api" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Para clonar o repositório:" -ForegroundColor Cyan
    Write-Host "   cd D:\Negocios\Projetos" -ForegroundColor Gray
    Write-Host "   git clone https://github.com/EvolutionAPI/evolution-api.git" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Diretório encontrado: $evolutionPath" -ForegroundColor Green
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

# Conteúdo do .env
$envContent = @"
# Evolution API Configuration
# Gerado automaticamente - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Autenticação
AUTHENTICATION_API_KEY=$apiKey

# Servidor
SERVER_URL=http://localhost:8082
PORT=8082

# Database - DESABILITADO para desenvolvimento
DATABASE_ENABLED=false

# Ambiente
NODE_ENV=development
"@

# Verificar se .env já existe
if (Test-Path $envPath) {
    Write-Host "⚠️ Arquivo .env já existe" -ForegroundColor Yellow
    $backupPath = "$envPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item $envPath $backupPath
    Write-Host "💾 Backup criado: $backupPath" -ForegroundColor Gray
    Write-Host ""
    $response = Read-Host "Deseja sobrescrever? (s/n)"
    if ($response -ne "s" -and $response -ne "S") {
        Write-Host "❌ Operação cancelada" -ForegroundColor Red
        exit 0
    }
}

# Criar/Atualizar .env
try {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "✅ Arquivo .env criado/atualizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Configurações:" -ForegroundColor Cyan
    Write-Host "   Arquivo: $envPath" -ForegroundColor Gray
    Write-Host "   API Key: $($apiKey.Substring(0, [Math]::Min(30, $apiKey.Length)))..." -ForegroundColor Gray
    Write-Host "   Porta: 8082" -ForegroundColor Gray
    Write-Host "   Database: DESABILITADO" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Vá para o diretório: cd $evolutionPath" -ForegroundColor White
    Write-Host "   2. Inicie a API: npm start" -ForegroundColor White
    Write-Host "   3. Acesse: http://localhost:8082" -ForegroundColor White
} catch {
    Write-Host "❌ Erro ao criar arquivo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

