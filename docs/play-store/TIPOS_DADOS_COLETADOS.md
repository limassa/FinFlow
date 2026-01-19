# 📊 Tipos de Dados Coletados - Play Store

Guia completo para preencher a seção "Tipos de dados" no Play Console.

---

## 📋 O que o FinFlow Coleta

### ✅ **Informações Pessoais**

#### **1. Nome** ✅
- **Coletado:** SIM
- **Onde:** Cadastro e perfil do usuário
- **Finalidade:** Identificação e personalização
- **Compartilhado:** NÃO

#### **2. Endereço de e-mail** ✅
- **Coletado:** SIM
- **Onde:** Cadastro, login, perfil
- **Finalidade:** Autenticação e comunicação
- **Compartilhado:** NÃO

#### **3. IDs de usuários** ✅
- **Coletado:** SIM
- **Onde:** Sistema interno (userId)
- **Finalidade:** Identificação única do usuário
- **Compartilhado:** NÃO

#### **4. Número de telefone** ✅ (Opcional)
- **Coletado:** SIM (opcional)
- **Onde:** Perfil/configurações
- **Finalidade:** Notificações WhatsApp (se configurado)
- **Compartilhado:** NÃO

#### **5. Endereço** ❌
- **Coletado:** NÃO

#### **6. Raça e etnia** ❌
- **Coletado:** NÃO

#### **7. Posicionamento político ou crenças religiosas** ❌
- **Coletado:** NÃO

#### **8. Orientação sexual** ❌
- **Coletado:** NÃO

#### **9. Outras informações** ❌
- **Coletado:** NÃO

---

### ✅ **Informações Financeiras**

#### **1. Informações financeiras** ✅
- **Coletado:** SIM
- **Onde:** Dados inseridos pelo usuário
- **Tipo:** Receitas, despesas, contas bancárias, saldos
- **Finalidade:** Funcionalidade do app
- **Compartilhado:** NÃO

#### **2. Informações de pagamento** ❌
- **Coletado:** NÃO (app não processa pagamentos)

#### **3. Histórico de compras** ❌
- **Coletado:** NÃO

#### **4. Informações de crédito** ❌
- **Coletado:** NÃO

---

### ❌ **Outros Tipos (NÃO Coletados)**

- ❌ **Saúde e fitness:** NÃO
- ❌ **Mensagens:** NÃO
- ❌ **Fotos e vídeos:** NÃO
- ❌ **Arquivos de áudio:** NÃO
- ❌ **Arquivos e documentos:** NÃO
- ❌ **Agenda:** NÃO (apenas visualização de vencimentos)
- ❌ **Contatos:** NÃO
- ❌ **Atividade em apps:** NÃO
- ❌ **Navegação na Web:** NÃO
- ❌ **Local:** NÃO (não coleta localização)

---

### ⚠️ **Informações e Desempenho do App** (Opcional)

#### **Logs e Erros** (Pode coletar)
- **Coletado:** Possivelmente (logs de erro para debug)
- **Finalidade:** Melhorar o app
- **Compartilhado:** NÃO

**Nota:** Se o app não envia logs para serviços externos (como Firebase Analytics, Sentry, etc.), pode não precisar declarar.

---

## 📝 Checklist para Preencher

### **Informações Pessoais:**
- [x] **Nome** ✅
- [x] **Endereço de e-mail** ✅
- [x] **IDs de usuários** ✅
- [x] **Número de telefone** ✅ (opcional)
- [ ] Endereço ❌
- [ ] Raça e etnia ❌
- [ ] Posicionamento político ou crenças religiosas ❌
- [ ] Orientação sexual ❌
- [ ] Outras informações ❌

### **Informações Financeiras:**
- [x] **Informações financeiras** ✅
- [ ] Informações de pagamento ❌
- [ ] Histórico de compras ❌
- [ ] Informações de crédito ❌

### **Outros:**
- [ ] Local ❌
- [ ] Saúde e fitness ❌
- [ ] Mensagens ❌
- [ ] Fotos e vídeos ❌
- [ ] Arquivos de áudio ❌
- [ ] Arquivos e documentos ❌
- [ ] Agenda ❌
- [ ] Contatos ❌
- [ ] Atividade em apps ❌
- [ ] Navegação na Web ❌
- [ ] Identificadores do dispositivo ❌ (se não usar)

---

## ✅ Resumo Final

### **Selecionar no Play Console:**

#### **Informações Pessoais:**
- ✅ Nome
- ✅ Endereço de e-mail
- ✅ IDs de usuários
- ✅ Número de telefone

#### **Informações Financeiras:**
- ✅ Informações financeiras

#### **Não Selecionar:**
- ❌ Todos os outros tipos

---

## 📋 Detalhes para Cada Tipo

### **Nome:**
- **Coletado de:** Dados fornecidos pelo usuário
- **Finalidade:** Identificação e personalização
- **Compartilhado:** NÃO

### **Endereço de e-mail:**
- **Coletado de:** Dados fornecidos pelo usuário
- **Finalidade:** Autenticação e comunicação
- **Compartilhado:** NÃO

### **IDs de usuários:**
- **Coletado de:** Sistema interno
- **Finalidade:** Identificação única
- **Compartilhado:** NÃO

### **Número de telefone:**
- **Coletado de:** Dados fornecidos pelo usuário (opcional)
- **Finalidade:** Notificações WhatsApp
- **Compartilhado:** NÃO

### **Informações financeiras:**
- **Coletado de:** Dados inseridos pelo usuário
- **Finalidade:** Funcionalidade do app (gerenciar finanças)
- **Compartilhado:** NÃO

---

## ⚠️ Importante

1. **Seja específico:** Selecione apenas os tipos que o app realmente coleta
2. **Não exagere:** Não selecione tipos que não são coletados
3. **Seja honesto:** Declare tudo que é coletado, mesmo que opcional

---

## 🎯 Passo a Passo no Play Console

1. **Informações Pessoais:**
   - Marque: Nome, Endereço de e-mail, IDs de usuários, Número de telefone

2. **Informações Financeiras:**
   - Marque: Informações financeiras

3. **Todos os outros:**
   - Deixe desmarcados

4. **Clique em "Próxima"**

---

**Pronto para preencher no Play Console!** ✅

