-- Script SQL para criar tabela de Metas de Despesa por Categoria
-- Data: 2025-10-29

-- Criar tabela de metas de despesa por categoria
CREATE TABLE IF NOT EXISTS meta_despesa (
    meta_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    valor_meta DECIMAL(15, 2) NOT NULL,
    periodo VARCHAR(20) NOT NULL DEFAULT 'mensal', -- 'mensal', 'anual'
    mes INTEGER, -- Para metas mensais (1-12)
    ano INTEGER NOT NULL, -- Ano da meta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT meta_despesa_usuario_fkey FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    CONSTRAINT meta_despesa_unique UNIQUE (usuario_id, categoria, periodo, mes, ano)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_meta_usuario ON meta_despesa(usuario_id);
CREATE INDEX IF NOT EXISTS idx_meta_categoria ON meta_despesa(categoria);
CREATE INDEX IF NOT EXISTS idx_meta_periodo ON meta_despesa(periodo, ano, mes);
CREATE INDEX IF NOT EXISTS idx_meta_active ON meta_despesa(is_active);

-- Comentários da tabela
COMMENT ON TABLE meta_despesa IS 'Tabela para controle de metas de gastos por categoria';
COMMENT ON COLUMN meta_despesa.meta_id IS 'ID único da meta';
COMMENT ON COLUMN meta_despesa.usuario_id IS 'ID do usuário proprietário da meta';
COMMENT ON COLUMN meta_despesa.categoria IS 'Categoria da despesa (ex: Alimentação, Transporte)';
COMMENT ON COLUMN meta_despesa.valor_meta IS 'Valor máximo permitido para a categoria';
COMMENT ON COLUMN meta_despesa.periodo IS 'Período da meta (mensal ou anual)';
COMMENT ON COLUMN meta_despesa.mes IS 'Mês da meta (1-12) para metas mensais';
COMMENT ON COLUMN meta_despesa.ano IS 'Ano da meta';
COMMENT ON COLUMN meta_despesa.is_active IS 'Status da meta (ativa ou inativa)';

