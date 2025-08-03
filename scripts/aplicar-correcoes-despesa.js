const axios = require('axios');

async function aplicarCorrecoesDespesa() {
  try {
    console.log('🔧 Aplicando correções na tabela de despesas...');
    
    // 1. Primeiro, vamos testar se conseguimos acessar o banco
    console.log('\n📡 Testando acesso ao banco...');
    const dbResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/test-db');
    console.log('✅ Conexão com banco OK');
    
    // 2. Verificar se há usuários no sistema
    console.log('\n👥 Verificando usuários...');
    const usersResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/test-users');
    console.log('✅ Usuários encontrados:', usersResponse.data.count);
    
    // 3. Tentar criar uma despesa com estrutura mais simples
    console.log('\n📝 Testando criação de despesa com estrutura simples...');
    
    const despesaSimples = {
      descricao: 'Teste Correção',
      valor: 50.00,
      data: '2024-12-19',
      tipo: 'Outros',
      usuario_id: 1
    };
    
    try {
      const postResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaSimples);
      console.log('✅ Despesa criada com sucesso:', postResponse.data);
      
      // Se conseguiu criar, vamos deletar para limpar
      if (postResponse.data && postResponse.data.despesa_id) {
        console.log('🧹 Limpando despesa de teste...');
        await axios.delete(`https://finflow-production-e4b3.up.railway.app/api/despesas/${postResponse.data.despesa_id}`);
        console.log('✅ Despesa de teste removida');
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar despesa simples:', error.response?.data || error.message);
      
      // Se ainda houver erro, vamos tentar com estrutura ainda mais básica
      console.log('\n🔍 Tentando com estrutura mais básica...');
      
      const despesaBasica = {
        descricao: 'Teste Básico',
        valor: 10.00,
        data: '2024-12-19',
        tipo: 'Outros',
        usuario_id: 1,
        pago: false
      };
      
      try {
        const postBasicoResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaBasica);
        console.log('✅ Despesa básica criada:', postBasicoResponse.data);
      } catch (errorBasico) {
        console.error('❌ Erro mesmo com estrutura básica:', errorBasico.response?.data || errorBasico.message);
        
        // Se ainda falhar, pode ser problema de estrutura da tabela
        console.log('\n🔍 Problema identificado: Estrutura da tabela incorreta');
        console.log('   Solução: Execute o script SQL de correção no banco de dados');
        console.log('   Arquivo: scripts/aplicar-correcoes-despesa.sql');
      }
    }
    
    // 4. Testar busca de despesas após correções
    console.log('\n📋 Testando busca de despesas...');
    try {
      const getResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/despesas?userId=1');
      console.log('✅ Busca de despesas OK:', getResponse.data.length, 'despesas encontradas');
    } catch (error) {
      console.error('❌ Erro na busca de despesas:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

aplicarCorrecoesDespesa(); 