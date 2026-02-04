# Script para configurar desenvolvimento nativo
# Execute: .\configurar-nativo.ps1

Write-Host "`n🚀 CONFIGURANDO DESENVOLVIMENTO NATIVO`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

# Verificar se está na pasta mobile
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na pasta mobile/" -ForegroundColor Red
    exit 1
}

Write-Host "1️⃣ Executando prebuild..." -ForegroundColor Yellow
Write-Host "   Isso criará as pastas android/ e ios/ com código nativo`n" -ForegroundColor Gray

try {
    npx expo prebuild
    
    Write-Host "`n✅ Prebuild concluído com sucesso!`n" -ForegroundColor Green
    
    Write-Host "2️⃣ Próximos passos:`n" -ForegroundColor Yellow
    
    Write-Host "   Para Android:" -ForegroundColor White
    Write-Host "   npx expo run:android`n" -ForegroundColor Gray
    
    Write-Host "   Para iOS (apenas Mac):" -ForegroundColor White
    Write-Host "   cd ios" -ForegroundColor Gray
    Write-Host "   pod install" -ForegroundColor Gray
    Write-Host "   cd .." -ForegroundColor Gray
    Write-Host "   npx expo run:ios`n" -ForegroundColor Gray
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
    Write-Host "✅ Configuração concluída!`n" -ForegroundColor Green
    Write-Host "📱 Agora você pode usar desenvolvimento nativo" -ForegroundColor Cyan
    Write-Host "   Isso resolve o erro Worklets!`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Erro ao executar prebuild:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n💡 Verifique:" -ForegroundColor Yellow
    Write-Host "   1. Android Studio está instalado (para Android)" -ForegroundColor White
    Write-Host "   2. Xcode está instalado (para iOS, apenas Mac)" -ForegroundColor White
    Write-Host "   3. Variáveis de ambiente configuradas`n" -ForegroundColor White
}




