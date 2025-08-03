# Solução para Erro de Criação de Despesas em Produção

## Problema Identificado

O sistema está retornando erro 500 ao tentar criar despesas em produção. O problema está relacionado à estrutura da tabela de despesas no banco de dados.

## Diagnóstico

1. **Conexão com banco**: ✅ Funcionando
2. **Busca de usuários**: ✅ Funcionando  
3. **Busca de despesas**: ✅ Funcionando
4. **Criação de despesas**: ❌ Erro 500

## Causa Raiz

A estrutura da tabela `despesa` no banco de produção está inconsistente com o código da aplicação. Especificamente:

- Diferenças nos nomes das colunas (ex: `Despesa_DtVencimento` vs `despesa_datavencimento`)
- Campos obrigatórios podem não existir
- Foreign keys podem estar incorretas
- Campos de recorrência podem estar faltando

## Solução

### 1. Aplicar Correções SQL

Execute o script SQL para corrigir a estrutura da tabela:

```sql
-- Arquivo: scripts/corrigir-nomes-colunas-despesa.sql
```

Este script irá:
- Renomear colunas com nomes incorretos
- Adicionar campos faltantes
- Configurar foreign keys corretas
- Garantir tipos de dados corretos

### 2. Verificar Estrutura

Após aplicar as correções, execute:

```bash
node scripts/teste-final-despesa.js
```

### 3. Scripts de Teste Disponíveis

- `scripts/teste-banco-despesa.js` - Teste detalhado do banco
- `scripts/verificar-estrutura-despesa.js` - Verificação de estrutura
- `scripts/aplicar-correcoes-despesa.js` - Aplicação de correções
- `scripts/teste-final-despesa.js` - Teste final completo

## Estrutura Correta da Tabela

A tabela `despesa` deve ter as seguintes colunas:

```sql
CREATE TABLE despesa (
    despesa_id SERIAL PRIMARY KEY,
    despesa_descricao VARCHAR(255) NOT NULL,
    despesa_valor DECIMAL(10,2) NOT NULL,
    despesa_data DATE NOT NULL,
    despesa_datavencimento DATE,
    despesa_tipo VARCHAR(50) NOT NULL,
    despesa_pago BOOLEAN DEFAULT FALSE,
    conta_id INTEGER REFERENCES Conta(Conta_Id),
    usuario_id INTEGER REFERENCES Usuario(Usuario_Id) ON DELETE CASCADE,
    despesa_recorrente BOOLEAN DEFAULT FALSE,
    despesa_frequencia VARCHAR(20) DEFAULT 'mensal',
    despesa_proximasparcelas INTEGER DEFAULT 12,
    despesa_ativo BOOLEAN DEFAULT TRUE,
    despesa_dtdelete TIMESTAMP,
    despesa_usuariodelete INTEGER,
    despesa_dtcriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    despesa_dtatualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Passos para Resolver

1. **Acesse o banco de dados de produção**
2. **Execute o script de correção**: `scripts/corrigir-nomes-colunas-despesa.sql`
3. **Teste a funcionalidade**: `node scripts/teste-final-despesa.js`
4. **Verifique se o problema foi resolvido**

## Arquivos Relacionados

- `backend/src/database/userRepository.js` - Código de criação de despesas
- `backend/app.js` - Endpoint POST /api/despesas
- `src/pages/Despesa.js` - Interface de criação de despesas
- `scripts/corrigir-nomes-colunas-despesa.sql` - Script de correção
- `scripts/teste-final-despesa.js` - Teste final

## Status

- ✅ Diagnóstico completo
- ✅ Scripts de correção criados
- ⏳ Aguardando aplicação das correções no banco
- ⏳ Aguardando teste final

## Notas Importantes

- O problema é específico da estrutura da tabela no banco de produção
- O código da aplicação está correto
- As correções são seguras e não afetam dados existentes
- Após as correções, todas as funcionalidades de despesas devem funcionar normalmente 