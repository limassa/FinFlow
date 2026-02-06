// Script para testar login
const userRepository = require('../src/database/userRepository');

async function testarLogin() {
  console.log('🔍 Testando login...\n');
  
  // Testar com usuário de teste
  const email = 'teste@finflow.com';
  const senha = '123456';
  
  console.log(`📋 Tentando fazer login com:`);
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${senha}\n`);
  
  try {
    const user = await userRepository.loginUser(email, senha);
    
    if (user) {
      console.log('✅ Login bem-sucedido!');
      console.log('📊 Dados do usuário:');
      console.log(`   ID: ${user.usuario_id || user.Usuario_Id}`);
      console.log(`   Nome: ${user.usuario_nome || user.Usuario_Nome}`);
      console.log(`   Email: ${user.usuario_email || user.Usuario_Email}\n`);
    } else {
      console.log('❌ Login falhou - usuário não encontrado ou senha incorreta\n');
      
      // Verificar se o usuário existe
      console.log('🔍 Verificando se o usuário existe...');
      const userByEmail = await userRepository.findUserByEmail(email);
      if (userByEmail) {
        console.log('✅ Usuário encontrado no banco');
        console.log(`   Email: ${userByEmail.usuario_email || userByEmail.Usuario_Email}`);
        console.log(`   Nome: ${userByEmail.usuario_nome || userByEmail.Usuario_Nome}`);
        console.log('⚠️  Problema pode ser com a senha\n');
      } else {
        console.log('❌ Usuário não encontrado no banco\n');
        console.log('💡 Execute: node scripts/criar-usuario-teste.js\n');
      }
    }
  } catch (err) {
    console.error('❌ Erro ao testar login:', err.message);
    if (err.code === '42P01') {
      console.error('   💡 Tabela não existe. Execute: node scripts/criar-tabelas-finflow-completo.js');
    }
  }
  
  process.exit(0);
}

testarLogin().catch(console.error);

