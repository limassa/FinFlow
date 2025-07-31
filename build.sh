#!/bin/bash

# Script de build para Netlify
echo "🚀 Iniciando build do FinFlow..."

# Verificar se estamos no diretório correto
echo "📁 Diretório atual: $(pwd)"
echo "📄 Verificando package.json..."
ls -la package.json

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Fazer o build
echo "🔨 Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem-sucedido
echo "✅ Verificando build..."
ls -la build/

echo "🎉 Build concluído com sucesso!" 