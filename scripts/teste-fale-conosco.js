const axios = require('axios');

// Configuração da API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function testarFaleConosco() {
  console.log('📧 Testando envio de email "Fale Conosco"...');
  console.log('📡 API URL:', API_URL);
  
  try {
    // Dados de teste para o formulário
    const dadosTeste = {
      nome: 'João Silva',
      email: 'joao.silva@teste.com',
      telefone: '(11) 99999-9999',
      tipo: 'sugestao',
      mensagem: 'Olá! Gostaria de sugerir uma nova funcionalidade para o sistema. Seria muito útil ter um relatório mensal mais detalhado com gráficos de evolução financeira. Obrigado!'
    };
    
    console.log('\n📋 Dados de teste:');
    console.log('   - Nome:', dadosTeste.nome);
    console.log('   - Email:', dadosTeste.email);
    console.log('   - Telefone:', dadosTeste.telefone);
    console.log('   - Tipo:', dadosTeste.tipo);
    console.log('   - Mensagem:', dadosTeste.mensagem.substring(0, 50) + '...');
    
    // Enviar requisição para a API
    console.log('\n🚀 Enviando requisição para /api/fale-conosco...');
    const response = await axios.post(`${API_URL}/api/fale-conosco`, dadosTeste);
    
    console.log('✅ Resposta da API:');
    console.log('   - Status:', response.status);
    console.log('   - Mensagem:', response.data.message);
    console.log('   - Status:', response.data.status);
    
    console.log('\n🎉 Teste de "Fale Conosco" concluído com sucesso!');
    console.log('📧 Verifique se o email foi recebido no endereço de suporte.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.response) {
      console.error('📋 Detalhes do erro:');
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Executar o teste
testarFaleConosco(); 