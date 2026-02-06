# 🔧 Como Corrigir o Erro de Database na Evolution API

## 🎯 Problema

Ao iniciar a Evolution API, você recebe:
```
Error: Database provider mongodb invalid.
```

## ✅ Solução: Corrigir Arquivo .env

O arquivo `.env` está em:
```
D:\Negocios\Projetos\Web\projeto-web\services\evolution-api\.env
```

### Problema Identificado

A linha `DATABASE_CONNECTION_URI` está com **aspas simples** ao redor do valor:
```env
DATABASE_CONNECTION_URI='postgresql://postgres:admin@localhost:5433/FinflowTeste'
```

### Correção Manual

1. **Abra o arquivo `.env`** em um editor de texto:
   ```
   D:\Negocios\Projetos\Web\projeto-web\services\evolution-api\.env
   ```

2. **Encontre a linha:**
   ```env
   DATABASE_CONNECTION_URI='postgresql://postgres:admin@localhost:5433/FinflowTeste'
   ```

3. **Remova as aspas simples:**
   ```env
   DATABASE_CONNECTION_URI=postgresql://postgres:admin@localhost:5433/FinFlowTeste
   ```

4. **Também corrija o nome do banco** (se necessário):
   - De: `FinflowTeste`
   - Para: `FinFlowTeste` (com F maiúsculo)

### Correção Automática

Execute o script:

```powershell
cd D:\Negocios\Projetos\Web\projeto-web\backend
.\corrigir-env-evolution.ps1
```

O script irá:
- ✅ Fazer backup do `.env`
- ✅ Remover aspas da `DATABASE_CONNECTION_URI`
- ✅ Corrigir nome do banco

## 📋 Configuração Correta

A linha deve ficar assim:

```env
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://postgres:admin@localhost:5433/FinFlowTeste
```

**Importante:**
- ❌ **SEM aspas** ao redor do valor
- ✅ Nome do banco: `FinFlowTeste` (com F maiúsculo)
- ✅ Credenciais: `postgres:admin`
- ✅ Porta: `5433`
- ✅ Host: `localhost`

## ✅ Após Corrigir

1. **Salve o arquivo `.env`**

2. **Inicie a Evolution API:**
   ```powershell
   cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
   npm start
   ```

3. **Aguarde a mensagem:**
   ```
   Server is up and running
   ```

4. **Acesse:**
   ```
   http://localhost:8082
   ```

## 🔍 Verificar se Funcionou

Se não der mais erro de "Database provider invalid", está funcionando!

## ⚠️ Se Ainda Der Erro

### Verificar se PostgreSQL está Rodando

```powershell
# Verificar se a porta 5433 está em uso
netstat -ano | findstr :5433
```

### Verificar Credenciais

Certifique-se de que:
- ✅ Usuário: `postgres`
- ✅ Senha: `admin`
- ✅ Porta: `5433`
- ✅ Banco: `FinFlowTeste` existe

### Testar Conexão PostgreSQL

```powershell
# Testar conexão (se tiver psql instalado)
psql -h localhost -p 5433 -U postgres -d FinFlowTeste
```

## 💡 Dica

Se preferir não usar database, você pode comentar as linhas de database no `.env`:

```env
# DATABASE_PROVIDER=postgresql
# DATABASE_CONNECTION_URI=postgresql://postgres:admin@localhost:5433/FinFlowTeste
```

Mas isso pode não funcionar em todas as versões da Evolution API.

