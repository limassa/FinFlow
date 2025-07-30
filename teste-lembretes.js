const axios = require('axios');

// Configurações
const API_BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = 1; // Altere para o ID do usuário que deseja testar

async function testarLembretes() {
  console.log('🔔 Testando Sistema de Lembretes - FinFlow\n');
  
  try {
    // 1. Verificar vencimentos próximos
    console.log('1. Verificando vencimentos próximos...');
    const vencimentosResponse = await axios.get(`${API_BASE_URL}/api/lembretes/vencimentos?userId=${TEST_USER_ID}`);
    
    if (vencimentosResponse.data.length === 0) {
      console.log('❌ Nenhuma despesa com vencimento próximo encontrada');
      console.log('💡 Para testar, crie uma despesa com vencimento nos próximos 5 dias');
      return;
    }
    
    console.log(`✅ Encontradas ${vencimentosResponse.data.length} despesa(s) com vencimento próximo:`);
    vencimentosResponse.data.forEach((venc, index) => {
      console.log(`   ${index + 1}. ${venc.despesa_descricao} - R$ ${venc.despesa_valor} - Vence: ${venc.despesa_dtvencimento}`);
    });
    
    // 2. Verificar configurações de lembretes do usuário
    console.log('\n2. Verificando configurações de lembretes...');
    const lembretesResponse = await axios.get(`${API_BASE_URL}/api/user/lembretes?userId=${TEST_USER_ID}`);
    console.log('✅ Configurações de lembretes:', lembretesResponse.data);
    
    // 3. Testar envio de email
    console.log('\n3. Testando envio de email de lembrete...');
    const emailResponse = await axios.post(`${API_BASE_URL}/api/lembretes/teste-email`, {
      userId: TEST_USER_ID
    });
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log('📧 Detalhes:', emailResponse.data);
    
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('📧 Verifique sua caixa de entrada para ver o email de teste.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Dicas para resolver:');
      console.log('1. Verifique se o usuário ID está correto');
      console.log('2. Crie uma despesa com vencimento nos próximos 5 dias');
      console.log('3. Ative os lembretes por email nas configurações do usuário');
    }
  }
}

// Função para criar uma despesa de teste
async function criarDespesaTeste() {
  console.log('📝 Criando despesa de teste...');
  
  try {
    // Data de vencimento para amanhã
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataVencimento = amanha.toISOString().split('T')[0];
    
    const despesaTeste = {
      descricao: 'Teste de Lembrete - FinFlow',
      valor: 150.00,
      data: new Date().toISOString().split('T')[0],
      dataVencimento: dataVencimento,
      tipo: 'Conta',
      pago: false,
      conta_id: 1, // Assumindo que existe uma conta com ID 1
      usuario_id: TEST_USER_ID
    };
    
    const response = await axios.post(`${API_BASE_URL}/api/despesas`, despesaTeste);
    console.log('✅ Despesa de teste criada com sucesso!');
    console.log('📅 Vencimento:', dataVencimento);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar despesa de teste:', error.response?.data || error.message);
    return null;
  }
}

// Menu principal
async function menuPrincipal() {
  console.log('\n🔔 Teste de Lembretes - FinFlow');
  console.log('================================');
  console.log('1. Testar sistema de lembretes');
  console.log('2. Criar despesa de teste');
  console.log('3. Sair');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nEscolha uma opção (1-3): ', async (opcao) => {
    switch (opcao) {
      case '1':
        await testarLembretes();
        break;
      case '2':
        await criarDespesaTeste();
        break;
      case '3':
        console.log('👋 Até logo!');
        rl.close();
        return;
      default:
        console.log('❌ Opção inválida');
    }
    
    rl.close();
    setTimeout(menuPrincipal, 2000);
  });
}

// Executar menu se chamado diretamente
if (require.main === module) {
  menuPrincipal();
}

module.exports = { testarLembretes, criarDespesaTeste }; 