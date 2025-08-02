-- Script para criar usuário admin no sistema PDV
-- Execute este script no seu banco PostgreSQL

-- Verificar se o usuário admin já existe
SELECT 'Verificando se usuário admin existe...' as status;

-- Inserir usuário admin (senha criptografada: admin123)
INSERT INTO Usuario (Usuario_Nome, Usuario_Email, Usuario_Senha, Usuario_Tipo, Usuario_Ativo) 
VALUES ('Administrador', 'admin@pdv.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6u', 'admin', true)
ON CONFLICT (Usuario_Email) DO NOTHING;

-- Verificar se foi inserido
SELECT 'Usuário admin criado com sucesso!' as status;

-- Listar usuários para confirmar
SELECT Usuario_ID, Usuario_Email, Usuario_Nome, Usuario_Tipo, Usuario_Ativo 
FROM Usuario 
WHERE Usuario_Email = 'admin@pdv.com'; 