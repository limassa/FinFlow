# 🔄 Como Replicar Dados de Produção

## 🎯 Objetivo

Replicar contas, receitas e despesas do banco de produção para o banco de teste local.

## 📋 Pré-requisitos

1. ✅ Tabelas criadas no banco de teste (execute: `node scripts/criar-tabelas-finflow-completo.js`)
2. ✅ Acesso ao banco de produção
3. ✅ URL de conexão do banco de produção

## 🔧 Configuração

### Opção 1: Adicionar DATABASE_URL_PRODUCTION

Edite `backend/config.env` e adicione:

```env
# URL do banco de produção (Railway, Heroku, etc.)
DATABASE_URL_PRODUCTION=postgresql://user:password@host:port/database
```

**Exemplo Railway:**
```env
DATABASE_URL_PRODUCTION=postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway
```

### Opção 2: Usar DATABASE_URL Existente

Se o `DATABASE_URL` no `config.env` já aponta para produção, o script tentará usá-lo automaticamente.

## 🚀 Executar Replicação

```powershell
cd backend
node scripts/replicar-dados-producao.js
```

## 📊 O que será Replicado

Para o usuário ID 1:
- ✅ **Usuario** - Dados do usuário (se não existir)
- ✅ **Conta** - Todas as contas ativas
- ✅ **Receita** - Todas as receitas ativas
- ✅ **Despesa** - Todas as despesas ativas

## ⚠️ Importante

- O script usa `ON CONFLICT DO NOTHING` para evitar duplicatas
- Apenas registros **ativos** são replicados
- O usuário ID 1 deve existir na produção

## 🔍 Verificar Dados Replicados

Após executar, verifique:

```powershell
node scripts/verificar-dados-usuario.js
```

## 🛠️ Troubleshooting

### Erro: "DATABASE_URL_PRODUCTION não configurada"

**Solução:** Adicione a variável no `config.env`

### Erro: "não existe a relação"

**Solução:** Execute primeiro:
```powershell
node scripts/criar-tabelas-finflow-completo.js
```

### Erro: "Usuário ID 1 não encontrado"

**Solução:** O script mostrará outros usuários disponíveis. Você pode modificar o script para usar outro ID.

### Erro de Conexão SSL

**Solução:** O script já configura SSL com `rejectUnauthorized: false` para Railway/Heroku.

## 📝 Notas

- O script não deleta dados existentes no teste
- Apenas adiciona dados que não existem
- Mantém a integridade referencial (contas antes de receitas/despesas)

