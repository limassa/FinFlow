# 🚀 Script de Deploy para Solução de Timeout - FinFlow
# Desenvolvido por: Liz Softwares
# Versão: PowerShell para Windows

Write-Host "🚀 INICIANDO DEPLOY DA SOLUÇÃO DE TIMEOUT..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Verificar se estamos na branch correta
$CURRENT_BRANCH = git branch --show-current
if ($CURRENT_BRANCH -ne "production") {
    Write-Host "❌ ERRO: Você deve estar na branch 'production' para fazer o deploy" -ForegroundColor Red
    Write-Host "🔧 Execute: git checkout production" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Branch atual: $CURRENT_BRANCH" -ForegroundColor Green

# Verificar status do git
Write-Host "`n📋 Verificando status do Git..." -ForegroundColor Cyan
git status

# Adicionar todas as alterações
Write-Host "`n📦 Adicionando alterações..." -ForegroundColor Cyan
git add .

# Fazer commit com mensagem descritiva
Write-Host "`n💾 Fazendo commit das alterações..." -ForegroundColor Cyan
$commitMessage = @"
fix: resolve timeout na conexão SMTP com configurações otimizadas

- Adiciona configurações de timeout para conexões SMTP
- Implementa pool de conexões para melhor performance
- Adiciona sistema de retry automático
- Cria arquivos de configuração específicos para produção
- Resolve problema de 'Connection timeout' em produção

Arquivos modificados:
- backend/src/services/emailService.js
- backend/config-email-producao.js (novo)
- backend/teste-email-timeout-resolvido.js (novo)
- documentacao/SOLUCAO_TIMEOUT_EMAIL.md (novo)
"@

git commit -m $commitMessage

# Fazer push para o repositório remoto
Write-Host "`n🚀 Fazendo push para produção..." -ForegroundColor Cyan
git push origin production

Write-Host "`n✅ DEPLOY INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. ✅ Código enviado para produção" -ForegroundColor White
Write-Host "2. 🔄 Aguardar deploy automático no Railway" -ForegroundColor White
Write-Host "3. 🧪 Testar com script: node backend/teste-email-timeout-resolvido.js" -ForegroundColor White
Write-Host "4. 👥 Testar cadastro real de usuário" -ForegroundColor White
Write-Host "5. 📧 Verificar se emails de boas-vindas chegam" -ForegroundColor White
Write-Host ""
Write-Host "🔍 MONITORAMENTO:" -ForegroundColor Yellow
Write-Host "- Verifique os logs do Railway durante o deploy" -ForegroundColor White
Write-Host "- Monitore os logs após o deploy para erros" -ForegroundColor White
Write-Host "- Execute o script de teste para validar a solução" -ForegroundColor White
Write-Host ""
Write-Host "📚 DOCUMENTAÇÃO:" -ForegroundColor Yellow
Write-Host "- Consulte: documentacao/SOLUCAO_TIMEOUT_EMAIL.md" -ForegroundColor White
Write-Host "- Script de teste: backend/teste-email-timeout-resolvido.js" -ForegroundColor White
Write-Host "- Configurações: backend/config-email-producao.js" -ForegroundColor White
Write-Host ""
Write-Host "🎯 RESULTADO ESPERADO:" -ForegroundColor Yellow
Write-Host "- ✅ Problema de timeout resolvido" -ForegroundColor White
Write-Host "- ✅ Emails sendo enviados com sucesso" -ForegroundColor White
Write-Host "- ✅ Sistema de email estável em produção" -ForegroundColor White
Write-Host ""
Write-Host "🚨 EM CASO DE PROBLEMAS:" -ForegroundColor Yellow
Write-Host "- Verifique as variáveis de ambiente no Railway" -ForegroundColor White
Write-Host "- Confirme se EMAIL_USER e EMAIL_PASS estão configurados" -ForegroundColor White
Write-Host "- Execute o script de teste para diagnóstico" -ForegroundColor White
Write-Host "- Consulte a documentação de solução" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Deploy concluído! Aguarde a aplicação ficar online no Railway." -ForegroundColor Green

# Aguardar input do usuário
Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
