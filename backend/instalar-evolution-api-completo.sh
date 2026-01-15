#!/bin/bash
# Script Bash para instalar Evolution API com MongoDB
# Execute: bash backend/instalar-evolution-api-completo.sh

echo "🚀 Instalando Evolution API com MongoDB..."
echo ""

# Verificar se Docker está rodando
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

echo "✅ Docker está rodando"

# Parar e remover containers existentes
echo "🧹 Limpando containers existentes..."
docker stop evolution-api 2>/dev/null
docker rm evolution-api 2>/dev/null
docker stop evolution-mongodb 2>/dev/null
docker rm evolution-mongodb 2>/dev/null
echo "✅ Containers antigos removidos"
echo ""

# Ler chave do config.env
API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#"

if [ -f "backend/config.env" ]; then
    KEY_LINE=$(grep "^EVOLUTION_API_KEY=" backend/config.env | head -1)
    if [ ! -z "$KEY_LINE" ]; then
        API_KEY=$(echo "$KEY_LINE" | sed 's/^EVOLUTION_API_KEY=//' | sed 's/"//g')
        echo "📋 Usando chave do config.env"
    fi
fi

echo "📋 Configurações:"
echo "   Nome: evolution-api"
echo "   Porta: 8080"
echo "   API Key: ${API_KEY:0:30}..."
echo "   Database: MongoDB"
echo ""

# Criar MongoDB
echo "🔧 Criando container MongoDB..."
docker run -d \
  --name evolution-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:latest

if [ $? -ne 0 ]; then
    echo "❌ Erro ao criar MongoDB"
    exit 1
fi

echo "✅ MongoDB criado"
echo "⏳ Aguardando MongoDB iniciar (15 segundos)..."
sleep 15

# Criar Evolution API
echo "🔧 Criando container Evolution API..."

docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  --link evolution-mongodb:mongo \
  -e AUTHENTICATION_API_KEY="$API_KEY" \
  -e DATABASE_ENABLED=true \
  -e DATABASE_PROVIDER=mongodb \
  -e DATABASE_CONNECTION_URI="mongodb://admin:admin123@evolution-mongodb:27017/evolution?authSource=admin" \
  atendai/evolution-api:latest

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Evolution API instalada com sucesso!"
    echo ""
    echo "⏳ Aguarde alguns segundos para a API iniciar completamente..."
    sleep 10
    echo ""
    echo "📋 Verificando logs..."
    docker logs evolution-api --tail 20
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Verifique se não há erros de 'Database provider invalid' nos logs acima"
    echo "   2. Acesse: http://localhost:8080"
    echo "   3. Crie uma instância chamada 'webcond'"
    echo "   4. Escaneie o QR Code com seu WhatsApp"
    echo ""
    echo "💡 Para ver logs: docker logs evolution-api"
    echo "💡 Para parar: docker stop evolution-api evolution-mongodb"
    echo "💡 Para iniciar: docker start evolution-mongodb evolution-api"
else
    echo ""
    echo "❌ Erro ao instalar Evolution API"
    echo "💡 Verifique os logs: docker logs evolution-api"
fi

