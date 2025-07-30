const emailService = require('./backend/src/services/emailService');

async function testarLembreteDetalhado() {
  console.log('🔔 Testando envio de lembrete detalhado...');
  
  try {
    // Dados simulados de vencimentos
    const vencimentos = [
      {
        despesa_descricao: 'Teste de Lembrete - FinFlow',
        despesa_valor: 150.00,
        despesa_dtvencimento: '2025-07-31T03:00:00.000Z',
        despesa_pago: false
      },
      {
        despesa_descricao: 'Teste Recebimento',
        despesa_valor: 1500.00,
        despesa_dtvencimento: '2025-07-30T03:00:00.000Z',
        despesa_pago: false
      }
    ];
    
    const user = {
      nome: 'João Teste',
      email: 'joaolmnmarket@gmail.com'
    };
    
    console.log('📊 Vencimentos:', vencimentos.length);
    console.log('👤 Usuário:', user.nome, user.email);
    
    // Testar envio de lembrete
    const resultado = await emailService.sendReminderEmail(user, vencimentos);
    
    if (resultado) {
      console.log('✅ Lembrete enviado com sucesso!');
    } else {
      console.log('❌ Falha ao enviar lembrete');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarLembreteDetalhado(); 