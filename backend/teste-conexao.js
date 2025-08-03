// Carregar variáveis de ambiente
require('dotenv').config({ path: './config.env' });
require('dotenv').config();

const { Pool } = require('pg');

console.log('🔍 Testando conexão com banco...');
console.log('📋 Configuração:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_USER:', process.env.DB_USER);

async function testarConexao() {
  try {
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5433,
      database: process.env.DB_NAME || 'FinFlowTeste',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'admin'
    });

    const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    
    console.log('\n✅ Conexão estabelecida!');
    console.log('  Hora atual:', result.rows[0].current_time);
    console.log('  Database:', result.rows[0].db_name);
    
    // Verificar se é o banco local ou Railway
    const dbName = result.rows[0].db_name;
    if (dbName === 'FinFlowTeste') {
      console.log('🎯 Banco: LOCAL (FinFlowTeste) ✅');
    } else if (dbName === 'railway') {
      console.log('🎯 Banco: RAILWAY ⚠️');
    } else {
      console.log('🎯 Banco: DESCONHECIDO -', dbName);
    }

    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testarConexao(); 