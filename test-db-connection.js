// Script para testar conexão com banco de dados
require('dotenv').config();

const { Pool } = require('pg');

console.log('🔍 Testando conexão com banco de dados...');
console.log('📋 Variáveis de ambiente:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'FinFlowTeste',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5433,
  ...(isProduction && {
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  })
});

async function testConnection() {
  try {
    console.log('🔄 Tentando conectar...');
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Conexão bem-sucedida!');
    console.log('  Hora atual:', result.rows[0].current_time);
    console.log('  Versão do PostgreSQL:', result.rows[0].db_version.split(' ')[0]);
    
    // Testar se a tabela Usuario existe
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuario'
      );
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('✅ Tabela Usuario encontrada');
      
      // Contar usuários
      const userCount = await pool.query('SELECT COUNT(*) as count FROM Usuario');
      console.log('  Número de usuários:', userCount.rows[0].count);
    } else {
      console.log('❌ Tabela Usuario não encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('  Código:', error.code);
    console.error('  Detalhes:', error.detail);
  } finally {
    await pool.end();
  }
}

testConnection(); 