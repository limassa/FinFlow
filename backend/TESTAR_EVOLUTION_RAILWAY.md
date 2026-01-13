# 🚀 Testar Evolution API em Produção (Railway)

Este guia explica como testar a conexão com o Evolution API configurado no Railway.

## 📋 Estrutura do Projeto no Railway

No seu projeto FinFlow, você tem:

```
📦 Projeto FinFlow
├── 🗄️ Postgres (Banco de Dados)
├── 📦 Repositório do GitHub (Backend Node.js) ← Configure AQUI! ✅
└── 📱 Evolution API (Serviço separado/compartilhado)
```

**Importante:** As variáveis de ambiente devem ser configuradas no serviço **"Repositório do GitHub"**, que é onde o backend Node.js roda.

## 📋 Pré-requisitos

### 1. Variáveis de Ambiente no Railway

Configure as seguintes variáveis de ambiente no serviço **"Repositório do GitHub"** (onde o backend Node.js roda):

```env
EVOLUTION_API_URL=https://sua-evolution-api.railway.app
EVOLUTION_INSTANCE_NAME=finflow
EVOLUTION_API_KEY=sua-chave-api-aqui
```

**⚠️ IMPORTANTE:** 
- **NÃO use aspas** nas variáveis de ambiente no Railway
- **NÃO adicione espaços** antes ou depois do `=`
- Exemplo correto: `EVOLUTION_API_KEY=valor` (sem aspas)
- Exemplo errado: `EVOLUTION_API_KEY="valor"` (com aspas)

**Onde configurar:**
1. Acesse seu projeto no Railway
2. Selecione o serviço **"Repositório do GitHub"** (não o Postgres!)
3. Vá em **Variables** (Variáveis)
4. Adicione as 3 variáveis acima
5. **Importante:** Reinicie o serviço após adicionar as variáveis

### 2. Verificar Configuração da Evolution API no Railway

Certifique-se de que:
- ✅ Evolution API está rodando no Railway
- ✅ Instância `finflow` foi criada
- ✅ QR Code foi escaneado e a instância está conectada
- ✅ URL pública da Evolution API está acessível

## 🧪 Como Testar a Conexão

### Método 1: Endpoint de Teste do Backend (Recomendado)

O backend possui um endpoint específico para testar a conexão:

**URL:**
```
POST https://finflow-production-e4b3.up.railway.app/api/lembretes/teste-whatsapp
```

**Body (JSON):**
```json
{
  "userId": 1
}
```

**Substitua `userId` pelo ID do usuário que deseja testar.**

**Exemplo usando curl:**
```bash
curl -X POST https://finflow-production-e4b3.up.railway.app/api/lembretes/teste-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**Exemplo usando Postman/Insomnia:**
- Método: `POST`
- URL: `https://finflow-production-e4b3.up.railway.app/api/lembretes/teste-whatsapp`
- Headers: `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "userId": 1
  }
  ```

### Método 2: Verificar Logs do Backend

1. Acesse o Railway Dashboard
2. Selecione o serviço **"Repositório do GitHub"** (não o Postgres!)
3. Vá em **Deployments** → Selecione o deployment ativo → **View Logs**
4. Execute o teste (Método 1)
5. Verifique os logs para ver:
   - ✅ Se a conexão com Evolution API foi estabelecida
   - ✅ Se a instância foi encontrada
   - ✅ Se o WhatsApp foi enviado com sucesso

### Método 3: Teste Direto na Evolution API

Teste diretamente na Evolution API para verificar se está funcionando:

**Verificar instâncias:**
```bash
curl -X GET https://sua-evolution-api.railway.app/instance/fetchInstances \
  -H "apikey: sua-chave-api-aqui"
```

**Verificar status de uma instância:**
```bash
curl -X GET https://sua-evolution-api.railway.app/instance/connectionState/finflow \
  -H "apikey: sua-chave-api-aqui"
```

## ✅ Checklist de Verificação

Antes de testar, verifique:

### No Railway (Repositório do GitHub - Backend):
- [ ] Variável `EVOLUTION_API_URL` configurada com a URL pública da Evolution API
- [ ] Variável `EVOLUTION_INSTANCE_NAME` configurada (geralmente `finflow`)
- [ ] Variável `EVOLUTION_API_KEY` configurada com a chave correta
- [ ] Serviço "Repositório do GitHub" foi reiniciado após adicionar as variáveis

### No Railway (Evolution API):
- [ ] Evolution API está rodando e acessível
- [ ] URL pública está funcionando
- [ ] Instância `finflow` foi criada
- [ ] QR Code foi escaneado e instância está conectada
- [ ] API Key está configurada e funcionando

