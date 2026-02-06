# 🗄️ Guia de Configuração de Banco Local - FinFlow

## 📍 **Arquivo Principal para Modificar**

### **Arquivo:** `backend/src/database/connection.js`
Este arquivo controla a conexão com o banco de dados.

## 🎯 **Opções de Configuração**

### **1. Configuração Automática (Recomendado)**
```bash
node configurar-banco-local.js
```

**Escolha sua opção:**
- `1` - PostgreSQL (Recomendado)
- `2` - MySQL
- `3` - SQLite (Para testes simples)
- `4` - Manter Railway (atual)

### **2. Configuração Manual**

#### **Editar `backend/config.env`:**
```env
# Configurações do Banco de Dados Local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finflow_local
DB_USER=postgres
DB_PASSWORD=sua-senha
DATABASE_URL=postgresql://postgres:sua-senha@localhost:5432/finflow_local
```

## 🐘 **PostgreSQL (Recomendado)**

### **1. Instalar PostgreSQL**
- **Windows:** https://www.postgresql.org/download/windows/
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql`

### **2. Criar Banco de Dados**
```sql
CREATE DATABASE finflow_local;
```

### **3. Configurar**
```bash
node configurar-banco-local.js
# Escolha opção 1 (PostgreSQL)
```

### **4. Configuração Típica**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finflow_local
DB_USER=postgres
DB_PASSWORD=sua-senha
```

## 🐬 **MySQL**

### **1. Instalar MySQL**
- **Windows:** https://dev.mysql.com/downloads/installer/
- **Mac:** `brew install mysql`
- **Linux:** `sudo apt-get install mysql-server`

### **2. Criar Banco de Dados**
```sql
CREATE DATABASE finflow_local;
```

### **3. Configurar**
```bash
node configurar-banco-local.js
# Escolha opção 2 (MySQL)
```

### **4. Configuração Típica**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=finflow_local
DB_USER=root
DB_PASSWORD=sua-senha
```

## 📁 **SQLite (Mais Simples)**

### **1. Configurar**
```bash
node configurar-banco-local.js
# Escolha opção 3 (SQLite)
```

### **2. Configuração Típica**
```env
DB_TYPE=sqlite
DB_FILE=finflow.db
DATABASE_URL=sqlite:./finflow.db
```

## 🔧 **Arquivos para Modificar**

### **1. `backend/config.env`**
```env
# Configurações do Banco de Dados Local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finflow_local
DB_USER=postgres
DB_PASSWORD=sua-senha
DATABASE_URL=postgresql://postgres:sua-senha@localhost:5432/finflow_local
```

### **2. `backend/src/database/connection.js`**
```javascript
// Configuração para banco local
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'sua-senha'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'finflow_local'}`;
```

## 📋 **Passos para Configurar**

### **1. Escolher Banco**
```bash
node configurar-banco-local.js
```

### **2. Instalar Banco (se necessário)**
- PostgreSQL: https://www.postgresql.org/download/
- MySQL: https://dev.mysql.com/downloads/
- SQLite: Já vem com Node.js

### **3. Criar Banco de Dados**
```sql
-- PostgreSQL
CREATE DATABASE finflow_local;

-- MySQL
CREATE DATABASE finflow_local;
```

### **4. Executar Scripts de Correção**
```bash
node corrigir-todas-tabelas.js
```

### **5. Testar Conexão**
```bash
cd backend && npm start
```

## 🧪 **Testes de Conexão**

### **1. Teste Rápido**
```bash
node teste-api.js
```

### **2. Teste de Tabelas**
```bash
node diagnostico-receita.js
node diagnostico-despesa.js
```

### **3. Teste de Inserção**
```bash
node corrigir-todas-tabelas.js
```

## 📊 **Configurações por Ambiente**

### **Desenvolvimento Local**
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finflow_local
```

### **Teste**
```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finflow_test
```

### **Produção (Railway)**
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
```

## 🐛 **Solução de Problemas**

### **Erro: "Connection refused"**
```bash
# Verificar se o banco está rodando
# PostgreSQL
sudo service postgresql status

# MySQL
sudo service mysql status
```

### **Erro: "Database does not exist"**
```sql
-- Criar banco
CREATE DATABASE finflow_local;
```

### **Erro: "Authentication failed"**
```bash
# Verificar usuário e senha
# PostgreSQL
psql -U postgres -h localhost

# MySQL
mysql -u root -p
```

### **Erro: "Port already in use"**
```bash
# Verificar portas
netstat -ano | findstr :5432
netstat -ano | findstr :3306

# Matar processo se necessário
taskkill /PID <PID> /F
```

## 📝 **Logs Úteis**

### **Conexão Bem-sucedida**
```
🔌 Configuração do banco de dados:
  URL: postgresql://postgres:***@localhost:5432/finflow_local
  SSL: enabled
  NODE_ENV: development
✅ Conexão com o banco estabelecida: 2025-01-08 10:30:00
```

### **Erro de Conexão**
```
❌ Erro na conexão com o banco: connection refused
💡 Verifique se o banco está rodando
```

## 🎯 **Checklist de Validação**

### **✅ Configuração**
- [ ] Banco instalado e rodando
- [ ] Arquivo `config.env` configurado
- [ ] Banco de dados criado
- [ ] Usuário e senha corretos

### **✅ Conexão**
- [ ] Teste de conexão OK
- [ ] Tabelas criadas
- [ ] Inserção de dados funcionando
- [ ] Backend rodando

### **✅ Funcionalidades**
- [ ] Login funcionando
- [ ] Cadastro funcionando
- [ ] Receitas/Despesas funcionando
- [ ] Relatórios funcionando

## 🚀 **Próximos Passos**

### **1. Configurar Banco**
```bash
node configurar-banco-local.js
```

### **2. Testar Conexão**
```bash
cd backend && npm start
```

### **3. Executar Scripts**
```bash
node corrigir-todas-tabelas.js
```

### **4. Testar Sistema**
```bash
node rodar-local.js
```

---

**Status:** ✅ Pronto para configuração  
**Arquivo principal:** `backend/src/database/connection.js`  
**Configuração:** `backend/config.env`  
**Última atualização:** 01/08/2025 