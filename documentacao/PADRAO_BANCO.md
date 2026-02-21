# Padrão do banco de dados

## Convenção de nomenclatura

O projeto utiliza **PascalCase** como padrão para tabelas e colunas quando o banco está configurado assim (ex.: Railway, produção). Em PostgreSQL, identificadores entre aspas duplas são **case-sensitive**.

| Tabela   | Nome com aspas      | Exemplo de coluna      |
|----------|---------------------|-------------------------|
| Usuario  | `"Usuario"`         | `"Usuario_Id"`, `"Usuario_Email"` |
| Despesa  | `"Despesa"`         | `"Despesa_Id"`, `"Despesa_Valor"` |
| Receita  | `"Receita"`         | `"Receita_Id"`, `"Receita_Data"`  |
| Conta    | `"Conta"`           | `"Conta_Id"`, `"Conta_Saldo"`     |
| Orcamento_Mensal | `"Orcamento_Mensal"` | `"Orcamento_Categoria"` |

### Exemplo de queries corretas

```sql
SELECT * FROM "Usuario" WHERE "Usuario_Email" = 'email@exemplo.com';
SELECT * FROM "Despesa" WHERE "Usuario_Id" = 1;
SELECT * FROM "Receita" r JOIN "Conta" c ON r."Conta_Id" = c."Conta_Id";
```

## Estratégia de fallback

O backend tenta primeiro o padrão **PascalCase** e, em caso de erro (ex.: tabela não existe), usa o padrão **minúsculas** (`usuario`, `despesa`, etc.). Isso mantém compatibilidade com ambientes que usam snake_case em minúsculas.

- **userRepository**: todas as operações tentam PascalCase primeiro.
- **app.js**: rotas de orçamento, foto do usuário e lembretes seguem o mesmo padrão.

## Arquivo schema.js

O arquivo `backend/src/database/schema.js` define as constantes de tabelas e colunas em PascalCase, para uso em novos scripts e rotas:

```javascript
const { TABLES } = require('./src/database/schema');
// Exemplo: pool.query(`SELECT * FROM ${TABLES.USUARIO} WHERE ...`);
```

## Scripts e novas tabelas

Ao criar novas tabelas ou scripts:

1. Prefira o padrão PascalCase com aspas: `"NovaTabela"`, `"NovaTabela_Coluna"`.
2. Para ambiente local/desenvolvimento, os scripts podem criar tabelas em minúsculas; o código já trata o fallback.
3. Em produção (Railway, etc.), mantenha consistência: se as tabelas existentes estão em PascalCase, use o mesmo padrão.
