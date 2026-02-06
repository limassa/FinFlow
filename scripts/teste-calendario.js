const axios = require('axios');

async function testeCalendario() {
  try {
    console.log('🧪 Testando funcionalidade do calendário...');
    
    // Testar endpoint de receitas
    console.log('\n📊 Testando endpoint de receitas...');
    const receitasResponse = await axios.get('http://localhost:3001/api/receitas?userId=1&mes=2025-08');
    console.log('✅ Receitas carregadas:', receitasResponse.data.length);
    console.log('📋 Primeira receita:', receitasResponse.data[0]);
    
    // Testar endpoint de despesas
    console.log('\n📊 Testando endpoint de despesas...');
    const despesasResponse = await axios.get('http://localhost:3001/api/despesas?userId=1&mes=2025-08');
    console.log('✅ Despesas carregadas:', despesasResponse.data.length);
    console.log('📋 Primeira despesa:', despesasResponse.data[0]);
    
    // Testar se há dados para o mês atual
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    console.log(`\n📅 Testando mês atual: ${mesAtual}`);
    
    const receitasMesAtual = await axios.get(`http://localhost:3001/api/receitas?userId=1&mes=${mesAtual}`);
    const despesasMesAtual = await axios.get(`http://localhost:3001/api/despesas?userId=1&mes=${mesAtual}`);
    
    console.log(`📊 Receitas do mês atual: ${receitasMesAtual.data.length}`);
    console.log(`📊 Despesas do mês atual: ${despesasMesAtual.data.length}`);
    
    // Verificar se há dados com datas específicas
    if (receitasMesAtual.data.length > 0) {
      console.log('\n📅 Exemplo de receita com data:', receitasMesAtual.data[0].receita_data);
    }
    
    if (despesasMesAtual.data.length > 0) {
      console.log('📅 Exemplo de despesa com data:', despesasMesAtual.data[0].despesa_data);
    }
    
    console.log('\n✅ Teste do calendário concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste do calendário:', error.response?.data || error.message);
  }
}

testeCalendario(); 