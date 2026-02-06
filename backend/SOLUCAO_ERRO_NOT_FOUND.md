# 🔧 Solução: Erro "Not Found" na Evolution API

## 🎯 Problema

Ao acessar `http://localhost:8080`, você recebe:
```
Not Found
The requested URL was not found on this server.
```

## 🔍 Possíveis Causas

1. **Container não está rodando**
2. **API ainda está iniciando**
3. **Porta incorreta ou conflito**
4. **URL incorreta**

## ✅ Soluções

### Solução 1: Verificar e Reiniciar Container

```powershell
# Verificar status
docker ps -a | findstr evolution

# Se estiver parado, iniciar
docker start evolution-api

# Aguardar alguns segundos
Start-Sleep -Seconds 15

# Verificar logs
docker logs evolution-api --tail 30
```

### Solução 2: Recriar Container

Se o container não estiver funcionando:

```powershell
# Parar e remover
docker stop evolution-api
docker rm evolution-api

# Criar novamente
docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  atendai/evolution-api:latest

# Aguardar iniciar
Start-Sleep -Seconds 20

# Verificar
docker logs evolution-api --tail 30
```

### Solução 3: Verificar Porta

```powershell
# Ver o que está usando a porta 8080
netstat -ano | findstr :8080

# Se houver conflito, use outra porta
docker run -d `
  --name evolution-api `
  -p 8081:8080 `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  atendai/evolution-api:latest

# E acesse: http://localhost:8081
```

### Solução 4: Verificar URL Correta

Algumas versões da Evolution API usam rotas diferentes:

- `http://localhost:8080` (padrão)
- `http://localhost:8080/manager`
- `http://localhost:8080/dashboard`
- `http://localhost:8080/api`

Tente cada uma no navegador.

## 🔍 Diagnóstico Completo

Execute estes comandos para diagnosticar:

```powershell
# 1. Ver containers
docker ps -a

# 2. Ver logs
docker logs evolution-api

# 3. Ver porta
netstat -ano | findstr :8080

# 4. Testar acesso
curl http://localhost:8080
# ou
Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing
```

## ⚠️ Se Nada Funcionar

### Opção 1: Usar Instalação Manual

Se Docker não funcionar, você pode instalar manualmente:

1. **Instalar Node.js** (se não tiver)
2. **Clonar repositório:**
   ```bash
   git clone https://github.com/EvolutionAPI/evolution-api.git
   cd evolution-api
   ```

3. **Instalar dependências:**
   ```bash
   npm install
   ```

4. **Configurar .env:**
   ```env
   AUTHENTICATION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
   SERVER_URL=http://localhost:8080
   PORT=8080
   ```

5. **Iniciar:**
   ```bash
   npm start
   ```

### Opção 2: Verificar Versão da Evolution API

A versão `latest` pode ter mudado. Tente uma versão específica:

```powershell
docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  atendai/evolution-api:2.3.7
```

## 📋 Checklist de Verificação

- [ ] Docker está rodando (`docker ps` funciona)
- [ ] Container `evolution-api` existe (`docker ps -a`)
- [ ] Container está rodando (`docker ps` mostra `evolution-api`)
- [ ] Porta 8080 está livre ou mapeada corretamente
- [ ] Aguardou tempo suficiente para API iniciar (15-30 segundos)
- [ ] Tentou diferentes URLs (`/manager`, `/dashboard`, `/api`)
- [ ] Verificou logs para erros (`docker logs evolution-api`)

## 💡 Dica

A Evolution API pode levar **30-60 segundos** para iniciar completamente. Aguarde um pouco e tente novamente.

## 🆘 Ainda com Problemas?

1. **Compartilhe os logs:**
   ```powershell
   docker logs evolution-api
   ```

2. **Verifique a versão do Docker:**
   ```powershell
   docker --version
   ```

3. **Tente uma instalação limpa:**
   ```powershell
   docker stop evolution-api evolution-mongodb
   docker rm evolution-api evolution-mongodb
   # Depois recrie seguindo os passos acima
   ```

