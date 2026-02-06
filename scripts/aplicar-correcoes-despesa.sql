-- Script para corrigir a estrutura da tabela de despesas
-- Execute este script no banco de dados de produção

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'despesa'
);

-- 2. Verificar estrutura atual da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'despesa'
ORDER BY ordinal_position;

-- 3. Adicionar campos de recorrência se não existirem
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_recorrente BOOLEAN DEFAULT FALSE;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_frequencia VARCHAR(20) DEFAULT 'mensal';
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_proximasparcelas INTEGER DEFAULT 12;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_datainiciorecorrencia DATE;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_datafimrecorrencia DATE;

-- 4. Garantir que os campos obrigatórios existem e têm os tipos corretos
ALTER TABLE despesa ALTER COLUMN despesa_descricao TYPE VARCHAR(255);
ALTER TABLE despesa ALTER COLUMN despesa_descricao SET NOT NULL;

ALTER TABLE despesa ALTER COLUMN despesa_valor TYPE DECIMAL(10,2);
ALTER TABLE despesa ALTER COLUMN despesa_valor SET NOT NULL;

ALTER TABLE despesa ALTER COLUMN despesa_data TYPE DATE;
ALTER TABLE despesa ALTER COLUMN despesa_data SET NOT NULL;

ALTER TABLE despesa ALTER COLUMN despesa_tipo TYPE VARCHAR(50);
ALTER TABLE despesa ALTER COLUMN despesa_tipo SET NOT NULL;

-- 5. Garantir que o campo usuario_id existe e tem a foreign key correta
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
ALTER TABLE despesa ADD CONSTRAINT IF NOT EXISTS fk_despesa_usuario 
    FOREIGN KEY (usuario_id) REFERENCES Usuario(Usuario_Id) ON DELETE CASCADE;

-- 6. Garantir que o campo conta_id existe e tem a foreign key correta
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS conta_id INTEGER;
ALTER TABLE despesa ADD CONSTRAINT IF NOT EXISTS fk_despesa_conta 
    FOREIGN KEY (conta_id) REFERENCES Conta(Conta_Id);

-- 7. Adicionar campos de auditoria se não existirem
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_dtdelete TIMESTAMP;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_usuariodelete INTEGER;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_dtcriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_dtatualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 8. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_despesa_usuario_id ON despesa(usuario_id);
CREATE INDEX IF NOT EXISTS idx_despesa_data ON despesa(despesa_data);
CREATE INDEX IF NOT EXISTS idx_despesa_ativo ON despesa(despesa_ativo);
CREATE INDEX IF NOT EXISTS idx_despesa_recorrente ON despesa(despesa_recorrente, despesa_datainiciorecorrencia);

-- 9. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'despesa'
ORDER BY ordinal_position;

-- 10. Testar inserção de uma despesa
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
    'Teste de Correção',
    100.00,
    '2024-12-19',
    'Outros',
    1,
    FALSE,
    FALSE,
    'mensal',
    12
) RETURNING *;

-- 11. Limpar o teste
DELETE FROM despesa WHERE despesa_descricao = 'Teste de Correção'; 