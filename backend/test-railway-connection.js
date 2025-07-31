// Script para testar conexão com o banco no Railway
require('dotenv').config();

const { Pool } = require('pg');

console.log('🔍 Testando conexão com o banco no Railway...');

// URL do banco de dados do Railway
const DATABASE_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔄 Conectando ao banco...');
    
    // Testar conexão básica
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexão estabelecida:', testResult.rows[0].current_time);
    
    // Verificar usuários
    const usersResult = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario');
    console.log('\n👥 Usuários encontrados:', usersResult.rows.length);
    usersResult.rows.forEach(user => {
      console.log(`  - ${user.usuario_nome} (${user.usuario_email})`);
    });
    
    // Testar login específico
    const loginResult = await pool.query(
      'SELECT Usuario_Id, Usuario_Email, Usuario_Nome, Usuario_Senha FROM Usuario WHERE Usuario_Email = $1',
      ['teste@teste.com']
    );
    
    if (loginResult.rows.length > 0) {
      const user = loginResult.rows[0];
      console.log('\n🔍 Usuário encontrado:');
      console.log(`  - ID: ${user.usuario_id}`);
      console.log(`  - Email: ${user.usuario_email}`);
      console.log(`  - Nome: ${user.usuario_nome}`);
      console.log(`  - Senha criptografada: ${user.usuario_senha.substring(0, 20)}...`);
      
      // Testar bcrypt
      const bcrypt = require('bcrypt');
      const senhaValida = await bcrypt.compare('12345678', user.usuario_senha);
      console.log(`  - Senha válida: ${senhaValida}`);
    } else {
      console.log('\n❌ Usuário teste@teste.com não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection(); 