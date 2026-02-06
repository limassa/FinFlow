-- Script SQL para Sistema PDV
-- Criado por: Liz Softwares
-- Data: 2024
-- Descrição: Script para criação das tabelas do sistema PDV

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS Usuario (
    Usuario_ID INT AUTO_INCREMENT PRIMARY KEY,
    Usuario_Nome VARCHAR(100) NOT NULL,
    Usuario_Email VARCHAR(100) UNIQUE NOT NULL,
    Usuario_Senha VARCHAR(255) NOT NULL,
    Usuario_Telefone VARCHAR(20),
    Usuario_DataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Usuario_Ativo BOOLEAN DEFAULT TRUE,
    Usuario_Tipo ENUM('admin', 'vendedor', 'gerente') DEFAULT 'vendedor'
);

-- =====================================================
-- TABELA DE CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS Cliente (
    Cliente_ID INT AUTO_INCREMENT PRIMARY KEY,
    Cliente_Nome VARCHAR(100) NOT NULL,
    Cliente_Email VARCHAR(100),
    Cliente_Telefone VARCHAR(20),
    Cliente_CPF VARCHAR(14) UNIQUE,
    Cliente_Endereco TEXT,
    Cliente_Cidade VARCHAR(50),
    Cliente_Estado VARCHAR(2),
    Cliente_CEP VARCHAR(10),
    Cliente_Observacoes TEXT,
    Cliente_DataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Cliente_Ativo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- TABELA DE CATEGORIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS Categoria (
    Categoria_ID INT AUTO_INCREMENT PRIMARY KEY,
    Categoria_Nome VARCHAR(50) NOT NULL,
    Categoria_Descricao TEXT,
    Categoria_Ativo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- TABELA DE FORNECEDORES
-- =====================================================
CREATE TABLE IF NOT EXISTS Fornecedor (
    Fornecedor_ID INT AUTO_INCREMENT PRIMARY KEY,
    Fornecedor_Nome VARCHAR(100) NOT NULL,
    Fornecedor_CNPJ VARCHAR(18) UNIQUE,
    Fornecedor_Telefone VARCHAR(20),
    Fornecedor_Email VARCHAR(100),
    Fornecedor_Endereco TEXT,
    Fornecedor_Ativo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- TABELA DE PRODUTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS Produto (
    Produto_ID INT AUTO_INCREMENT PRIMARY KEY,
    Produto_Codigo VARCHAR(20) UNIQUE NOT NULL,
    Produto_Nome VARCHAR(100) NOT NULL,
    Produto_Descricao TEXT,
    Produto_Preco DECIMAL(10,2) NOT NULL,
    Produto_PrecoCusto DECIMAL(10,2),
    Produto_Estoque INT DEFAULT 0,
    Produto_EstoqueMinimo INT DEFAULT 0,
    Produto_Categoria_ID INT,
    Produto_Fornecedor_ID INT,
    Produto_Ativo BOOLEAN DEFAULT TRUE,
    Produto_DataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Produto_Categoria_ID) REFERENCES Categoria(Categoria_ID),
    FOREIGN KEY (Produto_Fornecedor_ID) REFERENCES Fornecedor(Fornecedor_ID)
);

-- =====================================================
-- TABELA DE VENDAS
-- =====================================================
CREATE TABLE IF NOT EXISTS Venda (
    Venda_ID INT AUTO_INCREMENT PRIMARY KEY,
    Venda_Numero VARCHAR(20) UNIQUE NOT NULL,
    Venda_Data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Venda_Cliente_ID INT,
    Venda_Usuario_ID INT,
    Venda_Subtotal DECIMAL(10,2) NOT NULL,
    Venda_Desconto DECIMAL(10,2) DEFAULT 0,
    Venda_Total DECIMAL(10,2) NOT NULL,
    Venda_FormaPagamento ENUM('dinheiro', 'cartao', 'pix', 'boleto') NOT NULL,
    Venda_Status ENUM('pendente', 'concluida', 'cancelada') DEFAULT 'pendente',
    Venda_Observacoes TEXT,
    FOREIGN KEY (Venda_Cliente_ID) REFERENCES Cliente(Cliente_ID),
    FOREIGN KEY (Venda_Usuario_ID) REFERENCES Usuario(Usuario_ID)
);

-- =====================================================
-- TABELA DE ITENS DA VENDA
-- =====================================================
CREATE TABLE IF NOT EXISTS VendaItem (
    VendaItem_ID INT AUTO_INCREMENT PRIMARY KEY,
    VendaItem_Venda_ID INT NOT NULL,
    VendaItem_Produto_ID INT NOT NULL,
    VendaItem_Quantidade DECIMAL(5,4) NOT NULL,
    VendaItem_PrecoUnitario DECIMAL(10,2) NOT NULL,
    VendaItem_Subtotal DECIMAL(10,2) NOT NULL,
    VendaItem_Desconto DECIMAL(10,2) DEFAULT 0,
    VendaItem_Total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (VendaItem_Venda_ID) REFERENCES Venda(Venda_ID),
    FOREIGN KEY (VendaItem_Produto_ID) REFERENCES Produto(Produto_ID)
);

-- =====================================================
-- TABELA DE MOVIMENTAÇÃO DE ESTOQUE
-- =====================================================
CREATE TABLE IF NOT EXISTS EstoqueMovimento (
    EstoqueMovimento_ID INT AUTO_INCREMENT PRIMARY KEY,
    EstoqueMovimento_Produto_ID INT NOT NULL,
    EstoqueMovimento_Tipo ENUM('entrada', 'saida', 'ajuste') NOT NULL,
    EstoqueMovimento_Quantidade INT NOT NULL,
    EstoqueMovimento_Data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EstoqueMovimento_Observacoes TEXT,
    EstoqueMovimento_Usuario_ID INT,
    FOREIGN KEY (EstoqueMovimento_Produto_ID) REFERENCES Produto(Produto_ID),
    FOREIGN KEY (EstoqueMovimento_Usuario_ID) REFERENCES Usuario(Usuario_ID)
);

-- =====================================================
-- TABELA DE CONFIGURAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS Configuracao (
    Configuracao_ID INT AUTO_INCREMENT PRIMARY KEY,
    Configuracao_Chave VARCHAR(50) UNIQUE NOT NULL,
    Configuracao_Valor TEXT,
    Configuracao_Descricao TEXT,
    Configuracao_DataAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE CONTATOS (FALE CONOSCO)
-- =====================================================
CREATE TABLE IF NOT EXISTS Contato (
    Contato_ID INT AUTO_INCREMENT PRIMARY KEY,
    Contato_Nome VARCHAR(100) NOT NULL,
    Contato_Email VARCHAR(100) NOT NULL,
    Contato_Telefone VARCHAR(20),
    Contato_Tipo ENUM('sugestao', 'duvida', 'problema', 'elogio', 'outro') NOT NULL,
    Contato_Mensagem TEXT NOT NULL,
    Contato_DataEnvio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Contato_Status ENUM('novo', 'em_analise', 'respondido', 'fechado') DEFAULT 'novo'
);

-- =====================================================
-- INSERÇÃO DE DADOS INICIAIS
-- =====================================================

-- Inserir usuário administrador padrão
INSERT INTO Usuario (Usuario_Nome, Usuario_Email, Usuario_Senha, Usuario_Tipo) VALUES
('Administrador', 'admin@pdv.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6u', 'admin');

-- Inserir categorias padrão
INSERT INTO Categoria (Categoria_Nome, Categoria_Descricao) VALUES
('Eletrônicos', 'Produtos eletrônicos em geral'),
('Informática', 'Produtos de informática'),
('Acessórios', 'Acessórios diversos'),
('Vestuário', 'Roupas e acessórios de vestuário'),
('Alimentos', 'Produtos alimentícios');

-- Inserir fornecedores padrão
INSERT INTO Fornecedor (Fornecedor_Nome, Fornecedor_CNPJ, Fornecedor_Telefone, Fornecedor_Email) VALUES
('Fornecedor A', '12.345.678/0001-90', '(11) 99999-9999', 'contato@fornecedora.com'),
('Fornecedor B', '98.765.432/0001-10', '(11) 88888-8888', 'contato@fornecedorb.com'),
('Fornecedor C', '11.222.333/0001-44', '(11) 77777-7777', 'contato@fornecedorc.com');

-- Inserir produtos de exemplo
INSERT INTO Produto (Produto_Codigo, Produto_Nome, Produto_Descricao, Produto_Preco, Produto_PrecoCusto, Produto_Estoque, Produto_Categoria_ID, Produto_Fornecedor_ID) VALUES
('PROD001', 'Produto A', 'Descrição do produto A', 25.50, 15.00, 100, 1, 1),
('PROD002', 'Produto B', 'Descrição do produto B', 15.75, 10.00, 50, 2, 2),
('PROD003', 'Produto C', 'Descrição do produto C', 45.00, 30.00, 25, 3, 3);

-- Inserir clientes de exemplo
INSERT INTO Cliente (Cliente_Nome, Cliente_Email, Cliente_Telefone, Cliente_CPF, Cliente_Endereco, Cliente_Cidade, Cliente_Estado) VALUES
('João Silva', 'joao@email.com', '(11) 99999-9999', '123.456.789-00', 'Rua das Flores, 123', 'São Paulo', 'SP'),
('Maria Santos', 'maria@email.com', '(11) 88888-8888', '987.654.321-00', 'Av. Paulista, 456', 'São Paulo', 'SP'),
('Pedro Costa', 'pedro@email.com', '(11) 77777-7777', '456.789.123-00', 'Rua Augusta, 789', 'São Paulo', 'SP');

-- Inserir configurações padrão
INSERT INTO Configuracao (Configuracao_Chave, Configuracao_Valor, Configuracao_Descricao) VALUES
('empresa_nome', 'Minha Empresa', 'Nome da empresa'),
('empresa_cnpj', '12.345.678/0001-90', 'CNPJ da empresa'),
('empresa_endereco', 'Rua da Empresa, 123', 'Endereço da empresa'),
('empresa_telefone', '(11) 1234-5678', 'Telefone da empresa'),
('empresa_email', 'contato@empresa.com', 'Email da empresa'),
('pdv_versao', '1.0.0', 'Versão do sistema PDV');

-- =====================================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================

-- Índices para tabela Produto
CREATE INDEX idx_produto_codigo ON Produto(Produto_Codigo);
CREATE INDEX idx_produto_nome ON Produto(Produto_Nome);
CREATE INDEX idx_produto_categoria ON Produto(Produto_Categoria_ID);
CREATE INDEX idx_produto_ativo ON Produto(Produto_Ativo);

-- Índices para tabela Cliente
CREATE INDEX idx_cliente_nome ON Cliente(Cliente_Nome);
CREATE INDEX idx_cliente_cpf ON Cliente(Cliente_CPF);
CREATE INDEX idx_cliente_ativo ON Cliente(Cliente_Ativo);

-- Índices para tabela Venda
CREATE INDEX idx_venda_data ON Venda(Venda_Data);
CREATE INDEX idx_venda_cliente ON Venda(Venda_Cliente_ID);
CREATE INDEX idx_venda_usuario ON Venda(Venda_Usuario_ID);
CREATE INDEX idx_venda_status ON Venda(Venda_Status);

-- Índices para tabela VendaItem
CREATE INDEX idx_vendaitem_venda ON VendaItem(VendaItem_Venda_ID);
CREATE INDEX idx_vendaitem_produto ON VendaItem(VendaItem_Produto_ID);

-- Índices para tabela EstoqueMovimento
CREATE INDEX idx_estoquemovimento_produto ON EstoqueMovimento(EstoqueMovimento_Produto_ID);
CREATE INDEX idx_estoquemovimento_data ON EstoqueMovimento(EstoqueMovimento_Data);

-- =====================================================
-- FIM DO SCRIPT
-- ===================================================== 