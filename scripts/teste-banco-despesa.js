const axios = require('axios');

async function testarBancoDespesa() {
  try {
    console.log('🔍 Testando conexão com banco e estrutura da tabela de despesas...');
    
    // 1. Testar conexão básica com banco
    console.log('\n📡 Testando conexão com banco...');
    try {
      const dbResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/test-db');
      console.log('✅ Conexão com banco OK:', dbResponse.data);
    } catch (error) {
      console.error('❌ Erro na conexão com banco:', error.response?.data || error.message);
    }
    
    // 2. Testar busca de usuários
    console.log('\n👥 Testando busca de usuários...');
    try {
      const usersResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/test-users');
      console.log('✅ Usuários encontrados:', usersResponse.data);
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error.response?.data || error.message);
    }
    
    // 3. Testar busca de contas
    console.log('\n💰 Testando busca de contas...');
    try {
      const contasResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/contas?userId=1');
      console.log('✅ Contas encontradas:', contasResponse.data);
    } catch (error) {
      console.error('❌ Erro ao buscar contas:', error.response?.data || error.message);
    }
    
    // 4. Testar busca de despesas
    console.log('\n📋 Testando busca de despesas...');
    try {
      const despesasResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/despesas?userId=1');
      console.log('✅ Despesas encontradas:', despesasResponse.data);
    } catch (error) {
      console.error('❌ Erro ao buscar despesas:', error.response?.data || error.message);
    }
    
    // 5. Testar criação de despesa com erro detalhado
    console.log('\n📝 Testando criação de despesa com log detalhado...');
    const despesaTeste = {
      descricao: 'Teste Detalhado',
      valor: 100.00,
      data: '2024-12-19',
      tipo: 'Outros',
      usuario_id: 1
    };
    
    try {
      const postResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaTeste);
      console.log('✅ Despesa criada com sucesso:', postResponse.data);
    } catch (error) {
      console.error('❌ Erro ao criar despesa:');
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   Data:', error.response?.data);
      console.error('   Headers:', error.response?.headers);
      
      // Se for erro 500, pode ser problema de estrutura da tabela
      if (error.response?.status === 500) {
        console.log('\n🔍 Erro 500 detectado - provavelmente problema de estrutura da tabela');
        console.log('   Possíveis causas:');
        console.log('   - Colunas não existem na tabela');
        console.log('   - Tipos de dados incorretos');
        console.log('   - Constraints violados');
        console.log('   - Nomes de colunas incorretos');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarBancoDespesa(); 