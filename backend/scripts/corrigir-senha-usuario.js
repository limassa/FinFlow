const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function corrigirSenha() {
  console.log('🔧 Corrigindo senha do usuário de teste...\n');
  
  try {
    // Gerar hash correto para "123456"
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash('123456', saltRounds);
    
    console.log('🔑 Novo hash gerado:', senhaHash.substring(0, 30) + '...');
    
    // Atualizar no banco
    await pool.query(
      'UPDATE usuario SET usuario_senha = $1 WHERE usuario_email = $2',
      [senhaHash, 'teste@teste.com']
    );
    
    console.log('✅ Senha atualizada com sucesso!\n');
    
    // Verificar
    const result = await pool.query(
      'SELECT usuario_senha FROM usuario WHERE usuario_email = $1',
      ['teste@teste.com']
    );
    
    const novaSenha = result.rows[0].usuario_senha;
    const verificacao = await bcrypt.compare('123456', novaSenha);
    
    console.log('🔍 Verificação da nova senha:', verificacao ? '✅ CORRETA' : '❌ INCORRETA');
    console.log('\n📧 Login de teste:');
    console.log('   Email: teste@teste.com');
    console.log('   Senha: 123456');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

corrigirSenha();
