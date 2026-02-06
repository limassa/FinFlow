# 📱 Configuração do WhatsApp usando Evolution API

Este guia explica como configurar o WhatsApp no FinFlow usando a Evolution API.

## 📋 Pré-requisitos

1. **Evolution API instalada e rodando**
   - A Evolution API deve estar rodando (via Docker ou instalação local)
   - URL padrão: `http://localhost:8080`
   - Documentação: https://github.com/EvolutionAPI/evolution-api

2. **Instância criada na Evolution API**
   - Você precisa criar uma instância do WhatsApp na Evolution API
   - Nome da instância: `finflow` (ou conforme configurado)

## 🚀 Passo a Passo

### 1. Instalar a Evolution API

**Opção 1: Docker (Recomendado)**

⚠️ **Importante:** Este comando pode ser executado de **qualquer pasta**, pois cria um container Docker isolado. No entanto, recomendamos executar do diretório raiz do projeto para manter a organização.

```bash
# Execute do diretório raiz do projeto (D:\Negocios\Projetos\Web\projeto-web)
# ou de qualquer outro diretório

docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua-chave-aqui \
  atendai/evolution-api:latest
```

**Verificar se está rodando:**
```bash
docker ps
```

**Ver logs (se necessário):**
```bash
docker logs evolution-api
```

**Opção 2: Instalação Manual**

Siga a documentação oficial: https://github.com/EvolutionAPI/evolution-api

### 2. Criar Instância no WhatsApp

1. Acesse a interface da Evolution API: `http://localhost:8080`
2. Crie uma nova instância chamada `finflow`
3. Escaneie o QR Code com seu WhatsApp
4. Aguarde a conexão ser estabelecida

### 3. Configurar o Backend

Edite o arquivo `backend/config.env`:

```env
# Configurações da Evolution API (WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_INSTANCE_NAME=finflow
EVOLUTION_API_KEY=sua-chave-aqui
```

### 4. Adicionar Coluna no Banco de Dados

Execute o script SQL para adicionar a coluna de lembretes WhatsApp:

```bash
# Via psql
psql -U postgres -d FinFlowTeste -f backend/scripts/add-whatsapp-column.sql

# Ou execute diretamente no banco:
ALTER TABLE Usuario 
ADD COLUMN IF NOT EXISTS Usuario_LembretesWhatsApp BOOLEAN DEFAULT FALSE;
```

### 5. Reiniciar o Backend

```bash
cd backend
npm start
```

## 🧪 Testar a Integração

### 1. Ativar Lembretes WhatsApp

1. Acesse as Configurações no app ou web
2. Vá em "Lembretes"
3. Ative "Receber lembretes por WhatsApp"
4. Certifique-se de que o telefone está cadastrado no perfil

### 2. Testar Envio

**Via API (para desenvolvedores):**

```bash
curl -X POST http://localhost:3001/api/lembretes/teste-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**Via Interface:**
- Crie uma despesa com vencimento nos próximos 5 dias
- Os lembretes serão enviados automaticamente no horário configurado

## 🔧 Estrutura da API

### Endpoints da Evolution API utilizados

1. **Verificar Conexão:**
   ```
   GET /instance/fetchInstances
   Headers: { "apikey": "sua-chave" }
   ```

2. **Enviar Mensagem:**
   ```
   POST /message/sendText/{instanceName}
   Headers: { "apikey": "sua-chave", "Content-Type": "application/json" }
   Body: {
     "number": "5500000000000@s.whatsapp.net",
     "textMessage": {
       "text": "Sua mensagem aqui"
     }
   }
   ```

## ⚙️ Configurações Avançadas

### Formato de Telefone

O sistema formata automaticamente os telefones no formato:
- Entrada: `(00) 00000-0000` ou `00000000000`
- Saída: `5500000000000@s.whatsapp.net`

### Personalizar Mensagem

Edite o arquivo `backend/src/services/whatsappService.js` para personalizar as mensagens de lembrete.

## ⚠️ Troubleshooting

### Problema: "Instância não está conectada"

**Solução:**
1. Verifique se a Evolution API está rodando
2. Verifique se a instância `finflow` existe e está conectada
3. Verifique a URL no `config.env`

### Problema: "Número de telefone inválido"

**Solução:**
1. Certifique-se de que o telefone está cadastrado no perfil do usuário
2. Formato esperado: `(00) 00000-0000` ou `00000000000`
3. O telefone deve incluir DDD

### Problema: "Erro ao enviar mensagem"

**Solução:**
1. Verifique se a Evolution API está acessível
2. Verifique se a API Key está correta (se configurada)
3. Verifique os logs da Evolution API
4. Verifique se o WhatsApp está conectado na instância

## 📚 Recursos

- **Evolution API:** https://github.com/EvolutionAPI/evolution-api
- **Documentação:** https://doc.evolution-api.com/
- **Docker Hub:** https://hub.docker.com/r/atendai/evolution-api

## ✅ Checklist

- [ ] Evolution API instalada e rodando
- [ ] Instância `finflow` criada e conectada
- [ ] Configurações no `config.env`
- [ ] Coluna `Usuario_LembretesWhatsApp` adicionada no banco
- [ ] Backend reiniciado
- [ ] Telefone cadastrado no perfil do usuário
- [ ] Teste de envio realizado com sucesso

## 🎉 Pronto!

Após concluir todos os passos, o sistema estará configurado para enviar lembretes via WhatsApp!

