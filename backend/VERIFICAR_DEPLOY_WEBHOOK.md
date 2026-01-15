# ✅ Verificar Deploy do Webhook de Lembretes

## 📋 Passos para Verificar

### 1. Aguardar Deploy no Railway
- O Railway geralmente leva 2-5 minutos para fazer o deploy
- Verifique os logs do Railway para confirmar que o deploy foi concluído

### 2. Testar a Rota Manualmente

Após o deploy, teste acessando:

**No navegador:**
```
https://finflow-production-e4b3.up.railway.app/api/lembretes/processar
```

**Ou via curl:**
```bash
curl https://finflow-production-e4b3.up.railway.app/api/lembretes/processar
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Lembretes processados com sucesso",
  "timestamp": "2026-01-14T14:30:00.000Z"
}
```

### 3. Verificar Logs do Railway

Nos logs do Railway, você deve ver:
```
🔔 Verificando lembretes agendados...
   ⏰ Horário atual: HH:MM
   👥 Usuários com lembretes ativos: X
```

### 4. Configurar Serviço de Cron Externo

Após confirmar que a rota está funcionando:

1. Acesse [https://cron-job.org](https://cron-job.org)
2. Crie um cron job:
   - **URL**: `https://finflow-production-e4b3.up.railway.app/api/lembretes/processar`
   - **Schedule**: `* * * * *` (a cada minuto)
   - **Method**: `GET`

## 🚨 Se Ainda Der 404

1. **Verifique se o deploy foi concluído:**
   - Veja os logs do Railway
   - Procure por "Servidor rodando na porta"

2. **Force um redeploy no Railway:**
   - Vá em Settings > Redeploy
   - Ou faça um commit vazio para forçar deploy

3. **Verifique se está na branch correta:**
   - Railway deve estar configurado para a branch `production`

4. **Verifique os logs de erro:**
   - Pode haver um erro de sintaxe impedindo o servidor de iniciar

## ✅ Checklist

- [ ] Deploy concluído no Railway
- [ ] Rota `/api/lembretes/processar` retorna 200 OK
- [ ] Logs mostram "Verificando lembretes agendados"
- [ ] Cron job externo configurado
- [ ] Teste manual funcionando

