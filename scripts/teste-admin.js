const axios = require('axios');

console.log('🔐 Testando Login Admin - FinFlow\n');

const API_BASE_URL = 'http://localhost:3001';

async function testarLoginAdmin() {
  try {
    console.log('📋 Testando login com admin@gmail.com...');
    
    const response = await axios.post(`${API_BASE_URL}/api/login`, {
      email: 'admin@gmail.com',
      senha: 'admin123'
    });

    console.log('✅ Login bem-sucedido!');
    console.log('📊 Dados do usuário:');
    console.log('  ID:', response.data.id);
    console.log('  Nome:', response.data.nome);
    console.log('  Email:', response.data.email);
    console.log('  Token:', response.data.token ? 'Presente' : 'Ausente');

    return response.data;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Possíveis soluções:');
      console.log('1. Verificar se o backend está rodando');
      console.log('2. Verificar se o banco de dados está configurado');
      console.log('3. Verificar se o usuário admin existe');
    }
    
    return null;
  }
}

async function testarConexaoAPI() {
  try {
    console.log('\n🔌 Testando conexão com a API...');
    
    const response = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ API respondendo:', response.data);
    
    return true;
  } catch (error) {
    console.error('❌ API não está respondendo:', error.message);
    console.log('\n💡 Verifique se o backend está rodando:');
    console.log('  npm run backend');
    
    return false;
  }
}

async function testarReceitas() {
  try {
    console.log('\n💰 Testando endpoint de receitas...');
    
    const response = await axios.get(`${API_BASE_URL}/api/receitas`);
    console.log('✅ Endpoint de receitas funcionando');
    console.log('📊 Total de receitas:', response.data.length);
    
    return true;
  } catch (error) {
    console.error('❌ Erro no endpoint de receitas:', error.response?.data || error.message);
    return false;
  }
}

async function testarDespesas() {
  try {
    console.log('\n💸 Testando endpoint de despesas...');
    
    const response = await axios.get(`${API_BASE_URL}/api/despesas`);
    console.log('✅ Endpoint de despesas funcionando');
    console.log('📊 Total de despesas:', response.data.length);
    
    return true;
  } catch (error) {
    console.error('❌ Erro no endpoint de despesas:', error.response?.data || error.message);
    return false;
  }
}

async function executarTestes() {
  console.log('🚀 Iniciando testes do FinFlow...\n');
  
  // Testar conexão com API
  const apiOk = await testarConexaoAPI();
  if (!apiOk) {
    console.log('\n❌ API não está disponível. Execute: npm run backend');
    return;
  }
  
  // Testar login
  const usuario = await testarLoginAdmin();
  
  // Testar endpoints
  await testarReceitas();
  await testarDespesas();
  
  console.log('\n🎉 Testes concluídos!');
  
  if (usuario) {
    console.log('✅ Sistema funcionando corretamente');
    console.log('🌐 Acesse: http://localhost:3000');
  } else {
    console.log('⚠️  Problemas detectados. Verifique:');
    console.log('  1. Backend rodando');
    console.log('  2. Banco de dados configurado');
    console.log('  3. Usuário admin criado');
  }
}

// Executar testes
executarTestes().catch(console.error); 