### No Banco de Dados:
- [ ] Coluna `Usuario_LembretesWhatsApp` existe
- [ ] Usuário tem telefone cadastrado
- [ ] Lembretes WhatsApp estão ativados para o usuário

## 🔍 Interpretando os Resultados

### ✅ Sucesso

**Resposta:**
```json
{
  "message": "WhatsApp de teste enviado com sucesso!",
  "vencimentos": 2,
  "destinatario": "5511999999999",
  "phoneNumber": "5511999999999@s.whatsapp.net"
}
```

**O que significa:**
- ✅ Conexão com Evolution API OK
- ✅ Instância encontrada e conectada
- ✅ Mensagem enviada com sucesso
- ✅ Você deve receber o WhatsApp no telefone cadastrado

### ❌ Erros Comuns

#### 1. "Instância do WhatsApp não está conectada"

**Causa:** A instância não está conectada ou não foi encontrada

**Solução:**
- Verifique se o QR Code foi escaneado
- Verifique se o nome da instância está correto (`EVOLUTION_INSTANCE_NAME`)
- Teste diretamente na Evolution API (Método 3)

#### 2. "ECONNREFUSED" ou "ETIMEDOUT"

**Causa:** Backend não consegue acessar a Evolution API

**Solução:**
- Verifique se `EVOLUTION_API_URL` está correto no serviço "Repositório do GitHub"
- Verifique se a URL é acessível publicamente
- Teste a URL diretamente no navegador ou curl
- Certifique-se de que configurou no serviço correto (não no Postgres!)

#### 3. "401 Unauthorized"

**Causa:** API Key incorreta ou não configurada

**Solução:**
- Verifique se `EVOLUTION_API_KEY` está correto no serviço "Repositório do GitHub"
- Verifique se a chave está configurada no serviço correto (não no Postgres!)
- Reinicie o serviço "Repositório do GitHub" após adicionar a variável

#### 4. "Usuário não possui telefone cadastrado"

**Causa:** Telefone não está cadastrado no perfil

**Solução:**
- Cadastre o telefone no perfil do usuário
- Formato aceito: `(00) 00000-0000` ou `00000000000`

#### 5. "Lembretes por WhatsApp estão desativados"

**Causa:** Usuário não tem lembretes WhatsApp ativados

**Solução:**
- Ative "Receber lembretes por WhatsApp" nas configurações
- Salve as configurações

## 📝 Exemplo de Teste Completo

### 1. Preparar o Usuário

```sql
-- Verificar usuário
SELECT usuario_id, usuario_nome, usuario_email, usuario_telefone, usuario_lembreteswhatsapp
FROM usuario
WHERE usuario_id = 1;
```

### 2. Ativar WhatsApp para o Usuário

```sql
-- Ativar lembretes WhatsApp
UPDATE usuario
SET usuario_lembreteswhatsapp = TRUE
WHERE usuario_id = 1;
```

### 3. Criar Despesa de Teste

Crie uma despesa com vencimento nos próximos 5 dias através do app ou API.

### 4. Executar Teste

```bash
curl -X POST https://finflow-production-e4b3.up.railway.app/api/lembretes/teste-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### 5. Verificar Resultado

- ✅ Verifique a resposta da API
- ✅ Verifique os logs do backend no Railway
- ✅ Verifique se recebeu o WhatsApp no telefone

## 🚨 Troubleshooting

### Problema: Evolution API não está acessível

**Verificar:**
1. Acesse a URL da Evolution API diretamente no navegador
2. Verifique se retorna alguma resposta (mesmo que seja erro 401)
3. Se não acessar, verifique as configurações de rede no Railway

### Problema: API Key não funciona

**Verificar:**
1. Teste a API Key diretamente na Evolution API:
   ```bash
   curl -X GET https://sua-evolution-api.railway.app/instance/fetchInstances \
     -H "apikey: sua-chave-aqui"
   ```
2. Se retornar 401, a chave está incorreta
3. Se retornar 200, a chave está correta

### Problema: Instância não encontrada

**Verificar:**
1. Liste todas as instâncias:
   ```bash
   curl -X GET https://sua-evolution-api.railway.app/instance/fetchInstances \
     -H "apikey: sua-chave-aqui"
   ```
2. Verifique o nome exato da instância
3. Atualize `EVOLUTION_INSTANCE_NAME` se necessário

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do serviço "Repositório do GitHub" no Railway (não do Postgres!)
2. Verifique os logs da Evolution API no Railway
3. Confirme que configurou as variáveis no serviço correto
4. Compare as configurações com este guia
5. Teste cada componente individualmente (Evolution API → Backend → Banco)

