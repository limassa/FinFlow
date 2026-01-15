# Script para descobrir o IP da máquina na rede local
# Use este IP na configuração da API do app mobile

Write-Host "🔍 Descobrindo o IP da sua máquina na rede local..." -ForegroundColor Cyan
Write-Host ""

# Obter adaptadores de rede ativos
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }

if ($adapters.Count -eq 0) {
    Write-Host "❌ Nenhum adaptador de rede ativo encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "📡 Adaptadores de rede ativos:" -ForegroundColor Green
Write-Host ""

foreach ($adapter in $adapters) {
    $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
    
    if ($ipConfig) {
        $ip = $ipConfig.IPAddress
        Write-Host "  ✅ $($adapter.Name):" -ForegroundColor Green
        Write-Host "     IP: $ip" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Tentar encontrar o IP principal (não loopback, não link-local)
$mainIP = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { 
        $_.IPAddress -notlike "127.*" -and 
        $_.IPAddress -notlike "169.254.*" -and
        $_.InterfaceAlias -notlike "*Loopback*"
    } | 
    Select-Object -First 1 -ExpandProperty IPAddress

if ($mainIP) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📱 CONFIGURE NO APP:" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Edite: mobile/src/config/api.js" -ForegroundColor Yellow
    Write-Host "   Altere para:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   return 'http://$mainIP:3001';" -ForegroundColor White
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Não foi possível determinar o IP automaticamente." -ForegroundColor Yellow
    Write-Host "   Execute 'ipconfig' e procure por 'IPv4 Address'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Dica: Certifique-se de que:" -ForegroundColor Cyan
Write-Host "   - O backend está rodando na porta 3001" -ForegroundColor White
Write-Host "   - Seu dispositivo e computador estão na mesma rede Wi-Fi" -ForegroundColor White
Write-Host "   - O firewall permite conexões na porta 3001" -ForegroundColor White
Write-Host ""

