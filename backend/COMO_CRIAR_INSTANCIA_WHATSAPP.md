# 📱 Como Criar uma Instância na Evolution API

Este guia explica como criar uma instância do WhatsApp na Evolution API.

## 📋 Pré-requisitos

1. **Evolution API instalada e rodando**
   - A Evolution API deve estar em execução
   - URL padrão: `http://localhost:8080`
   - Veja `INSTALAR_EVOLUTION_API.md` se ainda não instalou

2. **Acesso à interface da Evolution API**
   - Abra o navegador e acesse: `http://localhost:8080`

## 🚀 Passo a Passo

### Passo 1: Acessar a Interface da Evolution API

1. **Abra o navegador** (Chrome, Firefox, Edge, etc.)
2. **Acesse:** `http://localhost:8080`
3. Você verá a interface da Evolution API

### Passo 2: Criar uma Nova Instância

**Método 1: Via Interface Web (Recomendado)**

1. **Procure pelo botão "Criar Instância" ou "Create Instance"**
   - Geralmente está no topo da página ou em um menu lateral
   - Pode estar em uma aba "Instances" ou "Instâncias"

2. **Preencha os campos:**
   - **Nome da Instância:** `webcond` (ou o nome que você configurou no `config.env`)
   - **Tipo:** WhatsApp (geralmente é o padrão)
   - **Outras configurações:** Deixe como padrão (geralmente não precisa alterar)

3. **Clique em "Criar" ou "Create"**

**Método 2: Via API REST (Para desenvolvedores)**

Você também pode criar via API usando cURL ou Postman:

```bash
# Exemplo usando cURL
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: sua-api-key-aqui" \
  -d '{
    "instanceName": "webcond",
    "token": "",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

**Nota:** Ajuste o header `apikey` conforme necessário, ou remova se não usar autenticação.

### Passo 3: Escanear o QR Code

Após criar a instância:

1. **Um QR Code será exibido** na tela
2. **Abra o WhatsApp no seu celular:**
   - Entre no WhatsApp
   - Vá em **Configurações** (Settings)
   - Vá em **Aparelhos conectados** ou **Dispositivos vinculados**
   - Toque em **Vincular um dispositivo**

3. **Escaneie o QR Code** que aparece na tela da Evolution API

4. **Aguarde a conexão:**
   - O status da instância mudará para "open" ou "connected"
   - Isso pode levar alguns segundos

### Passo 4: Verificar se a Instância Está Conectada

1. **Na interface da Evolution API:**
   - Verifique o status da instância
   - Deve mostrar "open" ou "connected"
   - O QR Code desaparecerá quando estiver conectada

2. **Ou teste via script:**
   ```bash
   cd backend
   node scripts/testar-evolution-api.js
   ```

## ⚙️ Configuração no Backend

Após criar a instância, certifique-se de que o `backend/config.env` está configurado corretamente:

```env
# Nome da instância (deve ser igual ao criado na Evolution API)
EVOLUTION_INSTANCE_NAME=webcond

# URL da Evolution API
EVOLUTION_API_URL=http://localhost:8080

# API Key (se necessário)
EVOLUTION_API_KEY=sua-api-key-aqui
```

**Importante:** O `EVOLUTION_INSTANCE_NAME` deve ser **exatamente igual** ao nome da instância criada na Evolution API.

## 🔍 Verificar Status da Instância

### Via Interface Web

1. Acesse: `http://localhost:8080`
2. Veja a lista de instâncias
3. Verifique o status:
   - **open/connected:** ✅ Conectada e funcionando
   - **close/closed:** ❌ Desconectada
   - **qrCode:** ⏳ Aguardando escanear QR Code

### Via Script de Teste

```bash
cd backend
node scripts/testar-evolution-api.js
```

O script mostrará:
- Se a Evolution API está acessível
- Se a instância existe
- Se a instância está conectada

## ⚠️ Problemas Comuns

### Problema: QR Code não aparece

**Soluções:**
1. Recarregue a página (F5)
2. Delete a instância e crie novamente
3. Verifique se a Evolution API está rodando corretamente

### Problema: QR Code expira

**Soluções:**
1. Gere um novo QR Code (geralmente há um botão "Gerar QR Code" ou "Generate QR Code")
2. Ou delete a instância e crie novamente

### Problema: Não consegue escanear o QR Code

**Soluções:**
1. Certifique-se de que está usando o WhatsApp principal (não Business)
2. Verifique se o WhatsApp está atualizado
3. Tente em outro dispositivo

### Problema: Instância não conecta após escanear

**Soluções:**
1. Aguarde alguns segundos (pode demorar)
2. Recarregue a página
3. Verifique os logs da Evolution API: `docker logs evolution-api`
4. Tente criar uma nova instância

### Problema: Instância desconecta frequentemente

**Soluções:**
1. Mantenha a Evolution API rodando
2. Não desinstale o WhatsApp do celular
3. Não desconecte manualmente no WhatsApp
4. Mantenha o container Docker rodando

## 🔄 Recriar Instância (Se necessário)

Se precisar recriar a instância:

1. **Via Interface Web:**
   - Acesse a lista de instâncias
   - Encontre a instância `webcond`
   - Clique em "Deletar" ou "Delete"
   - Confirme a exclusão
   - Crie uma nova instância com o mesmo nome

2. **Via API (Exemplo):**
   ```bash
   # Deletar instância
   curl -X DELETE http://localhost:8080/instance/delete/webcond \
     -H "apikey: sua-api-key-aqui"
   
   # Criar nova instância (ver Passo 2 - Método 2)
   ```

## ✅ Checklist

Após criar a instância, verifique:

- [ ] Evolution API está rodando (`http://localhost:8080` acessível)
- [ ] Instância criada na Evolution API
- [ ] Nome da instância é `webcond` (ou conforme config.env)
- [ ] QR Code escaneado no WhatsApp
- [ ] Status da instância é "open" ou "connected"
- [ ] `EVOLUTION_INSTANCE_NAME` no config.env está correto
- [ ] Backend reiniciado após alterar config.env
- [ ] Script de teste executado com sucesso

## 📝 Notas Importantes

1. **Uma instância = Um número de WhatsApp**
   - Cada instância representa uma conexão com um WhatsApp
   - Você pode criar múltiplas instâncias para diferentes números

2. **O número do WhatsApp não precisa ser o mesmo do servidor**
   - Você pode usar qualquer número de WhatsApp
   - Basta escanear o QR Code com o WhatsApp desejado

3. **A instância precisa estar conectada para funcionar**
   - Se desconectar, você precisará escanear o QR Code novamente
   - Mantenha a Evolution API rodando

4. **O QR Code expira**
   - Se não escanear em alguns minutos, gere um novo QR Code
   - Ou recrie a instância

## 🆘 Precisa de Ajuda?

Se tiver problemas:

1. Verifique os logs da Evolution API: `docker logs evolution-api`
2. Execute o script de teste: `node scripts/testar-evolution-api.js`
3. Consulte a documentação oficial: https://github.com/EvolutionAPI/evolution-api
4. Verifique o guia de troubleshooting: `TROUBLESHOOTING_WHATSAPP.md`

