const { Pool } = require('pg');

// Configuração baseada no ambiente
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'FinFlowTeste',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5433,
  // Configurações específicas para produção
  ...(isProduction && {
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  })
});

// Log de conexão para debug
console.log('🔌 Configuração do banco de dados:');
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Database:', process.env.DB_NAME || 'FinFlowTeste');
console.log('  User:', process.env.DB_USER || 'postgres');
console.log('  Port:', process.env.DB_PORT || 5433);
console.log('  SSL:', isProduction ? 'enabled' : 'disabled');

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro na conexão com o banco:', err.message);
  } else {
    console.log('✅ Conexão com o banco estabelecida:', res.rows[0].now);
  }
});

module.exports = pool;