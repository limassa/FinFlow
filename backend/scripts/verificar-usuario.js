const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function verificar() {
  console.log('🔍 Verificando usuário de teste...\n');
  
  try {
    const result = await pool.query(
      'SELECT usuario_id, usuario_email, usuario_nome, usuario_senha, usuario_ativo FROM usuario WHERE usuario_email = $1',
      ['teste@teste.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado!');
    } else {
      const user = result.rows[0];
      console.log('✅ Usuário encontrado:');
      console.log('   ID:', user.usuario_id);
      console.log('   Email:', user.usuario_email);
      console.log('   Nome:', user.usuario_nome);
      console.log('   Ativo:', user.usuario_ativo);
      console.log('   Senha (hash):', user.usuario_senha ? user.usuario_senha.substring(0, 20) + '...' : 'NULL');
      
      // Testar comparação de senha
      const bcrypt = require('bcrypt');
      const senhaCorreta = await bcrypt.compare('123456', user.usuario_senha);
      console.log('\n🔑 Teste de senha "123456":', senhaCorreta ? '✅ CORRETA' : '❌ INCORRETA');
      
      if (!senhaCorreta) {
        // Tentar com bcryptjs
        const bcryptjs = require('bcryptjs');
        const senhaCorretaJs = await bcryptjs.compare('123456', user.usuario_senha);
        console.log('🔑 Teste com bcryptjs:', senhaCorretaJs ? '✅ CORRETA' : '❌ INCORRETA');
      }
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

verificar();
