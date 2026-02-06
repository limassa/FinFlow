#!/bin/bash
# Script Bash para instalar Evolution API
# Execute: bash backend/instalar-evolution-api.sh

echo "🚀 Instalando Evolution API..."
echo ""

# Verificar se Docker está rodando
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

echo "✅ Docker está rodando"

# Verificar se container já existe
if docker ps -a --format '{{.Names}}' | grep -q "^evolution-api$"; then
    echo "⚠️ Container 'evolution-api' já existe"
    read -p "Deseja remover e recriar? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🗑️ Removendo container existente..."
        docker stop evolution-api 2>/dev/null
        docker rm evolution-api 2>/dev/null
        echo "✅ Container removido"
    else
        echo "ℹ️ Mantendo container existente"
        echo "💡 Para iniciar: docker start evolution-api"
        exit 0
    fi
fi

# Ler chave do config.env
API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#"

if [ -f "backend/config.env" ]; then
    KEY_LINE=$(grep "^EVOLUTION_API_KEY=" backend/config.env | head -1)
    if [ ! -z "$KEY_LINE" ]; then
        API_KEY=$(echo "$KEY_LINE" | sed 's/^EVOLUTION_API_KEY=//' | sed 's/"//g')
        echo "📋 Usando chave do config.env"
    fi
fi

echo ""
echo "📋 Configurações:"
echo "   Nome: evolution-api"
echo "   Porta: 8080"
echo "   API Key: ${API_KEY:0:30}..."
echo ""

# Instalar Evolution API
echo "🔧 Criando container..."

docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="$API_KEY" \
  atendai/evolution-api:latest

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Evolution API instalada com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Aguarde alguns segundos para a API iniciar"
    echo "   2. Acesse: http://localhost:8080"
    echo "   3. Crie uma instância chamada 'webcond'"
    echo "   4. Escaneie o QR Code com seu WhatsApp"
    echo ""
    echo "💡 Para ver logs: docker logs evolution-api"
    echo "💡 Para parar: docker stop evolution-api"
    echo "💡 Para iniciar: docker start evolution-api"
else
    echo ""
    echo "❌ Erro ao instalar Evolution API"
    echo "💡 Verifique os logs: docker logs evolution-api"
fi

