# 🔧 Troubleshooting - WhatsApp Evolution API

Este guia ajuda a resolver problemas comuns ao integrar o WhatsApp usando Evolution API.

## ❌ Erro: "Erro ao enviar WhatsApp de teste. Verifique a conexão com a Evolution API."

### Problema: Erro 401 (Unauthorized)

**Causa:** A API Key está incorreta ou o header de autenticação está errado.

**Soluções:**

1. **Verificar a API Key na Evolution API:**
   - Acesse a interface da Evolution API: `http://localhost:8080`
   - Verifique a API Key configurada na Evolution API
   - Compare com a API Key no arquivo `backend/config.env`

2. **Verificar o header de autenticação:**
   
   Algumas versões da Evolution API usam headers diferentes:
   
   **Opção 1: Header `apikey` (padrão)**
   ```javascript
   headers: {
     'apikey': 'sua-api-key'
   }
   ```
   
   **Opção 2: Header `Authorization` (algumas versões)**
   ```javascript
   headers: {
     'Authorization': 'Bearer sua-api-key'
   }
   ```
   
   **Opção 3: Header `x-api-key` (algumas versões)**
   ```javascript
   headers: {
     'x-api-key': 'sua-api-key'
   }
   ```

3. **Testar a conexão:**
   ```bash
   cd backend
   node scripts/testar-evolution-api.js
   ```

### Problema: Erro 404 (Not Found)

**Causa:** A URL da Evolution API está incorreta ou a Evolution API não está rodando.

**Soluções:**

1. **Verificar se a Evolution API está rodando:**
   ```bash
   # Verificar se o container está rodando
   docker ps
   
   # Ou verificar se o processo está rodando
   netstat -an | findstr :8080  # Windows
   lsof -i :8080                # Linux/Mac
   ```

2. **Verificar a URL no config.env:**
   ```env
   EVOLUTION_API_URL=http://localhost:8080
   ```

3. **Testar acesso direto:**
   - Abra o navegador e acesse: `http://localhost:8080`
   - Se não abrir, a Evolution API não está rodando

### Problema: Instância não encontrada

**Causa:** O nome da instância no config.env não corresponde ao nome da instância na Evolution API.

**Soluções:**

1. **Verificar o nome da instância:**
   - Acesse a interface da Evolution API: `http://localhost:8080`
   - Veja qual é o nome da instância criada
   - Compare com `EVOLUTION_INSTANCE_NAME` no `config.env`

2. **Criar a instância se não existir:**
   - Acesse a interface da Evolution API
   - Crie uma nova instância com o nome configurado
   - Escaneie o QR Code com seu WhatsApp

### Problema: Instância não conectada

**Causa:** O QR Code não foi escaneado ou a sessão expirou.

**Soluções:**

1. **Verificar status da instância:**
   ```bash
   node scripts/testar-evolution-api.js
   ```

2. **Recriar a instância:**
   - Acesse a interface da Evolution API
   - Delete a instância antiga (se necessário)
   - Crie uma nova instância
   - Escaneie o QR Code novamente

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar se a Evolution API está rodando

```bash
# Testar acesso HTTP
curl http://localhost:8080

# Ou usar o script de teste
cd backend
node scripts/testar-evolution-api.js
```

### Passo 2: Verificar configurações

Verifique o arquivo `backend/config.env`:

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_INSTANCE_NAME=webcond
EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
```

### Passo 3: Testar autenticação

Se o erro for 401, teste manualmente:

```bash
# Teste 1: Sem API Key
curl http://localhost:8080/instance/fetchInstances

# Teste 2: Com API Key no header apikey
curl -H "apikey: sua-api-key" http://localhost:8080/instance/fetchInstances

# Teste 3: Com API Key no header Authorization
curl -H "Authorization: Bearer sua-api-key" http://localhost:8080/instance/fetchInstances

# Teste 4: Com API Key no header x-api-key
curl -H "x-api-key: sua-api-key" http://localhost:8080/instance/fetchInstances
```

### Passo 4: Verificar logs

Verifique os logs do backend ao executar o teste:

```bash
# No terminal onde o backend está rodando, você verá:
📱 Teste de lembretes WhatsApp iniciado para userId: 1
📋 Buscando usuário...
✅ Usuário encontrado: Nome, telefone
📅 Buscando vencimentos próximos...
📊 Vencimentos encontrados: 2
📱 Enviando WhatsApp de teste...
❌ Erro ao verificar conexão com Evolution API: ...
```

## 🔧 Soluções Comuns

### Solução 1: Desabilitar autenticação (apenas para desenvolvimento)

Se você estiver usando a Evolution API sem autenticação:

1. **Comentar a verificação de API Key no código:**
   
   Edite `backend/src/services/whatsappService.js`:
   
   ```javascript
   async checkConnection() {
     try {
       const headers = {
         'Content-Type': 'application/json'
       };
       
       // Comentar esta parte se não usar API Key
       // if (this.apiKey) {
       //   headers['apikey'] = this.apiKey;
       // }
       
       // ... resto do código
     }
   }
   ```

2. **OU deixar EVOLUTION_API_KEY vazio no config.env:**
   
   ```env
   EVOLUTION_API_KEY=
   ```

### Solução 2: Usar header Authorization

Se a Evolution API usar o header `Authorization`:

Edite `backend/src/services/whatsappService.js`:

```javascript
// Alterar de:
headers['apikey'] = this.apiKey;

// Para:
headers['Authorization'] = `Bearer ${this.apiKey}`;
```

### Solução 3: Verificar versão da Evolution API

Diferentes versões da Evolution API podem usar diferentes formatos:

- **v1.x:** Usa `apikey` no header
- **v2.x:** Pode usar `Authorization: Bearer`
- **Algumas versões:** Usam `x-api-key`

Consulte a documentação da sua versão da Evolution API.

## ✅ Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Evolution API está rodando (`http://localhost:8080` acessível)
- [ ] Instância criada na Evolution API
- [ ] QR Code escaneado (instância conectada)
- [ ] API Key configurada corretamente no `config.env`
- [ ] Nome da instância corresponde ao configurado
- [ ] Backend reiniciado após alterar `config.env`
- [ ] Script de teste executado: `node scripts/testar-evolution-api.js`
- [ ] Logs do backend verificados

## 📞 Suporte

Se o problema persistir:

1. Execute o script de teste: `node scripts/testar-evolution-api.js`
2. Copie a saída completa do script
3. Verifique os logs do backend
4. Verifique os logs da Evolution API
5. Consulte a documentação da Evolution API: https://github.com/EvolutionAPI/evolution-api

