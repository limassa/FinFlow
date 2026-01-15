# 📱 Guia Prático: Como Testar Envio de WhatsApp

Este guia mostra **passo a passo** como testar o envio de mensagens via WhatsApp no FinFlow.

## ✅ Pré-requisitos

Antes de testar, certifique-se de que:

1. **Evolution API está rodando**
   - Acesse: `http://localhost:8080` (ou a porta configurada)
   - Deve abrir a interface da Evolution API

2. **Instância do WhatsApp está conectada**
   - A instância `finflow` (ou o nome configurado) deve estar criada
   - QR Code deve estar escaneado
   - Status deve ser "open" ou "connected"

3. **Backend está configurado**
   - Verifique `backend/config.env`:
     ```env
     EVOLUTION_API_URL=http://localhost:8080
     EVOLUTION_INSTANCE_NAME=finflow
     EVOLUTION_API_KEY=sua-chave-aqui
     ```

4. **Usuário configurado**
   - Telefone cadastrado no perfil
   - Lembretes WhatsApp ativados nas configurações

## 🧪 Métodos de Teste

### Método 1: Via Script PowerShell (Mais Rápido) ⚡

**1. Abra o PowerShell**

**2. Execute o script:**
```powershell
cd backend
.\scripts\testar-whatsapp.ps1 -UserId 1
```

**Substitua `1` pelo ID do seu usuário.**

**OU use o comando direto (PowerShell):**
```powershell
$body = @{ userId = 1 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/lembretes/teste-whatsapp" -Method Post -Body $body -ContentType "application/json"
```

**⚠️ IMPORTANTE:** No PowerShell, use o script ou o comando acima. O comando `curl` pode ter problemas com aspas.

**3. Verifique a resposta:**

✅ **Sucesso:**
```json
{
  "message": "WhatsApp de teste enviado com sucesso!",
  "vencimentos": 2,
  "destinatario": "5511999999999"
}
```

❌ **Erro:**
```json
{
  "error": "Mensagem de erro aqui"
}
```

**4. Verifique seu WhatsApp:**
- Você deve receber uma mensagem com os lembretes de vencimento

---

### Método 2: Via Postman ou Insomnia

**1. Abra o Postman ou Insomnia**

**2. Configure a requisição:**
- **Método:** `POST`
- **URL:** `http://localhost:3001/api/lembretes/teste-whatsapp`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "userId": 1
  }
  ```

**3. Envie a requisição**

**4. Verifique a resposta e seu WhatsApp**

---

### Método 3: Via Script Node.js

**1. Crie o arquivo `backend/scripts/testar-whatsapp.js`:**

```javascript
const axios = require('axios');

async function testarWhatsApp() {
  const userId = 1; // Altere para o ID do seu usuário
  
  try {
    console.log('📱 Testando envio de WhatsApp...');
    console.log(`   Usuário ID: ${userId}\n`);
    
    const response = await axios.post('http://localhost:3001/api/lembretes/teste-whatsapp', {
      userId: userId
    });
    
    console.log('✅ Sucesso!');
    console.log('   Mensagem:', response.data.message);
    console.log('   Vencimentos:', response.data.vencimentos);
    console.log('   Destinatário:', response.data.destinatario);
    console.log('\n📱 Verifique seu WhatsApp!');
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.error('   💡 Verifique se:');
      console.error('      - Telefone está cadastrado no perfil');
      console.error('      - Lembretes WhatsApp estão ativados');
      console.error('      - Existe despesa com vencimento próximo');
    } else if (error.response?.status === 404) {
      console.error('   💡 Usuário não encontrado ou sem vencimentos');
    } else if (error.response?.status === 500) {
      console.error('   💡 Verifique se a Evolution API está rodando');
    }
  }
}

testarWhatsApp();
```

**2. Execute:**
```powershell
cd backend
node scripts/testar-whatsapp.js
```

---

### Método 4: Via Navegador (JavaScript Console)

**1. Abra o navegador e acesse o FinFlow**

**2. Abra o Console do Desenvolvedor (F12)**

**3. Cole e execute:**
```javascript
fetch('http://localhost:3001/api/lembretes/teste-whatsapp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ userId: 1 }) // Altere para seu userId
})
.then(res => res.json())
.then(data => {
  console.log('✅ Resposta:', data);
  if (data.message) {
    alert('WhatsApp enviado! Verifique seu celular.');
  } else {
    alert('Erro: ' + (data.error || 'Erro desconhecido'));
  }
})
.catch(err => {
  console.error('❌ Erro:', err);
  alert('Erro ao enviar WhatsApp');
});
```

---

## 🔍 Verificar se Está Tudo OK

### Checklist Antes de Testar:

- [ ] Evolution API rodando (`http://localhost:8080`)
- [ ] Instância `finflow` criada e conectada
- [ ] Backend rodando (`http://localhost:3001`)
- [ ] `config.env` configurado corretamente
- [ ] Telefone cadastrado no perfil do usuário
- [ ] Lembretes WhatsApp ativados
- [ ] Pelo menos uma despesa com vencimento nos próximos 5 dias

### Verificar Logs do Backend:

Ao executar o teste, você verá no terminal do backend:

```
📱 Teste de lembretes WhatsApp iniciado para userId: 1
📋 Buscando usuário...
✅ Usuário encontrado: João Silva, 5511999999999
📅 Buscando vencimentos próximos...
📊 Vencimentos encontrados: 2
📱 Enviando WhatsApp de teste...
✅ WhatsApp enviado com sucesso!
```

---

## ❌ Resolução de Problemas

### Erro: "Usuário não encontrado"
- Verifique se o `userId` está correto
- Verifique se o usuário existe no banco de dados

### Erro: "Lembretes WhatsApp desativados"
- Vá em Configurações → Lembretes
- Ative "Receber lembretes por WhatsApp"
- Salve as configurações

### Erro: "Telefone não cadastrado"
- Vá em Configurações → Perfil
- Cadastre seu telefone
- Salve o perfil

### Erro: "Nenhuma despesa com vencimento próximo"
- Crie uma despesa
- Defina a data de vencimento para hoje ou nos próximos 5 dias
- A despesa deve estar marcada como "não paga"

### Erro: "Instância não está conectada"
- Verifique se a Evolution API está rodando
- Verifique se a instância está conectada (QR Code escaneado)
- Verifique o nome da instância em `EVOLUTION_INSTANCE_NAME`

### Erro: "Erro ao enviar WhatsApp de teste"
- Verifique se a Evolution API está acessível
- Verifique os logs da Evolution API
- Verifique se a API Key está correta

---

## 📝 Formato da Mensagem

A mensagem enviada terá este formato:

```
🔔 *LEMBRETES DE VENCIMENTO - FinFlow*

Olá, *João Silva*!

Você tem 2 despesa(s) com vencimento próximo:

*1. Conta de Luz*
   💰 Valor: R$ 150,00
   📅 Vencimento: 05/01/2026
   ⚠️ Status: ⏳ Pendente

*2. Internet*
   💰 Valor: R$ 99,90
   📅 Vencimento: 07/01/2026
   ⚠️ Status: ⏳ Pendente

📱 Acesse o FinFlow para mais detalhes.

_Esta é uma mensagem automática. Não responda._
```

---

## 🚀 Próximos Passos

Após testar com sucesso:

1. ✅ Configure o horário dos lembretes nas configurações
2. ✅ Crie despesas com vencimentos próximos
3. ✅ O sistema enviará lembretes automaticamente no horário configurado

---

## 💡 Dica

Para testar rapidamente, use o **Método 1 (Terminal)** - é o mais rápido e direto!

