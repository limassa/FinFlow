const axios = require('axios');

async function monitorarDeploy() {
  try {
    console.log('🚀 Monitorando deploy no Railway...');
    console.log('====================================');
    
    let tentativas = 0;
    const maxTentativas = 10;
    
    while (tentativas < maxTentativas) {
      tentativas++;
      console.log(`\n📡 Tentativa ${tentativas}/${maxTentativas}...`);
      
      try {
        // Testar conexão básica
        const testResponse = await axios.get('https://finflow-production-e4b3.up.railway.app/');
        console.log('✅ Servidor respondendo:', testResponse.data.message);
        
        // Testar criação de despesa
        console.log('📝 Testando criação de despesa...');
        const despesaTeste = {
          descricao: 'Teste Deploy',
          valor: 100.00,
          data: '2024-12-19',
          tipo: 'Outros',
          usuario_id: 1
        };
        
        const postResponse = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaTeste);
        console.log('✅ Despesa criada com sucesso:', postResponse.data);
        
        // Limpar despesa de teste
        if (postResponse.data && postResponse.data.despesa_id) {
          await axios.delete(`https://finflow-production-e4b3.up.railway.app/api/despesas/${postResponse.data.despesa_id}`);
          console.log('🧹 Despesa de teste removida');
        }
        
        console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
        console.log('✅ Criação de despesas funcionando');
        console.log('✅ Problema resolvido');
        
        return;
        
      } catch (error) {
        console.log('⏳ Deploy ainda em andamento...');
        console.log('   Aguardando 30 segundos...');
        
        if (tentativas < maxTentativas) {
          await new Promise(resolve => setTimeout(resolve, 30000)); // 30 segundos
        }
      }
    }
    
    console.log('\n❌ Deploy não foi concluído no tempo esperado');
    console.log('   Verifique manualmente o status no Railway');
    
  } catch (error) {
    console.error('❌ Erro ao monitorar deploy:', error.message);
  }
}

monitorarDeploy(); 