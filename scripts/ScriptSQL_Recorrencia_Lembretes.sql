-- Script para adicionar campos de recorrência e lembretes
-- Execute este script no seu banco de dados PostgreSQL

-- Adicionar campos de recorrência na tabela Receita
ALTER TABLE Receita 
ADD COLUMN IF NOT EXISTS Receita_Recorrente BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS Receita_Frequencia VARCHAR(20) DEFAULT 'mensal',
ADD COLUMN IF NOT EXISTS Receita_ProximasParcelas INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS Receita_DataInicioRecorrencia DATE,
ADD COLUMN IF NOT EXISTS Receita_DataFimRecorrencia DATE;

-- Adicionar campos de recorrência na tabela Despesa
ALTER TABLE Despesa 
ADD COLUMN IF NOT EXISTS Despesa_Recorrente BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS Despesa_Frequencia VARCHAR(20) DEFAULT 'mensal',
ADD COLUMN IF NOT EXISTS Despesa_ProximasParcelas INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS Despesa_DataInicioRecorrencia DATE,
ADD COLUMN IF NOT EXISTS Despesa_DataFimRecorrencia DATE;

-- Adicionar campos de lembretes na tabela Usuario
ALTER TABLE Usuario 
ADD COLUMN IF NOT EXISTS Usuario_LembretesAtivos BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS Usuario_LembretesEmail BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS Usuario_LembretesDiasAntes INTEGER DEFAULT 5;

-- Criar tabela de lembretes enviados
CREATE TABLE IF NOT EXISTS LembretesEnviados (
    Lembrete_Id SERIAL PRIMARY KEY,
    Usuario_Id INTEGER REFERENCES Usuario(Usuario_Id),
    Tipo VARCHAR(20) NOT NULL, -- 'receita' ou 'despesa'
    Item_Id INTEGER NOT NULL, -- ID da receita ou despesa
    DataEnvio TIMESTAMP DEFAULT NOW(),
    DataVencimento DATE NOT NULL,
    Status VARCHAR(20) DEFAULT 'enviado' -- 'enviado', 'lido', 'cancelado'
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_receita_recorrente ON Receita(Receita_Recorrente, Receita_DataInicioRecorrencia);
CREATE INDEX IF NOT EXISTS idx_despesa_recorrente ON Despesa(Despesa_Recorrente, Despesa_DataInicioRecorrencia);
CREATE INDEX IF NOT EXISTS idx_lembretes_usuario ON LembretesEnviados(Usuario_Id, DataVencimento);
CREATE INDEX IF NOT EXISTS idx_lembretes_status ON LembretesEnviados(Status, DataEnvio);

-- Comentários para documentação
COMMENT ON COLUMN Receita.Receita_Recorrente IS 'Indica se a receita é recorrente';
COMMENT ON COLUMN Receita.Receita_Frequencia IS 'Frequência da recorrência (mensal, semanal, quinzenal)';
COMMENT ON COLUMN Receita.Receita_ProximasParcelas IS 'Número de parcelas futuras a serem criadas';
COMMENT ON COLUMN Receita.Receita_DataInicioRecorrencia IS 'Data de início da recorrência';
COMMENT ON COLUMN Receita.Receita_DataFimRecorrencia IS 'Data de fim da recorrência';

COMMENT ON COLUMN Despesa.Despesa_Recorrente IS 'Indica se a despesa é recorrente';
COMMENT ON COLUMN Despesa.Despesa_Frequencia IS 'Frequência da recorrência (mensal, semanal, quinzenal)';
COMMENT ON COLUMN Despesa.Despesa_ProximasParcelas IS 'Número de parcelas futuras a serem criadas';
COMMENT ON COLUMN Despesa.Despesa_DataInicioRecorrencia IS 'Data de início da recorrência';
COMMENT ON COLUMN Despesa.Despesa_DataFimRecorrencia IS 'Data de fim da recorrência';

COMMENT ON COLUMN Usuario.Usuario_LembretesAtivos IS 'Indica se os lembretes estão ativos para o usuário';
COMMENT ON COLUMN Usuario.Usuario_LembretesEmail IS 'Indica se os lembretes devem ser enviados por email';
COMMENT ON COLUMN Usuario.Usuario_LembretesDiasAntes IS 'Número de dias antes do vencimento para enviar lembrete';

-- Verificar se os campos foram adicionados corretamente
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('receita', 'despesa', 'usuario')
AND column_name LIKE '%recorrente%' 
   OR column_name LIKE '%lembretes%'
   OR column_name LIKE '%frequencia%'
ORDER BY table_name, column_name; 