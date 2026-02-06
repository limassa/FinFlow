# 📧 Como Testar a Configuração de Email

## 📤 Como enviar email via Resend

O Resend envia emails por **API HTTP** (não usa SMTP), então funciona bem em ambientes como Railway.

### 1. Criar conta e API Key

1. Acesse **https://resend.com** e crie uma conta (plano gratuito: 3.000 emails/mês).
2. No dashboard: **API Keys** → **Create API Key** → copie a chave (começa com `re_`).

### 2. Configurar no projeto

**No Railway (produção):**  
O `config.env` local **não** é usado no Railway. Adicione as variáveis no painel:

1. Abra o projeto no Railway → seu serviço (backend).
2. Aba **Variables** → **New Variable**.
3. **Não use aspas** no valor (o Railway armazena o que você digita; aspas viram parte do valor).
   - Nome: `RESEND_API_KEY` | Valor: `re_sua_chave_aqui`
   - Nome: `RESEND_FROM_EMAIL` | Valor: `noreply@lizsoftware.com.br`
   - Nome: `RESEND_VERIFIED_DOMAIN` | Valor: `lizsoftware.com.br`
4. (Opcional) `SUPPORT_EMAIL` = `contato@lizsoftware.com.br` para destino do Fale Conosco.
5. Salve e faça **Redeploy** do serviço.

**Localmente** (opcional, em `backend/config.env`):

```
RESEND_API_KEY=re_sua_chave_aqui
```

Opcional (para definir o remetente):

- Se você **verificou um domínio** no Resend (ex: `lizsoftwares.com.br`):
  ```
  RESEND_FROM_EMAIL=noreply@lizsoftwares.com.br
  ```
- Se **não** verificou domínio: o Resend usa automaticamente `onboarding@resend.dev` como remetente (funciona para testes).

**⚠️ Limitação da conta gratuita Resend:**  
Sem domínio verificado, o Resend **só permite enviar para o e-mail da sua conta Resend**. Por isso:

- **`/api/email/teste`** envia para **`contato@lizsoftwares.com.br`** (Fale Conosco) → você **recebe** o e-mail de teste.
- **Cadastro** envia para o **e-mail que a pessoa está cadastrando** (ex: `fulano@gmail.com`) → o Resend **bloqueia** e o e-mail não chega (fallback).

**Para o e-mail de boas-vindas no cadastro funcionar para qualquer usuário:**

- **Opção A (recomendada):** Verifique um domínio em **https://resend.com/domains** (ex: `lizsoftwares.com.br`), adicione os registros DNS que o Resend pedir e, no Railway, configure `RESEND_FROM_EMAIL=noreply@lizsoftwares.com.br`. Depois disso você pode enviar para qualquer e-mail.
- **Opção B:** Apenas para testar: cadastre um usuário usando o **mesmo e-mail** da sua conta Resend (ou de `contato@lizsoftwares.com.br`, se for o mesmo).

### 3. Testar o envio

Após o deploy, chame a rota de teste:

```
GET https://seu-dominio.up.railway.app/api/email/teste
```

Ou use o "Fale Conosco" no app/site. Os emails (boas-vindas, redefinição de senha, etc.) usarão o Resend se `RESEND_API_KEY` estiver definido.

### 4. Prioridade no backend

O `emailService` tenta nesta ordem:

1. **Resend** (se `RESEND_API_KEY` existir)
2. **SendGrid** (se `SENDGRID_API_KEY` existir)
3. **Gmail** (se `EMAIL_USER` e `EMAIL_PASS` existirem)

---

## 🧪 Rota de Teste

Após o deploy, você pode testar a configuração de email acessando:

```
GET https://finflow-production-e4b3.up.railway.app/api/email/teste
```

Ou no navegador:
```
https://finflow-production-e4b3.up.railway.app/api/email/teste
```

## 📋 O que a rota faz:

1. **Verifica o status atual** do emailService
2. **Tenta configurar** o transporter se não estiver configurado
3. **Envia um email de teste** para o email configurado (ex: `contato@lizsoftwares.com.br`)
4. **Retorna informações detalhadas** sobre o status e resultado

