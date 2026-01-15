# 🔧 Solução: Erro "não existe a relação usuario"

## 🎯 Problema

Erro ao testar envio de WhatsApp:
```
error: não existe a relação "usuario"
code: '42P01'
```

## 🔍 Causa

No PostgreSQL, quando você não usa aspas duplas nos nomes de tabelas/colunas:
- O PostgreSQL converte automaticamente para **minúsculas**
- Se a tabela foi criada com aspas duplas, ela mantém o **case original**

O código estava usando `Usuario` (maiúscula) sem aspas, mas o PostgreSQL procurava por `usuario` (minúscula).

## ✅ Solução Aplicada

Ajustei as queries para:
1. **Tentar primeiro com aspas duplas** (preserva case): `"Usuario"`
2. **Se falhar, tentar sem aspas** (minúscula): `usuario`

Isso garante compatibilidade com ambos os casos.

### Arquivos Modificados

- `backend/src/database/userRepository.js`:
  - `findUserById()` - agora tenta com e sem aspas
  - `getVencimentosProximos()` - agora tenta com e sem aspas

## 🔄 Próximos Passos

1. **Reinicie o backend:**
   ```powershell
   # Pare o backend (Ctrl+C)
   # Depois inicie novamente:
   cd D:\Negocios\Projetos\Web\projeto-web\backend
   npm start
   ```

2. **Teste novamente o envio de WhatsApp**

## 💡 Se Ainda Der Erro

Se ainda der erro, verifique o nome exato da tabela no banco:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name ILIKE '%usuario%' OR table_name ILIKE '%user%');
```

Depois ajuste as queries conforme necessário.

## 📋 Nota

A solução com fallback (tentar com e sem aspas) garante que funcione independente de como a tabela foi criada.

