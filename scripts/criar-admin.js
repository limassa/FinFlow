const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuração do banco (mesma do connection.js)
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP'}@${process.env.DB_HOST || 'interchange.proxy.rlwy.net'}:${process.env.DB_PORT || '50880'}/${process.env.DB_NAME || 'railway'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function criarUsuarioAdmin() {
  try {
    console.log('🔍 Criando usuário admin...');
    
    // Verificar se já existe
    const checkResult = await pool.query('SELECT Usuario_ID FROM Usuario WHERE Usuario_Email = $1', ['admin@pdv.com']);
    
    if (checkResult.rows.length > 0) {
      console.log('⚠️ Usuário admin já existe');
      return false;
    }
    
    // Criar senha criptografada
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash('admin123', saltRounds);
    
    // Inserir usuário admin
    const result = await pool.query(`
      INSERT INTO Usuario (Usuario_Nome, Usuario_Email, Usuario_Senha, Usuario_Tipo, Usuario_Ativo) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING Usuario_ID, Usuario_Email, Usuario_Nome
    `, ['Administrador', 'admin@pdv.com', senhaCriptografada, 'admin', true]);
    
    console.log('✅ Usuário admin criado com sucesso:', result.rows[0]);
    console.log('');
    console.log('🔑 CREDENCIAIS:');
    console.log('   Email: admin@pdv.com');
    console.log('   Senha: admin123');
    console.log('');
    console.log('🎯 Agora você pode fazer login no sistema!');
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro ao criar usuário admin:', err.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Executar
criarUsuarioAdmin().catch(console.error); 