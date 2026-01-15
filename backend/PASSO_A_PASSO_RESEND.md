# 📧 Passo a Passo: Configurar Resend

## ✅ O que você precisa fazer

### 1. Criar Conta no Resend (2 minutos)

1. Acesse: **https://resend.com**
2. Clique em **"Sign Up"** (canto superior direito)
3. Crie sua conta com:
   - Email: seu email pessoal
   - Senha: crie uma senha
4. Confirme seu email (verifique a caixa de entrada)

### 2. Criar API Key (1 minuto)

1. Após fazer login, no menu lateral esquerdo, clique em **"API Keys"**
2. Clique no botão **"+ Create API Key"** (canto superior direito)
3. Preencha:
   - **Name**: `FinFlow Production` (ou qualquer nome)
   - **Permission**: Deixe "Full Access" (padrão)
4. Clique em **"Add"**
5. **IMPORTANTE**: Copie a chave que aparece (começa com `re_`)
   - ⚠️ **Você só verá essa chave uma vez!** Salve em um lugar seguro

### 3. Configurar no Railway (2 minutos)

1. Acesse seu projeto no Railway
2. Vá em **Settings** → **Variables**
3. Adicione as seguintes variáveis (sem aspas):

```
RESEND_API_KEY=re_Mi5NRBY1_8BhpSfYhFfLJKs4RMWJhr15a
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Importante:**
- ✅ **NÃO use aspas** nas variáveis
- ✅ Use a chave que você copiou do Resend
- ✅ `RESEND_FROM_EMAIL` pode ser `onboarding@resend.dev` (funciona sem verificação)

### 4. Aguardar Deploy (2-5 minutos)

Após adicionar as variáveis, o Railway fará deploy automaticamente. Aguarde alguns minutos.

### 5. Testar (1 minuto)

Após o deploy, teste acessando:

```
https://finflow-production-e4b3.up.railway.app/api/email/teste
```

Ou envie uma mensagem pelo "Fale Conosco" no app/web.

## 🎯 Resumo Rápido

1. ✅ Criar conta no Resend
2. ✅ Criar API Key e copiar
3. ✅ Adicionar `RESEND_API_KEY` no Railway (sem aspas)
4. ✅ Adicionar `RESEND_FROM_EMAIL=onboarding@resend.dev` no Railway
5. ✅ Aguardar deploy
6. ✅ Testar

## 📝 Variáveis no Railway

Adicione exatamente assim (sem aspas):

```
RESEND_API_KEY=re_Mi5NRBY1_8BhpSfYhFfLJKs4RMWJhr15a
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## ✅ Como saber se funcionou?

Nos logs do Railway, você deve ver:

```
✅ Resend configurado e disponível
📧 Usando email do Resend (funciona sem verificação): onboarding@resend.dev
✅ Email enviado via Resend! ID: ...
```

## 🎁 Plano Gratuito

- **3.000 emails/mês** grátis
- **100 emails/dia** grátis
- Mais que suficiente para começar!

## 🔗 Links Úteis

- [Resend Dashboard](https://resend.com/overview)
- [Resend API Keys](https://resend.com/api-keys)
- [Resend Domains](https://resend.com/domains) (para usar domínio próprio depois)

## 💡 Dica

Por enquanto, use `onboarding@resend.dev` como `RESEND_FROM_EMAIL`. Funciona imediatamente sem precisar verificar domínio.

Se quiser usar seu próprio email depois, você precisará:
1. Verificar um domínio próprio no Resend
2. Configurar `RESEND_VERIFIED_DOMAIN=seu-dominio.com`

Mas isso é opcional. O `onboarding@resend.dev` já funciona perfeitamente!

