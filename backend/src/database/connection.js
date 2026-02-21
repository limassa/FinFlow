// Carregar variáveis de ambiente com caminho absoluto
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  const configPath = path.join(__dirname, '..', '..', 'config.env');
  console.log('📄 Carregando config.env de:', configPath);
  require('dotenv').config({ path: configPath });
}

const { Pool } = require('pg');

// Log de conexão para debug
const ambiente = process.env.NODE_ENV || 'development';
console.log(`🔌 Configuração do banco de dados - AMBIENTE ${ambiente.toUpperCase()}:`);
console.log('  USE_LOCAL_DB:', process.env.USE_LOCAL_DB);
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Porta:', process.env.DB_PORT || 5433);
console.log('  Database:', process.env.DB_NAME || 'FinFlowTeste');
console.log('  NODE_ENV:', process.env.NODE_ENV);

// Configuração para ambiente de TESTE (Local)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro na conexão com o banco:', err.message);
  } else {
    console.log('✅ Conexão com o banco estabelecida:', res.rows[0].now);
  }
});

module.exports = pool;