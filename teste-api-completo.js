const axios = require('axios');
const userRepository = require('./backend/src/database/userRepository');
const emailService = require('./backend/src/services/emailService');

async function testarAPICompleto() {
  console.log('🔔 Testando API completa de lembretes...');
  
  try {
    const userId = 4;
    
    // 1. Buscar usuário
    console.log('1. Buscando usuário...');
    const user = await userRepository.findUserById(userId);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    console.log('✅ Usuário encontrado:', user.usuario_nome, user.usuario_email);
    
    // 2. Verificar lembretes
    if (!user.usuario_lembretesemail) {
      console.log('❌ Lembretes por email desativados');
      return;
    }
    console.log('✅ Lembretes por email ativos');
    
    // 3. Buscar vencimentos
    console.log('2. Buscando vencimentos próximos...');
    const vencimentos = await userRepository.getVencimentosProximos(userId);
    console.log('📊 Vencimentos encontrados:', vencimentos.length);
    
    if (vencimentos.length === 0) {
      console.log('❌ Nenhum vencimento próximo encontrado');
      return;
    }
    
    // 4. Enviar email
    console.log('3. Enviando email de lembrete...');
    const emailEnviado = await emailService.sendReminderEmail({
      nome: user.usuario_nome,
      email: user.usuario_email
    }, vencimentos);
    
    if (emailEnviado) {
      console.log('✅ Email enviado com sucesso!');
      console.log('📧 Destinatário:', user.usuario_email);
      console.log('📊 Vencimentos incluídos:', vencimentos.length);
    } else {
      console.log('❌ Falha ao enviar email');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarAPICompleto(); 