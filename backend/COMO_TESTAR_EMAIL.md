# 📧 Como Testar a Configuração de Email

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
3. **Envia um email de teste** para `contatoLizSoftware@gmail.com`
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
EMAIL_USER=contatoLizSoftware@gmail.com
EMAIL_PASS=xdas ngdw yeao sgou
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

## 📝 Checklist

- [ ] Variáveis de ambiente configuradas no Railway (sem aspas)
- [ ] `EMAIL_USER` está correto
- [ ] `EMAIL_PASS` é uma senha de app do Gmail (não a senha normal)
- [ ] Verificação em duas etapas ativada no Gmail
- [ ] Teste a rota `/api/email/teste`
- [ ] Verifique os logs do Railway
- [ ] Confirme se o email chegou em `contatoLizSoftware@gmail.com`

## 🔗 Links Úteis

- [Gerenciar Senhas de App do Google](https://myaccount.google.com/apppasswords)
- [Configurar Verificação em Duas Etapas](https://myaccount.google.com/security)
- [Documentação Nodemailer](https://nodemailer.com/about/)

