# 🔔 Guia de Teste - Sistema de Lembretes de Vencimento

Este guia explica como testar o sistema de notificação de vencimento por email no FinFlow.

## 📋 Pré-requisitos

### 1. Configuração do Email
Primeiro, configure as credenciais de email no arquivo `backend/config.env`:

```env
# Configurações de Email
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app

# URL do Frontend
FRONTEND_URL=http://localhost:3000
```

**Para Gmail:**
1. Ative a verificação em 2 etapas
2. Gere uma "Senha de App" em: Google Account > Segurança > Senhas de app
3. Use essa senha no `EMAIL_PASS`

### 2. Banco de Dados
Certifique-se de que o banco de dados está configurado e as tabelas foram criadas com os scripts SQL.

## 🚀 Como Testar

### Método 1: Script Automatizado (Recomendado)

1. **Instale as dependências:**
```bash
cd backend
npm install axios
```

2. **Execute o script de teste:**
```bash
node ../teste-lembretes.js
```

3. **Siga o menu interativo:**
   - Opção 1: Testar sistema de lembretes
   - Opção 2: Criar despesa de teste
   - Opção 3: Sair

### Método 2: Teste Manual via API

1. **Verificar vencimentos próximos:**
```bash
curl -X GET "http://localhost:3001/lembretes/vencimentos?userId=1"
```

2. **Testar envio de email:**
```bash
curl -X POST "http://localhost:3001/lembretes/teste-email" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### Método 3: Via Interface Web

1. **Acesse o sistema:**
   - URL: `http://localhost:3000`
   - Faça login com um usuário

2. **Configure lembretes:**
   - Vá em "Configurações" > "Lembretes"
   - Ative "Receber lembretes por email"
   - Salve as configurações

3. **Crie uma despesa de teste:**
   - Vá em "Despesas" > "Nova Despesa"
   - Preencha os dados
   - **Importante:** Defina a data de vencimento para os próximos 5 dias
   - Salve a despesa

4. **Teste o lembrete:**
   - Use o script de teste ou a API para enviar o email

## 📧 Estrutura do Email de Lembrete

O email de lembrete inclui:

- **Cabeçalho:** Logo e título do FinFlow
- **Saudação:** Nome do usuário
- **Lista de Despesas:** Detalhes de cada despesa com vencimento próximo
- **Valores:** Valor, data de vencimento e status
- **Link:** Botão para acessar o sistema
- **Rodapé:** Informações sobre o sistema

## 🔧 Solução de Problemas

### Erro: "Nenhuma despesa com vencimento próximo encontrada"
**Solução:**
1. Crie uma despesa com vencimento nos próximos 5 dias
2. Verifique se a despesa não está marcada como "Paga"
3. Confirme se o usuário tem permissões

### Erro: "Lembretes por email estão desativados"
**Solução:**
1. Vá em Configurações > Lembretes
2. Ative "Receber lembretes por email"
3. Salve as configurações

### Erro: "Erro ao enviar email"
**Solução:**
1. Verifique as credenciais de email no `config.env`
2. Confirme se o Gmail permite "Apps menos seguros" ou use senha de app
3. Verifique a conexão com a internet

### Erro: "Usuário não encontrado"
**Solução:**
1. Verifique se o `userId` está correto
2. Confirme se o usuário existe no banco de dados
3. Verifique se o usuário está ativo

## 📊 Monitoramento

### Logs do Servidor
O servidor registra logs detalhados:
```bash
# Terminal do backend
npm start
```

### Verificar Status
```bash
# Verificar se o servidor está rodando
curl http://localhost:3001/

# Verificar configurações de lembretes
curl "http://localhost:3001/user/lembretes?userId=1"
```

## 🎯 Cenários de Teste

### Cenário 1: Lembrete Simples
1. Crie uma despesa com vencimento para amanhã
2. Execute o teste de lembretes
3. Verifique se o email foi recebido

### Cenário 2: Múltiplas Despesas
1. Crie 3-4 despesas com vencimentos diferentes
2. Execute o teste
3. Verifique se todas aparecem no email

### Cenário 3: Configurações Personalizadas
1. Altere os dias de antecedência nas configurações
2. Crie despesas com vencimento dentro desse período
3. Teste o sistema

## 🔄 Automação (Futuro)

Para automatizar os lembretes, você pode:

1. **Criar um cron job:**
```javascript
// Exemplo de cron job (node-cron)
const cron = require('node-cron');

cron.schedule('0 18 * * *', async () => {
  // Executar verificação de lembretes às 18h
  await verificarLembretes();
});
```

2. **Usar um serviço de agendamento:**
   - AWS Lambda + CloudWatch Events
   - Google Cloud Functions + Cloud Scheduler
   - Heroku Scheduler

## 📝 Notas Importantes

- **Horário:** Os lembretes são verificados diariamente
- **Período:** Despesas com vencimento nos próximos 5 dias
- **Status:** Apenas despesas não pagas são consideradas
- **Configuração:** Cada usuário pode personalizar suas preferências

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Confirme as configurações de email
3. Teste com uma conta de email diferente
4. Verifique a conectividade com o banco de dados

---

**Desenvolvido por:** Liz Softwares  
**Versão:** 2.1.0  
**Data:** $(date) 