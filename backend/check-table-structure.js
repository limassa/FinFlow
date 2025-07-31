// Script para verificar estrutura da tabela
require('dotenv').config();

const { Pool } = require('pg');

console.log('🔍 Verificando estrutura da tabela Usuario...');

// URL do banco de dados do Railway
const DATABASE_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTableStructure() {
  try {
    console.log('🔄 Conectando ao banco...');
    
    // Verificar estrutura da tabela
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'usuario' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estrutura da tabela Usuario:');
    structureResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar se há dados
    const countResult = await pool.query('SELECT COUNT(*) as count FROM Usuario');
    console.log(`📊 Número de usuários: ${countResult.rows[0].count}`);
    
    if (countResult.rows[0].count > 0) {
      const usersResult = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario LIMIT 3');
      console.log('👥 Usuários existentes:');
      usersResult.rows.forEach(user => {
        console.log(`  - ${user.usuario_nome} (${user.usuario_email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure(); 