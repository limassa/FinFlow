const axios = require('axios');

console.log('🔍 VERIFICANDO STATUS DA APLICAÇÃO EM PRODUÇÃO');
console.log('================================================');

const PRODUCTION_URL = 'https://finflow-backend-production.up.railway.app';

console.log(`🌐 URL: ${PRODUCTION_URL}`);
console.log('🏭 Ambiente: PRODUÇÃO (Railway)');

async function verificarStatus() {
  console.log('\n1. TESTANDO HEALTHCHECK');
  console.log('=========================');
  
  try {
    const healthResponse = await axios.get(`${PRODUCTION_URL}/health`, {
      timeout: 10000
    });
    
    console.log('✅ Healthcheck OK:');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Mensagem: ${healthResponse.data.message}`);
    console.log(`   Versão: ${healthResponse.data.version}`);
    console.log(`   Timestamp: ${healthResponse.data.timestamp}`);
    
  } catch (error) {
    console.log('❌ Healthcheck falhou:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Erro: ${error.response.data.error || 'Erro desconhecido'}`);
    } else {
      console.log(`   Erro: ${error.message}`);
    }
  }
  
  console.log('\n2. TESTANDO ROTA RAIZ');
  console.log('========================');
  
  try {
    const rootResponse = await axios.get(`${PRODUCTION_URL}/`, {
      timeout: 10000
    });
    
    console.log('✅ Rota raiz OK:');
    console.log(`   Status: ${rootResponse.status}`);
    console.log(`   Mensagem: ${rootResponse.data.message}`);
    console.log(`   Versão: ${rootResponse.data.version}`);
    console.log(`   Ambiente: ${rootResponse.data.environment}`);
    
  } catch (error) {
    console.log('❌ Rota raiz falhou:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Erro: ${error.response.data.error || 'Erro desconhecido'}`);
    } else {
      console.log(`   Erro: ${error.message}`);
    }
  }
  
  console.log('\n3. TESTANDO ROTA DE TESTE');
  console.log('============================');
  
  try {
    const testResponse = await axios.get(`${PRODUCTION_URL}/api/test`, {
      timeout: 10000
    });
    
    console.log('✅ Rota de teste OK:');
    console.log(`   Status: ${testResponse.status}`);
    console.log(`   Mensagem: ${testResponse.data.message}`);
    console.log(`   Ambiente: ${testResponse.data.environment}`);
    
  } catch (error) {
    console.log('❌ Rota de teste falhou:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Erro: ${error.response.data.error || 'Erro desconhecido'}`);
    } else {
      console.log(`   Erro: ${error.message}`);
    }
  }
  
  console.log('\n4. TESTANDO ROTA DE CADASTRO');
  console.log('===============================');
  
  try {
    const cadastroResponse = await axios.get(`${PRODUCTION_URL}/api/cadastro`, {
      timeout: 10000
    });
    
    console.log('✅ Rota de cadastro OK (GET):');
    console.log(`   Status: ${cadastroResponse.status}`);
    
  } catch (error) {
    console.log('❌ Rota de cadastro falhou:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Erro: ${error.response.data.error || 'Erro desconhecido'}`);
      
      if (error.response.status === 404) {
        console.log('   🚨 PROBLEMA CRÍTICO: Rota não encontrada!');
        console.log('   💡 A aplicação pode não estar funcionando corretamente');
      }
    } else {
      console.log(`   Erro: ${error.message}`);
    }
  }
  
  console.log('\n📊 RESUMO DO STATUS');
  console.log('====================');
  console.log('🔍 Verifique se:');
  console.log('   1. A aplicação foi deployada corretamente no Railway');
  console.log('   2. As variáveis de ambiente estão configuradas');
  console.log('   3. O banco de dados está acessível');
  console.log('   4. Não há erros nos logs do Railway');
}

// Executar verificação
verificarStatus(); 