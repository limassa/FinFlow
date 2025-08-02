-- Script para criar tabela de versão do sistema FinFlow
-- Data: 2024-12-19

-- Criar tabela de versão
CREATE TABLE IF NOT EXISTS versao_sistema (
    versao_id SERIAL PRIMARY KEY,
    versao_numero VARCHAR(20) NOT NULL,
    versao_nome VARCHAR(100) NOT NULL,
    versao_data DATE NOT NULL,
    versao_descricao TEXT,
    versao_status VARCHAR(20) DEFAULT 'ATIVA',
    versao_ambiente VARCHAR(20) DEFAULT 'PRODUCAO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir versão atual
INSERT INTO versao_sistema (
    versao_numero, 
    versao_nome, 
    versao_data, 
    versao_descricao, 
    versao_status, 
    versao_ambiente
) VALUES (
    '1.0.0',
    'FinFlow v1.0.0 - Versão Inicial',
    '2024-12-19',
    'Versão inicial do sistema FinFlow com funcionalidades básicas de controle financeiro, gráficos e relatórios.',
    'ATIVA',
    'PRODUCAO'
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_versao_status ON versao_sistema(versao_status);
CREATE INDEX IF NOT EXISTS idx_versao_ambiente ON versao_sistema(versao_ambiente);

-- Comentários da tabela
COMMENT ON TABLE versao_sistema IS 'Tabela para controle de versões do sistema FinFlow';
COMMENT ON COLUMN versao_sistema.versao_id IS 'ID único da versão';
COMMENT ON COLUMN versao_sistema.versao_numero IS 'Número da versão (ex: 1.0.0)';
COMMENT ON COLUMN versao_sistema.versao_nome IS 'Nome descritivo da versão';
COMMENT ON COLUMN versao_sistema.versao_data IS 'Data de lançamento da versão';
COMMENT ON COLUMN versao_sistema.versao_descricao IS 'Descrição detalhada das mudanças';
COMMENT ON COLUMN versao_sistema.versao_status IS 'Status da versão (ATIVA, INATIVA, BETA)';
COMMENT ON COLUMN versao_sistema.versao_ambiente IS 'Ambiente da versão (PRODUCAO, DESENVOLVIMENTO, TESTE)'; 