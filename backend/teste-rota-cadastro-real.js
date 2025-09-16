const axios = require('axios');

console.log('🧪 TESTE DA ROTA DE CADASTRO REAL');
console.log('==================================');

// URL da aplicação em produção
const PRODUCTION_URL = 'https://finflow-backend-production.up.railway.app';
const LOCAL_URL = 'http://localhost:3001';

// Escolher qual URL testar
const BASE_URL = process.env.NODE_ENV === 'production' ? PRODUCTION_URL : LOCAL_URL;

console.log(`🌐 Testando em: ${BASE_URL}`);
console.log(`🏭 Ambiente: ${process.env.NODE_ENV || 'development'}`);

// Dados de teste
const testUser = {
  nome: 'Usuário Teste Real',
  telefone: '(11) 88888-8888',
  email: 'joaolmnmarket@gmail.com',
  senha: 'Teste123!@#'
};

console.log('\n1. DADOS DO USUÁRIO DE TESTE');
console.log('==============================');
console.log(`👤 Nome: ${testUser.nome}`);
console.log(`📱 Telefone: ${testUser.telefone}`);
console.log(`📧 Email: ${testUser.email}`);
console.log(`🔑 Senha: ${testUser.senha ? 'Configurada' : 'Não configurada'}`);

console.log('\n2. TESTANDO ROTA DE CADASTRO');
console.log('==============================');

async function testCadastro() {
  try {
    console.log('🚀 Enviando requisição de cadastro...');
    
    const response = await axios.post(`${BASE_URL}/api/cadastro`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos
    });
    
    console.log('✅ Resposta da API:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Mensagem: ${response.data.message || 'N/A'}`);
    console.log(`   Usuário ID: ${response.data.usuario_id || 'N/A'}`);
    
    if (response.data.message && response.data.message.includes('Verifique seu email')) {
      console.log('\n🎉 CADASTRO REALIZADO COM SUCESSO!');
      console.log('====================================');
      console.log('✅ Usuário criado no banco de dados');
      console.log('✅ Email de boas-vindas foi solicitado');
      console.log('✅ Verifique se o email chegou em: joaolmnmarket@gmail.com');
    }
    
  } catch (error) {
    console.log('\n❌ ERRO NO CADASTRO:');
    console.log('=====================');
    
    if (error.response) {
      // Erro da API
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Erro: ${error.response.data.error || 'Erro desconhecido'}`);
      
      if (error.response.status === 409) {
        console.log('   📧 Usuário já existe - tente com outro email');
      } else if (error.response.status === 400) {
        console.log('   🔍 Erro de validação - verifique os dados');
      }
    } else if (error.request) {
      // Erro de conexão
      console.log('   🌐 Erro de conexão - servidor não respondeu');
      console.log('   💡 Verifique se a aplicação está rodando');
    } else {
      // Erro geral
      console.log('   💥 Erro:', error.message);
    }
  }
}

// Executar o teste
testCadastro(); 