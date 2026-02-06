const nodemailer = require('nodemailer');

console.log('🧪 TESTE DE CADASTRO COMPLETO - SIMULANDO PRODUÇÃO');
console.log('====================================================');

// Simular variáveis de produção
process.env.EMAIL_USER = 'contatoLizSoftware@gmail.com';
process.env.EMAIL_PASS = 'xdas ngdw yeao sgou';
process.env.EMAIL_SERVICE = 'gmail';
process.env.FRONTEND_URL = 'https://finflow.lizsoftwares.com';
process.env.NODE_ENV = 'production';

// Simular dados de usuário como na rota real
const userData = {
  nome: 'Usuário Teste',
  telefone: '(11) 99999-9999',
  email: 'joaolmnmarket@gmail.com',
  senha: 'Teste123!@#'
};

console.log('1. DADOS DO USUÁRIO DE TESTE');
console.log('==============================');
console.log(`👤 Nome: ${userData.nome}`);
console.log(`📱 Telefone: ${userData.telefone}`);
console.log(`📧 Email: ${userData.email}`);
console.log(`🔑 Senha: ${userData.senha ? 'Configurada' : 'Não configurada'}`);

console.log('\n2. CONFIGURANDO EMAIL SERVICE');
console.log('===============================');
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('3. SIMULANDO PROCESSO DE CADASTRO');
console.log('==================================');

// Simular criação do usuário (como na rota real)
const mockUser = {
  usuario_nome: userData.nome,
  usuario_email: userData.email
};

console.log('✅ Usuário simulado criado:', mockUser);

console.log('\n4. ENVIANDO EMAIL DE BOAS-VINDAS');
console.log('==================================');

// Simular EXATAMENTE o que acontece na rota de cadastro
const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@finflow.com',
    to: user.usuario_email,
    subject: 'Bem-vindo ao FinFlow! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo ao FinFlow!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Sua conta foi criada com sucesso</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${user.usuario_nome}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Estamos muito felizes em tê-lo conosco! O FinFlow é a ferramenta perfeita para 
            controlar suas finanças de forma simples e eficiente.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">✨ O que você pode fazer:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Cadastrar receitas e despesas</li>
              <li>Gerenciar múltiplas contas</li>
              <li>Visualizar relatórios detalhados</li>
              <li>Acompanhar sua evolução financeira</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Acessar FinFlow
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Se você não criou esta conta, ignore este email.
          </p>
        </div>
      </div>
    `
  };
  
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de boas-vindas enviado para:', user.usuario_email);
    console.log(`📧 Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error);
    return false;
  }
};

// Executar o envio como na rota real
console.log('🚀 Iniciando envio de email...');
sendWelcomeEmail(mockUser)
  .then(success => {
    if (success) {
      console.log('\n🎉 TESTE DE CADASTRO CONCLUÍDO!');
      console.log('==================================');
      console.log('✅ Usuário simulado criado com sucesso');
      console.log('✅ Email de boas-vindas enviado com sucesso');
      console.log('✅ Sistema funcionando como em produção');
      
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log('1. Verifique se o email chegou em: joaolmnmarket@gmail.com');
      console.log('2. Se chegou, o problema está na integração da rota real');
      console.log('3. Se não chegou, há um problema no processo de envio');
    } else {
      console.log('\n❌ TESTE FALHOU!');
      console.log('==================');
      console.log('❌ Email de boas-vindas não foi enviado');
      console.log('❌ Verifique os logs de erro acima');
    }
  })
  .catch(error => {
    console.error('\n💥 ERRO CRÍTICO:', error);
  }); 