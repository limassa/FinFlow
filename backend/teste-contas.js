const userRepository = require('./src/database/userRepository');

console.log('🧪 TESTE DE FUNCIONALIDADE DE CONTAS');
console.log('=====================================\n');

async function testarContas() {
  try {
    console.log('1. TESTANDO CRIAÇÃO DE CONTA');
    console.log('=============================');
    
    const dadosConta = {
      nome: 'Conta Teste',
      tipo: 'Corrente',
      saldo: 1000.00,
      incrementarSaldoTotal: true,
      usuario_id: 1 // Assumindo que existe um usuário com ID 1
    };
    
    console.log('   📝 Dados da conta:', dadosConta);
    
    try {
      const conta = await userRepository.createConta(dadosConta);
      console.log('   ✅ Conta criada com sucesso!');
      console.log('   📊 Conta criada:', conta);
      
      console.log('\n2. TESTANDO BUSCA DE CONTAS');
      console.log('============================');
      
      const contas = await userRepository.getContas(1);
      console.log('   ✅ Contas encontradas:', contas.length);
      console.log('   📋 Lista de contas:', contas);
      
    } catch (error) {
      console.log('   ❌ Erro ao criar conta:', error.message);
      console.log('   🔍 Stack trace:', error.stack);
    }
    
  } catch (error) {
    console.log('💥 Erro geral:', error.message);
    console.log('🔍 Stack trace:', error.stack);
  }
}

// Executar teste
testarContas().catch(console.error);
