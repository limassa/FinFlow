const axios = require('axios');

async function testarEndpointVersaoRailway() {
  try {
    console.log('🧪 Testando endpoint de versão no Railway...');
    
    // URL do backend no Railway (substitua pela URL real)
    const baseURL = 'https://finflow-backend-production.up.railway.app';
    
    console.log(`📡 Conectando em: ${baseURL}`);
    
    // Testar endpoint de versão
    const response = await axios.get(`${baseURL}/api/versao`, {
      timeout: 10000 // 10 segundos de timeout
    });
    
    console.log('✅ Resposta da API:', response.data);
    
    if (response.data.success) {
      const versao = response.data.versao;
      console.log('\n📋 Informações da versão no Railway:');
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
      console.log('💡 Dica: Verifique se o backend está rodando no Railway');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Dica: Verifique se a URL do Railway está correta');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Dica: Timeout na conexão. Verifique a conectividade');
    }
    
    console.log('\n🔧 Para testar localmente, use:');
    console.log('   node testes/teste-endpoint-versao-local.js');
  }
}

testarEndpointVersaoRailway(); 