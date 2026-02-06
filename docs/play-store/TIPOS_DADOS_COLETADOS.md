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

## 📋 Detalhes para Cada Tipo de Dado

### **1. Nome**

#### **Os dados são coletados, compartilhados ou ambos?**
- ✅ **Coletados**
- ❌ **Compartilhados**

#### **Os dados são processados de maneira efêmera?**
- ❌ **Não, os dados coletados não são processados de maneira efêmera**
- **Justificativa:** Nome é armazenado no banco de dados para identificação do usuário

#### **Os dados são obrigatórios, ou os usuários podem escolher?**
- ✅ **A coleta de dados é obrigatória: os usuários não podem desativá-la**
- **Justificativa:** Nome é necessário para criar a conta e personalizar o app

#### **Por que os dados do usuário são coletados?**
- ✅ **Funcionalidade do app** - Usado para identificação e personalização
- ✅ **Gerenciamento de contas** - Usado para criar e gerenciar a conta do usuário
- ✅ **Personalização** - Usado para personalizar a experiência do usuário

---

### **2. Endereço de e-mail**

#### **Os dados são coletados, compartilhados ou ambos?**
- ✅ **Coletados**
- ❌ **Compartilhados**

#### **Os dados são processados de maneira efêmera?**
- ❌ **Não, os dados coletados não são processados de maneira efêmera**
- **Justificativa:** Email é armazenado no banco de dados para autenticação

#### **Os dados são obrigatórios, ou os usuários podem escolher?**
- ✅ **A coleta de dados é obrigatória: os usuários não podem desativá-la**
- **Justificativa:** Email é necessário para criar conta e fazer login

#### **Por que os dados do usuário são coletados?**
- ✅ **Funcionalidade do app** - Usado para autenticação e login
- ✅ **Gerenciamento de contas** - Usado para criar e gerenciar a conta
- ✅ **Mensagens do desenvolvedor** - Usado para enviar notificações por email (se configurado)

---

### **3. IDs de usuários**

#### **Os dados são coletados, compartilhados ou ambos?**
- ✅ **Coletados**
- ❌ **Compartilhados**

#### **Os dados são processados de maneira efêmera?**
- ❌ **Não, os dados coletados não são processados de maneira efêmera**
- **Justificativa:** ID do usuário é armazenado no banco de dados para identificação única

#### **Os dados são obrigatórios, ou os usuários podem escolher?**
- ✅ **A coleta de dados é obrigatória: os usuários não podem desativá-la**
- **Justificativa:** ID é gerado automaticamente pelo sistema para identificar o usuário

#### **Por que os dados do usuário são coletados?**
- ✅ **Funcionalidade do app** - Usado para identificar o usuário e associar dados
- ✅ **Gerenciamento de contas** - Usado para gerenciar a conta do usuário
- ✅ **Segurança, conformidade e prevenção de fraudes** - Usado para segurança e autenticação

---

### **4. Número de telefone**

#### **Os dados são coletados, compartilhados ou ambos?**
- ✅ **Coletados**
- ❌ **Compartilhados**

#### **Os dados são processados de maneira efêmera?**
- ❌ **Não, os dados coletados não são processados de maneira efêmera**
- **Justificativa:** Telefone é armazenado no banco de dados para notificações

#### **Os dados são obrigatórios, ou os usuários podem escolher?**
- ✅ **Os usuários podem escolher se os dados são coletados**
- **Justificativa:** Telefone é opcional, usado apenas para notificações WhatsApp

#### **Por que os dados do usuário são coletados?**
- ✅ **Funcionalidade do app** - Usado para enviar notificações WhatsApp (se configurado)
- ✅ **Mensagens do desenvolvedor** - Usado para enviar lembretes por WhatsApp

---

### **5. Informações financeiras**

#### **Os dados são coletados, compartilhados ou ambos?**
- ✅ **Coletados**
- ❌ **Compartilhados**

#### **Os dados são processados de maneira efêmera?**
- ❌ **Não, os dados coletados não são processados de maneira efêmera**
- **Justificativa:** Dados financeiros são armazenados no banco de dados para funcionalidade do app

#### **Os dados são obrigatórios, ou os usuários podem escolher?**
- ✅ **A coleta de dados é obrigatória: os usuários não podem desativá-la**
- **Justificativa:** Dados financeiros são essenciais para a funcionalidade principal do app

#### **Por que os dados do usuário são coletados?**
- ✅ **Funcionalidade do app** - Usado para gerenciar receitas, despesas e contas bancárias
- ✅ **Personalização** - Usado para gerar relatórios e gráficos personalizados

---

## ⚠️ Importante

1. **Seja específico:** Selecione apenas os tipos que o app realmente coleta
2. **Não exagere:** Não selecione tipos que não são coletados
3. **Seja honesto:** Declare tudo que é coletado, mesmo que opcional

---

## 🎯 Passo a Passo no Play Console

### **Passo 1: Selecionar Tipos de Dados**

1. **Informações Pessoais:**
   - Marque: Nome, Endereço de e-mail, IDs de usuários, Número de telefone

2. **Informações Financeiras:**
   - Marque: Informações financeiras

3. **Todos os outros:**
   - Deixe desmarcados

### **Passo 2: Preencher Detalhes de Cada Tipo**

Para cada tipo de dado selecionado, preencha:

#### **Nome:**
- Coletados: ✅ SIM
- Compartilhados: ❌ NÃO
- Processamento efêmero: ❌ NÃO
- Obrigatório: ✅ SIM
- Finalidade: ✅ Funcionalidade do app, ✅ Gerenciamento de contas, ✅ Personalização

#### **Endereço de e-mail:**
- Coletados: ✅ SIM
- Compartilhados: ❌ NÃO
- Processamento efêmero: ❌ NÃO
- Obrigatório: ✅ SIM
- Finalidade: ✅ Funcionalidade do app, ✅ Gerenciamento de contas, ✅ Mensagens do desenvolvedor

#### **IDs de usuários:**
- Coletados: ✅ SIM
- Compartilhados: ❌ NÃO
- Processamento efêmero: ❌ NÃO
- Obrigatório: ✅ SIM
- Finalidade: ✅ Funcionalidade do app, ✅ Gerenciamento de contas, ✅ Segurança

#### **Número de telefone:**
- Coletados: ✅ SIM
- Compartilhados: ❌ NÃO
- Processamento efêmero: ❌ NÃO
- Obrigatório: ❌ NÃO (usuários podem escolher)
- Finalidade: ✅ Funcionalidade do app, ✅ Mensagens do desenvolvedor

#### **Informações financeiras:**
- Coletados: ✅ SIM
- Compartilhados: ❌ NÃO
- Processamento efêmero: ❌ NÃO
- Obrigatório: ✅ SIM
- Finalidade: ✅ Funcionalidade do app, ✅ Personalização

---

## 📋 Resumo Rápido por Tipo

| Tipo | Coletado | Compartilhado | Efêmero | Obrigatório | Finalidade |
|------|----------|---------------|---------|-------------|------------|
| **Nome** | ✅ | ❌ | ❌ | ✅ | Funcionalidade, Contas, Personalização |
| **E-mail** | ✅ | ❌ | ❌ | ✅ | Funcionalidade, Contas, Mensagens |
| **IDs** | ✅ | ❌ | ❌ | ✅ | Funcionalidade, Contas, Segurança |
| **Telefone** | ✅ | ❌ | ❌ | ❌ | Funcionalidade, Mensagens |
| **Financeiro** | ✅ | ❌ | ❌ | ✅ | Funcionalidade, Personalização |

---

**Pronto para preencher no Play Console!** ✅

