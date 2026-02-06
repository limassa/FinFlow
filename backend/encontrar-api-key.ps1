# Script para encontrar a API Key correta da Evolution API
# Execute: .\backend\encontrar-api-key.ps1

$evolutionEnvPath = Join-Path $PSScriptRoot "..\services\evolution-api\.env"

Write-Host "🔍 Procurando API Key da Evolution API..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path $evolutionEnvPath) {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    Write-Host ""
    
    $content = Get-Content $evolutionEnvPath
    $apiKeyLine = $content | Select-String -Pattern "^AUTHENTICATION_API_KEY="
    
    if ($apiKeyLine) {
        $apiKey = ($apiKeyLine -replace '^AUTHENTICATION_API_KEY=', '').Trim()
        # Remover aspas se houver
        $apiKey = $apiKey -replace '^"', '' -replace '"$', '' -replace "^'", '' -replace "'$", ''
        
        Write-Host "📋 API Key encontrada:" -ForegroundColor Cyan
        Write-Host "   $apiKey" -ForegroundColor White
        Write-Host ""
        
        Write-Host "📝 Atualizando backend\config.env..." -ForegroundColor Yellow
        
        # Atualizar config.env
        $configPath = Join-Path $PSScriptRoot "config.env"
        if (Test-Path $configPath) {
            $configContent = Get-Content $configPath
            $newContent = @()
            
            foreach ($line in $configContent) {
                if ($line -match "^EVOLUTION_API_KEY=") {
                    $newContent += "EVOLUTION_API_KEY=$apiKey"
                    Write-Host "   ✅ Linha atualizada" -ForegroundColor Green
                } else {
                    $newContent += $line
                }
            }
            
            $newContent | Out-File -FilePath $configPath -Encoding UTF8
            Write-Host ""
            Write-Host "✅ config.env atualizado!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
            Write-Host "   1. Reinicie o backend (Ctrl+C e depois npm start)" -ForegroundColor White
            Write-Host "   2. Teste: node scripts/testar-evolution-api.js" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host "❌ config.env não encontrado" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ AUTHENTICATION_API_KEY não encontrada no .env" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 A Evolution API pode não ter API Key configurada" -ForegroundColor Cyan
        Write-Host "   Tente deixar EVOLUTION_API_KEY vazio no config.env" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Arquivo .env não encontrado em: $evolutionEnvPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Verifique manualmente o arquivo .env da Evolution API" -ForegroundColor Yellow
}
