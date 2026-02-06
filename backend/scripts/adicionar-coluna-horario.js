// Script para adicionar coluna de horário de lembretes na tabela Usuario
// Execute: node backend/scripts/adicionar-coluna-horario.js

require('dotenv').config({ path: './config.env' });
const pool = require('../src/database/connection');

async function adicionarColunaHorario() {
  try {
    console.log('🔧 Verificando se a coluna Usuario_LembretesHorario existe...');
    
    // Verificar se a coluna já existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuario' 
      AND column_name = 'usuario_lembreteshorario'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Coluna Usuario_LembretesHorario já existe!');
      return;
    }
    
    console.log('📝 Adicionando coluna Usuario_LembretesHorario...');
    
    // Adicionar a coluna
    await pool.query(`
      ALTER TABLE Usuario 
      ADD COLUMN Usuario_LembretesHorario VARCHAR(5) DEFAULT '18:15'
    `);
    
    console.log('✅ Coluna Usuario_LembretesHorario adicionada com sucesso!');
    
    // Adicionar comentário (opcional)
    try {
      await pool.query(`
        COMMENT ON COLUMN Usuario.Usuario_LembretesHorario IS 'Horário dos lembretes (formato HH:MM)'
      `);
      console.log('✅ Comentário adicionado na coluna');
    } catch (err) {
      // Ignorar erro se não conseguir adicionar comentário
      console.log('⚠️ Não foi possível adicionar comentário (pode ser ignorado)');
    }
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

adicionarColunaHorario();

