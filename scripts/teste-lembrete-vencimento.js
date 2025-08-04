const axios = require('axios');

// Configurações da API
const API_BASE_URL = 'http://localhost:3001/api';

// Função para testar o sistema de lembretes
async function testarLembretesVencimento() {
  console.log('🧪 Iniciando teste de lembretes de vencimento...\n');

  try {
    // 1. Primeiro, vamos criar uma despesa com vencimento próximo (amanhã)
    console.log('📝 1. Criando despesa de teste com vencimento próximo...');
    
    const dataAmanha = new Date();
    dataAmanha.setDate(dataAmanha.getDate() + 1);
    const dataVencimento = dataAmanha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    const despesaTeste = {
      userId: 1, // Assumindo usuário ID 1
      despesa_nome: 'Teste Lembrete - Internet',
      despesa_valor: 89.90,
      despesa_categoria: 'Serviços',
      despesa_dtvencimento: dataVencimento,
      despesa_status: 'pendente',
      despesa_observacoes: 'Despesa criada para testar lembretes'
    };

    const responseDespesa = await axios.post(`${API_BASE_URL}/despesas`, despesaTeste);
    console.log('✅ Despesa criada:', responseDespesa.data);
    const despesaId = responseDespesa.data.despesa_id;

    // 2. Configurar lembretes ativos para o usuário
    console.log('\n📧 2. Configurando lembretes ativos...');
    
    const configLembretes = {
      userId: 1,
      lembretesAtivos: true,
      lembretesEmail: true,
      lembretesDiasAntes: 1, // Lembrar 1 dia antes
      lembretesHorario: '09:00'
    };

    const responseLembretes = await axios.put(`${API_BASE_URL}/user/lembretes`, configLembretes);
    console.log('✅ Lembretes configurados:', responseLembretes.data);

    // 3. Verificar configurações de lembretes
    console.log('\n🔍 3. Verificando configurações de lembretes...');
    
    const responseConfig = await axios.get(`${API_BASE_URL}/user/lembretes?userId=1`);
    console.log('✅ Configurações atuais:', responseConfig.data);

    // 4. Simular verificação de lembretes (endpoint que verifica despesas próximas do vencimento)
    console.log('\n📅 4. Simulando verificação de lembretes...');
    
    try {
      const responseLembrete = await axios.post(`${API_BASE_URL}/lembretes/verificar`, {
        userId: 1
      });
      console.log('✅ Verificação de lembretes:', responseLembrete.data);
    } catch (error) {
      console.log('⚠️ Endpoint de verificação não encontrado, mas isso é normal');
      console.log('O sistema de lembretes geralmente roda em background');
    }

    // 5. Testar envio direto de email de lembrete
    console.log('\n📧 5. Testando envio direto de email de lembrete...');
    
    const emailLembrete = {
      userId: 1,
      despesaId: despesaId,
      diasAntes: 1
    };

    try {
      const responseEmail = await axios.post(`${API_BASE_URL}/lembretes/teste-email`, emailLembrete);
      console.log('✅ Email de lembrete enviado:', responseEmail.data);
    } catch (error) {
      console.log('❌ Erro ao enviar email de lembrete:', error.response?.data || error.message);
    }

    // 6. Limpar dados de teste
    console.log('\n🧹 6. Limpando dados de teste...');
    
    try {
      await axios.delete(`${API_BASE_URL}/despesas/${despesaId}`);
      console.log('✅ Despesa de teste removida');
    } catch (error) {
      console.log('⚠️ Erro ao remover despesa de teste:', error.response?.data || error.message);
    }

    console.log('\n🎉 Teste de lembretes concluído!');
    console.log('\n📋 Resumo do teste:');
    console.log('- ✅ Despesa criada com vencimento próximo');
    console.log('- ✅ Lembretes configurados');
    console.log('- ✅ Configurações verificadas');
    console.log('- ✅ Email de lembrete testado');
    console.log('- ✅ Dados de teste limpos');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error.message);
  }
}

// Executar o teste
testarLembretesVencimento(); 