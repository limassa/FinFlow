// Testar o serviço de email usado pelo backend
const emailService = require('./src/services/emailService');

console.log('🔍 TESTANDO SERVIÇO DE EMAIL DO BACKEND');
console.log('========================================\n');

// Verificar se o serviço foi carregado corretamente
console.log('1. Verificando carregamento do serviço...');
console.log('✅ EmailService carregado:', typeof emailService);
console.log('✅ Transporter configurado:', !!emailService.transporter);

// Testar envio de email usando o serviço
async function testarServico() {
  try {
    console.log('\n2. Testando envio de email usando o serviço...');
    
    const user = {
      nome: 'Usuário Teste',
      email: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com'
    };
    
    console.log('📧 Enviando email para:', user.email);
    
    const resultado = await emailService.sendWelcomeEmail(user);
    
    if (resultado) {
      console.log('✅ Email enviado com sucesso usando o serviço!');
      console.log('✅ O serviço de email está funcionando corretamente');
    } else {
      console.log('❌ Falha ao enviar email usando o serviço');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar serviço:', error.message);
  }
}

// Executar teste
testarServico().catch(console.error); 