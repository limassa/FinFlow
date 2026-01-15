# Script PowerShell para testar envio de WhatsApp
# Uso: .\testar-whatsapp.ps1 -UserId 1

param(
    [Parameter(Mandatory=$true)]
    [int]$UserId
)

$backendUrl = "http://localhost:3001"
$endpoint = "$backendUrl/api/lembretes/teste-whatsapp"

Write-Host "`n📱 TESTE DE ENVIO DE WHATSAPP`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "📋 Configuração:" -ForegroundColor Yellow
Write-Host "   Backend: $backendUrl"
Write-Host "   Usuário ID: $UserId`n"

Write-Host "🔄 Enviando requisição...`n" -ForegroundColor Yellow

try {
    $body = @{
        userId = $UserId
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -Headers $headers -ErrorAction Stop

    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
    Write-Host "✅ SUCESSO!`n" -ForegroundColor Green
    Write-Host "📊 Resposta do servidor:" -ForegroundColor Yellow
    Write-Host "   Mensagem: $($response.message)" -ForegroundColor White
    Write-Host "   Vencimentos: $($response.vencimentos)" -ForegroundColor White
    Write-Host "   Destinatário: $($response.destinatario)`n" -ForegroundColor White
    Write-Host "📱 Verifique seu WhatsApp! Você deve ter recebido uma mensagem.`n" -ForegroundColor Cyan

} catch {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
    Write-Host "❌ ERRO!`n" -ForegroundColor Red

    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd() | ConvertFrom-Json -ErrorAction SilentlyContinue

        Write-Host "📊 Status HTTP: $statusCode" -ForegroundColor Yellow
        if ($responseBody) {
            Write-Host "📋 Mensagem: $($responseBody.error)" -ForegroundColor White
        } else {
            Write-Host "📋 Mensagem: $($_.Exception.Message)" -ForegroundColor White
        }
        Write-Host ""

        if ($statusCode -eq 400) {
            Write-Host "💡 SOLUÇÃO:" -ForegroundColor Yellow
            Write-Host "   1. Verifique se o telefone está cadastrado no perfil" -ForegroundColor White
            Write-Host "   2. Verifique se lembretes WhatsApp estão ativados" -ForegroundColor White
            Write-Host "   3. Verifique se existe despesa com vencimento próximo`n" -ForegroundColor White
        } elseif ($statusCode -eq 404) {
            Write-Host "💡 SOLUÇÃO:" -ForegroundColor Yellow
            Write-Host "   1. Verifique se o usuário existe (userId correto?)" -ForegroundColor White
            Write-Host "   2. Crie uma despesa com vencimento nos próximos 5 dias`n" -ForegroundColor White
        } elseif ($statusCode -eq 500) {
            Write-Host "💡 SOLUÇÃO:" -ForegroundColor Yellow
            Write-Host "   1. Verifique se a Evolution API está rodando" -ForegroundColor White
            Write-Host "   2. Verifique se a instância está conectada" -ForegroundColor White
            Write-Host "   3. Verifique os logs do backend`n" -ForegroundColor White
        }
    } elseif ($_.Exception.Message -like "*Unable to connect*" -or $_.Exception.Message -like "*Connection refused*") {
        Write-Host "❌ Não foi possível conectar ao backend!`n" -ForegroundColor Red
        Write-Host "💡 SOLUÇÃO:" -ForegroundColor Yellow
        Write-Host "   1. Verifique se o backend está rodando" -ForegroundColor White
        Write-Host "   2. Verifique se a URL está correta: $backendUrl" -ForegroundColor White
        Write-Host "   3. Execute: cd backend && npm start`n" -ForegroundColor White
    } else {
        Write-Host "❌ Erro: $($_.Exception.Message)`n" -ForegroundColor Red
        Write-Host "💡 Verifique os logs do backend para mais detalhes.`n" -ForegroundColor Yellow
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

