#!/bin/bash

# 🚀 Script de Deploy Automatizado - FinFlow
# Desenvolvido por: Liz Softwares

set -e  # Para o script se houver erro

echo "🚀 Iniciando deploy do FinFlow..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto"
fi

# Verificar se o git está limpo
if [ -n "$(git status --porcelain)" ]; then
    warning "Há mudanças não commitadas. Deseja continuar? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        error "Deploy cancelado"
    fi
fi

# Backup do banco de dados (se configurado)
if [ -n "$DB_HOST" ]; then
    log "📊 Fazendo backup do banco de dados..."
    pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" > "backup_$(date +%Y%m%d_%H%M%S).sql"
    log "✅ Backup criado com sucesso"
fi

# Build do frontend
log "🏗️ Fazendo build do frontend..."
cd frontend || error "Diretório frontend não encontrado"

# Instalar dependências
npm ci --production || error "Erro ao instalar dependências do frontend"

# Build de produção
npm run build || error "Erro no build do frontend"

log "✅ Build do frontend concluído"

# Deploy do backend
log "🔧 Configurando backend..."
cd ../backend || error "Diretório backend não encontrado"

# Instalar dependências
npm ci --production || error "Erro ao instalar dependências do backend"

# Verificar variáveis de ambiente
if [ ! -f ".env" ]; then
    warning "Arquivo .env não encontrado. Copiando exemplo..."
    cp config.env.example .env
    warning "⚠️ Configure as variáveis de ambiente em .env antes de continuar"
    exit 1
fi

# Executar migrações do banco (se houver)
if [ -f "scripts/migrate.sql" ]; then
    log "🗄️ Executando migrações do banco..."
    psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" -f scripts/migrate.sql || warning "Erro nas migrações"
fi

# Reiniciar serviços
log "🔄 Reiniciando serviços..."

# Se estiver usando PM2
if command -v pm2 &> /dev/null; then
    pm2 restart finflow-backend || pm2 start app.js --name "finflow-backend"
    pm2 save
    log "✅ Serviços reiniciados com PM2"
else
    # Reiniciar com systemd (se configurado)
    if systemctl is-active --quiet finflow-backend; then
        sudo systemctl restart finflow-backend
        log "✅ Serviços reiniciados com systemd"
    else
        warning "PM2 ou systemd não encontrados. Reinicie manualmente"
    fi
fi

# Testes de saúde
log "🏥 Executando testes de saúde..."

# Testar API
if curl -f http://localhost:3001/ > /dev/null 2>&1; then
    log "✅ API respondendo"
else
    error "❌ API não está respondendo"
fi

# Testar frontend
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    log "✅ Frontend respondendo"
else
    warning "⚠️ Frontend não está respondendo"
fi

# Testar email (se configurado)
if [ -n "$EMAIL_USER" ]; then
    log "📧 Testando envio de email..."
    node -e "
    const emailService = require('./src/services/emailService');
    emailService.sendWelcomeEmail({
        nome: 'Teste Deploy',
        email: '$EMAIL_USER'
    }).then(result => {
        console.log(result ? 'Email enviado' : 'Erro no email');
        process.exit(result ? 0 : 1);
    }).catch(err => {
        console.error('Erro:', err);
        process.exit(1);
    });
    " || warning "⚠️ Erro no teste de email"
fi

# Limpeza
log "🧹 Limpando arquivos temporários..."
rm -rf node_modules/.cache
rm -rf frontend/build/.cache

# Log final
log "🎉 Deploy concluído com sucesso!"
log "📊 Status dos serviços:"
pm2 status 2>/dev/null || echo "PM2 não disponível"

echo ""
echo "🔗 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:3001"
echo ""
echo "📞 Para suporte: suporte@lizsoftwares.com" 