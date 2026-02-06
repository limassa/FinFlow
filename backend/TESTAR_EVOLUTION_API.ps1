# Script para testar e diagnosticar Evolution API
# Execute: .\backend\TESTAR_EVOLUTION_API.ps1

$evolutionPath = Join-Path $PSScriptRoot "..\services\evolution-api"

Write-Host "🔍 Diagnóstico Completo da Evolution API`n" -ForegroundColor Cyan

# Verificar se o diretório existe
if (-not (Test-Path $evolutionPath)) {
    Write-Host "❌ Diretório não encontrado: $evolutionPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Diretório encontrado: $evolutionPath`n" -ForegroundColor Green

# Verificar .env
Write-Host "1️⃣ Verificando arquivo .env..." -ForegroundColor Yellow
$envPath = Join-Path $evolutionPath ".env"
if (Test-Path $envPath) {
    Write-Host "   ✅ Arquivo .env encontrado" -ForegroundColor Green
    $content = Get-Content $envPath
    $dbProvider = $content | Select-String -Pattern "^DATABASE_PROVIDER="
    $dbUri = $content | Select-String -Pattern "^DATABASE_CONNECTION_URI="
    Write-Host "   Provider: $($dbProvider -replace '^DATABASE_PROVIDER=', '')" -ForegroundColor Gray
    $uriValue = ($dbUri -replace '^DATABASE_CONNECTION_URI=', '').Trim()
    if ($uriValue -match "^'") {
        Write-Host "   ⚠️ URI ainda tem aspas!" -ForegroundColor Red
    } else {
        Write-Host "   ✅ URI parece correta" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Arquivo .env não encontrado" -ForegroundColor Red
}

Write-Host ""

# Verificar PostgreSQL
Write-Host "2️⃣ Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgTest = Test-NetConnection -ComputerName localhost -Port 5433 -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($pgTest) {
        Write-Host "   ✅ PostgreSQL acessível na porta 5433" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PostgreSQL não está acessível" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️ Não foi possível verificar: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Verificar dependências
Write-Host "3️⃣ Verificando dependências..." -ForegroundColor Yellow
$packageJson = Join-Path $evolutionPath "package.json"
$nodeModules = Join-Path $evolutionPath "node_modules"

if (Test-Path $packageJson) {
    Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ package.json não encontrado" -ForegroundColor Red
}

if (Test-Path $nodeModules) {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ node_modules não existe" -ForegroundColor Yellow
    Write-Host "   💡 Execute: cd $evolutionPath && npm install" -ForegroundColor Gray
}

Write-Host ""

# Verificar porta do servidor
Write-Host "4️⃣ Verificando porta do servidor..." -ForegroundColor Yellow
if (Test-Path $envPath) {
    $content = Get-Content $envPath
    $serverPort = $content | Select-String -Pattern "^SERVER_PORT="
    if ($serverPort) {
        $port = ($serverPort -replace '^SERVER_PORT=', '').Trim()
        Write-Host "   Porta configurada: $port" -ForegroundColor Gray
        $portInUse = netstat -ano | findstr ":$port "
        if ($portInUse) {
            Write-Host "   ⚠️ Porta $port está em uso" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ Porta $port está livre" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "📋 RESUMO:" -ForegroundColor Cyan
Write-Host "   Para iniciar a Evolution API:" -ForegroundColor White
Write-Host "   cd $evolutionPath" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "   Se der erro, copie a mensagem completa e me envie" -ForegroundColor Yellow
Write-Host ""

