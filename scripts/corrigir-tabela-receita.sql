-- Script para corrigir a tabela Receita
-- Adiciona as colunas que estão faltando para funcionalidade de receitas recorrentes

-- Verificar se as colunas já existem antes de adicionar
DO $$
BEGIN
    -- Adicionar coluna Receita_Recorrente se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'receita' AND column_name = 'receita_recorrente'
    ) THEN
        ALTER TABLE Receita ADD COLUMN Receita_Recorrente BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna Receita_Recorrente adicionada';
    ELSE
        RAISE NOTICE 'Coluna Receita_Recorrente já existe';
    END IF;

    -- Adicionar coluna Receita_Frequencia se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'receita' AND column_name = 'receita_frequencia'
    ) THEN
        ALTER TABLE Receita ADD COLUMN Receita_Frequencia VARCHAR(20) DEFAULT 'mensal';
        RAISE NOTICE 'Coluna Receita_Frequencia adicionada';
    ELSE
        RAISE NOTICE 'Coluna Receita_Frequencia já existe';
    END IF;

    -- Adicionar coluna Receita_ProximasParcelas se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'receita' AND column_name = 'receita_proximasparcelas'
    ) THEN
        ALTER TABLE Receita ADD COLUMN Receita_ProximasParcelas INTEGER DEFAULT 12;
        RAISE NOTICE 'Coluna Receita_ProximasParcelas adicionada';
    ELSE
        RAISE NOTICE 'Coluna Receita_ProximasParcelas já existe';
    END IF;

END $$;

-- Verificar a estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'receita' 
ORDER BY ordinal_position;

-- Testar inserção de uma receita
INSERT INTO Receita (
    Receita_Descricao, 
    Receita_Valor, 
    Receita_Data, 
    Receita_Tipo, 
    Receita_Recebido, 
    Conta_id, 
    Usuario_Id, 
    Receita_Recorrente, 
    Receita_Frequencia, 
    Receita_ProximasParcelas
) VALUES (
    'Teste Receita Corrigida',
    150.00,
    '2024-01-15',
    'Salário',
    FALSE,
    NULL,
    1,
    FALSE,
    'mensal',
    12
) RETURNING Receita_Id;

-- Limpar dados de teste
DELETE FROM Receita WHERE Receita_Descricao = 'Teste Receita Corrigida';

SELECT 'Tabela Receita corrigida com sucesso!' as status; 