const axios = require('axios');

async function testarDespesaProducao() {
  try {
    console.log('🧪 Testando funcionalidade de despesas na PRODUÇÃO...');
    
    // Testar GET /api/despesas
    console.log('\n📋 Testando GET /api/despesas...');
    const getResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/despesas?userId=1');
    console.log('✅ GET /api/despesas:', getResponse.data);
    
    // Testar POST /api/despesas
    console.log('\n📝 Testando POST /api/despesas...');
    const despesaTeste = {
      descricao: 'Teste de Despesa Produção',
      valor: 150.00,
      data: '2024-12-19',
      dataVencimento: '2024-12-25',
      tipo: 'Alimentação',
      pago: false,
      conta_id: 1,
      usuario_id: 1
    };
    
    const postResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaTeste);
    console.log('✅ POST /api/despesas:', postResponse.data);
    
  } catch (error) {
    console.error('❌ Erro ao testar despesas na produção:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Dados:', error.response.data);
    }
  }
}

testarDespesaProducao(); 