-- Script para adicionar campo Receita_Recebido na tabela Receita
-- Execute este script para implementar o checkbox "Recebido" similar ao "Pago" de Despesas

-- Adicionar coluna Receita_Recebido na tabela Receita
ALTER TABLE Receita ADD COLUMN Receita_Recebido BOOLEAN DEFAULT FALSE;

-- Adicionar comentário na coluna
COMMENT ON COLUMN Receita.Receita_Recebido IS 'Indica se a receita foi recebida (similar ao Pago de Despesas)';

-- Verificar a estrutura atual da tabela Receita
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'receita' 
ORDER BY ordinal_position;

-- Atualizar receitas existentes (opcional - definir como recebidas se a data for passada)
UPDATE Receita 
SET Receita_Recebido = TRUE 
WHERE Receita_Data < CURRENT_DATE 
AND Receita_Recebido IS NULL;

-- Verificar o resultado
SELECT 
    Receita_Id,
    Receita_Descricao,
    Receita_Data,
    Receita_Recebido,
    CASE 
        WHEN Receita_Recebido = TRUE THEN 'Recebido'
        WHEN Receita_Recebido = FALSE THEN 'Não Recebido'
        ELSE 'Não Definido'
    END as Status_Recebimento
FROM Receita 
ORDER BY Receita_Data DESC 
LIMIT 10; 