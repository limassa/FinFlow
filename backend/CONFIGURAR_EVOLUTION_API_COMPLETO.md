# 🚀 Configuração Completa da Evolution API

## ✅ Status Atual

- ✅ Evolution API iniciada com sucesso!
- ✅ Prisma Client gerado
- ✅ Tabelas criadas no banco de dados
- ✅ PostgreSQL conectado

## 📋 Passo a Passo de Configuração

### Passo 1: Acessar a Interface Web

1. **Abra seu navegador** (Chrome, Firefox, Edge)
2. **Acesse:**
   ```
   http://localhost:8082
   ```
3. Você deve ver a interface da Evolution API

### Passo 2: Criar Instância do WhatsApp

1. **Na interface web**, procure por:
   - Botão **"Create Instance"** ou **"Criar Instância"**
   - Pode estar no topo, menu lateral ou em uma aba "Instances"

2. **Preencha o formulário:**
   - **Nome da Instância:** `webcond`
     - ⚠️ **IMPORTANTE:** Use exatamente `webcond` (minúsculas, sem espaços)
   - **Tipo:** WhatsApp ou WHATSAPP-BAILEYS (geralmente é o padrão)
   - **Outros campos:** Deixe como padrão

3. **Clique em "Create" ou "Criar"**

4. **Um QR Code aparecerá na tela**

### Passo 3: Escanear QR Code

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

### Passo 4: Verificar Conexão

#### Opção 1: Na Interface Web

1. Procure pela lista de instâncias
2. Encontre a instância `webcond`
3. Verifique o status:
   - ✅ **"open"** ou **"connected"** = Conectada!
   - ⏳ **"qrCode"** = Ainda precisa escanear
   - ❌ **"close"** = Desconectada

#### Opção 2: Via Script de Teste

Execute no terminal:

```powershell
cd D:\Negocios\Projetos\Web\projeto-web\backend
node scripts/testar-evolution-api.js
```

**O que você deve ver:**
- ✅ Evolution API acessível
- ✅ Instância `webcond` encontrada
- ✅ Status: `open` ou `connected`

### Passo 5: Configurar no Backend do FinFlow

O arquivo `backend/config.env` já deve estar configurado:

```env
EVOLUTION_API_URL=http://localhost:8082
EVOLUTION_INSTANCE_NAME=webcond
EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
```

**Verificar se está correto:**
- ✅ URL: `http://localhost:8082` (porta onde a Evolution API está rodando)
- ✅ Nome da instância: `webcond` (deve ser exatamente igual ao criado)
- ✅ API Key: Deve ser a mesma configurada na Evolution API

### Passo 6: Reiniciar Backend (Se Necessário)

Se você alterou o `config.env`, reinicie o backend:

```powershell
cd D:\Negocios\Projetos\Web\projeto-web\backend
npm start
```

## 🧪 Testar Integração

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
cd D:\Negocios\Projetos\Web\projeto-web\backend
curl -X POST http://localhost:3001/api/lembretes/teste-whatsapp -H "Content-Type: application/json" -d "{\"userId\": 1}"
```

Substitua `userId: 1` pelo ID do seu usuário.

**O que deve acontecer:**
- ✅ Mensagem enviada para seu WhatsApp
- ✅ Lista de despesas com vencimento próximo

## 📋 Checklist Completo

- [x] Evolution API iniciada
- [x] Prisma Client gerado
- [x] Tabelas criadas
- [ ] Interface web acessível (`http://localhost:8082`)
- [ ] Instância `webcond` criada
- [ ] QR Code escaneado
- [ ] Status da instância é "open" ou "connected"
- [ ] `config.env` configurado corretamente
- [ ] Backend reiniciado (se necessário)
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
3. Tente acessar: `http://localhost:8082/manager` ou `http://localhost:8082/dashboard`

### Problema: QR Code não aparece

**Soluções:**
1. Aguarde alguns segundos - pode demorar para gerar
2. Recarregue a página (F5)
3. Verifique se a instância foi criada - veja a lista de instâncias

### Problema: Instância não conecta após escanear

**Soluções:**
1. Aguarde mais tempo (pode demorar até 1 minuto)
2. Recarregue a página (F5)
3. Verifique os logs da Evolution API
4. Tente criar uma nova instância

### Problema: Erro ao testar envio

**Verifique:**
1. Instância está conectada
2. Telefone cadastrado no perfil
3. Lembretes WhatsApp ativados
4. Despesa com vencimento próximo existe

## 💡 Dicas

1. **Mantenha a Evolution API rodando:**
   - Não feche o terminal onde está rodando
   - Se reiniciar o computador, inicie novamente: `npm start`

2. **Se a instância desconectar:**
   - Acesse `http://localhost:8082`
   - Encontre a instância `webcond`
   - Gere um novo QR Code e escaneie novamente

3. **Para ver logs:**
   - Os logs aparecem no terminal onde você executou `npm start`

## 🎉 Pronto!

Após completar estes passos, o sistema estará configurado para enviar lembretes por WhatsApp!

O sistema enviará automaticamente lembretes no horário configurado nas suas preferências.

