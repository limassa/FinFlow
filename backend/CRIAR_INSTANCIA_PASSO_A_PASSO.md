# 📱 Criar Instância do WhatsApp - Passo a Passo Detalhado

A Evolution API está rodando! Agora você precisa criar a instância pela **interface web**.

## 🎯 Situação Atual

- ✅ Evolution API instalada e rodando
- ✅ Acessível em `http://localhost:8080`
- ⏳ Precisa criar a instância `webcond` pela interface web

## 🚀 Passo a Passo na Interface Web

### Passo 1: Acessar a Interface

1. **Abra seu navegador** (Chrome, Firefox, Edge)
2. **Acesse:** `http://localhost:8080`
3. Você deve ver a interface da Evolution API

### Passo 2: Localizar o Botão de Criar Instância

A interface pode variar, mas geralmente você encontrará:

**Opção A: Botão no Topo**
- Procure por um botão grande **"Create Instance"** ou **"Criar Instância"**
- Pode estar no centro da página ou no canto superior direito

**Opção B: Menu Lateral**
- Procure por um menu lateral (hambúrguer ☰)
- Clique e procure por **"Instances"** ou **"Instâncias"**
- Dentro, deve haver um botão **"Create"** ou **"Criar"**

**Opção C: Aba/Tab**
- Procure por abas no topo: **"Instances"**, **"Dashboard"**, **"Manager"**
- Clique na aba de instâncias
- Procure pelo botão de criar

**Opção D: Formulário Direto**
- Pode haver um formulário já visível na página inicial
- Com campos para preencher

### Passo 3: Preencher o Formulário

Quando encontrar o formulário de criação:

1. **Campo "Instance Name" ou "Nome da Instância":**
   ```
   webcond
   ```
   ⚠️ **CRUCIAL:** Use exatamente `webcond` (minúsculas, sem espaços)

2. **Campo "Type" ou "Tipo" (se existir):**
   - Selecione: **WhatsApp** ou **WHATSAPP-BAILEYS**
   - Geralmente é o padrão

3. **Outros campos:**
   - Deixe como padrão (não precisa alterar)

### Passo 4: Criar a Instância

1. **Clique no botão:**
   - **"Create"** ou **"Criar"**
   - **"Submit"** ou **"Enviar"**
   - **"Save"** ou **"Salvar"**

2. **Aguarde alguns segundos**

3. **Um QR Code deve aparecer na tela**

### Passo 5: Escanear o QR Code

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

### Passo 6: Verificar se Está Conectado

1. **Na interface da Evolution API:**
   - Procure pela lista de instâncias
   - Encontre a instância `webcond`
   - Verifique o status:
     - ✅ **"open"** ou **"connected"** = Conectada!
     - ⏳ **"qrCode"** = Ainda precisa escanear
     - ❌ **"close"** = Desconectada

2. **Ou teste via script:**
   ```bash
   cd backend
   node scripts/testar-evolution-api.js
   ```

## 📸 O que Você Deve Ver

### Antes de Escanear:
- QR Code visível na tela
- Status: "qrCode" ou "waiting"
- Mensagem indicando que precisa escanear

### Depois de Escanear:
- QR Code desaparece
- Status muda para "open" ou "connected"
- Mensagem de sucesso
- Nome do WhatsApp conectado pode aparecer

## ⚠️ Problemas Comuns

### Problema: Não encontro o botão de criar

**Soluções:**
1. **Recarregue a página** (F5)
2. **Procure em diferentes abas/menus**
3. **Verifique se há uma barra de pesquisa** - pode estar escondido
4. **Tente acessar diretamente:**
   - `http://localhost:8080/manager`
   - `http://localhost:8080/dashboard`
   - `http://localhost:8080/admin`

### Problema: QR Code não aparece

**Soluções:**
1. **Aguarde alguns segundos** - pode demorar para gerar
2. **Recarregue a página** (F5)
3. **Verifique se a instância foi criada** - veja a lista de instâncias
4. **Clique na instância** para ver o QR Code

### Problema: QR Code expira

**Soluções:**
1. **Gere um novo QR Code:**
   - Clique na instância `webcond`
   - Procure por botão **"Generate QR Code"** ou **"Gerar QR Code"**
   - Ou delete e crie a instância novamente

### Problema: Não consegue escanear

**Soluções:**
1. **Certifique-se de usar o WhatsApp principal** (não Business)
2. **Verifique se o WhatsApp está atualizado**
3. **Tente em outro dispositivo**
4. **Aumente o zoom da página** para o QR Code ficar maior

### Problema: Instância não conecta após escanear

**Soluções:**
1. **Aguarde mais tempo** (pode demorar até 1 minuto)
2. **Recarregue a página** (F5)
3. **Verifique os logs:**
   ```bash
   docker logs evolution-api
   ```
4. **Tente criar uma nova instância**

## ✅ Após Conectar com Sucesso

1. **Verifique o status:**
   ```bash
   cd backend
   node scripts/testar-evolution-api.js
   ```

2. **Teste o envio de mensagem:**
   - Vá nas configurações do app mobile
   - Ative "Receber lembretes por WhatsApp"
   - Crie uma despesa com vencimento próximo
   - Teste o envio via API

3. **Mantenha o Docker rodando:**
   - Não pare o container `evolution-api`
   - Se parar, reinicie: `docker start evolution-api`

## 📋 Checklist Final

- [ ] Evolution API acessível em `http://localhost:8080`
- [ ] Instância `webcond` criada na interface
- [ ] QR Code escaneado com sucesso
- [ ] Status da instância é "open" ou "connected"
- [ ] Script de teste executado com sucesso
- [ ] Backend configurado corretamente (`config.env`)

## 🆘 Ainda com Problemas?

1. **Verifique os logs:**
   ```bash
   docker logs evolution-api --tail 50
   ```

2. **Consulte a documentação oficial:**
   - https://github.com/EvolutionAPI/evolution-api

3. **Tente recriar a instância:**
   - Delete a instância existente (se houver)
   - Crie uma nova com o nome `webcond`

4. **Verifique a versão da Evolution API:**
   - Algumas versões têm interfaces diferentes
   - O script pode não funcionar em todas as versões

