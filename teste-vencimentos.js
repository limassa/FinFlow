const userRepository = require('./backend/src/database/userRepository');

async function testarVencimentos() {
  console.log('📅 Testando busca de vencimentos próximos...');
  
  try {
    const userId = 4;
    console.log('👤 Buscando vencimentos para usuário ID:', userId);
    
    const vencimentos = await userRepository.getVencimentosProximos(userId);
    
    console.log('📊 Vencimentos encontrados:', vencimentos.length);
    
    if (vencimentos.length > 0) {
      console.log('📋 Detalhes dos vencimentos:');
      vencimentos.forEach((venc, index) => {
        console.log(`   ${index + 1}. ${venc.despesa_descricao}`);
        console.log(`      Valor: R$ ${venc.despesa_valor}`);
        console.log(`      Vencimento: ${venc.despesa_dtvencimento}`);
        console.log(`      Pago: ${venc.despesa_pago}`);
        console.log(`      Email: ${venc.usuario_email}`);
        console.log(`      Nome: ${venc.usuario_nome}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhum vencimento encontrado');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarVencimentos(); 