# Script completo para limpar TUDO e resolver erro Worklets
# Execute: .\limpar-tudo.ps1

Write-Host "`n🧹 LIMPEZA COMPLETA - Resolvendo Erro Worklets`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

# 1. Parar processos do Metro/Expo
Write-Host "1️⃣ Parando processos do Metro/Expo..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*expo*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Processos parados`n" -ForegroundColor Green

# 2. Limpar cache do Expo
Write-Host "2️⃣ Limpando cache do Expo..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force .expo
    Write-Host "   ✅ .expo removido" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  .expo não encontrado" -ForegroundColor Gray
}

# 3. Limpar cache do node_modules
Write-Host "3️⃣ Limpando cache do node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "   ✅ node_modules\.cache removido" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  node_modules\.cache não encontrado" -ForegroundColor Gray
}

# 4. Limpar cache do Metro
Write-Host "4️⃣ Limpando cache do Metro..." -ForegroundColor Yellow
$metroCache = "$env:TEMP\metro-*"
if (Test-Path $metroCache) {
    Remove-Item -Recurse -Force $metroCache -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache do Metro limpo" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Cache do Metro não encontrado" -ForegroundColor Gray
}

# 5. Limpar cache do Watchman (se instalado)
Write-Host "5️⃣ Limpando cache do Watchman..." -ForegroundColor Yellow
if (Get-Command watchman -ErrorAction SilentlyContinue) {
    watchman watch-del-all 2>$null
    Write-Host "   ✅ Cache do Watchman limpo" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Watchman não instalado (opcional)" -ForegroundColor Gray
}

# 6. Limpar cache do npm
Write-Host "6️⃣ Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "   ✅ Cache do npm limpo" -ForegroundColor Green

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
Write-Host "✅ LIMPEZA COMPLETA FINALIZADA!`n" -ForegroundColor Green

Write-Host "🔄 PRÓXIMOS PASSOS:`n" -ForegroundColor Yellow
Write-Host "   1. Reinstale as dependências (OPCIONAL):" -ForegroundColor White
Write-Host "      Remove-Item -Recurse -Force node_modules" -ForegroundColor Gray
Write-Host "      npm install`n" -ForegroundColor Gray
Write-Host "   2. Inicie o Metro com cache limpo:" -ForegroundColor White
Write-Host "      npm run start:clear`n" -ForegroundColor Gray
Write-Host "   3. Feche COMPLETAMENTE o Expo Go no dispositivo" -ForegroundColor White
Write-Host "   4. Reabra o Expo Go e escaneie o QR code novamente`n" -ForegroundColor White
Write-Host "   Se o erro persistir, use desenvolvimento nativo:" -ForegroundColor Yellow
Write-Host "   npx expo prebuild" -ForegroundColor Gray
Write-Host "   npx expo run:android`n" -ForegroundColor Gray




