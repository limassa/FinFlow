// Script para criar usuário de teste
require('dotenv').config();

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

console.log('🔍 Criando usuário de teste...');

// URL do banco de dados do Railway
const DATABASE_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTestUser() {
  try {
    console.log('🔄 Conectando ao banco...');
    
    // Dados do usuário de teste
    const testUser = {
      nome: 'Usuário Teste',
      email: 'teste@teste.com',
      senha: '12345678'
    };
    
    // Criptografar senha
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(testUser.senha, saltRounds);
    
    // Verificar se usuário já existe
    const existingUser = await pool.query(
      'SELECT Usuario_Id FROM Usuario WHERE Usuario_Email = $1',
      [testUser.email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Usuário já existe, atualizando...');
      await pool.query(
        'UPDATE Usuario SET Usuario_Senha = $1, Usuario_Nome = $2 WHERE Usuario_Email = $3',
        [senhaCriptografada, testUser.nome, testUser.email]
      );
    } else {
      console.log('➕ Criando novo usuário...');
      await pool.query(
        'INSERT INTO Usuario (Usuario_Email, Usuario_Senha, Usuario_Nome) VALUES ($1, $2, $3)',
        [testUser.email, senhaCriptografada, testUser.nome]
      );
    }
    
    console.log('✅ Usuário de teste criado/atualizado com sucesso!');
    console.log('📋 Credenciais de teste:');
    console.log('  Email: teste@teste.com');
    console.log('  Senha: 12345678');
    
    // Verificar se foi criado
    const user = await pool.query(
      'SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario WHERE Usuario_Email = $1',
      [testUser.email]
    );
    
    if (user.rows.length > 0) {
      console.log('✅ Usuário encontrado no banco:');
      console.log('  ID:', user.rows[0].usuario_id);
      console.log('  Nome:', user.rows[0].usuario_nome);
      console.log('  Email:', user.rows[0].usuario_email);
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUser(); 