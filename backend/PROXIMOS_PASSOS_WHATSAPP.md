# 🚀 Próximos Passos - Configurar WhatsApp

A Evolution API está rodando! Agora vamos configurar o WhatsApp.

## ✅ Status Atual

- ✅ Evolution API funcionando (`http://localhost:8080`)
- ✅ Interface acessível ("Server is up and running")
- ⏳ Próximo: Criar instância do WhatsApp

## 📱 Passo 1: Criar Instância do WhatsApp

### Na Interface Web (`http://localhost:8080`):

1. **Procure pelo botão/formulário de criar instância:**
   - Pode estar escrito: **"Create Instance"**, **"Criar Instância"**, **"New Instance"**, **"Nova Instância"**
   - Geralmente está no topo da página ou em um menu lateral

2. **Preencha o formulário:**
   - **Nome da Instância (Instance Name):** `webcond`
     - ⚠️ **IMPORTANTE:** Use exatamente `webcond` (minúsculas, sem espaços)
   - **Tipo (Type):** WhatsApp ou WHATSAPP-BAILEYS (geralmente é o padrão)
   - **Outros campos:** Deixe como padrão

3. **Clique em "Create" ou "Criar"**

4. **Um QR Code aparecerá na tela**

## 📲 Passo 2: Escanear QR Code

1. **No seu celular:**
   - Abra o aplicativo **WhatsApp**
   - Toque nos **três pontos** (⋮) no canto superior direito
   - Vá em **"Aparelhos conectados"** ou **"Dispositivos vinculados"**
   - Toque em **"Vincular um dispositivo"** ou **"Conectar um aparelho"**

2. **Escaneie o QR Code:**
   - Use a câmera do WhatsApp para escanear o QR Code que aparece na tela do computador
   - Mantenha o QR Code visível e estável

3. **Aguarde a conexão:**
   - O WhatsApp mostrará uma mensagem de confirmação
   - Na interface da Evolution API, o status deve mudar
   - O QR Code desaparecerá quando estiver conectado
   - Isso pode levar 10-30 segundos

## ✅ Passo 3: Verificar Conexão

Após escanear o QR Code, verifique se está conectado:

### Opção 1: Na Interface Web

1. Procure pela lista de instâncias
2. Encontre a instância `webcond`
3. Verifique o status:
   - ✅ **"open"** ou **"connected"** = Conectada!
   - ⏳ **"qrCode"** = Ainda precisa escanear
   - ❌ **"close"** = Desconectada

### Opção 2: Via Script de Teste

Execute no terminal:

```powershell
cd backend
node scripts/testar-evolution-api.js
```

**O que você deve ver:**
- ✅ Evolution API acessível
- ✅ Instância `webcond` encontrada
- ✅ Status: `open` ou `connected`

## 🧪 Passo 4: Testar Envio de Mensagem

Após a instância estar conectada:

### 1. Configurar no App Mobile

1. **Abra o app mobile do FinFlow**
2. **Vá em Configurações → Lembretes**
3. **Ative "Receber lembretes por WhatsApp"**
4. **Preencha seu telefone** em Configurações → Perfil
5. **Salve as configurações**

### 2. Criar Despesa de Teste

1. **Crie uma despesa** com vencimento nos próximos 5 dias
2. **Salve a despesa**

### 3. Testar Envio

Execute no terminal:

```powershell
cd backend
curl -X POST http://localhost:3001/api/lembretes/teste-whatsapp -H "Content-Type: application/json" -d "{\"userId\": 1}"
```

Substitua `userId: 1` pelo ID do seu usuário.

**O que deve acontecer:**
- ✅ Mensagem enviada para seu WhatsApp
- ✅ Lista de despesas com vencimento próximo

## 📋 Checklist Completo

- [ ] Evolution API rodando (`http://localhost:8080`)
- [ ] Interface acessível
- [ ] Instância `webcond` criada
- [ ] QR Code escaneado
- [ ] Status da instância é "open" ou "connected"
- [ ] Script de teste executado com sucesso
- [ ] Telefone cadastrado no perfil do app
- [ ] Lembretes WhatsApp ativados nas configurações
- [ ] Despesa de teste criada
- [ ] Teste de envio executado com sucesso

## ⚠️ Problemas Comuns

### Problema: Não encontro o botão de criar instância

**Soluções:**
1. Recarregue a página (F5)
2. Procure em diferentes abas/menus
3. Tente acessar: `http://localhost:8080/manager` ou `http://localhost:8080/dashboard`

### Problema: QR Code não aparece

**Soluções:**
1. Aguarde alguns segundos - pode demorar para gerar
2. Recarregue a página (F5)
3. Verifique se a instância foi criada - veja a lista de instâncias

### Problema: QR Code expira

**Soluções:**
1. Gere um novo QR Code:
   - Clique na instância `webcond`
   - Procure por botão "Generate QR Code" ou "Gerar QR Code"
2. Ou delete e crie a instância novamente

### Problema: Instância não conecta após escanear

**Soluções:**
1. Aguarde mais tempo (pode demorar até 1 minuto)
2. Recarregue a página (F5)
3. Verifique os logs: `docker logs evolution-api`
4. Tente criar uma nova instância

## 🎉 Pronto!

Após completar estes passos, o sistema estará configurado para enviar lembretes por WhatsApp!

O sistema enviará automaticamente lembretes no horário configurado nas suas preferências.

## 💡 Dicas

1. **Mantenha a Evolution API rodando:**
   - Não pare o container/serviço
   - Se reiniciar o computador, inicie novamente

2. **Se a instância desconectar:**
   - Acesse `http://localhost:8080`
   - Encontre a instância `webcond`
   - Gere um novo QR Code e escaneie novamente

3. **Para ver logs:**
   ```powershell
   docker logs evolution-api --tail 50
   ```

