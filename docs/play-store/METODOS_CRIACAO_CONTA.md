# 🔐 Métodos de Criação de Conta - Play Store

Guia para preencher a seção "Métodos de criação de contas" no Play Console.

---

## 📋 Pergunta do Play Console

**"Quais dos seguintes métodos de criação de contas são oferecidos pelo app?"**

---

## ✅ Resposta para FinFlow

### **Resposta: Nome de usuário e senha**

**Selecione:**
- ✅ **Nome de usuário e senha**

**Onde:**
- **Nome de usuário:** E-mail do usuário
- **Senha:** Senha criada pelo usuário

---

## ❌ O que NÃO selecionar

- ❌ **Nome de usuário e outras autenticações** - Não usa 2FA, biometria, etc.
- ❌ **Nome de usuário, senha e outras autenticações** - Não usa autenticação adicional
- ❌ **OAuth** - Não usa Google, Facebook, Apple, etc.
- ❌ **Outro** - Não se aplica
- ❌ **Meu app não permite que os usuários criem uma conta** - O app permite criação de conta

---

## 📝 Como Funciona no FinFlow

### **Criação de Conta:**
1. Usuário acessa a tela de Cadastro
2. Preenche: Nome, E-mail, Senha
3. Cria a conta no app

### **Login:**
1. Usuário insere E-mail (nome de usuário)
2. Insere Senha
3. Faz login no app

### **Recuperação de Senha:**
1. Usuário pode solicitar redefinição de senha
2. Recebe link por e-mail
3. Redefine a senha

---

## 🔍 Detalhes Técnicos

### **Autenticação:**
- ✅ **Tipo:** Email + Senha
- ❌ **2FA (Autenticação de dois fatores):** Não
- ❌ **Biometria:** Não
- ❌ **SSO (Single Sign-On):** Não
- ❌ **OAuth:** Não (Google, Facebook, etc.)

### **Nome de Usuário:**
- **Formato:** Endereço de e-mail
- **Exemplo:** `usuario@exemplo.com`

### **Senha:**
- **Criada pelo usuário**
- **Armazenada de forma segura (hash)**
- **Mínimo de caracteres:** Configurado no backend

---

## ✅ Resumo para Preencher

**No Play Console, selecione:**

```
☑ Nome de usuário e senha
```

**E desmarque todas as outras opções:**
- ☐ Nome de usuário e outras autenticações
- ☐ Nome de usuário, senha e outras autenticações
- ☐ OAuth
- ☐ Outro
- ☐ Meu app não permite que os usuários criem uma conta

---

## 📋 Checklist

Antes de preencher, verifique:

- [ ] O app permite criação de conta? ✅ SIM
- [ ] Usa email como nome de usuário? ✅ SIM
- [ ] Usa senha? ✅ SIM
- [ ] Usa OAuth (Google, Facebook)? ❌ NÃO
- [ ] Usa 2FA? ❌ NÃO
- [ ] Usa biometria? ❌ NÃO
- [ ] Usa SSO? ❌ NÃO

---

## 💡 Observação

**"Nome de usuário"** no contexto do Play Console pode ser:
- ID de usuário
- Endereço de e-mail ✅ (caso do FinFlow)
- Número de telefone

No FinFlow, o "nome de usuário" é o **endereço de e-mail**.

---

**Pronto para preencher no Play Console!** ✅

