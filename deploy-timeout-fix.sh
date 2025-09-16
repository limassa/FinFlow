#!/bin/bash

# 🚀 Script de Deploy para Solução de Timeout - FinFlow
# Desenvolvido por: Liz Softwares

echo "🚀 INICIANDO DEPLOY DA SOLUÇÃO DE TIMEOUT..."
echo "============================================="

# Verificar se estamos na branch correta
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "production" ]; then
    echo "❌ ERRO: Você deve estar na branch 'production' para fazer o deploy"
    echo "🔧 Execute: git checkout production"
    exit 1
fi

echo "✅ Branch atual: $CURRENT_BRANCH"

# Verificar status do git
echo -e "\n📋 Verificando status do Git..."
git status

# Adicionar todas as alterações
echo -e "\n📦 Adicionando alterações..."
git add .

# Fazer commit com mensagem descritiva
echo -e "\n💾 Fazendo commit das alterações..."
git commit -m "fix: resolve timeout na conexão SMTP com configurações otimizadas

- Adiciona configurações de timeout para conexões SMTP
- Implementa pool de conexões para melhor performance
- Adiciona sistema de retry automático
- Cria arquivos de configuração específicos para produção
- Resolve problema de 'Connection timeout' em produção

Arquivos modificados:
- backend/src/services/emailService.js
- backend/config-email-producao.js (novo)
- backend/teste-email-timeout-resolvido.js (novo)
- documentacao/SOLUCAO_TIMEOUT_EMAIL.md (novo)"

# Fazer push para o repositório remoto
echo -e "\n🚀 Fazendo push para produção..."
git push origin production

echo -e "\n✅ DEPLOY INICIADO COM SUCESSO!"
echo "====================================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. ✅ Código enviado para produção"
echo "2. 🔄 Aguardar deploy automático no Railway"
echo "3. 🧪 Testar com script: node backend/teste-email-timeout-resolvido.js"
echo "4. 👥 Testar cadastro real de usuário"
echo "5. 📧 Verificar se emails de boas-vindas chegam"
echo ""
echo "🔍 MONITORAMENTO:"
echo "- Verifique os logs do Railway durante o deploy"
echo "- Monitore os logs após o deploy para erros"
echo "- Execute o script de teste para validar a solução"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo "- Consulte: documentacao/SOLUCAO_TIMEOUT_EMAIL.md"
echo "- Script de teste: backend/teste-email-timeout-resolvido.js"
echo "- Configurações: backend/config-email-producao.js"
echo ""
echo "🎯 RESULTADO ESPERADO:"
echo "- ✅ Problema de timeout resolvido"
echo "- ✅ Emails sendo enviados com sucesso"
echo "- ✅ Sistema de email estável em produção"
echo ""
echo "🚨 EM CASO DE PROBLEMAS:"
echo "- Verifique as variáveis de ambiente no Railway"
echo "- Confirme se EMAIL_USER e EMAIL_PASS estão configurados"
echo "- Execute o script de teste para diagnóstico"
echo "- Consulte a documentação de solução"
echo ""
echo "🎉 Deploy concluído! Aguarde a aplicação ficar online no Railway."
