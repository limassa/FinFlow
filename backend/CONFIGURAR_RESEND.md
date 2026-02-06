# 📧 Como Configurar Resend (Solução para Railway)

## 🎯 Por que Resend?

O Railway está **bloqueando conexões SMTP** (Gmail), causando "Connection timeout". O Resend funciona via **API HTTP**, então não é bloqueado.

## ✅ Passo a Passo

### 1. Criar Conta no Resend

1. Acesse: https://resend.com
2. Clique em "Sign Up" (gratuito)
3. Crie sua conta (3.000 emails/mês grátis)

### 2. Criar API Key

1. Após fazer login, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "FinFlow Production")
4. Copie a chave (começa com `re_`)

### 3. Configurar no Railway

No Railway, adicione as variáveis de ambiente:

```
RESEND_API_KEY=re_sua_chave_aqui
RESEND_FROM_EMAIL=contatoLizSoftware@gmail.com
```

**Importante:** 
- Não use aspas nas variáveis
- ⚠️ **Gmail.com não pode ser verificado no Resend** (não é seu domínio)

### 4. Opções para Email "From"

**Opção A: Usar domínio próprio (Recomendado)**

1. No Resend, vá em **Domains**
2. Adicione seu domínio (ex: `lizsoftware.com.br`)
3. Siga as instruções para verificar (adicionar registros DNS)
4. Configure no Railway:
   ```
   RESEND_VERIFIED_DOMAIN=lizsoftware.com.br
   RESEND_FROM_EMAIL=noreply@lizsoftware.com.br
   ```

**Opção B: Usar email do Resend (Temporário)**

O sistema automaticamente usa `onboarding@resend.dev` se o domínio não estiver verificado. Funciona, mas o email vem de um endereço do Resend.

**Opção C: Verificar domínio Gmail (Não é possível)**

Gmail.com não pode ser verificado porque não é seu domínio. Use uma das opções acima.

### 5. Testar

Após o deploy, teste a rota:

```
GET https://finflow-production-e4b3.up.railway.app/api/email/teste
```

## 📊 Prioridade de Serviços

O sistema tenta na seguinte ordem:

1. **Resend** (se `RESEND_API_KEY` configurado) ✅ **Recomendado para Railway**
2. **SendGrid** (se `SENDGRID_API_KEY` configurado e com créditos)
3. **Gmail** (se `EMAIL_USER` e `EMAIL_PASS` configurados) ⚠️ Pode dar timeout no Railway

## 🎁 Plano Gratuito do Resend

- **3.000 emails/mês** grátis
- **100 emails/dia** grátis
- API rápida e confiável
- Funciona perfeitamente no Railway

## ✅ Após Configurar

1. Aguarde o deploy no Railway (2-5 minutos)
2. Teste enviando uma mensagem pelo "Fale Conosco"
3. Verifique se o email chegou em `contatoLizSoftware@gmail.com`

## 🔗 Links

- [Resend Dashboard](https://resend.com/overview)
- [Resend API Keys](https://resend.com/api-keys)
- [Resend Documentation](https://resend.com/docs)

