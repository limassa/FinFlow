const axios = require('axios');

async function testarRotas() {
  try {
    console.log('🧪 TESTE DE ROTAS');
    console.log('==================');
    
    const userId = 1;
    const baseUrl = 'http://localhost:3001';
    
    // 1. Testar rota que sabemos que funciona
    console.log('\n1. TESTANDO ROTA /api/contas');
    console.log('=============================');
    try {
      const response1 = await axios.get(`${baseUrl}/api/contas?userId=${userId}`);
      console.log('✅ Rota /api/contas funciona');
      console.log('   Status:', response1.status);
      console.log('   Contas encontradas:', response1.data.length);
    } catch (error) {
      console.log('❌ Rota /api/contas falhou:', error.message);
    }
    
    // 2. Testar rota de saldo total
    console.log('\n2. TESTANDO ROTA /api/contas/saldo-total');
    console.log('=========================================');
    try {
      const response2 = await axios.get(`${baseUrl}/api/contas/saldo-total?userId=${userId}`);
      console.log('✅ Rota /api/contas/saldo-total funciona');
      console.log('   Status:', response2.status);
      console.log('   Dados:', response2.data);
    } catch (error) {
      console.log('❌ Rota /api/contas/saldo-total falhou:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Dados:', error.response.data);
      }
    }
    
    // 3. Testar rota de versão
    console.log('\n3. TESTANDO ROTA /api/versao');
    console.log('=============================');
    try {
      const response3 = await axios.get(`${baseUrl}/api/versao`);
      console.log('✅ Rota /api/versao funciona');
      console.log('   Status:', response3.status);
      console.log('   Dados:', response3.data);
    } catch (error) {
      console.log('❌ Rota /api/versao falhou:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    process.exit(0);
  }
}

testarRotas();
