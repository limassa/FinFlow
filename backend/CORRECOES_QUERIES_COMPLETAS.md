# ✅ Correções de Queries - Case Sensitivity PostgreSQL

## 🎯 Problema

Erros 500 no backend devido a queries que não funcionam com case sensitivity do PostgreSQL.

## ✅ Soluções Aplicadas

Todas as queries principais foram corrigidas para tentar primeiro com aspas duplas (preservando case) e, se falhar, tentar sem aspas (minúscula).

### Funções Corrigidas

1. ✅ `findUserById()` - Buscar usuário por ID
2. ✅ `findUserByEmail()` - Buscar usuário por email
3. ✅ `loginUser()` - Login de usuário
4. ✅ `getReceitas()` - Buscar receitas
5. ✅ `getDespesas()` - Buscar despesas
6. ✅ `getContas()` - Buscar contas
7. ✅ `getSaldoTotalContas()` - Calcular saldo total
8. ✅ `getVencimentosProximos()` - Buscar vencimentos próximos
9. ✅ Queries de Receita/Despesa por ID

## 🔄 Próximo Passo

**REINICIE O BACKEND** para aplicar as mudanças:

```powershell
# Pare o backend (Ctrl+C)
# Depois inicie novamente:
cd backend
npm start
```

## 📋 Estrutura da Correção

Todas as queries seguem este padrão:

```javascript
async function exemplo() {
  let result;
  try {
    // Tentar com aspas duplas primeiro (case-sensitive)
    result = await pool.query(
      'SELECT * FROM "Tabela" WHERE "Coluna" = $1',
      [param]
    );
  } catch (err) {
    // Se falhar, tentar sem aspas (minúscula)
    result = await pool.query(
      'SELECT * FROM tabela WHERE coluna = $1',
      [param]
    );
  }
  return result.rows;
}
```

## ⚠️ Nota

Algumas queries de INSERT/UPDATE ainda podem precisar de correção se você encontrar erros específicos. As queries de SELECT (que são as mais usadas pelo app mobile) já foram todas corrigidas.

## 🧪 Teste

Após reiniciar o backend, teste o app mobile novamente. Os erros 500 devem estar resolvidos.

