-- Script para remover campos não utilizados das tabelas
-- Execute com cuidado e faça backup antes

-- 1. Remover campos não utilizados da tabela usuario
ALTER TABLE usuario DROP COLUMN IF EXISTS usuario_resettoken;
ALTER TABLE usuario DROP COLUMN IF EXISTS usuario_resetexpiry;
ALTER TABLE usuario DROP COLUMN IF EXISTS usuario_ativo;

-- 2. Remover campos não utilizados da tabela receita
ALTER TABLE receita DROP COLUMN IF EXISTS receita_dtdelete;
ALTER TABLE receita DROP COLUMN IF EXISTS receita_usuariodelete;
ALTER TABLE receita DROP COLUMN IF EXISTS receita_datainiciorecorrencia;
ALTER TABLE receita DROP COLUMN IF EXISTS receita_datafimrecorrencia;
ALTER TABLE receita DROP COLUMN IF EXISTS receita_observacoes;

-- 3. Remover campos não utilizados da tabela despesa
ALTER TABLE despesa DROP COLUMN IF EXISTS despesa_dtdelete;
ALTER TABLE despesa DROP COLUMN IF EXISTS despesa_usuariodelete;
ALTER TABLE despesa DROP COLUMN IF EXISTS despesa_datainiciorecorrencia;
ALTER TABLE despesa DROP COLUMN IF EXISTS despesa_datafimrecorrencia;
ALTER TABLE despesa DROP COLUMN IF EXISTS despesa_datavencimento; -- Campo duplicado
ALTER TABLE despesa DROP COLUMN IF EXISTS despesa_observacoes;

-- 4. Remover campos não utilizados da tabela conta
ALTER TABLE conta DROP COLUMN IF EXISTS conta_dtdelete;

-- 5. Verificar se há campos de data duplicados
-- O campo despesa_datavencimento parece estar duplicado com despesa_dtvencimento
-- Verificar qual está sendo usado no código

-- 6. Adicionar comentários sobre as mudanças
COMMENT ON TABLE usuario IS 'Tabela de usuários - campos de reset removidos';
COMMENT ON TABLE receita IS 'Tabela de receitas - campos de delete e observações removidos';
COMMENT ON TABLE despesa IS 'Tabela de despesas - campos de delete e observações removidos';
COMMENT ON TABLE conta IS 'Tabela de contas - campo de delete removido';

-- 7. Verificar estrutura final
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('usuario', 'receita', 'despesa', 'conta')
ORDER BY table_name, ordinal_position; 