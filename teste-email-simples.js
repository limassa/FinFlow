const emailService = require('./backend/src/services/emailService');

async function testarEmail() {
  console.log('📧 Testando envio de email...');
  
  try {
    // Testar envio de email de boas-vindas
    const resultado = await emailService.sendWelcomeEmail({
      nome: 'Teste',
      email: 'joaolmnmarket@gmail.com'
    });
    
    if (resultado) {
      console.log('✅ Email enviado com sucesso!');
    } else {
      console.log('❌ Falha ao enviar email');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarEmail(); 