# ⏰ Como Configurar Lembretes Automáticos no Railway

O Railway não suporta cron jobs nativos. Para enviar lembretes automaticamente, você precisa usar um serviço externo de cron que chama um webhook.

## 🔧 Opção 1: Usar cron-job.org (Recomendado - Gratuito)

### Passo 1: Criar conta no cron-job.org
1. Acesse [https://cron-job.org](https://cron-job.org)
2. Crie uma conta gratuita
3. Faça login

### Passo 2: Criar um novo cron job
1. Clique em "Create cronjob"
2. Configure:
   - **Title**: `FinFlow - Lembretes Automáticos`
   - **Address**: `https://finflow-production-e4b3.up.railway.app/api/lembretes/processar`
   - **Schedule**: `* * * * *` (a cada minuto)
   - **Request method**: `GET`
   - **Save response**: Desmarcado
3. Clique em "Create cronjob"

### Passo 3: Verificar funcionamento
- O serviço chamará o webhook a cada minuto
- Verifique os logs do Railway para confirmar que está funcionando

## 🔧 Opção 2: Usar EasyCron (Alternativa)

1. Acesse [https://www.easycron.com](https://www.easycron.com)
2. Crie uma conta
3. Adicione um novo cron job:
   - **URL**: `https://finflow-production-e4b3.up.railway.app/api/lembretes/processar`
   - **Schedule**: `* * * * *` (a cada minuto)
   - **HTTP Method**: `GET`

## 🔧 Opção 3: Usar Uptime Robot (Monitoramento + Cron)

1. Acesse [https://uptimerobot.com](https://uptimerobot.com)
2. Crie uma conta
3. Adicione um novo monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://finflow-production-e4b3.up.railway.app/api/lembretes/processar`
   - **Interval**: 5 minutos (mínimo gratuito)

## 🔐 Opção 4: Webhook com Autenticação (Mais Seguro)

Se quiser usar autenticação no webhook:

1. Configure a variável de ambiente no Railway:
   ```
   WEBHOOK_TOKEN=seu-token-secreto-aqui
   ```

2. Use a rota POST com token:
   ```
   POST https://finflow-production-e4b3.up.railway.app/api/lembretes/webhook
   Headers:
     x-webhook-token: seu-token-secreto-aqui
   ```

3. Configure o serviço de cron para enviar o header `x-webhook-token`

## 📋 Como Funciona

1. O serviço externo chama o webhook a cada minuto
2. O webhook verifica todos os usuários com lembretes ativos
3. Para cada usuário, verifica se o horário atual corresponde ao `lembretesHorario`
4. Se corresponder, busca vencimentos próximos e envia notificações

## 🧪 Testar Manualmente

Você pode testar manualmente chamando:

```bash
curl https://finflow-production-e4b3.up.railway.app/api/lembretes/processar
```

Ou acesse no navegador:
```
https://finflow-production-e4b3.up.railway.app/api/lembretes/processar
```

## ⚙️ Configuração no Railway

### Variáveis de Ambiente (Opcional)

No Railway, você pode configurar:

```
ENABLE_INTERNAL_CRON=false  # Desabilita o cron interno (recomendado usar serviço externo)
WEBHOOK_TOKEN=seu-token-secreto  # Token para autenticação do webhook (opcional)
```

## 📊 Monitoramento

Verifique os logs do Railway para ver:
- `🔔 Verificando lembretes agendados...`
- `⏰ Horário atual: HH:MM`
- `👥 Usuários com lembretes ativos: X`
- `✅ Email enviado com sucesso` ou `✅ WhatsApp enviado com sucesso`

## 🚨 Troubleshooting

### Lembretes não estão sendo enviados

1. **Verifique se o webhook está sendo chamado:**
   - Veja os logs do Railway
   - Deve aparecer `🔔 Verificando lembretes agendados...`

2. **Verifique se o horário está correto:**
   - O horário no banco deve estar no formato `HH:MM` (ex: `18:15`)
   - O sistema verifica com tolerância de 1 minuto

3. **Verifique se o usuário tem lembretes ativos:**
   - `usuario_lembretesativos = TRUE`
   - `usuario_lembretesemail = TRUE` ou `usuario_lembreteswhatsapp = TRUE`

4. **Verifique se há vencimentos próximos:**
   - O sistema busca despesas com vencimento nos próximos N dias (configurado pelo usuário)

## ✅ Checklist

- [ ] Serviço de cron externo configurado
- [ ] URL do webhook correta
- [ ] Cron job executando a cada minuto
- [ ] Usuários com lembretes ativos
- [ ] Horário configurado corretamente
- [ ] Despesas com vencimento próximo criadas
- [ ] Logs do Railway mostrando execução

---

**Recomendação**: Use **cron-job.org** (gratuito e confiável) para chamar o webhook a cada minuto.

