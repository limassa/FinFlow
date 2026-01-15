-- Script para adicionar coluna de lembretes WhatsApp na tabela Usuario
-- Execute este script no banco de dados PostgreSQL

ALTER TABLE Usuario 
ADD COLUMN IF NOT EXISTS Usuario_LembretesWhatsApp BOOLEAN DEFAULT FALSE;

-- Comentário na coluna
COMMENT ON COLUMN Usuario.Usuario_LembretesWhatsApp IS 'Ativa/desativa lembretes por WhatsApp';

