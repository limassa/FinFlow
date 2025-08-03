// Carregar variáveis de ambiente
require('dotenv').config({ path: './config.env' });
require('dotenv').config();

const { Pool } = require('pg');

// Configuração para ambiente de TESTE (Local)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

// Log de conexão para debug
console.log('🔌 Configuração do banco de dados - AMBIENTE TESTE:');
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Porta:', process.env.DB_PORT || 5433);
console.log('  Database:', process.env.DB_NAME || 'FinFlowTeste');
console.log('  NODE_ENV:', process.env.NODE_ENV);

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro na conexão com o banco:', err.message);
  } else {
    console.log('✅ Conexão com o banco estabelecida:', res.rows[0].now);
  }
});

module.exports = pool;