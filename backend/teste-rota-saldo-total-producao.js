const axios = require('axios');

async function testarRotaSaldoTotal() {
  console.log('🧪 TESTE DA ROTA DE SALDO TOTAL EM PRODUÇÃO');
  console.log('=============================================');
  
  // URL de produção
  const url = 'https://finflow.lizsoftware.com.br/api/contas/saldo-total?userId=1';
  
  console.log('🌐 Testando URL:', url);
  console.log('📋 Método: GET');
  console.log('📋 Parâmetros: userId=1');
  
  try {
    console.log('🔄 Fazendo requisição...');
    const response = await axios.get(url);
    
    console.log('✅ Sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📊 Dados:', response.data);
    
    if (response.data.saldoTotal !== undefined) {
      console.log('💰 Saldo Total:', response.data.saldoTotal);
    }
    
  } catch (error) {
    console.log('❌ Erro na requisição:');
    console.log('📊 Status:', error.response?.status || 'Sem status');
    console.log('📊 Dados:', error.response?.data || error.message);
  }
}

testarRotaSaldoTotal();

