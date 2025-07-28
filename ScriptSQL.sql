-- Script SQL para PostgreSQL

-- Criação da tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de receitas
CREATE TABLE receita_transacao (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    usuario_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de despesas
CREATE TABLE despesa_transacao (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    usuario_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_receitas_user_id ON receita_transacao(usuario_id);
CREATE INDEX idx_receitas_data ON receita_transacao(date);
CREATE INDEX idx_receitas_ativo ON receita_transacao(ativo);

CREATE INDEX idx_despesas_user_id ON despesa_transacao(usuario_id);
CREATE INDEX idx_despesas_data ON despesa_transacao(date);
CREATE INDEX idx_despesas_ativo ON despesa_transacao(ativo);

CREATE TABLE dependents (
    id SERIAL PRIMARY KEY,
    main_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    max_monthly_expense DECIMAL(15, 2),
    can_add_expenses BOOLEAN DEFAULT TRUE,
    can_add_income BOOLEAN DEFAULT FALSE,
    can_view_reports BOOLEAN DEFAULT FALSE
);

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'checking', 'savings', 'credit_card', 'investment'
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE income_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE expense_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE income_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES income_categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly'
    next_occurrence DATE
);

CREATE TABLE expense_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly'
    next_occurrence DATE
);

CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE budget_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE budget_items (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER REFERENCES budget_plans(id) ON DELETE CASCADE,
    category_id INTEGER,
    category_type VARCHAR(10) NOT NULL, -- 'income' or 'expense'
    planned_amount DECIMAL(15, 2) NOT NULL,
    actual_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de contas
CREATE TABLE IF NOT EXISTS contas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    saldo DECIMAL(10,2) DEFAULT 0.00,
    usuario_id INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);

-- Adicionar campos de conta nas tabelas de receitas e despesas
ALTER TABLE receita_transacao ADD COLUMN IF NOT EXISTS conta_id INTEGER NULL;
ALTER TABLE receita_transacao ADD CONSTRAINT fk_receita_conta FOREIGN KEY (conta_id) REFERENCES contas(id);

ALTER TABLE despesa_transacao ADD COLUMN IF NOT EXISTS conta_id INTEGER NULL;
ALTER TABLE despesa_transacao ADD CONSTRAINT fk_despesa_conta FOREIGN KEY (conta_id) REFERENCES contas(id);

ALTER TABLE despesa_transacao 
ADD COLUMN despesa_pago BOOLEAN DEFAULT FALSE,
ADD COLUMN despesa_dtVencimento DATE;