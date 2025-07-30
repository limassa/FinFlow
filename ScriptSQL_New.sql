-- Script SQL para PostgreSQL

-- Criação da tabela de usuários
CREATE TABLE Usuario (
    Usuario_Id SERIAL PRIMARY KEY,
    Usuario_Email VARCHAR(255) UNIQUE NOT NULL,
    Usuario_Senha VARCHAR(255) NOT NULL,
    Usuario_Nome VARCHAR(255) NOT NULL,
    Usuario_Telefone VARCHAR(20),
    Usuario_DtCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	Usuario_DtAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	Usuario_Ativo BOOLEAN DEFAULT TRUE,
	Usuario_ResetToken VARCHAR(255),
	Usuario_ResetExpiry TIMESTAMP
	)

-- Criação da tabela de contas
CREATE TABLE IF NOT EXISTS Conta (
    Conta_Id SERIAL PRIMARY KEY,
    Conta_Nome VARCHAR(100) NOT NULL,
    Conta_Tipo VARCHAR(50) NOT NULL,
    Conta_Saldo DECIMAL(10,2) DEFAULT 0.00,
    Usuario_Id INTEGER NOT NULL,
    Conta_Ativo BOOLEAN DEFAULT true,
    Conta_DtCriacao TIMESTAMP DEFAULT NOW(),
    Conta_DtAtualizacao TIMESTAMP DEFAULT NOW(),
    Conta_DtDelete TIMESTAMP NULL,
    FOREIGN KEY (Usuario_Id) REFERENCES Usuario(Usuario_Id)
);

-- Criação da tabela de receitas
CREATE TABLE Receita (
    Receita_Id SERIAL PRIMARY KEY,
    Receita_Descricao VARCHAR(255) NOT NULL,
    Receita_Valor DECIMAL(10,2) NOT NULL,
    Receita_Data DATE NOT NULL,
    Receita_Tipo VARCHAR(50) NOT NULL,
    Usuario_Id INTEGER REFERENCES Usuario(Usuario_Id) ON DELETE CASCADE,
    Receita_Ativo BOOLEAN DEFAULT TRUE,
    Receita_DtDelete TIMESTAMP,
    Receita_UsuarioDelete INTEGER REFERENCES Usuario(Usuario_Id),
    Receita_DtCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Receita_DtAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	Conta_id INTEGER NULL REFERENCES Conta(Conta_Id),
	Receita_Recebido BOOLEAN DEFAULT FALSE
);

-- Criação da tabela de despesas
CREATE TABLE Despesa (
    Despesa_Id SERIAL PRIMARY KEY,
    Despesa_Descricao VARCHAR(255) NOT NULL,
    Despesa_Valor DECIMAL(10,2) NOT NULL,
    Despesa_Data DATE NOT NULL,
    Despesa_Tipo VARCHAR(50) NOT NULL,
    Usuario_Id INTEGER REFERENCES Usuario(Usuario_Id) ON DELETE CASCADE,
    Despesa_Ativo BOOLEAN DEFAULT TRUE,
    Despesa_DtDelete TIMESTAMP,
    Despesa_UsuarioDelete INTEGER REFERENCES Usuario(Usuario_Id),
    Despesa_DtCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Despesa_DtAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	Despesa_Pago BOOLEAN DEFAULT FALSE,
	Despesa_DtVencimento DATE,
	Conta_id INTEGER NULL REFERENCES Conta(Conta_Id)
);

-- Índices para melhor performance
CREATE INDEX idx_Receita_Usuario_Id ON Receita(Usuario_Id);
CREATE INDEX idx_Receita_Receita_Data ON Receita(Receita_Data);
CREATE INDEX idx_Receita_Receia_Ativo ON Receita(Receita_Ativo);

CREATE INDEX idx_Despesa_Usuario_Id ON Despesa(Usuario_Id);
CREATE INDEX idx_Despesa_Despesa_Data ON Despesa(Despesa_Data);
CREATE INDEX idx_despesa_Despesa_Ativo ON Despesa(Despesa_Ativo);



