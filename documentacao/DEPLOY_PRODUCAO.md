# 🚀 Guia de Deploy para Produção - FinFlow

Este guia explica como fazer o deploy do FinFlow em ambiente de produção.

## 📋 Checklist de Preparação

### ✅ Pré-requisitos
- [ ] Conta em provedor de hospedagem (Heroku, Vercel, Railway, etc.)
- [ ] Banco de dados PostgreSQL configurado
- [ ] Configurações de email para produção
- [ ] Domínio configurado (opcional)
- [ ] SSL/HTTPS configurado

## 🏗️ Estrutura do Projeto

```
projeto-web/
├── frontend/          # React App (porta 3000)
├── backend/           # Node.js API (porta 3001)
├── database/          # Scripts SQL
└── docs/             # Documentação
```

## 🔧 Configurações de Produção

### 1. Variáveis de Ambiente

#### **Backend (.env)**
```env
# Configurações de Email
EMAIL_USER=seu-email-producao@gmail.com
EMAIL_PASS=sua-senha-de-app-producao

# URL do Frontend
FRONTEND_URL=https://seu-dominio.com

# Configurações do Banco de Dados
DB_HOST=seu-host-postgresql
DB_PORT=5432
DB_NAME=finflow_producao
DB_USER=seu_usuario_db
DB_PASSWORD=sua_senha_db

# Configurações do Servidor
PORT=3001
NODE_ENV=production
```

#### **Frontend (.env)**
```env
REACT_APP_API_URL=https://api.seu-dominio.com
REACT_APP_VERSION=2.1.0
```

### 2. Configurações de Segurança

#### **Backend**
- [ ] CORS configurado para domínio de produção
- [ ] Rate limiting implementado
- [ ] Validação de entrada reforçada
- [ ] Logs de segurança ativos

#### **Frontend**
- [ ] HTTPS obrigatório
- [ ] Headers de segurança configurados
- [ ] CSP (Content Security Policy) ativo

## 🚀 Opções de Deploy

### Opção 1: Heroku (Recomendado para iniciantes)

#### **Backend (Heroku)**
```bash
# 1. Instalar Heroku CLI
# 2. Login no Heroku
heroku login

# 3. Criar app
heroku create finflow-backend

# 4. Configurar variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set EMAIL_USER=seu-email@gmail.com
heroku config:set EMAIL_PASS=sua-senha-app
heroku config:set FRONTEND_URL=https://finflow-frontend.herokuapp.com

# 5. Adicionar addon do PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 6. Deploy
git push heroku main
```

#### **Frontend (Vercel)**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login no Vercel
vercel login

# 3. Deploy
vercel --prod
```

### Opção 2: Railway

#### **Backend + Frontend**
```bash
# 1. Conectar repositório no Railway
# 2. Configurar variáveis de ambiente
# 3. Deploy automático
```

### Opção 3: VPS (DigitalOcean, AWS, etc.)

#### **Preparação do Servidor**
```bash
# 1. Atualizar sistema
sudo apt update && sudo apt upgrade

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# 4. Instalar PM2
sudo npm install -g pm2
```

#### **Deploy do Backend**
```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/finflow.git
cd finflow/backend

# 2. Instalar dependências
npm install --production

# 3. Configurar variáveis de ambiente
cp config.env.example .env
# Editar .env com configurações de produção

# 4. Executar com PM2
pm2 start app.js --name "finflow-backend"
pm2 save
pm2 startup
```

#### **Deploy do Frontend**
```bash
# 1. Build de produção
npm run build

# 2. Configurar Nginx
sudo nano /etc/nginx/sites-available/finflow
```

**Configuração Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        root /var/www/finflow/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🗄️ Banco de Dados

### 1. Configuração PostgreSQL

#### **Criar Banco de Dados**
```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar banco de dados
CREATE DATABASE finflow_producao;

-- Criar usuário
CREATE USER finflow_user WITH PASSWORD 'senha_segura';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE finflow_producao TO finflow_user;

-- Conectar ao banco
\c finflow_producao

-- Executar scripts SQL
\i ScriptSQL.sql
\i ScriptSQL_New.sql
\i ScriptSQL_Recorrencia_Lembretes.sql
```

### 2. Backup e Restore

#### **Backup**
```bash
pg_dump -U finflow_user -h localhost finflow_producao > backup_$(date +%Y%m%d).sql
```

#### **Restore**
```bash
psql -U finflow_user -h localhost finflow_producao < backup_20250130.sql
```

## 📧 Configuração de Email

### 1. Gmail (Produção)
```env
EMAIL_USER=finflow@seu-dominio.com
EMAIL_PASS=sua-senha-de-app
```

### 2. SendGrid (Alternativa)
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=sua-api-key
```

## 🔒 Segurança

### 1. SSL/HTTPS
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com
```

### 2. Firewall
```bash
# Configurar UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📊 Monitoramento

### 1. Logs
```bash
# Ver logs do backend
pm2 logs finflow-backend

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
```

### 2. Métricas
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Database monitoring

## 🔄 CI/CD (Opcional)

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run deploy
```

## 🧪 Testes de Produção

### 1. Checklist de Testes
- [ ] Login/Logout funcionando
- [ ] Cadastro de usuários
- [ ] CRUD de despesas/receitas
- [ ] Relatórios gerando
- [ ] Emails sendo enviados
- [ ] Lembretes funcionando
- [ ] Responsividade mobile

### 2. Testes de Performance
```bash
# Teste de carga
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3001/
```

## 🆘 Troubleshooting

### Problemas Comuns

#### **1. Erro de CORS**
```javascript
// backend/app.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### **2. Erro de Conexão com Banco**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -U finflow_user -h localhost -d finflow_producao
```

#### **3. Erro de Email**
```bash
# Verificar logs
pm2 logs finflow-backend

# Testar envio manual
node -e "require('./src/services/emailService').sendWelcomeEmail({nome:'Teste',email:'teste@email.com'})"
```

## 📈 Otimizações

### 1. Performance
- [ ] Compressão gzip
- [ ] Cache de consultas
- [ ] CDN para assets
- [ ] Lazy loading

### 2. Segurança
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection

## 📞 Suporte

### Contatos
- **Desenvolvimento:** Liz Softwares
- **Email:** suporte@lizsoftwares.com
- **Documentação:** [Link para docs]

---

**Versão:** 2.1.0  
**Última atualização:** 30/07/2025  
**Desenvolvido por:** Liz Softwares 