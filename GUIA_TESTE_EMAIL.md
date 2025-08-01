# 🧪 Guia de Teste de Email - FinFlow

## 🎯 **Objetivo**
Configurar e testar o sistema de email com sua nova configuração de email.

## 📋 **Passos para Configurar**

### **1. 🔧 Preparar Ambiente de Teste**

```bash
# 1. Criar branch de teste
git checkout -b teste-email

# 2. Verificar se está na branch correta
git branch

# 3. Instalar dependências (se necessário)
cd backend
npm install
cd ..
```

### **2. 📧 Configurar Novo Email**

**Edite o arquivo `backend/config.env`:**
```env
# Configurações de Email (SUA NOVA CONFIGURAÇÃO)
EMAIL_USER=seu-novo-email@provedor.com
EMAIL_PASS=sua-nova-senha-de-app
EMAIL_SERVICE=gmail  # ou outlook, yahoo, smtp

# URL do Frontend
FRONTEND_URL=http://localhost:3000

# Configurações do Servidor
PORT=3001
NODE_ENV=development
```

### **3. 🧪 Testar Configuração**

```bash
# Testar conexão e envio
node teste-email.js
```

**Resultado esperado:**
```
📧 Testando configuração de email...

1. Verificando configurações...
📧 Email: seu-novo-email@provedor.com
🔑 Senha: Configurada
🌐 Frontend URL: http://localhost:3000

2. Testando conexão com servidor de email...
✅ Conexão com servidor de email OK!

3. Enviando email de teste...
✅ Email de teste enviado com sucesso!
📧 Message ID: <message-id>
📬 Para: seu-novo-email@provedor.com

🎉 Teste de email concluído com sucesso!
```

### **4. 🚀 Rodar Sistema Completo**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

### **5. 🔍 Validar Funcionalidades**

#### **A. Testar Cadastro de Usuário**
1. Acesse: `http://localhost:3000/cadastro`
2. Cadastre um novo usuário
3. Verifique se recebeu email de boas-vindas

#### **B. Testar Redefinição de Senha**
1. Acesse: `http://localhost:3000/forgot-password`
2. Digite um email cadastrado
3. Verifique se recebeu email de redefinição

#### **C. Testar Lembretes**
1. Cadastre uma despesa com vencimento próximo
2. Configure lembretes nas configurações
3. Verifique se recebeu email de lembrete

## 🔧 **Scripts de Teste Disponíveis**

### **1. Teste Básico de Email**
```bash
node teste-email.js
```

### **2. Teste de Configuração**
```bash
node configurar-email.js
```

### **3. Teste de Conexão**
```bash
node backend/teste-conexao-email.js
```

## 📊 **Checklist de Validação**

### **✅ Configuração**
- [ ] Email configurado no `config.env`
- [ ] Senha de app gerada (se Gmail/Outlook)
- [ ] Verificação em duas etapas ativada
- [ ] Teste de conexão OK

### **✅ Testes de Envio**
- [ ] Email de teste enviado
- [ ] Message ID gerado
- [ ] Email recebido na caixa de entrada
- [ ] Design do email correto

### **✅ Funcionalidades do Sistema**
- [ ] Cadastro de usuário envia email
- [ ] Redefinição de senha funciona
- [ ] Lembretes de vencimento funcionam
- [ ] Alertas de segurança funcionam

## 🐛 **Solução de Problemas**

### **Erro: "Invalid login"**
```bash
# Solução: Verificar senha de app
1. Acesse: https://myaccount.google.com/security
2. Gere nova senha de app
3. Atualize EMAIL_PASS no config.env
```

### **Erro: "Connection timeout"**
```bash
# Solução: Verificar configurações
1. Verifique EMAIL_SERVICE (gmail, outlook, etc.)
2. Teste com outro provedor
3. Verifique firewall/antivírus
```

### **Erro: "Email não recebido"**
```bash
# Solução: Verificar spam
1. Verifique pasta de spam
2. Adicione email aos contatos
3. Configure filtros de email
```

## 📝 **Logs de Teste**

### **Log de Sucesso**
```
✅ Conexão com servidor de email OK!
✅ Email de teste enviado com sucesso!
📧 Message ID: <message-id>
📬 Para: seu-email@provedor.com
```

### **Log de Erro**
```
❌ Erro no teste de email: Invalid login
🔧 Possíveis soluções:
1. Verifique se o EMAIL_USER e EMAIL_PASS estão corretos
2. Para Gmail, use "Senha de App" em vez da senha normal
3. Verifique se a autenticação de 2 fatores está configurada
```

## 🎯 **Próximos Passos**

### **1. Commit das Alterações**
```bash
git add .
git commit -m "feat: configurar novo email para testes"
git push origin teste-email
```

### **2. Teste em Produção**
```bash
# Após validar em desenvolvimento
git checkout main
git merge teste-email
git push origin main
```

### **3. Monitoramento**
- Verificar logs de envio
- Monitorar taxa de entrega
- Configurar alertas de falha

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs do backend
2. Teste com `node teste-email.js`
3. Verifique configurações no `config.env`
4. Teste com outro provedor de email

---

**Status:** ✅ Pronto para teste  
**Última atualização:** 01/08/2025 