# 🔧 Solução para Erro de Usuário - Sistema PDV

## 🚨 Problema Identificado
O sistema está apresentando erro de usuário durante o login.

## 🔍 Diagnóstico

### 1. **Verificar se o Backend está rodando**
```bash
# No terminal, execute:
cd backend
npm start
```

**Resultado esperado:**
```
✅ Servidor rodando na porta 3001
✅ Conexão com banco estabelecida
```

### 2. **Verificar se o Banco de Dados foi criado**
O banco precisa ser criado usando o script SQL.

**Execute o script SQL:**
```sql
-- Use o arquivo ScriptSQL_PDV.sql
-- Execute no seu banco PostgreSQL
```

### 3. **Verificar se o usuário admin existe**
O usuário admin deve existir com as credenciais:
- **Email:** `admin@pdv.com`
- **Senha:** `admin123`

## 🛠️ Soluções

### **Solução 1: Criar usuário admin manualmente**

Se o banco existe mas o usuário admin não foi criado:

```sql
-- Conecte no banco e execute:
INSERT INTO Usuario (Usuario_Nome, Usuario_Email, Usuario_Senha, Usuario_Tipo, Usuario_Ativo) 
VALUES ('Administrador', 'admin@pdv.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6u', 'admin', true);
```

### **Solução 2: Verificar configuração da API**

No arquivo `src/config/api.js`, verifique se a URL está correta:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

### **Solução 3: Testar conexão manualmente**

1. **Teste o backend:**
```bash
curl http://localhost:3001/test
```

2. **Teste o login:**
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pdv.com","senha":"admin123"}'
```

## 🔑 Credenciais Padrão

**Login:** `admin@pdv.com`  
**Senha:** `admin123`

## 📋 Checklist de Verificação

- [ ] Backend está rodando na porta 3001
- [ ] Banco de dados PostgreSQL está ativo
- [ ] Tabelas foram criadas (execute ScriptSQL_PDV.sql)
- [ ] Usuário admin existe no banco
- [ ] Configuração da API está correta
- [ ] Frontend está acessando a URL correta

## 🚀 Passos para Resolver

1. **Inicie o backend:**
```bash
cd backend
npm start
```

2. **Execute o script SQL no banco:**
```bash
# Use seu cliente PostgreSQL preferido
# Execute o conteúdo de ScriptSQL_PDV.sql
```

3. **Teste o login:**
```bash
# Acesse http://localhost:3000
# Use as credenciais: admin@pdv.com / admin123
```

4. **Se ainda houver erro, verifique os logs:**
```bash
# No terminal do backend, verifique os logs de erro
```

## 📞 Suporte

Se o problema persistir, verifique:
- Logs do backend no terminal
- Console do navegador (F12)
- Configuração do banco de dados
- Status do serviço PostgreSQL 