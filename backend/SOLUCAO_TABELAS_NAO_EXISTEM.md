# 🔧 Solução: Tabelas Não Existem no Banco de Dados

## 🎯 Problema

Ao iniciar a Evolution API, você recebe:
```
PrismaClientKnownRequestError: The table `(not available)` does not exist in the current database.
```

**Código:** `P2021`

## ✅ Solução: Criar Tabelas no Banco

O Prisma Client foi gerado, mas as **tabelas ainda não foram criadas** no banco de dados PostgreSQL.

### Opção 1: Usar Migrações (Recomendado)

Execute as migrações do Prisma:

```bash
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
npx prisma migrate deploy
```

**O que faz:**
- ✅ Cria todas as tabelas necessárias
- ✅ Usa o histórico de migrações
- ✅ Recomendado para produção

### Opção 2: Sincronizar Schema (Mais Rápido para Desenvolvimento)

Se não quiser usar migrações, sincronize o schema diretamente:

```bash
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
npx prisma db push
```

**O que faz:**
- ✅ Cria/atualiza tabelas baseado no schema
- ✅ Mais rápido
- ✅ Não mantém histórico de migrações
- ✅ Recomendado para desenvolvimento

### Opção 3: Criar Migração e Aplicar

Se preferir criar uma nova migração:

```bash
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
npx prisma migrate dev --name init
```

**O que faz:**
- ✅ Cria uma nova migração
- ✅ Aplica a migração
- ✅ Mantém histórico

## 📋 Comandos Completos

```bash
# 1. Ir para o diretório
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api

# 2. Criar tabelas (escolha uma opção acima)
npx prisma db push
# OU
npx prisma migrate deploy

# 3. Iniciar a API
npm start
```

## 🔍 Verificar se Funcionou

Após executar `prisma db push` ou `prisma migrate deploy`, você deve ver:
- ✅ Mensagens de sucesso
- ✅ Tabelas criadas no banco
- ✅ Sem erros

**Para verificar as tabelas criadas:**
```sql
-- No PostgreSQL
\dt
-- Ou
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

## ⚠️ Se Der Erro de Conexão

Certifique-se de que:
- ✅ PostgreSQL está rodando
- ✅ Credenciais no `.env` estão corretas:
  ```env
  DATABASE_CONNECTION_URI=postgresql://postgres:admin@localhost:5433/FinFlowTeste
  ```
- ✅ Banco de dados `FinFlowTeste` existe

**Criar banco se não existir:**
```sql
CREATE DATABASE "FinFlowTeste";
```

## 📝 Diferença Entre os Comandos

### `prisma db push`
- ✅ Mais rápido
- ✅ Sincroniza schema diretamente
- ❌ Não mantém histórico
- ✅ Ideal para desenvolvimento

### `prisma migrate deploy`
- ✅ Mantém histórico de migrações
- ✅ Mais controle sobre mudanças
- ✅ Ideal para produção
- ⚠️ Requer migrações existentes

### `prisma migrate dev`
- ✅ Cria nova migração
- ✅ Aplica migração
- ✅ Mantém histórico
- ✅ Ideal quando precisa criar migração

## ✅ Após Resolver

1. **Execute `npx prisma db push`** (ou `migrate deploy`)
2. **Aguarde as tabelas serem criadas**
3. **Execute `npm start`**
4. **A Evolution API deve iniciar normalmente**

## 💡 Dica

Para desenvolvimento, use `prisma db push`. É mais rápido e não precisa de migrações pré-existentes.

