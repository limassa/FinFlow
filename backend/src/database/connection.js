const { Pool } = require('pg');

// Configuração para Railway com fallback para variáveis individuais
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP'}@${process.env.DB_HOST || 'interchange.proxy.rlwy.net'}:${process.env.DB_PORT || '50880'}/${process.env.DB_NAME || 'railway'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Log de conexão para debug
console.log('🔌 Configuração do banco de dados - AMBIENTE PRODUÇÃO:');
console.log('  URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@')); // Oculta a senha
console.log('  SSL: enabled');
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