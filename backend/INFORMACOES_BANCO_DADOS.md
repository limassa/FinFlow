# 📊 Informações do Banco de Dados

## 🗄️ Banco de Dados Atual

**Configuração:**
- **Nome do Banco:** `FinFlowTeste`
- **Host:** `localhost`
- **Porta:** `5433`
- **Usuário:** `postgres`
- **Senha:** `admin`
- **SGBD:** PostgreSQL 16.9

**Arquivo de Configuração:**
- `backend/config.env`
- `backend/src/database/connection.js`

## 📋 Tabelas do FinFlow

O banco contém **4 tabelas do FinFlow**:

1. **Usuario** (15 colunas)
   - 1 registro: Usuário Teste (ID: 1)

2. **Receita** (16 colunas)
   - 3 registros de exemplo

3. **Despesa** (17 colunas)
   - 3 registros de exemplo

4. **Conta** (9 colunas)
   - 1 registro: Conta Corrente

## 🔍 Outras Tabelas

O banco também contém **36 tabelas da Evolution API**:
- Chat, Chatwoot, Contact, Dify, Evoai, EvolutionBot, Flowise, Instance, Message, Session, etc.

**Importante:** As tabelas da Evolution API **não afetam** o funcionamento do FinFlow. Elas estão no mesmo banco porque a Evolution API foi configurada para usar o mesmo banco PostgreSQL.

## 🧹 Limpeza do Banco

**NÃO foi feita limpeza do banco.**

O que aconteceu:
1. ✅ As tabelas do FinFlow foram **criadas do zero** (estavam vazias)
2. ✅ Dados de teste foram **inseridos manualmente** via script
3. ⚠️ As tabelas da Evolution API **já existiam** no banco antes

## 📊 Estado Atual dos Dados

### Usuario
- **Total:** 1 registro
- **ID 1:** teste@finflow.com / Senha: 123456

### Receita
- **Total:** 3 registros
- Salário (R$ 5.000)
- Freelance (R$ 1.500)
- Venda (R$ 800)

### Despesa
- **Total:** 3 registros
- Aluguel (R$ 1.200)
- Supermercado (R$ 450)
- Internet (R$ 99,90)

### Conta
- **Total:** 1 registro
- Conta Corrente (R$ 1.000)

## 🔄 Se Quiser Limpar

Se você quiser limpar apenas as tabelas do FinFlow (mantendo Evolution API):

```sql
-- CUIDADO: Isso vai deletar TODOS os dados do FinFlow!
TRUNCATE TABLE "Despesa" CASCADE;
TRUNCATE TABLE "Receita" CASCADE;
TRUNCATE TABLE "Conta" CASCADE;
TRUNCATE TABLE "Usuario" CASCADE;
```

Ou deletar as tabelas completamente:

```sql
DROP TABLE IF EXISTS "Despesa" CASCADE;
DROP TABLE IF EXISTS "Receita" CASCADE;
DROP TABLE IF EXISTS "Conta" CASCADE;
DROP TABLE IF EXISTS "Usuario" CASCADE;
```

## 💡 Recomendações

1. **Para Produção:** Use um banco separado para o FinFlow
2. **Para Desenvolvimento:** O banco atual está OK para testes
3. **Backup:** Faça backup antes de limpar dados importantes

## 📝 Scripts Úteis

- `backend/scripts/verificar-banco-completo.js` - Verificar estado completo do banco
- `backend/scripts/verificar-dados-usuario.js` - Verificar dados de um usuário
- `backend/scripts/criar-usuario-teste.js` - Criar dados de teste
- `backend/scripts/criar-tabelas-finflow-completo.js` - Recriar tabelas

