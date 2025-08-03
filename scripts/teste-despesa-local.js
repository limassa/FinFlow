const axios = require('axios');

async function testeDespesaLocal() {
  try {
    console.log('🧪 Teste Local - Criação de Despesas');
    console.log('=====================================');
    
    // 1. Testar conexão básica
    console.log('\n📡 Testando conexão local...');
    const testResponse = await axios.get('http://localhost:3001/');
    console.log('✅ Servidor local OK:', testResponse.data.message);
    
    // 2. Testar busca de usuários
    console.log('\n👥 Testando busca de usuários...');
    const usersResponse = await axios.get('http://localhost:3001/api/test-users');
    console.log('✅ Usuários encontrados:', usersResponse.data);
    
    // 3. Testar busca de despesas
    console.log('\n📋 Testando busca de despesas...');
    const getResponse = await axios.get('http://localhost:3001/api/despesas?userId=1');
    console.log('✅ Despesas encontradas:', getResponse.data.length);
    
    // 4. Testar criação de despesa
    console.log('\n📝 Testando criação de despesa...');
    const despesaTeste = {
      descricao: 'Teste Local',
      valor: 100.00,
      data: '2024-12-19',
      tipo: 'Outros',
      usuario_id: 1
    };
    
    try {
      const postResponse = await axios.post('http://localhost:3001/api/despesas', despesaTeste);
      console.log('✅ Despesa criada com sucesso:', postResponse.data);
      
      // Limpar despesa de teste
      if (postResponse.data && postResponse.data.despesa_id) {
        await axios.delete(`http://localhost:3001/api/despesas/${postResponse.data.despesa_id}`);
        console.log('🧹 Despesa de teste removida');
      }
      
    } catch (error) {
      console.error('❌ Erro na criação de despesa:', error.response?.data || error.message);
      
      if (error.response?.status === 500) {
        console.log('\n🔍 Erro 500 detectado - verificando estrutura da tabela local');
        console.log('   Possíveis causas:');
        console.log('   - Colunas não existem na tabela local');
        console.log('   - Tipos de dados incorretos');
        console.log('   - Constraints violados');
        console.log('   - Nomes de colunas incorretos');
      }
    }
    
    // 5. Testar criação de despesa completa
    console.log('\n📝 Testando criação de despesa completa...');
    const despesaCompleta = {
      descricao: 'Teste Local Completo',
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
      const postCompletaResponse = await axios.post('http://localhost:3001/api/despesas', despesaCompleta);
      console.log('✅ Despesa completa criada:', postCompletaResponse.data);
      
      // Limpar despesa de teste
      if (postCompletaResponse.data && postCompletaResponse.data.despesa_id) {
        await axios.delete(`http://localhost:3001/api/despesas/${postCompletaResponse.data.despesa_id}`);
        console.log('🧹 Despesa completa de teste removida');
      }
      
    } catch (error) {
      console.error('❌ Erro na criação de despesa completa:', error.response?.data || error.message);
    }
    
    console.log('\n📋 Resumo do Teste Local:');
    console.log('   - Servidor local: ✅ Funcionando');
    console.log('   - Busca de usuários: ✅ Funcionando');
    console.log('   - Busca de despesas: ✅ Funcionando');
    console.log('   - Criação de despesas: ⏳ Verificando...');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Servidor local não está rodando');
      console.log('   Execute: cd backend && npm start');
    }
  }
}

testeDespesaLocal(); 