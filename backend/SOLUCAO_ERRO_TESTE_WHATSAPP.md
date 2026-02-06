# 🔧 Solução: Erro ao Testar Envio de WhatsApp

## 🎯 Problema

Ao testar o envio de lembretes WhatsApp, você recebe:
```json
{
    "error": "Erro ao testar envio de lembretes"
}
```

## 🔍 Possíveis Causas

### 1. Evolution API Não Está Acessível

**Sintoma:** Erro `ECONNREFUSED` ou timeout

**Solução:**
1. **Verifique se a Evolution API está rodando:**
   - Olhe no terminal onde você executou `npm start` na Evolution API
   - Deve estar mostrando logs e sem erros

2. **Verifique a porta:**
   - A Evolution API deve estar na porta **8082**
   - Acesse: `http://localhost:8082` no navegador
   - Deve abrir a interface da Evolution API

3. **Se não estiver rodando:**
   ```bash
   cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
   npm start
   ```

### 2. Instância Não Está Conectada

**Sintoma:** Erro "Instância não está conectada"

**Solução:**
1. **Acesse a interface:** `http://localhost:8082`
2. **Verifique o status da instância `finflow`:**
   - Deve mostrar **"open"** ou **"connected"**
   - Se mostrar **"qrCode"**, precisa escanear novamente
   - Se mostrar **"close"**, a instância está desconectada

3. **Se desconectada:**
   - Gere um novo QR Code
   - Escaneie novamente com seu WhatsApp

### 3. Nome da Instância Incorreto

**Sintoma:** Erro "Instância não encontrada"

**Solução:**
1. **Verifique o nome no `config.env`:**
   ```env
   EVOLUTION_INSTANCE_NAME=finflow
   ```
   Deve ser **exatamente igual** ao nome criado na Evolution API.

2. **Se diferente, atualize o `config.env`** e reinicie o backend.

### 4. API Key Incorreta

**Sintoma:** Erro 401 (Unauthorized)

**Solução:**
1. **Verifique a API Key no `config.env`:**
   ```env
   EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
   ```

2. **Deve ser a mesma** configurada na Evolution API (no arquivo `.env` da Evolution API)

### 5. Usuário Sem Telefone ou Lembretes Desativados

**Sintoma:** Erro específico sobre telefone ou lembretes

**Solução:**
1. **No app mobile:**
   - Vá em Configurações → Perfil
   - Preencha o campo "Telefone"
   - Vá em Configurações → Lembretes
   - Ative "Receber lembretes por WhatsApp"
   - Salve as configurações

### 6. Nenhuma Despesa com Vencimento Próximo

**Sintoma:** Erro "Nenhuma despesa com vencimento próximo encontrada"

**Solução:**
1. **Crie uma despesa** com vencimento nos próximos 5 dias
2. **Salve a despesa**
3. **Tente o teste novamente**

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar Evolution API

```powershell
# Testar acesso
Invoke-WebRequest -Uri "http://localhost:8082" -UseBasicParsing
```

**Deve retornar:** Status 200

### Passo 2: Verificar Instância

```powershell
cd backend
node scripts/testar-evolution-api.js
```

**Deve mostrar:**
- ✅ Evolution API acessível
- ✅ Instância `finflow` encontrada
- ✅ Status: `open` ou `connected`

### Passo 3: Verificar Logs do Backend

Ao executar o teste, veja os logs no terminal do backend. Eles mostrarão:
- 📋 Buscando usuário...
- ✅ Usuário encontrado
- 📅 Buscando vencimentos...
- 📊 Vencimentos encontrados: X
- 📱 Enviando WhatsApp...
- ✅ ou ❌ Resultado

### Passo 4: Verificar Configuração

```powershell
# Verificar config.env
Get-Content backend\config.env | Select-String -Pattern "EVOLUTION"
```

**Deve mostrar:**
```
EVOLUTION_API_URL=http://localhost:8082
EVOLUTION_INSTANCE_NAME=finflow
EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
```

## ✅ Checklist de Verificação

- [ ] Evolution API rodando (`http://localhost:8082` acessível)
- [ ] Instância `finflow` criada na Evolution API
- [ ] Instância `finflow` conectada (status: "open" ou "connected")
- [ ] `config.env` com `EVOLUTION_INSTANCE_NAME=finflow`
- [ ] Backend reiniciado após alterar `config.env`
- [ ] Usuário tem telefone cadastrado no perfil
- [ ] Lembretes WhatsApp ativados nas configurações
- [ ] Despesa com vencimento próximo existe
- [ ] Script de teste executado: `node scripts/testar-evolution-api.js`

## 🧪 Teste Completo

Execute este teste completo:

```powershell
# 1. Verificar Evolution API
cd backend
node scripts/testar-evolution-api.js

# 2. Testar envio (substitua userId pelo seu)
curl -X POST http://localhost:3001/api/lembretes/teste-whatsapp -H "Content-Type: application/json" -d "{\"userId\": 1}"
```

## 📋 Logs Importantes

Ao executar o teste, os logs do backend mostrarão:

```
📱 Teste de lembretes WhatsApp iniciado para userId: 1
📋 Buscando usuário...
✅ Usuário encontrado: Nome, Telefone
📅 Buscando vencimentos próximos...
📊 Vencimentos encontrados: X
📱 Enviando WhatsApp de teste...
✅ WhatsApp enviado com sucesso!
```

Se houver erro, os logs mostrarão onde está o problema.

## 🆘 Se Nada Funcionar

1. **Verifique os logs do backend** - mostram onde está o erro
2. **Verifique os logs da Evolution API** - mostram se recebeu a requisição
3. **Teste a conexão:** `node scripts/testar-evolution-api.js`
4. **Verifique se a instância está conectada** na interface web

## 💡 Dica

O erro genérico "Erro ao testar envio de lembretes" geralmente significa que:
- A Evolution API não está acessível, OU
- A instância não está conectada, OU
- Há um erro na conexão/autenticação

Verifique os logs do backend para ver o erro específico!

