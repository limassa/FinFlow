const { Pool } = require('pg');

// Configuração baseada no ambiente
const isProduction = process.env.NODE_ENV === 'production';

// URL do banco de dados do Railway
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
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
console.log('  Ambiente:', isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
console.log('  URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@')); // Oculta a senha
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