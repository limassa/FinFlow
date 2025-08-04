const axios = require('axios');

async function testeCalendarioFrontend() {
  try {
    console.log('🧪 Testando comportamento do frontend...');
    
    // Simular dados que vêm da API
    const receitas = [
      {
        receita_id: 5,
        receita_descricao: 'Teste Recorrente (2/12)',
        receita_valor: '1500.00',
        receita_data: '2025-08-30T03:00:00.000Z',
        receita_tipo: 'Salário',
        receita_recebido: false
      }
    ];
    
    const despesas = [
      {
        despesa_id: 10,
        despesa_descricao: 'Almoço Restaurante',
        despesa_valor: '100.00',
        despesa_data: '2025-08-03T03:00:00.000Z',
        despesa_tipo: 'Alimentação',
        despesa_pago: true
      }
    ];
    
    console.log('📊 Dados simulados:');
    console.log('💰 Receitas:', receitas.length);
    console.log('💸 Despesas:', despesas.length);
    
    // Simular a lógica do calendário
    const currentDate = new Date();
    const ano = currentDate.getFullYear();
    const mes = currentDate.getMonth();
    
    console.log(`📅 Mês atual: ${ano}-${mes + 1}`);
    
    // Testar filtro de datas
    const dataTeste = '2025-08-03';
    console.log(`\n🔍 Testando filtro para data: ${dataTeste}`);
    
    const receitasDoDia = receitas.filter(r => {
      const receitaData = new Date(r.receita_data).toISOString().split('T')[0];
      console.log(`📅 Comparando: ${receitaData} === ${dataTeste} = ${receitaData === dataTeste}`);
      return receitaData === dataTeste;
    });
    
    const despesasDoDia = despesas.filter(d => {
      const despesaData = new Date(d.despesa_data).toISOString().split('T')[0];
      console.log(`📅 Comparando: ${despesaData} === ${dataTeste} = ${despesaData === dataTeste}`);
      return despesaData === dataTeste;
    });
    
    console.log(`\n📊 Resultado do filtro:`);
    console.log(`💰 Receitas no dia ${dataTeste}: ${receitasDoDia.length}`);
    console.log(`💸 Despesas no dia ${dataTeste}: ${despesasDoDia.length}`);
    
    // Testar com data que tem dados
    const dataComDados = '2025-08-30';
    console.log(`\n🔍 Testando filtro para data: ${dataComDados}`);
    
    const receitasComDados = receitas.filter(r => {
      const receitaData = new Date(r.receita_data).toISOString().split('T')[0];
      return receitaData === dataComDados;
    });
    
    console.log(`💰 Receitas no dia ${dataComDados}: ${receitasComDados.length}`);
    
    console.log('\n✅ Teste do frontend concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testeCalendarioFrontend(); 