const axios = require('axios');

// Configuração
const BACKEND_URL = 'http://localhost:3001';
// Pegar userId da linha de comando ou usar padrão
const USER_ID = process.argv[2] ? parseInt(process.argv[2]) : 1;

async function testarWhatsApp() {
  console.log('📱 TESTE DE ENVIO DE WHATSAPP\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    console.log(`📋 Configuração:`);
    console.log(`   Backend: ${BACKEND_URL}`);
    console.log(`   Usuário ID: ${USER_ID}\n`);
    
    console.log('🔄 Enviando requisição...\n');
    
    const response = await axios.post(`${BACKEND_URL}/api/lembretes/teste-whatsapp`, {
      userId: USER_ID
    }, {
      timeout: 30000 // 30 segundos
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ SUCESSO!\n');
    console.log('📊 Resposta do servidor:');
    console.log(`   Mensagem: ${response.data.message}`);
    console.log(`   Vencimentos: ${response.data.vencimentos}`);
    console.log(`   Destinatário: ${response.data.destinatario}\n`);
    console.log('📱 Verifique seu WhatsApp! Você deve ter recebido uma mensagem.\n');
    
  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('❌ ERRO!\n');
    
    if (error.response) {
      // Erro da API
      const status = error.response.status;
      const data = error.response.data;
      
      console.log(`📊 Status HTTP: ${status}`);
      console.log(`📋 Mensagem: ${data.error || data.message || 'Erro desconhecido'}\n`);
      
      if (status === 400) {
        console.log('💡 SOLUÇÃO:');
        console.log('   1. Verifique se o telefone está cadastrado no perfil');
        console.log('   2. Verifique se lembretes WhatsApp estão ativados');
        console.log('   3. Verifique se existe despesa com vencimento próximo\n');
      } else if (status === 404) {
        console.log('💡 SOLUÇÃO:');
        console.log('   1. Verifique se o usuário existe (userId correto?)');
        console.log('   2. Crie uma despesa com vencimento nos próximos 5 dias\n');
      } else if (status === 500) {
        console.log('💡 SOLUÇÃO:');
        console.log('   1. Verifique se a Evolution API está rodando');
        console.log('   2. Verifique se a instância está conectada');
        console.log('   3. Verifique os logs do backend\n');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Não foi possível conectar ao backend!\n');
      console.log('💡 SOLUÇÃO:');
      console.log('   1. Verifique se o backend está rodando');
      console.log('   2. Verifique se a URL está correta:', BACKEND_URL);
      console.log('   3. Execute: cd backend && npm start\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Timeout ao conectar!\n');
      console.log('💡 SOLUÇÃO:');
      console.log('   1. Verifique se o backend está respondendo');
      console.log('   2. Verifique se a Evolution API está acessível\n');
    } else {
      console.log('❌ Erro:', error.message);
      console.log('\n💡 Verifique os logs do backend para mais detalhes.\n');
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Executar teste
testarWhatsApp();

