# Script PowerShell para iniciar o Expo Go
# Uso: .\start-expo.ps1

Write-Host "🚀 Iniciando Expo Go..." -ForegroundColor Cyan
Write-Host ""

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o Expo CLI está instalado
try {
    $expoVersion = npx expo --version
    Write-Host "✅ Expo CLI encontrado: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Expo CLI não encontrado globalmente. Usando npx..." -ForegroundColor Yellow
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Verificar se o backend está rodando
Write-Host "🔍 Verificando conexão com o backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend está rodando!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend não está rodando em localhost:3001" -ForegroundColor Yellow
    Write-Host "   Certifique-se de que o backend está rodando antes de testar o app." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "📱 Escolha o modo de conexão:" -ForegroundColor Cyan
Write-Host "   1. Tunnel (recomendado para testes remotos)"
Write-Host "   2. LAN (para dispositivos na mesma rede)"
Write-Host "   3. Local (apenas localhost)"
Write-Host "   4. Padrão (expo start)"
Write-Host ""
$opcao = Read-Host "Digite o número da opção (1-4)"

switch ($opcao) {
    "1" {
        Write-Host "🌐 Iniciando com Tunnel..." -ForegroundColor Cyan
        npx expo start --tunnel
    }
    "2" {
        Write-Host "📡 Iniciando com LAN..." -ForegroundColor Cyan
        npx expo start --lan
    }
    "3" {
        Write-Host "💻 Iniciando em modo Local..." -ForegroundColor Cyan
        npx expo start
    }
    "4" {
        Write-Host "🚀 Iniciando Expo (padrão)..." -ForegroundColor Cyan
        npx expo start
    }
    default {
        Write-Host "⚠️  Opção inválida. Iniciando no modo padrão..." -ForegroundColor Yellow
        npx expo start
    }
}

Write-Host ""
Write-Host "📱 Para conectar:" -ForegroundColor Green
Write-Host "   - iOS: Abra a câmera e escaneie o QR code"
Write-Host "   - Android: Abra o Expo Go e escaneie o QR code"
Write-Host "   - Pressione 'a' para abrir no Android emulador"
Write-Host "   - Pressione 'i' para abrir no iOS emulador"
Write-Host "   - Pressione 'w' para abrir no navegador"
Write-Host "   - Pressione 'r' para recarregar"
Write-Host "   - Pressione 'm' para abrir o menu de desenvolvedor"
Write-Host "   - Pressione Ctrl+C para parar"
Write-Host ""

