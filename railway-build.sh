#!/bin/bash

echo "🚀 Iniciando build para Railway..."

# Navegar para o diretório backend
cd backend

# Limpar node_modules se existir
if [ -d "node_modules" ]; then
    echo "🧹 Limpando node_modules existente..."
    rm -rf node_modules
fi

# Limpar cache do npm
echo "🧹 Limpando cache do npm..."
npm cache clean --force

# Instalar dependências
echo "📦 Instalando dependências do backend..."
npm install --production

# Verificar se as dependências foram instaladas
echo "🔍 Verificando dependências instaladas..."
npm list --depth=0

echo "✅ Build concluído!" 