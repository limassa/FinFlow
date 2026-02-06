const axios = require('axios');

async function testarRotasProducao() {
  console.log('🧪 TESTE DE ROTAS EM PRODUÇÃO');
  console.log('==============================');
  
  const baseUrl = 'https://finflow.lizsoftware.com.br';
  
  const rotas = [
    { nome: 'Teste', url: `${baseUrl}/api/test` },
    { nome: 'Contas', url: `${baseUrl}/api/contas?userId=1` },
    { nome: 'Saldo Total', url: `${baseUrl}/api/contas/saldo-total?userId=1` }
  ];
  
  for (const rota of rotas) {
    console.log(`\n🔍 Testando rota: ${rota.nome}`);
    console.log(`📋 URL: ${rota.url}`);
    
    try {
      const response = await axios.get(rota.url);
      console.log(`✅ Status: ${response.status}`);
      
      if (response.headers['content-type']?.includes('application/json')) {
        console.log('📊 Dados JSON:', response.data);
      } else {
        console.log('📊 Resposta HTML (primeiros 100 caracteres):', response.data.substring(0, 100) + '...');
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.response?.status || 'Sem status'}`);
      console.log(`📊 Dados: ${error.response?.data || error.message}`);
    }
  }
}

testarRotasProducao();

