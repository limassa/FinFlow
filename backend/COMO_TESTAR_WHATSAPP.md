# 📱 Como Testar Notificações por WhatsApp

Este guia explica como testar as notificações por WhatsApp no FinFlow.

## 📋 Pré-requisitos

1. **Evolution API instalada e rodando**
   - A Evolution API deve estar em execução
   - Instância do WhatsApp criada e conectada (QR Code escaneado)
   - Veja `INSTALAR_EVOLUTION_API.md` para mais detalhes

2. **Backend configurado**
   - Variáveis de ambiente configuradas em `backend/config.env`:
     ```env
     EVOLUTION_API_URL=http://localhost:8080
     EVOLUTION_INSTANCE_NAME=finflow
     EVOLUTION_API_KEY=sua-chave-aqui
     ```

3. **Banco de dados atualizado**
   - Coluna `Usuario_LembretesWhatsApp` adicionada
   - Execute: `node backend/scripts/adicionar-coluna-whatsapp.js`

## 🧪 Métodos de Teste

### Método 1: Via API (Recomendado para desenvolvedores)

Use a rota de teste do backend:

```bash
curl -X POST http://localhost:3001/api/lembretes/teste-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**Substitua `userId` pelo ID do usuário que deseja testar.**

**Resposta de sucesso:**
```json
{
  "message": "WhatsApp de teste enviado com sucesso!",
  "vencimentos": 2,
  "destinatario": "5511999999999"
}
```

**Possíveis erros:**
- `404`: Usuário não encontrado
- `400`: Lembretes WhatsApp desativados ou telefone não cadastrado
- `404`: Nenhuma despesa com vencimento próximo encontrada
- `500`: Erro ao enviar (verifique conexão com Evolution API)

### Método 2: Via Interface do App

1. **Configure o usuário:**
   - Acesse **Configurações** → **Perfil**
   - Cadastre seu telefone no campo "Telefone"
   - Acesse **Configurações** → **Lembretes**
   - Ative "Receber lembretes por WhatsApp"
   - Salve as configurações

2. **Crie uma despesa de teste:**
   - Acesse **Despesas**
   - Crie uma nova despesa
   - Defina a data de vencimento para **hoje ou nos próximos 5 dias**
   - Salve a despesa

3. **Teste manualmente:**
   - Use a rota de teste da API (Método 1) ou
   - Aguarde o horário configurado (o sistema enviará automaticamente)

### Método 3: Teste Automático (Produção)

O sistema envia lembretes automaticamente:
- No horário configurado nas configurações de lembretes
- Para despesas com vencimento nos próximos dias (conforme configurado)
- Apenas se lembretes WhatsApp estiverem ativados

## ✅ Checklist de Verificação

Antes de testar, verifique:

- [ ] Evolution API está rodando (`http://localhost:8080`)
- [ ] Instância `finflow` está criada e conectada (QR Code escaneado)
- [ ] Backend está rodando (`http://localhost:3001`)
- [ ] Variáveis de ambiente configuradas em `backend/config.env`
- [ ] Coluna `Usuario_LembretesWhatsApp` existe no banco
- [ ] Usuário tem telefone cadastrado no perfil
- [ ] Lembretes WhatsApp estão ativados nas configurações
- [ ] Existe pelo menos uma despesa com vencimento nos próximos 5 dias

## 🔍 Debug

### Verificar conexão com Evolution API

Verifique os logs do backend ao executar o teste. Você verá:

```
📱 Teste de lembretes WhatsApp iniciado para userId: 1
📋 Buscando usuário...
✅ Usuário encontrado: Nome Usuário, 5511999999999
📅 Buscando vencimentos próximos...
📊 Vencimentos encontrados: 2
📱 Enviando WhatsApp de teste...
✅ WhatsApp enviado com sucesso!
```

### Erros Comuns

**"Instância do WhatsApp não está conectada"**
- Verifique se a Evolution API está rodando
- Verifique se a instância está conectada (QR Code escaneado)
- Verifique o nome da instância em `EVOLUTION_INSTANCE_NAME`

**"Usuário não possui telefone cadastrado"**
- Cadastre o telefone no perfil do usuário
- Formato aceito: `(00) 00000-0000` ou `00000000000`

**"Nenhuma despesa com vencimento próximo encontrada"**
- Crie uma despesa com vencimento nos próximos 5 dias
- A despesa deve estar com `despesa_pago = FALSE`

**"Erro ao enviar WhatsApp de teste"**
- Verifique se a Evolution API está acessível
- Verifique os logs da Evolution API
- Verifique se a instância está conectada

## 📝 Formato da Mensagem

A mensagem enviada terá o seguinte formato:

```
🔔 *LEMBRETES DE VENCIMENTO - FinFlow*

Olá, *Nome do Usuário*!

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

## 🚀 Próximos Passos

Após testar com sucesso:
1. Configure o horário dos lembretes nas configurações
2. Crie despesas com vencimentos próximos
3. O sistema enviará lembretes automaticamente no horário configurado

