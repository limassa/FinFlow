const axios = require('axios');

async function simularFrontend() {
  try {
    console.log('🧪 SIMULAÇÃO DO FRONTEND');
    console.log('========================');
    
    const userId = 1;
    const baseUrl = 'http://localhost:3001';
    
    // 1. Buscar contas antes
    console.log('\n1. BUSCANDO CONTAS ANTES');
    console.log('=========================');
    const contasAntes = await axios.get(`${baseUrl}/api/contas?userId=${userId}`);
    console.log(`📋 Contas encontradas: ${contasAntes.data.length}`);
    
    const saldoAntes = contasAntes.data.reduce((sum, conta) => sum + parseFloat(conta.conta_saldo || 0), 0);
    console.log(`💰 Saldo total antes: R$ ${saldoAntes.toFixed(2)}`);
    
    // 2. Criar nova conta
    console.log('\n2. CRIANDO NOVA CONTA');
    console.log('=====================');
    const dadosConta = {
      nome: 'Conta Frontend Teste',
      tipo: 'Corrente',
      saldo: 1000.00,
      incrementarSaldoTotal: true,
      usuario_id: userId
    };
    
    console.log('📝 Dados da conta:', dadosConta);
    const novaConta = await axios.post(`${baseUrl}/api/contas`, dadosConta);
    console.log('✅ Conta criada:', novaConta.data.conta_nome, '- R$', novaConta.data.conta_saldo);
    
    // 3. Buscar contas depois
    console.log('\n3. BUSCANDO CONTAS DEPOIS');
    console.log('==========================');
    const contasDepois = await axios.get(`${baseUrl}/api/contas?userId=${userId}`);
    console.log(`📋 Contas encontradas: ${contasDepois.data.length}`);
    
    const saldoDepois = contasDepois.data.reduce((sum, conta) => sum + parseFloat(conta.conta_saldo || 0), 0);
    console.log(`💰 Saldo total depois: R$ ${saldoDepois.toFixed(2)}`);
    
    // 4. Testar rota de saldo total
    console.log('\n4. TESTANDO ROTA SALDO TOTAL');
    console.log('=============================');
    const saldoTotalResponse = await axios.get(`${baseUrl}/api/contas/saldo-total?userId=${userId}`);
    console.log('✅ Resposta da rota saldo-total:', saldoTotalResponse.data);
    
    // 5. Verificação
    console.log('\n5. VERIFICAÇÃO');
    console.log('===============');
    const diferenca = saldoDepois - saldoAntes;
    const valorEsperado = parseFloat(dadosConta.saldo);
    
    console.log(`📊 Diferença: R$ ${diferenca.toFixed(2)}`);
    console.log(`📊 Valor esperado: R$ ${valorEsperado.toFixed(2)}`);
    console.log(`✅ Cálculo correto: ${Math.abs(diferenca - valorEsperado) < 0.01 ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Rota saldo-total funciona: ${saldoTotalResponse.data.saldoTotal === saldoDepois ? 'SIM' : 'NÃO'}`);
    
  } catch (error) {
    console.error('❌ Erro na simulação:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Dados:`, error.response.data);
    }
  } finally {
    process.exit(0);
  }
}

simularFrontend();
