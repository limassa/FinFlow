const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testarAPI() {
  console.log('🚀 Testando API do sistema PDV...\n');
  
  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('🔍 Testando conexão com o servidor...');
    const response = await axios.get(`${API_BASE_URL}/api/test`);
    console.log('✅ Servidor está rodando:', response.data);
    
    // Teste 2: Verificar usuários
    console.log('\n🔍 Testando busca de usuários...');
    const usersResponse = await axios.get(`${API_BASE_URL}/api/users`);
    console.log('✅ Usuários encontrados:', usersResponse.data.length);
    usersResponse.data.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.usuario_id}, Email: ${user.usuario_email}, Nome: ${user.usuario_nome}`);
    });
    
    // Teste 3: Testar login
    console.log('\n🔍 Testando login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/login`, {
      email: 'admin@pdv.com',
      senha: 'admin123'
    });
    console.log('✅ Login bem-sucedido:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response ? error.response.data : error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUÇÃO:');
      console.log('1. Certifique-se de que o backend está rodando:');
      console.log('   cd backend && npm start');
      console.log('2. Verifique se a porta 3001 está livre');
      console.log('3. Execute o script SQL para criar o banco de dados');
    }
  }
}

testarAPI(); 