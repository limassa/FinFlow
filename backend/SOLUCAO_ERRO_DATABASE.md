# 🔧 Solução: Erro "Database provider invalid" na Evolution API

Este erro ocorre porque a Evolution API precisa de um banco de dados configurado, mas não está encontrando a configuração correta.

## 🔍 Causa do Problema

A Evolution API precisa de um banco de dados para armazenar:
- Instâncias do WhatsApp
- Configurações
- Dados de sessão

O erro "Database provider invalid" significa que:
- A variável de ambiente do banco de dados não está configurada
- Ou está configurada incorretamente

## ✅ Solução: Configurar Banco de Dados

A Evolution API suporta vários bancos de dados. A solução mais simples é usar **MongoDB** ou **PostgreSQL**.

### Opção 1: Usar MongoDB (Mais Simples)

A Evolution API pode usar MongoDB embutido ou externo. Vamos usar uma configuração simplificada:

**1. Parar e remover o container atual:**

```bash
docker stop evolution-api
docker rm evolution-api
```

**2. Criar novo container com MongoDB:**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" \
  -e DATABASE_ENABLED=true \
  -e DATABASE_PROVIDER=postgresql \
  -e DATABASE_CONNECTION_URI="postgresql://postgres:admin@host.docker.internal:5433/FinFlowTeste" \
  atendai/evolution-api:latest
```

**Nota:** Esta configuração tenta usar o PostgreSQL que você já tem rodando. Se não funcionar, vamos usar MongoDB.

### Opção 2: Usar MongoDB com Container Separado (Recomendado)

**1. Parar e remover o container atual:**

```bash
docker stop evolution-api
docker rm evolution-api
```

**2. Criar container MongoDB:**

```bash
docker run -d \
  --name evolution-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:latest
```

**3. Aguardar MongoDB iniciar (10-15 segundos):**

```bash
timeout /t 15
```

**4. Criar Evolution API com MongoDB:**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  --link evolution-mongodb:mongo \
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" \
  -e DATABASE_ENABLED=true \
  -e DATABASE_PROVIDER=mongodb \
  -e DATABASE_CONNECTION_URI="mongodb://admin:admin123@evolution-mongodb:27017/evolution?authSource=admin" \
  atendai/evolution-api:latest
```

### Opção 3: Usar SQLite (Mais Simples, mas Menos Recomendado)

**1. Parar e remover o container atual:**

```bash
docker stop evolution-api
docker rm evolution-api
```

**2. Criar com SQLite:**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" \
  -e DATABASE_ENABLED=true \
  -e DATABASE_PROVIDER=sqlite \
  -v evolution-data:/evolution-api/database \
  atendai/evolution-api:latest
```

## 🚀 Script Automatizado

Criei um script que faz tudo automaticamente. Execute:

**PowerShell:**
```powershell
cd backend
.\instalar-evolution-api-completo.ps1
```

**Bash:**
```bash
cd backend
bash instalar-evolution-api-completo.sh
```

## ✅ Verificar se Funcionou

Após executar uma das opções acima:

```bash
# Verificar se os containers estão rodando
docker ps

# Ver logs da Evolution API
docker logs evolution-api --tail 50

# Verificar se não há mais erros de database
docker logs evolution-api | Select-String -Pattern "Database provider" -CaseSensitive:$false
```

**O que você deve ver:**
- ✅ Containers rodando
- ✅ Sem erros de "Database provider invalid"
- ✅ Mensagens de sucesso nos logs

## 🔍 Troubleshooting

### Problema: Ainda aparece erro de database

**Soluções:**
1. **Verifique os logs completos:**
   ```bash
   docker logs evolution-api
   ```

2. **Verifique se o MongoDB está acessível:**
   ```bash
   docker logs evolution-mongodb
   ```

3. **Tente reiniciar os containers:**
   ```bash
   docker restart evolution-api
   ```

### Problema: MongoDB não conecta

**Soluções:**
1. **Verifique se o MongoDB está rodando:**
   ```bash
   docker ps | findstr mongo
   ```

2. **Aguarde mais tempo** - MongoDB pode demorar para iniciar

3. **Verifique a URI de conexão** - deve estar correta

### Problema: Porta já em uso

**Soluções:**
1. **Use outra porta para MongoDB:**
   ```bash
   docker run -d --name evolution-mongodb -p 27018:27017 mongo:latest
   ```

2. **Atualize a URI de conexão** com a nova porta

## 📋 Variáveis de Ambiente Completas

Se quiser configurar manualmente, aqui estão todas as variáveis:

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="sua-chave" \
  -e DATABASE_ENABLED=true \
  -e DATABASE_PROVIDER=mongodb \
  -e DATABASE_CONNECTION_URI="mongodb://admin:admin123@evolution-mongodb:27017/evolution?authSource=admin" \
  -e SERVER_URL=http://localhost:8080 \
  -e CONFIG_SESSION_PHONE_CLIENT=Chrome \
  -e CONFIG_SESSION_PHONE_NAME=Chrome \
  atendai/evolution-api:latest
```

## 💡 Recomendação

**Use a Opção 2 (MongoDB com container separado)** - é a mais estável e recomendada pela Evolution API.

## 🆘 Ainda com Problemas?

1. **Verifique a versão da Evolution API:**
   ```bash
   docker inspect evolution-api | Select-String -Pattern "Image"
   ```

2. **Consulte a documentação oficial:**
   - https://github.com/EvolutionAPI/evolution-api

3. **Tente uma versão específica:**
   ```bash
   atendai/evolution-api:2.0.0
   ```

