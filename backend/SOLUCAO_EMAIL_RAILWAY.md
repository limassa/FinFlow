# 📧 Solução para Problema de Email no Railway

## 🚨 Problema Identificado

O Railway está **bloqueando conexões SMTP** (portas 465 e 587), causando "Connection timeout" ao tentar usar Gmail via Nodemailer.

## ✅ Soluções Recomendadas

### Opção 1: Usar Resend (Recomendado - Gratuito)

**Resend** é um serviço de email moderno que funciona via API (não SMTP), então não é bloqueado pelo Railway.

1. **Criar conta no Resend:**
   - Acesse: https://resend.com
   - Crie uma conta gratuita (3.000 emails/mês grátis)
   - Vá em API Keys e crie uma nova chave

2. **Configurar no Railway:**
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=contatoLizSoftware@gmail.com
   ```

3. **Instalar pacote:**
   ```bash
   npm install resend
   ```

### Opção 2: Recarregar Créditos do SendGrid

Se você tem plano pago no SendGrid:
- Recarregue os créditos
- O sistema já está configurado para usar SendGrid quando disponível

### Opção 3: Usar Mailgun (Alternativa)

Similar ao Resend, funciona via API:
- https://www.mailgun.com
- Plano gratuito: 5.000 emails/mês

### Opção 4: Configurar Proxy SMTP

Se precisar usar Gmail, configure um proxy SMTP externo, mas isso é mais complexo.

## 🔧 Implementação Rápida com Resend

Vou implementar o Resend como alternativa. É a solução mais rápida e confiável para Railway.

## 📝 Nota Importante

O problema não é com o código, mas com as restrições de rede do Railway que bloqueiam SMTP. Usar uma API de email (como Resend) resolve o problema.

