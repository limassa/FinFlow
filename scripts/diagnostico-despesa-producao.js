const axios = require('axios');

async function diagnosticarDespesaProducao() {
  try {
    console.log('🔍 Diagnosticando problema com despesas na PRODUÇÃO...');
    
    // 1. Testar conexão básica
    console.log('\n📡 Testando conexão básica...');
    const testResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/');
    console.log('✅ Servidor respondendo:', testResponse.data);
    
    // 2. Testar endpoint de versão
    console.log('\n📋 Testando endpoint de versão...');
    const versaoResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/versao');
    console.log('✅ Versão:', versaoResponse.data);
    
    // 3. Testar busca de despesas
    console.log('\n📋 Testando busca de despesas...');
    const getResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/despesas?userId=1');
    console.log('✅ GET /api/despesas:', getResponse.data);
    
    // 4. Testar criação de despesa com dados mínimos
    console.log('\n📝 Testando criação de despesa com dados mínimos...');
    const despesaMinima = {
      descricao: 'Teste Mínimo',
      valor: 10.00,
      data: '2024-12-19',
      tipo: 'Outros',
      usuario_id: 1
    };
    
    try {
      const postResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaMinima);
      console.log('✅ POST /api/despesas (mínimo):', postResponse.data);
    } catch (error) {
      console.error('❌ Erro com dados mínimos:', error.response?.data || error.message);
    }
    
    // 5. Testar criação de despesa com todos os campos
    console.log('\n📝 Testando criação de despesa com todos os campos...');
    const despesaCompleta = {
      descricao: 'Teste Completo',
      valor: 150.00,
      data: '2024-12-19',
      dataVencimento: '2024-12-25',
      tipo: 'Alimentação',
      pago: false,
      conta_id: 1,
      usuario_id: 1,
      recorrente: false,
      frequencia: 'mensal',
      proximasParcelas: 12
    };
    
    try {
      const postCompletoResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaCompleta);
      console.log('✅ POST /api/despesas (completo):', postCompletoResponse.data);
    } catch (error) {
      console.error('❌ Erro com dados completos:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no diagnóstico:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Dados:', error.response.data);
    }
  }
}

diagnosticarDespesaProducao(); 