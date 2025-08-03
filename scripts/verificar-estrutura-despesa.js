const axios = require('axios');

async function verificarEstruturaDespesa() {
  try {
    console.log('🔍 Verificando estrutura da tabela de despesas...');
    
    // Testar criação de despesa com diferentes combinações de campos
    const testes = [
      {
        nome: 'Teste Básico',
        dados: {
          descricao: 'Teste Básico',
          valor: 10.00,
          data: '2024-12-19',
          tipo: 'Outros',
          usuario_id: 1
        }
      },
      {
        nome: 'Teste com Data Vencimento',
        dados: {
          descricao: 'Teste com Vencimento',
          valor: 20.00,
          data: '2024-12-19',
          dataVencimento: '2024-12-25',
          tipo: 'Alimentação',
          usuario_id: 1
        }
      },
      {
        nome: 'Teste com Conta',
        dados: {
          descricao: 'Teste com Conta',
          valor: 30.00,
          data: '2024-12-19',
          tipo: 'Transporte',
          conta_id: 1,
          usuario_id: 1
        }
      },
      {
        nome: 'Teste com Pago',
        dados: {
          descricao: 'Teste com Pago',
          valor: 40.00,
          data: '2024-12-19',
          tipo: 'Saúde',
          pago: true,
          usuario_id: 1
        }
      },
      {
        nome: 'Teste Completo',
        dados: {
          descricao: 'Teste Completo',
          valor: 50.00,
          data: '2024-12-19',
          dataVencimento: '2024-12-25',
          tipo: 'Moradia',
          pago: false,
          conta_id: 1,
          usuario_id: 1,
          recorrente: false,
          frequencia: 'mensal',
          proximasParcelas: 12
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
    
    // Testar busca de despesas
    console.log('\n📋 Testando busca de despesas...');
    try {
      const getResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/api/despesas?userId=1');
      console.log('✅ Busca de despesas:', getResponse.data);
    } catch (error) {
      console.error('❌ Erro na busca:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verificarEstruturaDespesa(); 