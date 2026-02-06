# 📋 Registros DNS para Adicionar no Registro.br

## ✅ Registros que você precisa adicionar:

### 1. Registro TXT para DKIM (Obrigatório)

**No painel do Registro.br:**

```
Tipo: TXT
Nome: resend._domainkey
Valor: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDTJsEtTLXlu6RviTCJGhdeFGA0ZW++buonpOU1dpN1u4xZAucUj05IbLh5nf7gKlU1pVlS9Hqm9+LZSBzMO5/9kk7NgwnRGl61mRwED/qRfUwRW72fbEqAUccse/VIgdxnsRLSxBe1votCKN05gbK7dCfRR0gKvGSM1J77GlX9mQIDAQAB
TTL: 3600 (ou padrão)
```

### 2. Registro MX para Feedback (Obrigatório)

**No painel do Registro.br:**

```
Tipo: MX
Nome: send
Prioridade: 10
Valor: feedback-smtp.sa-east-1.amazonses.com
TTL: 3600 (ou padrão)
```

### 3. Registro TXT para SPF (Obrigatório)

**No painel do Registro.br:**

```
Tipo: TXT
Nome: send
Valor: v=spf1 include:amazonses.com ~all
TTL: 3600 (ou padrão)
```

## 📝 Passo a Passo no Registro.br

### Passo 1: Acessar o Painel

1. Acesse: https://registro.br
2. Faça login
3. Vá em **"Meus Domínios"**
4. Clique no seu domínio

### Passo 2: Gerenciar DNS

1. Procure por **"DNS"**, **"Zona DNS"** ou **"Gerenciar DNS"**
2. Clique para editar

### Passo 3: Adicionar Registro TXT (DKIM)

1. Clique em **"Adicionar Registro"** ou **"Novo Registro"**
2. Selecione: **TXT**
3. Preencha:
   - **Nome/Host**: `resend._domainkey`
   - **Valor**: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDTJsEtTLXlu6RviTCJGhdeFGA0ZW++buonpOU1dpN1u4xZAucUj05IbLh5nf7gKlU1pVlS9Hqm9+LZSBzMO5/9kk7NgwnRGl61mRwED/qRfUwRW72fbEqAUccse/VIgdxnsRLSxBe1votCKN05gbK7dCfRR0gKvGSM1J77GlX9mQIDAQAB`
   - **TTL**: 3600
4. Clique em **"Salvar"**

### Passo 4: Adicionar Registro MX

1. Clique em **"Adicionar Registro"**
2. Selecione: **MX**
3. Preencha:
   - **Nome/Host**: `send`
   - **Prioridade**: `10`
   - **Valor**: `feedback-smtp.sa-east-1.amazonses.com`
   - **TTL**: 3600
4. Clique em **"Salvar"**

### Passo 5: Adicionar Registro TXT (SPF)

1. Clique em **"Adicionar Registro"**
2. Selecione: **TXT**
3. Preencha:
   - **Nome/Host**: `send`
   - **Valor**: `v=spf1 include:amazonses.com ~all`
   - **TTL**: 3600
4. Clique em **"Salvar"**

## ⏱️ Aguardar Propagação

- **Tempo**: 5-30 minutos (Registro.br geralmente é rápido)
- **Verificar**: Volte ao Resend e veja se o status mudou para "Verified"

## ✅ Verificar se Funcionou

1. Volte para: https://resend.com/domains
2. Clique no seu domínio
3. O status deve mudar de **"Pending"** para **"Verified"** ✅

Se ainda estiver pendente após 30 minutos:
- Verifique se copiou o valor completo do TXT (é muito longo!)
- Certifique-se de que não há espaços extras
- Verifique se o tipo de registro está correto

## 🔍 Como Testar os Registros

### Verificar TXT (DKIM):
```bash
nslookup -type=TXT resend._domainkey.seu-dominio.com.br
```

### Verificar MX:
```bash
nslookup -type=MX send.seu-dominio.com.br
```

### Verificar TXT (SPF):
```bash
nslookup -type=TXT send.seu-dominio.com.br
```

Ou use ferramentas online:
- https://dnschecker.org
- https://mxtoolbox.com

## ⚠️ Importante

- **Copie o valor completo** do TXT (é uma string muito longa)
- **Não adicione espaços** no início ou fim do valor
- **Aguarde a propagação** antes de verificar no Resend
- O Registro.br geralmente propaga em 5-15 minutos

## ✅ Após Verificar

Quando o domínio estiver verificado no Resend:

1. No Railway, adicione:
   ```
   RESEND_VERIFIED_DOMAIN=seu-dominio.com.br
   RESEND_FROM_EMAIL=noreply@seu-dominio.com.br
   ```

2. Aguarde o deploy (2-5 minutos)

3. Teste enviando um email pelo "Fale Conosco"

