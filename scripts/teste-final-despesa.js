const axios = require('axios');

async function testeFinalDespesa() {
  try {
    console.log('🧪 Teste Final - Criação de Despesas');
    console.log('=====================================');
    
    // 1. Testar conexão básica
    console.log('\n📡 Testando conexão...');
    const testResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/');
    console.log('✅ Servidor OK:', testResponse.data.message);
    
    // 2. Testar busca de despesas
    console.log('\n📋 Testando busca de despesas...');
    const getResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/despesas?userId=1');
    console.log('✅ Busca OK:', getResponse.data.length, 'despesas encontradas');
    
    // 3. Testar criação de despesa básica
    console.log('\n📝 Testando criação de despesa básica...');
    const despesaBasica = {
      descricao: 'Teste Final Básico',
      valor: 100.00,
      data: '2024-12-19',
      tipo: 'Outros',
      usuario_id: 1
    };
    
    try {
      const postBasicaResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaBasica);
      console.log('✅ Despesa básica criada:', postBasicaResponse.data);
      
      // Limpar despesa de teste
      if (postBasicaResponse.data && postBasicaResponse.data.despesa_id) {
        await axios.delete(`https://finflow-production-e4b3.up.railway.app/api/despesas/${postBasicaResponse.data.despesa_id}`);
        console.log('🧹 Despesa de teste removida');
      }
      
    } catch (error) {
      console.error('❌ Erro na criação básica:', error.response?.data || error.message);
    }
    
    // 4. Testar criação de despesa completa
    console.log('\n📝 Testando criação de despesa completa...');
    const despesaCompleta = {
      descricao: 'Teste Final Completo',
      valor: 250.00,
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
      const postCompletaResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaCompleta);
      console.log('✅ Despesa completa criada:', postCompletaResponse.data);
      
      // Limpar despesa de teste
      if (postCompletaResponse.data && postCompletaResponse.data.despesa_id) {
        await axios.delete(`https://finflow-production-e4b3.up.railway.app/api/despesas/${postCompletaResponse.data.despesa_id}`);
        console.log('🧹 Despesa de teste removida');
      }
      
    } catch (error) {
      console.error('❌ Erro na criação completa:', error.response?.data || error.message);
    }
    
    // 5. Testar criação de despesa recorrente
    console.log('\n📝 Testando criação de despesa recorrente...');
    const despesaRecorrente = {
      descricao: 'Teste Final Recorrente',
      valor: 500.00,
      data: '2024-12-19',
      dataVencimento: '2024-12-25',
      tipo: 'Moradia',
      pago: false,
      conta_id: 1,
      usuario_id: 1,
      recorrente: true,
      frequencia: 'mensal',
      proximasParcelas: 6
    };
    
    try {
      const postRecorrenteResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaRecorrente);
      console.log('✅ Despesa recorrente criada:', postRecorrenteResponse.data);
      
      // Limpar despesas de teste (pode ter criado múltiplas)
      if (postRecorrenteResponse.data && Array.isArray(postRecorrenteResponse.data)) {
        for (const despesa of postRecorrenteResponse.data) {
          if (despesa.despesa_id) {
            await axios.delete(`https://finflow-production-e4b3.up.railway.app/api/despesas/${despesa.despesa_id}`);
          }
        }
        console.log('🧹 Despesas recorrentes de teste removidas');
      }
      
    } catch (error) {
      console.error('❌ Erro na criação recorrente:', error.response?.data || error.message);
    }
    
    // 6. Verificar estado final
    console.log('\n📋 Verificando estado final...');
    const finalGetResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/despesas?userId=1');
    console.log('✅ Estado final:', finalGetResponse.data.length, 'despesas encontradas');
    
    console.log('\n🎉 Teste final concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste final:', error.message);
  }
}

testeFinalDespesa(); 