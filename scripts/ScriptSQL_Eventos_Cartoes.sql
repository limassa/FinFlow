-- =====================================================
-- SCRIPT SQL - NOVAS FUNCIONALIDADES
-- Eventos, Cartões de Crédito, Categorias Customizáveis, Orçamento
-- =====================================================

-- =====================================================
-- TABELA: EVENTOS (Agenda/Calendário)
-- =====================================================
CREATE TABLE IF NOT EXISTS evento (
  evento_id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
  evento_titulo VARCHAR(200) NOT NULL,
  evento_descricao TEXT,
  evento_data DATE NOT NULL,
  evento_hora_inicio TIME,
  evento_hora_fim TIME,
  evento_tipo VARCHAR(50) DEFAULT 'geral', -- geral, lembrete, compromisso, vencimento
  evento_cor VARCHAR(20) DEFAULT '#4F46E5',
  evento_recorrente BOOLEAN DEFAULT FALSE,
  evento_frequencia VARCHAR(20), -- diario, semanal, mensal, anual
  evento_lembrete BOOLEAN DEFAULT TRUE,
  evento_lembrete_minutos INTEGER DEFAULT 30,
  receita_id INTEGER REFERENCES receita(receita_id),
  despesa_id INTEGER REFERENCES despesa(despesa_id),
  evento_ativo BOOLEAN DEFAULT TRUE,
  evento_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  evento_atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evento_usuario ON evento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_evento_data ON evento(evento_data);
CREATE INDEX IF NOT EXISTS idx_evento_tipo ON evento(evento_tipo);

-- =====================================================
-- TABELA: CARTÃO DE CRÉDITO
-- =====================================================
CREATE TABLE IF NOT EXISTS cartao_credito (
  cartao_id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
  cartao_nome VARCHAR(100) NOT NULL,
  cartao_bandeira VARCHAR(50), -- visa, mastercard, elo, etc.
  cartao_limite DECIMAL(15,2) DEFAULT 0,
  cartao_dia_fechamento INTEGER DEFAULT 1, -- dia do fechamento da fatura
  cartao_dia_vencimento INTEGER DEFAULT 10, -- dia do vencimento
  cartao_cor VARCHAR(20) DEFAULT '#4F46E5',
  cartao_ativo BOOLEAN DEFAULT TRUE,
  cartao_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cartao_usuario ON cartao_credito(usuario_id);

-- =====================================================
-- TABELA: COMPRAS NO CARTÃO
-- =====================================================
CREATE TABLE IF NOT EXISTS compra_cartao (
  compra_id SERIAL PRIMARY KEY,
  cartao_id INTEGER NOT NULL REFERENCES cartao_credito(cartao_id),
  usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
  compra_descricao VARCHAR(200) NOT NULL,
  compra_valor_total DECIMAL(15,2) NOT NULL,
  compra_data DATE NOT NULL,
  compra_categoria VARCHAR(100),
  compra_parcelas INTEGER DEFAULT 1,
  compra_parcela_atual INTEGER DEFAULT 1,
  compra_valor_parcela DECIMAL(15,2),
  compra_mes_fatura VARCHAR(7), -- YYYY-MM (mês da fatura)
  compra_ativo BOOLEAN DEFAULT TRUE,
  compra_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compra_cartao ON compra_cartao(cartao_id);
CREATE INDEX IF NOT EXISTS idx_compra_usuario ON compra_cartao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_compra_mes_fatura ON compra_cartao(compra_mes_fatura);

-- =====================================================
-- TABELA: CATEGORIAS CUSTOMIZÁVEIS
-- =====================================================
CREATE TABLE IF NOT EXISTS categoria_customizada (
  categoria_id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
  categoria_nome VARCHAR(100) NOT NULL,
  categoria_tipo VARCHAR(20) NOT NULL, -- 'receita' ou 'despesa'
  categoria_icone VARCHAR(50) DEFAULT 'ellipsis-horizontal',
  categoria_cor VARCHAR(20) DEFAULT '#6B7280',
  categoria_ordem INTEGER DEFAULT 0,
  categoria_ativo BOOLEAN DEFAULT TRUE,
  categoria_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, categoria_nome, categoria_tipo)
);

CREATE INDEX IF NOT EXISTS idx_categoria_usuario ON categoria_customizada(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categoria_tipo ON categoria_customizada(categoria_tipo);

-- =====================================================
-- TABELA: ORÇAMENTO MENSAL
-- =====================================================
CREATE TABLE IF NOT EXISTS orcamento_mensal (
  orcamento_id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
  orcamento_categoria VARCHAR(100) NOT NULL,
  orcamento_valor DECIMAL(15,2) NOT NULL,
  orcamento_mes VARCHAR(7) NOT NULL, -- YYYY-MM
  orcamento_ativo BOOLEAN DEFAULT TRUE,
  orcamento_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, orcamento_categoria, orcamento_mes)
);

CREATE INDEX IF NOT EXISTS idx_orcamento_usuario ON orcamento_mensal(usuario_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_mes ON orcamento_mensal(orcamento_mes);

-- =====================================================
-- ATUALIZAÇÃO NA TABELA USUARIO: FOTO DO PERFIL
-- =====================================================
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS usuario_foto TEXT;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS usuario_foto_atualizada_em TIMESTAMP;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Fatura do cartão por mês
CREATE OR REPLACE VIEW vw_fatura_cartao AS
SELECT 
  cc.cartao_id,
  cc.cartao_nome,
  cc.cartao_bandeira,
  cc.usuario_id,
  c.compra_mes_fatura,
  SUM(c.compra_valor_parcela) as valor_fatura,
  COUNT(c.compra_id) as total_compras
FROM cartao_credito cc
LEFT JOIN compra_cartao c ON cc.cartao_id = c.cartao_id AND c.compra_ativo = TRUE
WHERE cc.cartao_ativo = TRUE
GROUP BY cc.cartao_id, cc.cartao_nome, cc.cartao_bandeira, cc.usuario_id, c.compra_mes_fatura;

-- View: Resumo orçamento vs realizado
CREATE OR REPLACE VIEW vw_orcamento_realizado AS
SELECT 
  o.usuario_id,
  o.orcamento_mes,
  o.orcamento_categoria,
  o.orcamento_valor as valor_orcado,
  COALESCE(SUM(d.despesa_valor), 0) as valor_realizado,
  o.orcamento_valor - COALESCE(SUM(d.despesa_valor), 0) as diferenca
FROM orcamento_mensal o
LEFT JOIN despesa d ON 
  o.usuario_id = d.usuario_id 
  AND o.orcamento_categoria = d.despesa_tipo
  AND TO_CHAR(d.despesa_data, 'YYYY-MM') = o.orcamento_mes
  AND d.despesa_ativo = TRUE
WHERE o.orcamento_ativo = TRUE
GROUP BY o.usuario_id, o.orcamento_mes, o.orcamento_categoria, o.orcamento_valor;
