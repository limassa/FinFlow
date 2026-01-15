# 🌐 Como Configurar DNS no Registro.br para Resend

## 📋 Pré-requisitos

1. Ter um domínio registrado no Registro.br (ex: `lizsoftware.com.br`)
2. Ter acesso ao painel do Registro.br
3. Ter o domínio adicionado no Resend (você receberá os registros DNS necessários)

## ✅ Passo a Passo

### 1. Adicionar Domínio no Resend

1. Acesse: https://resend.com/domains
2. Clique em **"Add Domain"**
3. Digite seu domínio (ex: `lizsoftware.com.br`)
4. Clique em **"Add"**
5. O Resend mostrará os registros DNS que você precisa adicionar

**Exemplo de registros que o Resend pede:**
- **Tipo TXT**: `resend._domainkey.lizsoftware.com.br`
- **Valor**: `p=...` (uma string longa)
- **Tipo MX**: `feedback-smtp.resend.com`
- **Prioridade**: `10`

### 2. Acessar o Painel do Registro.br

1. Acesse: https://registro.br
2. Faça login com seu CPF/CNPJ e senha
3. No menu, clique em **"Meus Domínios"**
4. Clique no domínio que você quer configurar (ex: `lizsoftware.com.br`)

### 3. Configurar DNS no Registro.br

#### Opção A: Usar DNS do Registro.br (Recomendado)

1. No painel do domínio, procure por **"DNS"** ou **"Zona DNS"**
2. Clique em **"Gerenciar DNS"** ou **"Editar Zona DNS"**
3. Você verá uma lista de registros DNS existentes

#### Opção B: Usar DNS Externo (Cloudflare, etc.)

Se você usa Cloudflare ou outro serviço de DNS:
1. Configure os registros no painel do seu provedor de DNS
2. No Registro.br, certifique-se de que os nameservers estão apontando para o seu provedor

### 4. Adicionar Registros TXT do Resend

1. No painel de DNS do Registro.br, clique em **"Adicionar Registro"** ou **"Novo Registro"**
2. Selecione o tipo: **TXT**
3. Preencha:
   - **Nome/Host**: `resend._domainkey` (ou o que o Resend pedir)
   - **Valor**: Cole o valor completo que o Resend forneceu (começa com `p=`)
   - **TTL**: Deixe o padrão (geralmente 3600)
4. Clique em **"Salvar"** ou **"Adicionar"**

**Exemplo:**
```
Tipo: TXT
Nome: resend._domainkey
Valor: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (string longa)
TTL: 3600
```

### 5. Adicionar Registros MX do Resend (se necessário)

1. Clique em **"Adicionar Registro"**
2. Selecione o tipo: **MX**
3. Preencha:
   - **Nome/Host**: `@` ou deixe em branco (para o domínio raiz)
   - **Prioridade**: `10` (ou o que o Resend pedir)
   - **Valor**: `feedback-smtp.resend.com` (ou o que o Resend pedir)
   - **TTL**: 3600
4. Clique em **"Salvar"**

**Exemplo:**
```
Tipo: MX
Nome: @
Prioridade: 10
Valor: feedback-smtp.resend.com
TTL: 3600
```

### 6. Aguardar Propagação DNS

- ⏱️ **Tempo de propagação**: 5 minutos a 48 horas (geralmente 15-30 minutos)
- O Registro.br geralmente propaga em 5-15 minutos
- Você pode verificar a propagação em: https://dnschecker.org

### 7. Verificar no Resend

1. Volte para o Resend: https://resend.com/domains
2. Clique no seu domínio
3. O status deve mudar de **"Pending"** para **"Verified"** ✅
4. Se ainda estiver pendente, aguarde mais alguns minutos

## 🔍 Como Verificar se os Registros Estão Corretos

### Verificar TXT:
```bash
# No terminal (Windows PowerShell ou CMD)
nslookup -type=TXT resend._domainkey.lizsoftware.com.br
```

Ou use ferramentas online:
- https://dnschecker.org
- https://mxtoolbox.com

### Verificar MX:
```bash
nslookup -type=MX lizsoftware.com.br
```

## ⚠️ Problemas Comuns

### 1. "Registro não encontrado"

**Solução:**
- Verifique se o nome do registro está exatamente como o Resend pediu
- Certifique-se de que salvou o registro no painel do Registro.br
- Aguarde alguns minutos para propagação

### 2. "Domínio não verificado após 24h"

**Solução:**
- Verifique se copiou o valor completo do registro TXT (pode ser muito longo)
- Certifique-se de que não há espaços extras no valor
- Verifique se o tipo de registro está correto (TXT, não CNAME)

### 3. "Erro ao salvar registro"

**Solução:**
- Verifique se o formato do valor está correto
- Certifique-se de que não excedeu o limite de caracteres
- Tente adicionar o registro novamente

## 📝 Exemplo Completo

**Domínio:** `lizsoftware.com.br`

**Registros a adicionar no Registro.br:**

1. **TXT para verificação:**
   ```
   Tipo: TXT
   Nome: resend._domainkey
   Valor: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (valor completo do Resend)
   TTL: 3600
   ```

2. **MX para feedback:**
   ```
   Tipo: MX
   Nome: @
   Prioridade: 10
   Valor: feedback-smtp.resend.com
   TTL: 3600
   ```

## ✅ Após Verificar

1. No Railway, adicione:
   ```
   RESEND_VERIFIED_DOMAIN=lizsoftware.com.br
   RESEND_FROM_EMAIL=noreply@lizsoftware.com.br
   ```

2. Aguarde o deploy (2-5 minutos)

3. Teste enviando um email pelo "Fale Conosco"

## 🔗 Links Úteis

- [Registro.br - Gerenciar DNS](https://registro.br)
- [Resend - Domains](https://resend.com/domains)
- [DNS Checker](https://dnschecker.org)
- [MX Toolbox](https://mxtoolbox.com)

## 💡 Dica

Se você não tiver um domínio próprio ainda, pode:
1. Registrar um domínio no Registro.br (a partir de R$ 40/ano)
2. Ou usar o fallback automático (SendGrid/Gmail) que já está configurado

