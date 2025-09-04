const userRepository = require('./src/database/userRepository');

async function testarCriacaoContaCompleta() {
  try {
    console.log('🧪 TESTE COMPLETO DE CRIAÇÃO DE CONTA');
    console.log('=====================================');
    
    const userId = 1;
    
    // 1. Verificar saldo total antes
    console.log('\n1. SALDO TOTAL ANTES');
    console.log('====================');
    const saldoAntes = await userRepository.getSaldoTotalContas(userId);
    console.log(`💰 Saldo total antes: R$ ${saldoAntes.toFixed(2)}`);
    
    // 2. Criar nova conta
    console.log('\n2. CRIANDO NOVA CONTA');
    console.log('=====================');
    const dadosConta = {
      nome: 'Conta Teste Saldo Final',
      tipo: 'Corrente',
      saldo: 2500.75,
      incrementarSaldoTotal: true,
      usuario_id: userId
    };
    
    console.log('📝 Dados da conta:', dadosConta);
    const conta = await userRepository.createConta(dadosConta);
    console.log('✅ Conta criada:', conta.conta_nome, '- R$', conta.conta_saldo);
    
    // 3. Verificar saldo total depois
    console.log('\n3. SALDO TOTAL DEPOIS');
    console.log('======================');
    const saldoDepois = await userRepository.getSaldoTotalContas(userId);
    console.log(`💰 Saldo total depois: R$ ${saldoDepois.toFixed(2)}`);
    
    // 4. Verificar diferença
    console.log('\n4. VERIFICAÇÃO');
    console.log('===============');
    const diferenca = saldoDepois - saldoAntes;
    const valorEsperado = parseFloat(dadosConta.saldo);
    
    console.log(`📊 Diferença: R$ ${diferenca.toFixed(2)}`);
    console.log(`📊 Valor esperado: R$ ${valorEsperado.toFixed(2)}`);
    console.log(`✅ Cálculo correto: ${Math.abs(diferenca - valorEsperado) < 0.01 ? 'SIM' : 'NÃO'}`);
    
    // 5. Listar todas as contas
    console.log('\n5. LISTA DE CONTAS');
    console.log('==================');
    const contas = await userRepository.getContas(userId);
    console.log(`📋 Total de contas: ${contas.length}`);
    
    contas.forEach((conta, index) => {
      console.log(`   ${index + 1}. ${conta.conta_nome} - R$ ${parseFloat(conta.conta_saldo).toFixed(2)}`);
    });
    
    const somaManual = contas.reduce((sum, conta) => sum + parseFloat(conta.conta_saldo || 0), 0);
    console.log(`\n💰 Soma manual: R$ ${somaManual.toFixed(2)}`);
    console.log(`💰 Função getSaldoTotalContas: R$ ${saldoDepois.toFixed(2)}`);
    console.log(`✅ Valores coincidem: ${Math.abs(somaManual - saldoDepois) < 0.01 ? 'SIM' : 'NÃO'}`);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

testarCriacaoContaCompleta();
