-- Script para preparar a tabela de usuários para criptografia de senhas
-- Execute este script apenas se necessário

-- Verificar se a coluna Usuario_Senha existe e tem tamanho adequado
-- Para senhas criptografadas com bcrypt, precisamos de pelo menos 60 caracteres

-- Alterar o tamanho da coluna Usuario_Senha para acomodar senhas criptografadas
ALTER TABLE Usuario ALTER COLUMN Usuario_Senha TYPE VARCHAR(255);

-- Adicionar comentário na coluna para documentar
COMMENT ON COLUMN Usuario.Usuario_Senha IS 'Senha criptografada com bcrypt (hash + salt)';

-- Verificar a estrutura atual da tabela
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuario' 
AND column_name = 'usuario_senha';

-- Exemplo de como uma senha criptografada se parece:
-- $2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxq6Hy
-- Onde:
-- $2b$ = versão do bcrypt
-- 10 = número de rounds (salt rounds)
-- LQv3c1yqBWVHxkd0LHAkCO = salt (22 caracteres)
-- Yz6TtxMQJqhN8/LewdBPj3ZxQQxq6Hy = hash da senha (31 caracteres)
-- Total: 60 caracteres

-- Verificar usuários existentes (apenas para debug, remover em produção)
-- SELECT Usuario_Id, Usuario_Email, LEFT(Usuario_Senha, 10) || '...' as Senha_Preview 
-- FROM Usuario; 