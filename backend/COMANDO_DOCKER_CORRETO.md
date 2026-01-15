# 🐳 Comando Docker Correto para Evolution API

## ❌ Erro que Você Teve

```bash
docker run -d evolution-api-finflow -p 8080:8080 -e FinFlow_2025_Evolution_API_Chave_Secreta_123!@# atendai/evolution-api:latest
bash: !@#: event not found
```

**Problemas:**
1. ❌ Falta `--name` antes do nome
2. ❌ Falta `AUTHENTICATION_API_KEY=` antes da chave
3. ❌ Caracteres especiais (`!@#`) precisam estar entre aspas

## ✅ Comando Correto para Git Bash

**Use este comando (com aspas duplas):**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="FinFlow_2025_Evolution_API_Chave_Secreta_123!@#" \
  atendai/evolution-api:latest
```

**Ou use a chave que já está no config.env:**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" \
  atendai/evolution-api:latest
```

## 🚀 Método Mais Fácil: Usar Script Automatizado

Criei scripts que fazem tudo automaticamente!

### Para Git Bash (Windows):

```bash
cd backend
bash instalar-evolution-api.sh
```

### Para PowerShell (Windows):

```powershell
cd backend
.\instalar-evolution-api.ps1
```

Os scripts:
- ✅ Verificam se Docker está rodando
- ✅ Removem container antigo se existir
- ✅ Lêem a chave do `config.env` automaticamente
- ✅ Instalam a Evolution API com a chave correta
- ✅ Mostram próximos passos

## 📋 Explicação do Comando

```bash
docker run -d \                    # -d = rodar em background
  --name evolution-api \           # Nome do container (OBRIGATÓRIO --name)
  -p 8080:8080 \                   # Mapear porta
  -e AUTHENTICATION_API_KEY="..." \ # Variável de ambiente (OBRIGATÓRIO -e NOME=valor)
  atendai/evolution-api:latest     # Imagem Docker
```

**Pontos importantes:**
- `--name` é obrigatório antes do nome do container
- `-e` precisa do formato: `-e NOME_VARIAVEL="valor"`
- Aspas duplas protegem caracteres especiais (`!@#`)

## ⚠️ Se Ainda Der Erro

### Erro: "container name already exists"

```bash
# Remover container existente
docker rm -f evolution-api

# Executar novamente
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" \
  atendai/evolution-api:latest
```

### Erro: "port 8080 is already allocated"

```bash
# Usar porta diferente (exemplo: 8081)
docker run -d \
  --name evolution-api \
  -p 8081:8080 \
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" \
  atendai/evolution-api:latest

# E atualizar config.env:
# EVOLUTION_API_URL=http://localhost:8081
```

## ✅ Verificar se Funcionou

```bash
# Verificar se está rodando
docker ps

# Ver logs
docker logs evolution-api

# Acessar interface
# Abra: http://localhost:8080
```
