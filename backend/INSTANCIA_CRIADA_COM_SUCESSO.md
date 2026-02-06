# ✅ Instância Criada com Sucesso - Próximos Passos

Se você já criou a instância `webcond` e escaneou o QR Code, siga estes passos:

## 🔍 Verificar se Está Funcionando

Execute o script de teste:

```bash
cd backend
node scripts/testar-evolution-api.js
```

**O que você deve ver:**
- ✅ Evolution API acessível
- ✅ Instância `webcond` encontrada
- ✅ Status: `open` ou `connected`

## ⚙️ Configurar o Backend (Se Ainda Não Fez)

Certifique-se de que o `backend/config.env` está correto:

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_INSTANCE_NAME=webcond
EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
```

**Importante:** O `EVOLUTION_INSTANCE_NAME` deve ser **exatamente igual** ao nome da instância criada.

## 🧪 Testar o Envio de WhatsApp

### 1. Configurar no App Mobile

1. **Abra o app mobile**
2. **Vá em Configurações → Lembretes**
3. **Ative "Receber lembretes por WhatsApp"**
4. **Preencha seu telefone** em Configurações → Perfil
5. **Salve as configurações**

### 2. Criar uma Despesa de Teste

1. **Crie uma despesa** com vencimento nos próximos 5 dias
2. **Salve a despesa**

### 3. Testar o Envio

Execute no terminal:

```bash
cd backend
curl -X POST http://localhost:3001/api/lembretes/teste-whatsapp \
  -H "Content-Type: application/json" \
  -d "{\"userId\": 1}"
```

Substitua `userId: 1` pelo ID do seu usuário.

**O que deve acontecer:**
- ✅ Mensagem enviada para seu WhatsApp
- ✅ Lista de despesas com vencimento próximo

## 📋 Checklist Completo

- [ ] Evolution API rodando (`docker ps` mostra `evolution-api`)
- [ ] Instância `webcond` criada
- [ ] QR Code escaneado
- [ ] Status da instância é "open" ou "connected"
- [ ] `config.env` configurado corretamente
- [ ] Backend reiniciado (se alterou `config.env`)
- [ ] Telefone cadastrado no perfil do app
- [ ] Lembretes WhatsApp ativados nas configurações
- [ ] Despesa de teste criada
- [ ] Teste de envio executado com sucesso

## 🎉 Pronto!

Agora o sistema está configurado para enviar lembretes por WhatsApp!

O sistema enviará automaticamente lembretes no horário configurado nas suas preferências.

## 💡 Dicas

1. **Mantenha o Docker rodando:**
   - Não pare o container `evolution-api`
   - Se reiniciar o computador, inicie o Docker novamente

2. **Se a instância desconectar:**
   - Acesse `http://localhost:8080`
   - Encontre a instância `webcond`
   - Gere um novo QR Code e escaneie novamente

3. **Para ver logs:**
   ```bash
   docker logs evolution-api --tail 50
   ```

4. **Para parar a Evolution API:**
   ```bash
   docker stop evolution-api
   ```

5. **Para iniciar novamente:**
   ```bash
   docker start evolution-api
   ```

