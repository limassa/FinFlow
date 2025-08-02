-- Script de Reestruturação do Banco de Dados
-- Renomear tabelas e colunas para nomenclatura mais limpa

-- 1. Renomear tabelas
ALTER TABLE receita_transacao RENAME TO receita;
ALTER TABLE despesa_transacao RENAME TO despesa;

-- 2. Renomear colunas da tabela receita
ALTER TABLE receita RENAME COLUMN descricao TO receita_descricao;
ALTER TABLE receita RENAME COLUMN valor TO receita_valor;
ALTER TABLE receita RENAME COLUMN date TO receita_data;
ALTER TABLE receita RENAME COLUMN tipo TO receita_tipo;
ALTER TABLE receita RENAME COLUMN usuario_id TO user_id;
ALTER TABLE receita RENAME COLUMN conta_id TO conta_id; -- Manter como está (chave estrangeira)

-- 3. Renomear colunas da tabela despesa
ALTER TABLE despesa RENAME COLUMN descricao TO despesa_descricao;
ALTER TABLE despesa RENAME COLUMN valor TO despesa_valor;
ALTER TABLE despesa RENAME COLUMN date TO despesa_data;
ALTER TABLE despesa RENAME COLUMN despesa_dtVencimento TO despesa_datavencimento;
ALTER TABLE despesa RENAME COLUMN tipo TO despesa_tipo;
ALTER TABLE despesa RENAME COLUMN despesa_pago TO despesa_pago; -- Manter como está
ALTER TABLE despesa RENAME COLUMN usuario_id TO user_id;
ALTER TABLE despesa RENAME COLUMN conta_id TO conta_id; -- Manter como está (chave estrangeira)

-- 4. Renomear colunas da tabela users (se necessário)
-- ALTER TABLE users RENAME COLUMN full_name TO user_nome;
-- ALTER TABLE users RENAME COLUMN password_hash TO user_senha;
-- ALTER TABLE users RENAME COLUMN telefone TO user_telefone;

-- 5. Renomear colunas da tabela contas
ALTER TABLE contas RENAME COLUMN nome TO conta_nome;
ALTER TABLE contas RENAME COLUMN tipo TO conta_tipo;
ALTER TABLE contas RENAME COLUMN saldo TO conta_saldo;
ALTER TABLE contas RENAME COLUMN usuario_id TO user_id;

-- 6. Atualizar constraints de chave estrangeira (se necessário)
-- As constraints serão mantidas automaticamente pelo PostgreSQL

-- 7. Verificar a estrutura final das tabelas
-- \d receita
-- \d despesa
-- \d users
-- \d contas 