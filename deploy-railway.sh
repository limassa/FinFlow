#!/bin/bash

# Script de Deploy para Railway - FinFlow
# Desenvolvido por: Liz Softwares

echo "🚀 Iniciando deploy no Railway..."

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install

# Build do frontend
echo "🏗️ Fazendo build do frontend..."
npm run build

# Voltar para o backend
cd ../backend

# Iniciar o servidor
echo "🚀 Iniciando servidor..."
npm start 