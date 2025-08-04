const axios = require('axios');

async function testeDeletarDespesa() {
  try {
    console.log('🧪 Teste - Deletar Despesa');
    console.log('===========================');
    
    // 1. Testar conexão
    console.log('\n📡 Testando conexão...');
    const testResponse = await axios.get('http://localhost:3001/');
    console.log('✅ Servidor local OK:', testResponse.data.message);
    
    // 2. Criar uma despesa de teste
    console.log('\n📝 Criando despesa de teste...');
    const despesaTeste = {
      descricao: 'Teste Deletar Despesa',
      valor: 50.00,
      data: '2024-12-19',
      tipo: 'Teste',
      usuario_id: 1
    };
    
    const createResponse = await axios.post('http://localhost:3001/api/despesas', despesaTeste);
    console.log('✅ Despesa criada:', createResponse.data[0].despesa_id);
    
    const despesaId = createResponse.data[0].despesa_id;
    
    // 3. Verificar se a despesa existe
    console.log('\n📋 Verificando despesa criada...');
    const getResponse = await axios.get(`http://localhost:3001/api/despesas?userId=1`);
    const despesas = getResponse.data.filter(d => d.despesa_id === despesaId);
    console.log('✅ Despesa encontrada:', despesas.length > 0);
    
    // 4. Deletar a despesa
    console.log('\n🗑️ Deletando despesa...');
    try {
      const deleteResponse = await axios.delete(`http://localhost:3001/api/despesas/${despesaId}`);
      console.log('✅ Despesa deletada com sucesso!');
      console.log('   Status:', deleteResponse.status);
    } catch (error) {
      console.error('❌ Erro ao deletar despesa:', error.response?.data || error.message);
      console.log('   Status:', error.response?.status);
    }
    
    // 5. Verificar se foi realmente deletada
    console.log('\n📋 Verificando se despesa foi deletada...');
    const getResponse2 = await axios.get(`http://localhost:3001/api/despesas?userId=1`);
    const despesasAposDelete = getResponse2.data.filter(d => d.despesa_id === despesaId);
    console.log('✅ Despesa removida da lista:', despesasAposDelete.length === 0);
    
    console.log('\n📋 Resumo do Teste:');
    console.log('   - Criação: ✅ Funcionando');
    console.log('   - Deletar: ⏳ Verificando...');
    console.log('   - Verificação: ✅ Funcionando');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Servidor local não está rodando');
      console.log('   Execute: cd backend && npm start');
    }
  }
}

testeDeletarDespesa(); 