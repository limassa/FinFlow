# 📱 Criar Instância do WhatsApp - Guia Visual

A Evolution API está rodando! Agora você precisa criar a instância do WhatsApp.

## 🎯 O que você está vendo agora

Se você está vendo **"Server is up and running"** em `http://localhost:8080`, a Evolution API está funcionando perfeitamente!

## 🚀 Método 1: Via Interface Web (Mais Visual)

### Passo 1: Navegar na Interface

1. **Na página `http://localhost:8080`**, procure por:
   - Um botão **"Create Instance"** ou **"Criar Instância"**
   - Um menu lateral com opções
   - Uma aba **"Instances"** ou **"Instâncias"**
   - Um formulário para criar nova instância

2. **Dica:** A interface pode variar dependendo da versão da Evolution API. Procure por:
   - Botões com ícone de "+" (mais)
   - Links ou botões que mencionam "Instance" ou "Instância"
   - Formulários de criação

### Passo 2: Preencher o Formulário

Quando encontrar o formulário de criação:

1. **Nome da Instância (Instance Name):**
   - Digite: `webcond`
   - ⚠️ **IMPORTANTE:** Este nome deve ser **exatamente igual** ao que está no `config.env`

2. **Tipo (Type):**
   - Selecione: **WhatsApp** ou **WHATSAPP-BAILEYS**
   - Geralmente é a opção padrão

3. **Outros campos:**
   - Deixe como padrão (geralmente não precisa alterar)

### Passo 3: Criar e Escanear QR Code

1. **Clique em "Create" ou "Criar"**

2. **Um QR Code aparecerá na tela**

3. **No seu celular:**
   - Abra o **WhatsApp**
   - Vá em **Configurações** (⚙️)
   - Vá em **Aparelhos conectados** ou **Dispositivos vinculados**
   - Toque em **Vincular um dispositivo** ou **Conectar um aparelho**
   - Use a câmera para **escanear o QR Code** na tela do computador

4. **Aguarde a conexão:**
   - O status mudará para **"open"** ou **"connected"**
   - O QR Code desaparecerá quando estiver conectado
   - Isso pode levar alguns segundos

## 🚀 Método 2: Via Script Automatizado (Mais Rápido)

Execute no terminal:

```bash
cd backend
node scripts/criar-instancia-evolution.js
```

O script irá:
- ✅ Verificar se a instância já existe
- ✅ Criar a instância automaticamente
- ✅ Mostrar os próximos passos

**Depois de executar o script:**
1. Acesse `http://localhost:8080`
2. Encontre a instância `webcond`
3. Escaneie o QR Code que aparece

## 🔍 Como Encontrar a Instância na Interface

Após criar a instância:

1. **Procure por uma lista de instâncias** na interface
2. **Encontre a instância `webcond`**
3. **Verifique o status:**
   - Se mostrar **QR Code:** Precisa escanear
   - Se mostrar **"open"** ou **"connected":** ✅ Está conectada!

## ⚠️ Se Não Encontrar o Botão de Criar

Algumas versões da Evolution API têm interfaces diferentes:

1. **Procure por uma URL específica:**
   - Tente: `http://localhost:8080/manager`
   - Tente: `http://localhost:8080/dashboard`
   - Tente: `http://localhost:8080/admin`

2. **Use o script automatizado:**
   ```bash
   node scripts/criar-instancia-evolution.js
   ```
   Depois acesse `http://localhost:8080` para ver o QR Code

3. **Verifique a documentação da Evolution API:**
   - A interface pode ter mudado na versão que você está usando
   - Consulte: https://github.com/EvolutionAPI/evolution-api

## ✅ Verificar se Funcionou

Após escanear o QR Code:

```bash
cd backend
node scripts/testar-evolution-api.js
```

O script deve mostrar:
- ✅ Evolution API acessível
- ✅ Instância `webcond` encontrada
- ✅ Status: `open` ou `connected`

## 📋 Checklist

- [ ] Evolution API rodando (`http://localhost:8080` acessível)
- [ ] Instância `webcond` criada
- [ ] QR Code escaneado no WhatsApp
- [ ] Status da instância é "open" ou "connected"
- [ ] Script de teste executado com sucesso

## 🆘 Precisa de Ajuda?

Se tiver problemas:

1. **Execute o script de criação:**
   ```bash
   node scripts/criar-instancia-evolution.js
   ```

2. **Verifique os logs:**
   ```bash
   docker logs evolution-api
   ```

3. **Tente criar via API diretamente:**
   - Veja o arquivo `COMO_CRIAR_INSTANCIA_WHATSAPP.md` para exemplos de cURL

