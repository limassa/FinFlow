const axios = require('axios');

async function verificarEstruturaTabela() {
  try {
    console.log('🔍 Verificando estrutura da tabela de despesas...');
    
    // Testar diferentes variações de nomes de colunas
    const testes = [
      {
        nome: 'Teste com conta_id (minúsculo)',
        dados: {
          descricao: 'Teste conta_id',
          valor: 10.00,
          data: '2024-12-19',
          tipo: 'Outros',
          conta_id: 1,
          usuario_id: 1
        }
      },
      {
        nome: 'Teste com Conta_id (maiúsculo)',
        dados: {
          descricao: 'Teste Conta_id',
          valor: 20.00,
          data: '2024-12-19',
          tipo: 'Alimentação',
          Conta_id: 1,
          usuario_id: 1
        }
      },
      {
        nome: 'Teste sem conta_id',
        dados: {
          descricao: 'Teste sem conta',
          valor: 30.00,
          data: '2024-12-19',
          tipo: 'Transporte',
          usuario_id: 1
        }
      },
      {
        nome: 'Teste com usuario_id (minúsculo)',
        dados: {
          descricao: 'Teste usuario_id',
          valor: 40.00,
          data: '2024-12-19',
          tipo: 'Saúde',
          usuario_id: 1
        }
      },
      {
        nome: 'Teste com Usuario_id (maiúsculo)',
        dados: {
          descricao: 'Teste Usuario_id',
          valor: 50.00,
          data: '2024-12-19',
          tipo: 'Moradia',
          Usuario_id: 1
        }
      }
    ];
    
    for (const teste of testes) {
      console.log(`\n📝 ${teste.nome}...`);
      try {
        const response = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', teste.dados);
        console.log(`✅ ${teste.nome} - Sucesso:`, response.data);
      } catch (error) {
        console.error(`❌ ${teste.nome} - Erro:`, error.response?.data || error.message);
        if (error.response?.data?.error) {
          console.error(`   Detalhes:`, error.response.data.error);
        }
      }
    }
    
    // Testar também com diferentes nomes de tabela
    console.log('\n🔍 Testando se é problema de nome da tabela...');
    
    // Verificar se a tabela se chama 'despesa' ou 'Despesa'
    const tabelas = ['despesa', 'Despesa'];
    
    for (const tabela of tabelas) {
      console.log(`\n📋 Testando tabela: ${tabela}`);
      
      const despesaTeste = {
        descricao: `Teste ${tabela}`,
        valor: 60.00,
        data: '2024-12-19',
        tipo: 'Outros',
        usuario_id: 1
      };
      
      try {
        const response = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaTeste);
        console.log(`✅ Sucesso com tabela ${tabela}:`, response.data);
      } catch (error) {
        console.error(`❌ Erro com tabela ${tabela}:`, error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verificarEstruturaTabela(); 