## ✅ Resposta de Sucesso:

```json
{
  "success": true,
  "message": "Email de teste enviado com sucesso!",
  "status": {
    "configurado": true,
    "configuracaoAtual": "SendGrid API",
    "tipoAtual": "sendgrid",
    "sendgridDisponivel": true,
    "timestamp": "2026-01-14T..."
  },
  "emailEnviado": true
}
```

## ❌ Resposta de Erro:

```json
{
  "success": false,
  "message": "Falha ao enviar email de teste. Verifique os logs.",
  "status": {
    "configurado": false,
    "configuracaoAtual": null,
    "tipoAtual": null,
    "sendgridDisponivel": true
  },
  "emailEnviado": false
}
```

## 🔍 Verificar Configuração do Gmail

### 1. Verificar Variáveis de Ambiente no Railway

No Railway, verifique se estão configuradas (sem aspas):

```
EMAIL_USER=contato@lizsoftwares.com.br
EMAIL_PASS=senha_de_app_do_gmail
```

### 2. Verificar Senha de App do Gmail

A `EMAIL_PASS` deve ser uma **senha de app** do Gmail, não a senha normal:

1. Acesse: https://myaccount.google.com/apppasswords
2. Ou: Google Account → Segurança → Verificação em duas etapas → Senhas de app
3. Gere uma nova senha de app para "Email"
4. Use essa senha no `EMAIL_PASS`

### 3. Verificar Logs do Railway

Após testar, verifique os logs do Railway. Você deve ver:

**Se funcionar:**
```
✅ Email enviado via Gmail! Message ID: ...
🔧 Configuração usada: Gmail Timeout Otimizado
```

**Se falhar:**
```
❌ Falha com Gmail Timeout Otimizado: Invalid login
⚠️  Erro de autenticação - verifique EMAIL_USER e EMAIL_PASS
```

## 🚨 Problemas Comuns

### 1. "Invalid login" ou "authentication failed"
- **Causa**: Senha de app incorreta ou não configurada
- **Solução**: Gere uma nova senha de app no Gmail e atualize `EMAIL_PASS`

### 2. "Timeout ao verificar conexão"
- **Causa**: Problema de rede ou firewall
- **Solução**: Verifique se o Railway consegue acessar smtp.gmail.com

### 3. "Maximum credits exceeded" (SendGrid)
- **Causa**: SendGrid sem créditos
- **Solução**: O sistema tentará Gmail automaticamente. Se Gmail também falhar, verifique a configuração acima.

### 4. "FALLBACK DE EMAIL" / "Email simulado (sistema de email indisponível)"
- **Causa**: Nenhum provedor de email configurado no ambiente (ex: Railway sem `RESEND_API_KEY`) ou Resend retornou erro (domínio não verificado, etc.).
- **Solução**:
  1. **No Railway:** em Variables, adicione `RESEND_API_KEY` com a chave do Resend (começa com `re_`) e faça Redeploy.
  2. Nos logs, procure por: `RESEND_API_KEY=sim` ou `RESEND_API_KEY=não`. Se for `não`, a variável não está definida no servidor.
  3. Se Resend estiver configurado mas ainda cair no fallback, verifique o erro nos logs (ex: "only send testing emails" → verifique um domínio em https://resend.com/domains).

## 📝 Checklist

- [ ] Variáveis de ambiente configuradas no Railway (sem aspas)
- [ ] `EMAIL_USER` está correto
- [ ] `EMAIL_PASS` é uma senha de app do Gmail (não a senha normal)
- [ ] Verificação em duas etapas ativada no Gmail
- [ ] Teste a rota `/api/email/teste`
- [ ] Verifique os logs do Railway
- [ ] Confirme se o email chegou no endereço configurado (ex: `contato@lizsoftwares.com.br`)

## 🔗 Links Úteis

- [Gerenciar Senhas de App do Google](https://myaccount.google.com/apppasswords)
- [Configurar Verificação em Duas Etapas](https://myaccount.google.com/security)
- [Documentação Nodemailer](https://nodemailer.com/about/)

