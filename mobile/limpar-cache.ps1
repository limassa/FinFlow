# Script para limpar cache do Expo/React Native
# Execute: .\limpar-cache.ps1

Write-Host "`n🧹 Limpando cache do Expo/React Native...`n" -ForegroundColor Cyan

# Limpar cache do Expo
if (Test-Path ".expo") {
    Write-Host "   Removendo .expo..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .expo
    Write-Host "   ✅ .expo removido" -ForegroundColor Green
}

# Limpar cache do node_modules
if (Test-Path "node_modules\.cache") {
    Write-Host "   Removendo node_modules\.cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "   ✅ node_modules\.cache removido" -ForegroundColor Green
}

# Limpar cache do Metro
if (Test-Path "$env:TEMP\metro-*") {
    Write-Host "   Limpando cache do Metro..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "$env:TEMP\metro-*" -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache do Metro limpo" -ForegroundColor Green
}

# Limpar cache do watchman (se instalado)
if (Get-Command watchman -ErrorAction SilentlyContinue) {
    Write-Host "   Limpando cache do Watchman..." -ForegroundColor Yellow
    watchman watch-del-all 2>$null
    Write-Host "   ✅ Cache do Watchman limpo" -ForegroundColor Green
}

Write-Host "`n✅ Cache limpo com sucesso!`n" -ForegroundColor Green
Write-Host "🔄 Próximos passos:`n" -ForegroundColor Yellow
Write-Host "   1. Execute: npm run start:clear" -ForegroundColor White
Write-Host "   2. Reinicie o app no dispositivo`n" -ForegroundColor White



