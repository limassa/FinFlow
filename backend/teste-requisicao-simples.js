const axios = require('axios');

async function testarRequisicao() {
  try {
    console.log('🧪 TESTE DE REQUISIÇÃO SIMPLES');
    console.log('===============================');
    
    const userId = 1;
    const url = `http://localhost:3001/api/contas/saldo-total?userId=${userId}`;
    
    console.log('🌐 URL:', url);
    console.log('📋 Método: GET');
    console.log('📋 Parâmetros: userId=' + userId);
    console.log('\n🔄 Fazendo requisição...');
    
    const response = await axios.get(url);
    
    console.log('✅ Resposta recebida:');
    console.log('   Status:', response.status);
    console.log('   Dados:', response.data);
    console.log('   Saldo Total: R$', response.data.saldoTotal.toFixed(2));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  } finally {
    process.exit(0);
  }
}

testarRequisicao();
