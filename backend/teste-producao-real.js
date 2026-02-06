const axios = require('axios');

console.log('🧪 TESTE DA ROTA DE CADASTRO EM PRODUÇÃO');
console.log('==========================================');

// URL da aplicação em produção
const PRODUCTION_URL = 'https://finflow-backend-production.up.railway.app';

console.log(`🌐 Testando em: ${PRODUCTION_URL}`);
console.log('🏭 Ambiente: PRODUÇÃO (Railway)');

// Dados de teste
const testUser = {
  nome: 'Usuário Teste Produção',
  telefone: '(11) 77777-7777',
  email: 'joaolmnmarket@gmail.com',
  senha: 'Teste123!@#'
};

console.log('\n1. DADOS DO USUÁRIO DE TESTE');
console.log('==============================');
console.log(`👤 Nome: ${testUser.nome}`);
console.log(`📱 Telefone: ${testUser.telefone}`);
console.log(`📧 Email: ${testUser.email}`);
console.log(`🔑 Senha: ${testUser.senha ? 'Configurada' : 'Não configurada'}`);

console.log('\n2. TESTANDO ROTA DE CADASTRO EM PRODUÇÃO');
console.log('==========================================');

async function testCadastro() {
  try {
    console.log('🚀 Enviando requisição de cadastro para produção...');
    
    const response = await axios.post(`${PRODUCTION_URL}/api/cadastro`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos
    });
    
    console.log('✅ Resposta da API de Produção:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Mensagem: ${response.data.message || 'N/A'}`);
    console.log(`   Usuário ID: ${response.data.usuario_id || 'N/A'}`);
    
    if (response.data.message && response.data.message.includes('Verifique seu email')) {
      console.log('\n🎉 CADASTRO EM PRODUÇÃO REALIZADO COM SUCESSO!');
      console.log('==================================================');
      console.log('✅ Usuário criado no banco de dados de produção');
      console.log('✅ Email de boas-vindas foi solicitado');
      console.log('✅ Verifique se o email chegou em: joaolmnmarket@gmail.com');
      
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log('1. Aguarde alguns minutos para o email chegar');
      console.log('2. Verifique a pasta de spam/lixo eletrônico');
      console.log('3. Se não chegar, há um problema no envio em produção');
    }
    
  } catch (error) {
    console.log('\n❌ ERRO NO CADASTRO EM PRODUÇÃO:');
    console.log('==================================');
    
    if (error.response) {
      // Erro da API
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Erro: ${error.response.data.error || 'Erro desconhecido'}`);
      
      if (error.response.status === 409) {
        console.log('   📧 Usuário já existe - tente com outro email');
      } else if (error.response.status === 400) {
        console.log('   🔍 Erro de validação - verifique os dados');
      } else if (error.response.status === 500) {
        console.log('   💥 Erro interno do servidor - verifique os logs');
      }
    } else if (error.request) {
      // Erro de conexão
      console.log('   🌐 Erro de conexão - servidor não respondeu');
      console.log('   💡 Verifique se a aplicação está rodando em produção');
    } else {
      // Erro geral
      console.log('   💥 Erro:', error.message);
    }
    
    console.log('\n🔍 DIAGNÓSTICO:');
    console.log('   - Se erro 500: Problema no backend de produção');
    console.log('   - Se erro de conexão: Aplicação não está rodando');
    console.log('   - Se erro 409: Usuário já existe (normal)');
  }
}

// Executar o teste
testCadastro(); 