// Script para criar usuário de teste
require('dotenv').config();

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

console.log('👤 Criando usuário de teste...');

// URL do banco de dados do Railway
const DATABASE_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTestUser() {
  try {
    console.log('🔄 Conectando ao banco...');
    
    // Verificar se o usuário já existe
    const existingUser = await pool.query(
      'SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario WHERE Usuario_Email = $1',
      ['teste@teste.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Usuário já existe:', existingUser.rows[0]);
      
      // Atualizar a senha para garantir que está correta
      const saltRounds = 10;
      const senhaCriptografada = await bcrypt.hash('12345678', saltRounds);
      
      await pool.query(
        'UPDATE Usuario SET Usuario_Senha = $1 WHERE Usuario_Email = $2',
        [senhaCriptografada, 'teste@teste.com']
      );
      
      console.log('✅ Senha atualizada para o usuário teste@teste.com');
    } else {
      // Criar novo usuário
      const saltRounds = 10;
      const senhaCriptografada = await bcrypt.hash('12345678', saltRounds);
      
      const result = await pool.query(
        'INSERT INTO Usuario (Usuario_Email, Usuario_Senha, Usuario_Nome, Usuario_Ativo) VALUES ($1, $2, $3, $4) RETURNING Usuario_Id, Usuario_Email, Usuario_Nome',
        ['teste@teste.com', senhaCriptografada, 'Usuário Teste', true]
      );
      
      console.log('✅ Usuário criado:', result.rows[0]);
    }
    
    // Verificar todos os usuários
    const allUsers = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario');
    console.log('\n👥 Todos os usuários:');
    allUsers.rows.forEach(user => {
      console.log(`  - ${user.usuario_nome} (${user.usuario_email})`);
    });
    
    console.log('\n🎉 Usuário de teste configurado!');
    console.log('📧 Email: teste@teste.com');
    console.log('🔑 Senha: 12345678');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUser(); 