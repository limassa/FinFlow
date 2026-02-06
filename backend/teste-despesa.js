const axios = require('axios');

async function testarDespesa() {
  try {
    console.log('🧪 Testando funcionalidade de despesas...');
    
    // Testar GET /api/despesas
    console.log('\n📋 Testando GET /api/despesas...');
    const getResponse = await axios.get('http://localhost:3001/despesas?userId=1');
    console.log('✅ GET /api/despesas:', getResponse.data);
    
    // Testar POST /api/despesas
    console.log('\n📝 Testando POST /api/despesas...');
    const despesaTeste = {
      descricao: 'Teste de Despesa',
      valor: 100.00,
      data: '2024-12-19',
      dataVencimento: '2024-12-25',
      tipo: 'Alimentação',
      pago: false,
      conta_id: 1,
      usuario_id: 1
    };
    
    const postResponse = await axios.post('http://localhost:3001/despesas', despesaTeste);
    console.log('✅ POST /api/despesas:', postResponse.data);
    
  } catch (error) {
    console.error('❌ Erro ao testar despesas:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Dados:', error.response.data);
    }
  }
}

testarDespesa(); 