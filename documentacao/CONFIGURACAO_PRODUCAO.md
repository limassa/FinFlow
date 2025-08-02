# 🎯 Configuração para Produção - FinFlow
## Guia Passo a Passo (Como para uma criança de 5 anos)

---

## 📝 **PASSO 1: DOMÍNIO** 🌐

### **1.1 - Escolher o nome**
```
Opções sugeridas (Liz Softwares):
✅ finflow.lizsoftwares.com (RECOMENDADO)
✅ finflow.lizsoftwares.net
✅ app.lizsoftwares.com
✅ finflow.lizsoftwares.com.br
```

### **1.2 - Onde comprar**
**Recomendo:** GoDaddy (www.godaddy.com)

**Como fazer:**
1. Acesse: https://www.godaddy.com
2. Digite o nome que você quer
3. Clique em "Comprar"
4. Pague por 1 ano (~R$ 30-50)

### **1.3 - Informações que você vai receber:**
```
✅ Nome do domínio: finflow.lizsoftwares.com
✅ Nameservers: (vai receber 2-4 endereços)
✅ Painel de controle: (link para gerenciar)
```

---

## 📧 **PASSO 2: EMAIL CORPORATIVO** 📧

### **2.1 - Escolher serviço de email**
**Recomendo:** Google Workspace

**Por que?**
- ✅ Muito profissional
- ✅ Fácil de usar
- ✅ Inclui Gmail, Drive, Docs
- ✅ Custa ~R$ 15/mês

### **2.2 - Como configurar Google Workspace**
1. Acesse: https://workspace.google.com
2. Clique em "Começar"
3. Digite seu domínio (ex: lizsoftwares.com)
4. Siga o passo a passo
5. Configure os emails:

```
Emails que você precisa criar:
✅ admin@lizsoftwares.com (para você)
✅ suporte@lizsoftwares.com (para clientes)
✅ noreply@lizsoftwares.com (para o sistema)
✅ finflow@lizsoftwares.com (para o sistema)
```

### **2.3 - Configurar senhas de app**
**Para o sistema enviar emails automaticamente:**
1. Acesse: https://myaccount.google.com
2. Vá em "Segurança"
3. Ative "Verificação em 2 etapas"
4. Vá em "Senhas de app"
5. Gere uma senha para "FinFlow"

---

## 🏠 **PASSO 3: HOSPEDAGEM** 🏠

### **3.1 - Escolher onde hospedar**
**Recomendo:** Railway (railway.app)

**Por que Railway?**
- ✅ Gratuito para começar
- ✅ Muito fácil de usar
- ✅ Deploy automático
- ✅ Banco de dados incluído
- ✅ Não precisa configurar nada complexo

### **3.2 - Como usar Railway**
1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em "New Project"
4. Escolha "Deploy from GitHub repo"
5. Selecione seu repositório do FinFlow

---

## ⚙️ **PASSO 4: CONFIGURAÇÕES** ⚙️

### **4.1 - Variáveis de ambiente (Railway)**
Depois de conectar o repositório, configure estas variáveis:

```
NODE_ENV=production
PORT=3001

# Email (Google Workspace)
EMAIL_USER=finflow@lizsoftwares.com
EMAIL_PASS=sua-senha-de-app-gerada

# Frontend URL
FRONTEND_URL=https://finflow.lizsoftwares.com

# Banco de dados (Railway cria automaticamente)
DATABASE_URL=postgresql://...
```

### **4.2 - Como configurar no Railway:**
1. No projeto Railway, vá em "Variables"
2. Adicione cada variável acima
3. Clique em "Save"

---

## 🗄️ **PASSO 5: BANCO DE DADOS** 🗄️

### **5.1 - Railway cria automaticamente**
- ✅ Railway cria o banco PostgreSQL
- ✅ Você só precisa conectar
- ✅ Não precisa configurar nada

### **5.2 - Executar scripts SQL**
Depois do deploy, execute estes scripts:
1. ScriptSQL.sql
2. ScriptSQL_New.sql  
3. ScriptSQL_Recorrencia_Lembretes.sql

---

## 🔗 **PASSO 6: CONECTAR DOMÍNIO** 🔗

### **6.1 - Configurar DNS**
No painel do seu provedor de domínio:

```
Tipo: CNAME
Nome: finflow
Valor: cname.railway.app

Tipo: CNAME  
Nome: www.finflow
Valor: cname.railway.app
```

### **6.2 - Adicionar domínio no Railway**
1. No projeto Railway, vá em "Settings"
2. Clique em "Domains"
3. Adicione: finflow.lizsoftwares.com
4. Adicione: www.finflow.lizsoftwares.com

---

## 🧪 **PASSO 7: TESTAR TUDO** 🧪

### **7.1 - Checklist de testes**
```
✅ Site carrega: https://finflow.lizsoftwares.com
✅ Login funciona
✅ Cadastro funciona
✅ Emails são enviados
✅ Relatórios funcionam
✅ Lembretes funcionam
```

### **7.2 - Como testar**
1. Acesse: https://finflow.lizsoftwares.com
2. Crie uma conta
3. Teste todas as funcionalidades
4. Verifique se os emails chegam

---

## 📞 **PASSO 8: SUPORTE** 📞

### **8.1 - Se algo der errado**
- **Email:** suporte@lizsoftwares.com
- **WhatsApp:** (seu número)
- **Documentação:** (link para docs)

### **8.2 - Monitoramento**
- Railway mostra logs em tempo real
- Você pode ver se está funcionando
- Recebe alertas se algo quebrar

---

## 💰 **CUSTOS MENSAIS** 💰

```
✅ Domínio: R$ 3-5/mês
✅ Google Workspace: R$ 15/mês
✅ Railway: Gratuito (até 500 horas)
✅ Total: ~R$ 18-20/mês
```

---

## 🎉 **RESUMO FINAL** 🎉

### **Ordem das tarefas:**
1. **Comprar domínio** (finflow.lizsoftwares.com)
2. **Configurar email** (Google Workspace)
3. **Hospedar no Railway**
4. **Configurar variáveis**
5. **Conectar domínio**
6. **Testar tudo**
7. **Lançar!**

### **Tempo estimado:**
- **Domínio:** 10 minutos
- **Email:** 30 minutos
- **Railway:** 15 minutos
- **Configuração:** 30 minutos
- **Testes:** 1 hora
- **Total:** ~2-3 horas

---

## 🏢 **VANTAGENS DO DOMÍNIO LIZ SOFTWARES**

### **✅ Profissionalismo:**
- Usa o domínio da empresa
- Passa mais credibilidade
- Parece mais estabelecido

### **✅ Marketing:**
- Promove a marca Liz Softwares
- Usuários lembram da empresa
- Facilita vendas futuras

### **✅ SEO:**
- Melhor posicionamento
- Domínio confiável
- Mais autoridade

---

**🎯 Pronto! Agora você tem um sistema profissional rodando!**

**Desenvolvido por:** Liz Softwares  
**Versão:** 2.1.0  
**Data:** 30/07/2025 