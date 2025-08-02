const axios = require('axios');

async function testarEndpointVersaoLocal() {
  try {
    console.log('🧪 Testando endpoint de versão localmente...');
    
    // URL do backend local
    const baseURL = 'http://localhost:3001';
    
    console.log(`📡 Conectando em: ${baseURL}`);
    
    // Testar endpoint de versão
    const response = await axios.get(`${baseURL}/api/versao`, {
      timeout: 5000 // 5 segundos de timeout
    });
    
    console.log('✅ Resposta da API:', response.data);
    
    if (response.data.success) {
      const versao = response.data.versao;
      console.log('\n📋 Informações da versão local:');
      console.log(`   Número: ${versao.versao_numero}`);
      console.log(`   Nome: ${versao.versao_nome}`);
      console.log(`   Data: ${versao.versao_data}`);
      console.log(`   Status: ${versao.versao_status}`);
      console.log(`   Ambiente: ${versao.versao_ambiente}`);
      console.log(`   Descrição: ${versao.versao_descricao}`);
      
      console.log('\n🎉 Teste do endpoint de versão realizado com sucesso!');
    } else {
      console.log('❌ Erro:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint de versão:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Certifique-se de que o backend está rodando na porta 3001');
      console.log('   npm start (na pasta backend)');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Dica: Verifique se a URL local está correta');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Dica: Timeout na conexão. Verifique a conectividade');
    }
    
    console.log('\n🔧 Para iniciar o backend localmente:');
    console.log('   cd backend && npm start');
  }
}

testarEndpointVersaoLocal(); 