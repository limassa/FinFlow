# Script para corrigir .env da Evolution API
# Execute: .\backend\corrigir-env-evolution.ps1

$envPath = Join-Path $PSScriptRoot "..\services\evolution-api\.env"

Write-Host "🔧 Corrigindo .env da Evolution API..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $envPath)) {
    Write-Host "❌ Arquivo .env não encontrado em: $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Arquivo encontrado: $envPath" -ForegroundColor Green
Write-Host ""

# Ler conteúdo
$content = Get-Content $envPath

# Fazer backup
$backupPath = "$envPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $envPath $backupPath
Write-Host "💾 Backup criado: $backupPath" -ForegroundColor Gray
Write-Host ""

# Corrigir linhas
$newContent = @()
foreach ($line in $content) {
    # Remover aspas da DATABASE_CONNECTION_URI
    if ($line -match "^DATABASE_CONNECTION_URI=") {
        # Remover aspas simples no início e fim
        $line = $line -replace "^DATABASE_CONNECTION_URI=", "DATABASE_CONNECTION_URI="
        if ($line -match "^DATABASE_CONNECTION_URI='") {
            $line = $line -replace "^DATABASE_CONNECTION_URI='", "DATABASE_CONNECTION_URI="
        }
        # Remover aspas no final
        if ($line.EndsWith("'")) {
            $line = $line.Substring(0, $line.Length - 1)
        }
        # Corrigir nome do banco
        $line = $line -replace "FinflowTeste", "FinFlowTeste"
        Write-Host "✅ Corrigido: $line" -ForegroundColor Green
    }
    $newContent += $line
}

# Salvar
$newContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host ""
Write-Host "✅ Arquivo .env corrigido!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Vá para: cd ..\services\evolution-api" -ForegroundColor White
Write-Host "   2. Inicie: npm start" -ForegroundColor White
Write-Host ""
