# 🔍 Diagnóstico: Evolution API Não Inicia

## 🎯 Problemas Comuns e Soluções

### Problema 1: Erro de Database Provider

**Erro:**
```
Error: Database provider mongodb invalid.
```

**Solução:**
1. Verifique o arquivo `.env` em `services/evolution-api/.env`
2. Certifique-se de que:
   ```env
   DATABASE_PROVIDER=postgresql
   DATABASE_CONNECTION_URI=postgresql://postgres:admin@localhost:5433/FinFlowTeste
   ```
   - **SEM aspas** ao redor do valor
   - Nome do banco: `FinFlowTeste` (com F maiúsculo)

### Problema 2: PostgreSQL Não Está Acessível

**Verificar:**
```powershell
# Verificar se a porta 5433 está em uso
netstat -ano | findstr :5433

# Testar conexão
Test-NetConnection -ComputerName localhost -Port 5433
```

**Se não estiver acessível:**
1. Inicie o PostgreSQL
2. Verifique se está rodando na porta 5433
3. Verifique as credenciais (usuário: `postgres`, senha: `admin`)

### Problema 3: Banco de Dados Não Existe

**Verificar:**
```powershell
# Se tiver psql instalado
psql -h localhost -p 5433 -U postgres -l
```

**Se o banco não existir:**
```sql
CREATE DATABASE "FinFlowTeste";
```

### Problema 4: Credenciais Incorretas

**Verificar no .env:**
```env
DATABASE_CONNECTION_URI=postgresql://postgres:admin@localhost:5433/FinFlowTeste
```

Certifique-se de que:
- Usuário: `postgres`
- Senha: `admin`
- Porta: `5433`
- Host: `localhost`

### Problema 5: Porta Já em Uso

**Verificar:**
```powershell
netstat -ano | findstr :8082
```

**Se estiver em uso:**
1. Pare o processo que está usando a porta
2. Ou mude a porta no `.env`:
   ```env
   SERVER_PORT=8083
   ```

## 🔍 Passos de Diagnóstico

### 1. Verificar Configuração do .env

```powershell
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
Get-Content .env | Select-String -Pattern "DATABASE|SERVER|PORT"
```

### 2. Verificar se PostgreSQL Está Rodando

```powershell
# Ver processos PostgreSQL
Get-Process | Where-Object {$_.ProcessName -like "*postgres*"}

# Ver porta
netstat -ano | findstr :5433
```

### 3. Testar Conexão com PostgreSQL

Se tiver `psql` instalado:
```powershell
psql -h localhost -p 5433 -U postgres -d FinFlowTeste
```

### 4. Ver Logs da Evolution API

Ao tentar iniciar, copie a mensagem de erro completa.

### 5. Verificar Dependências

```powershell
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
npm install
```

## ✅ Solução Alternativa: Desabilitar Database

Se não conseguir fazer funcionar com PostgreSQL, tente desabilitar o database:

**No arquivo `.env`:**
```env
# Comentar ou remover linhas de database
# DATABASE_PROVIDER=postgresql
# DATABASE_CONNECTION_URI=postgresql://postgres:admin@localhost:5433/FinFlowTeste
```

**E adicionar:**
```env
DATABASE_ENABLED=false
```

**Nota:** Isso pode não funcionar em todas as versões da Evolution API.

## 📋 Informações Necessárias para Diagnóstico

Para ajudar melhor, forneça:

1. **Mensagem de erro completa** ao tentar `npm start`
2. **Conteúdo das linhas de DATABASE** do arquivo `.env`
3. **Status do PostgreSQL** (está rodando?)
4. **Porta que está usando** (8082?)

## 🆘 Se Nada Funcionar

Considere usar Docker com uma versão específica que funciona:

```powershell
docker run -d `
  --name evolution-api `
  -p 8082:8080 `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  -e DATABASE_ENABLED=false `
  atendai/evolution-api:2.3.7
```

