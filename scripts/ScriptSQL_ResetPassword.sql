-- Script para adicionar campos de redefinição de senha na tabela Usuario
-- Execute este script no seu banco de dados PostgreSQL

-- Adicionar campos para redefinição de senha
ALTER TABLE Usuario 
ADD COLUMN IF NOT EXISTS Usuario_ResetToken VARCHAR(255),
ADD COLUMN IF NOT EXISTS Usuario_ResetExpiry TIMESTAMP;

-- Criar índice para melhor performance nas consultas de token
CREATE INDEX IF NOT EXISTS idx_usuario_reset_token ON Usuario(Usuario_ResetToken);

-- Comentários para documentação
COMMENT ON COLUMN Usuario.Usuario_ResetToken IS 'Token para redefinição de senha';
COMMENT ON COLUMN Usuario.Usuario_ResetExpiry IS 'Data de expiração do token de redefinição';

-- Verificar se os campos foram adicionados corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuario' 
AND column_name IN ('usuario_resettoken', 'usuario_resetexpiry'); 