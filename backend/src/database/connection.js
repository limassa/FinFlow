const { Pool } = require('pg');

// Configuração simplificada para Railway
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Log de conexão para debug
console.log('🔌 Configuração do banco de dados:');
console.log('  URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@')); // Oculta a senha
console.log('  SSL: enabled');

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro na conexão com o banco:', err.message);
  } else {
    console.log('✅ Conexão com o banco estabelecida:', res.rows[0].now);
  }
});

module.exports = pool;