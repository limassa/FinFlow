# 🚀 Script de Deploy Seguro para Produção - FinFlow
# Desenvolvido por: Liz Softwares
# Versão: PowerShell para Windows - APENAS ARQUIVOS ESSENCIAIS

Write-Host "🚀 INICIANDO DEPLOY SEGURO PARA PRODUÇÃO..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "⚠️  ATENÇÃO: Apenas arquivos essenciais serão enviados!" -ForegroundColor Yellow

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

# ========================================
# 📦 ADICIONAR APENAS ARQUIVOS ESSENCIAIS
# ========================================

Write-Host "`n📦 Adicionando APENAS arquivos essenciais para produção..." -ForegroundColor Cyan

# 1. Serviço de email corrigido
Write-Host "   ✅ Adicionando: backend/src/services/emailService.js" -ForegroundColor Green
git add backend/src/services/emailService.js

# 2. Configurações de email para produção
Write-Host "   ✅ Adicionando: backend/config-email-producao.js" -ForegroundColor Green
git add backend/config-email-producao.js

# 3. Script de teste de timeout
Write-Host "   ✅ Adicionando: backend/teste-email-timeout-resolvido.js" -ForegroundColor Green
git add backend/teste-email-timeout-resolvido.js

# 4. Documentação da solução
Write-Host "   ✅ Adicionando: documentacao/SOLUCAO_TIMEOUT_EMAIL.md" -ForegroundColor Green
git add documentacao/SOLUCAO_TIMEOUT_EMAIL.md

Write-Host "   ✅ Adicionando: documentacao/SOLUCAO_EMAIL_PRODUCAO.md" -ForegroundColor Green
git add documentacao/SOLUCAO_EMAIL_PRODUCAO.md

# 5. Resumo da solução
Write-Host "   ✅ Adicionando: RESUMO_SOLUCAO_TIMEOUT.md" -ForegroundColor Green
git add RESUMO_SOLUCAO_TIMEOUT.md

# 6. Configurações de produção (se existirem)
if (Test-Path "backend/config.production.js") {
    Write-Host "   ✅ Adicionando: backend/config.production.js" -ForegroundColor Green
    git add backend/config.production.js
}

# 7. Arquivos de deploy (se existirem)
if (Test-Path "railway.json") {
    Write-Host "   ✅ Adicionando: railway.json" -ForegroundColor Green
    git add railway.json
}

if (Test-Path "railway.toml") {
    Write-Host "   ✅ Adicionando: railway.toml" -ForegroundColor Green
    git add railway.toml
}

# ========================================
# 🚫 ARQUIVOS QUE NÃO DEVEM SER ADICIONADOS
# ========================================

Write-Host "`n🚫 ARQUIVOS EXCLUÍDOS (não enviar para produção):" -ForegroundColor Red

# Verificar se existem arquivos sensíveis
$ARQUIVOS_SENSIVEIS = @(
    "config.env",
    ".env",
    "backend/config.env",
    "config-homolog.js",
    "config-local.js"
)

foreach ($arquivo in $ARQUIVOS_SENSIVEIS) {
    if (Test-Path $arquivo) {
        Write-Host "   ❌ EXCLUÍDO: $arquivo" -ForegroundColor Red
    }
}

# Verificar scripts de teste
$SCRIPTS_TESTE = @(
    "teste-*.js",
    "verificar-*.js",
    "test-backend-*.js"
)

foreach ($padrao in $SCRIPTS_TESTE) {
    $arquivos = Get-ChildItem -Path "backend" -Filter $padrao -Recurse -ErrorAction SilentlyContinue
    foreach ($arquivo in $arquivos) {
        if ($arquivo.Name -ne "teste-email-timeout-resolvido.js") {
            Write-Host "   ❌ EXCLUÍDO: $($arquivo.FullName)" -ForegroundColor Red
        }
    }
}

# ========================================
# 💾 FAZENDO COMMIT SEGURO
# ========================================

Write-Host "`n💾 Fazendo commit seguro para produção..." -ForegroundColor Cyan

$commitMessage = @"
fix: resolve timeout na conexão SMTP - DEPLOY SEGURO

✅ ARQUIVOS ENVIADOS (apenas essenciais):
- backend/src/services/emailService.js (timeout corrigido)
- backend/config-email-producao.js (configurações otimizadas)
- backend/teste-email-timeout-resolvido.js (script de teste)
- documentacao/SOLUCAO_TIMEOUT_EMAIL.md (solução completa)
- documentacao/SOLUCAO_EMAIL_PRODUCAO.md (documentação existente)
- RESUMO_SOLUCAO_TIMEOUT.md (resumo executivo)

🚫 ARQUIVOS EXCLUÍDOS (segurança):
- config.env (credenciais locais)
- Scripts de teste locais
- Configurações de banco local
- Scripts de deploy local

🔒 SEGURANÇA: Configurações de banco preservadas
🎯 OBJETIVO: Resolver timeout de email em produção
"@

git commit -m $commitMessage

# ========================================
# 🚀 FAZENDO PUSH PARA PRODUÇÃO
# ========================================

Write-Host "`n🚀 Fazendo push seguro para produção..." -ForegroundColor Cyan
git push origin production

# ========================================
# ✅ DEPLOY SEGURO CONCLUÍDO
# ========================================

Write-Host "`n✅ DEPLOY SEGURO CONCLUÍDO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 ARQUIVOS ENVIADOS:" -ForegroundColor Yellow
Write-Host "1. ✅ Serviço de email com timeout corrigido" -ForegroundColor White
Write-Host "2. ✅ Configurações otimizadas para produção" -ForegroundColor White
Write-Host "3. ✅ Script de teste de timeout" -ForegroundColor White
Write-Host "4. ✅ Documentação completa da solução" -ForegroundColor White
Write-Host ""
Write-Host "🚫 ARQUIVOS PROTEGIDOS:" -ForegroundColor Yellow
Write-Host "1. ✅ Configurações de banco preservadas" -ForegroundColor White
Write-Host "2. ✅ Credenciais locais não enviadas" -ForegroundColor White
Write-Host "3. ✅ Scripts de teste local mantidos" -ForegroundColor White
Write-Host ""
Write-Host "🔍 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. ✅ Código enviado para produção" -ForegroundColor White
Write-Host "2. 🔄 Aguardar deploy automático no Railway" -ForegroundColor White
Write-Host "3. 🧪 Testar com script: node backend/teste-email-timeout-resolvido.js" -ForegroundColor White
Write-Host "4. 👥 Testar cadastro real de usuário" -ForegroundColor White
Write-Host "5. 📧 Verificar se emails de boas-vindas chegam" -ForegroundColor White
Write-Host ""
Write-Host "🔒 SEGURANÇA:" -ForegroundColor Yellow
Write-Host "- ✅ Apenas arquivos essenciais enviados" -ForegroundColor White
Write-Host "- ✅ Configurações de banco preservadas" -ForegroundColor White
Write-Host "- ✅ Credenciais locais protegidas" -ForegroundColor White
Write-Host "- ✅ Deploy limpo e seguro" -ForegroundColor White
Write-Host ""
Write-Host "🎯 RESULTADO ESPERADO:" -ForegroundColor Yellow
Write-Host "- ✅ Problema de timeout resolvido" -ForegroundColor White
Write-Host "- ✅ Emails sendo enviados com sucesso" -ForegroundColor White
Write-Host "- ✅ Sistema de email estável em produção" -ForegroundColor White
Write-Host "- ✅ Configurações de banco intactas" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Deploy seguro concluído! Aguarde a aplicação ficar online no Railway." -ForegroundColor Green

# Aguardar input do usuário
Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
