#!/bin/bash

# Script Bash para iniciar o Expo Go
# Uso: ./start-expo.sh

echo "🚀 Iniciando Expo Go..."
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js encontrado: $NODE_VERSION"

# Verificar se o Expo CLI está disponível
if ! command -v npx &> /dev/null; then
    echo "❌ npx não encontrado. Por favor, instale o npm."
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

# Verificar se o backend está rodando
echo "🔍 Verificando conexão com o backend..."
if curl -s --connect-timeout 2 http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend está rodando!"
else
    echo "⚠️  Backend não está rodando em localhost:3001"
    echo "   Certifique-se de que o backend está rodando antes de testar o app."
    echo ""
fi

echo ""
echo "📱 Escolha o modo de conexão:"
echo "   1. Tunnel (recomendado para testes remotos)"
echo "   2. LAN (para dispositivos na mesma rede)"
echo "   3. Local (apenas localhost)"
echo "   4. Padrão (expo start)"
echo ""
read -p "Digite o número da opção (1-4): " opcao

case $opcao in
    1)
        echo "🌐 Iniciando com Tunnel..."
        npx expo start --tunnel
        ;;
    2)
        echo "📡 Iniciando com LAN..."
        npx expo start --lan
        ;;
    3)
        echo "💻 Iniciando em modo Local..."
        npx expo start
        ;;
    4)
        echo "🚀 Iniciando Expo (padrão)..."
        npx expo start
        ;;
    *)
        echo "⚠️  Opção inválida. Iniciando no modo padrão..."
        npx expo start
        ;;
esac

echo ""
echo "📱 Para conectar:"
echo "   - iOS: Abra a câmera e escaneie o QR code"
echo "   - Android: Abra o Expo Go e escaneie o QR code"
echo "   - Pressione 'a' para abrir no Android emulador"
echo "   - Pressione 'i' para abrir no iOS emulador"
echo "   - Pressione 'w' para abrir no navegador"
echo "   - Pressione 'r' para recarregar"
echo "   - Pressione 'm' para abrir o menu de desenvolvedor"
echo "   - Pressione Ctrl+C para parar"
echo ""

