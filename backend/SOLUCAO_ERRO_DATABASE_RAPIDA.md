# ⚡ Solução Rápida: Erro "Database provider invalid"

## 🎯 Problema

A Evolution API está mostrando erro: **"Database provider invalid"**

Isso acontece porque a Evolution API precisa de um banco de dados configurado.

## ✅ Solução Rápida (Docker com MongoDB)

Execute estes comandos **um por vez**:

### 1. Parar e remover containers antigos:

```powershell
docker stop evolution-api evolution-mongodb 2>$null
docker rm evolution-api evolution-mongodb 2>$null
```

### 2. Criar MongoDB:

```powershell
docker run -d --name evolution-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:latest
```

### 3. Aguardar 15 segundos:

```powershell
timeout /t 15
```

### 4. Criar Evolution API com MongoDB:

```powershell
docker run -d --name evolution-api -p 8080:8080 --link evolution-mongodb:mongo -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" -e DATABASE_ENABLED=true -e DATABASE_PROVIDER=mongodb -e DATABASE_CONNECTION_URI="mongodb://admin:admin123@evolution-mongodb:27017/evolution?authSource=admin" atendai/evolution-api:latest
```

### 5. Verificar se funcionou:

```powershell
docker logs evolution-api --tail 30
```

**O que você deve ver:**
- ✅ Sem erros de "Database provider invalid"
- ✅ Mensagens de sucesso
- ✅ API iniciando corretamente

### 6. Acessar a interface:

Abra no navegador: `http://localhost:8080`

## 🔍 Se Ainda Der Erro

1. **Verifique se MongoDB está rodando:**
   ```powershell
   docker ps | findstr mongo
   ```

2. **Veja os logs completos:**
   ```powershell
   docker logs evolution-api
   docker logs evolution-mongodb
   ```

3. **Tente reiniciar:**
   ```powershell
   docker restart evolution-mongodb
   docker restart evolution-api
   ```

## 📋 Comandos Úteis

**Ver containers rodando:**
```powershell
docker ps
```

**Parar tudo:**
```powershell
docker stop evolution-api evolution-mongodb
```

**Iniciar novamente:**
```powershell
docker start evolution-mongodb
docker start evolution-api
```

**Ver logs:**
```powershell
docker logs evolution-api --tail 50
```

## ✅ Após Resolver

1. Acesse `http://localhost:8080`
2. Crie instância `webcond`
3. Escaneie QR Code
4. Teste: `node scripts/testar-evolution-api.js`

