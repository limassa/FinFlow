const axios = require('axios');

async function testarVersao() {
  try {
    console.log('🧪 Testando funcionalidade de versão...');
    
    // Testar endpoint de versão
    const response = await axios.get('http://localhost:3001/api/versao');
    
    console.log('✅ Resposta da API:', response.data);
    
    if (response.data.success) {
      const versao = response.data.versao;
      console.log('\n📋 Informações da versão:');
      console.log(`   Número: ${versao.versao_numero}`);
      console.log(`   Nome: ${versao.versao_nome}`);
      console.log(`   Data: ${versao.versao_data}`);
      console.log(`   Status: ${versao.versao_status}`);
      console.log(`   Ambiente: ${versao.versao_ambiente}`);
      console.log(`   Descrição: ${versao.versao_descricao}`);
    } else {
      console.log('❌ Erro:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar versão:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Certifique-se de que o backend está rodando na porta 3001');
    }
  }
}

testarVersao(); 