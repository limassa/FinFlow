-- Script para corrigir os nomes das colunas da tabela de despesas
-- Execute este script no banco de dados de produção

-- 1. Verificar estrutura atual
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'despesa'
ORDER BY ordinal_position;

-- 2. Corrigir nomes das colunas se necessário
-- Renomear Despesa_DtVencimento para despesa_datavencimento se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'despesa' 
        AND column_name = 'Despesa_DtVencimento'
    ) THEN
        ALTER TABLE despesa RENAME COLUMN "Despesa_DtVencimento" TO despesa_datavencimento;
        RAISE NOTICE 'Coluna Despesa_DtVencimento renomeada para despesa_datavencimento';
    END IF;
END $$;

-- 3. Garantir que todas as colunas necessárias existem com os nomes corretos
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_descricao VARCHAR(255);
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_valor DECIMAL(10,2);
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_data DATE;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_datavencimento DATE;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_tipo VARCHAR(50);
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_pago BOOLEAN DEFAULT FALSE;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS conta_id INTEGER;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_recorrente BOOLEAN DEFAULT FALSE;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_frequencia VARCHAR(20) DEFAULT 'mensal';
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_proximasparcelas INTEGER DEFAULT 12;

-- 4. Garantir que os campos obrigatórios são NOT NULL
ALTER TABLE despesa ALTER COLUMN despesa_descricao SET NOT NULL;
ALTER TABLE despesa ALTER COLUMN despesa_valor SET NOT NULL;
ALTER TABLE despesa ALTER COLUMN despesa_data SET NOT NULL;
ALTER TABLE despesa ALTER COLUMN despesa_tipo SET NOT NULL;

-- 5. Adicionar foreign keys se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_despesa_usuario'
    ) THEN
        ALTER TABLE despesa ADD CONSTRAINT fk_despesa_usuario 
            FOREIGN KEY (usuario_id) REFERENCES Usuario(Usuario_Id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_despesa_conta'
    ) THEN
        ALTER TABLE despesa ADD CONSTRAINT fk_despesa_conta 
            FOREIGN KEY (conta_id) REFERENCES Conta(Conta_Id);
    END IF;
END $$;

-- 6. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'despesa'
ORDER BY ordinal_position;

-- 7. Testar inserção
INSERT INTO despesa (
    despesa_descricao, 
    despesa_valor, 
    despesa_data, 
    despesa_tipo, 
    usuario_id, 
    despesa_pago,
    despesa_recorrente,
    despesa_frequencia,
    despesa_proximasparcelas
) VALUES (
    'Teste Nomes Colunas',
    100.00,
    '2024-12-19',
    'Outros',
    1,
    FALSE,
    FALSE,
    'mensal',
    12
) RETURNING *;

-- 8. Limpar teste
DELETE FROM despesa WHERE despesa_descricao = 'Teste Nomes Colunas'; 