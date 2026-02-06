const nodemailer = require('./backend/node_modules/nodemailer');
require('dotenv').config({ path: './backend/config.env' });

// Configuração do transporter para teste
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
    pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
  }
});

async function testarEmail() {
  console.log('📧 Testando configuração de email...\n');
  
  try {
    // 1. Verificar configurações
    console.log('1. Verificando configurações...');
    console.log(`📧 Email: ${process.env.EMAIL_USER}`);
    console.log(`🔑 Senha: ${process.env.EMAIL_PASS ? 'Configurada' : 'Não configurada'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    
    // 2. Testar conexão
    console.log('\n2. Testando conexão com servidor de email...');
    await transporter.verify();
    console.log('✅ Conexão com servidor de email OK!');
    
    // 3. Enviar email de teste
    console.log('\n3. Enviando email de teste...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Enviar para o próprio email
      subject: '🧪 Teste de Email - FinFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🧪 Teste de Email</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Sistema de Email</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">✅ Email Funcionando!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Este é um email de teste para verificar se a configuração de email do FinFlow está funcionando corretamente.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📋 Detalhes do Teste:</h3>
              <p style="color: #666; margin: 0;">
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>Servidor:</strong> Gmail<br>
                <strong>Status:</strong> Funcionando ✅
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Se você recebeu este email, significa que a configuração está correta e o sistema 
              pode enviar emails automaticamente (boas-vindas, redefinição de senha, lembretes, etc.).
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Acessar FinFlow
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Este é um email de teste automático do sistema FinFlow.
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de teste enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Para: ${info.accepted.join(', ')}`);
    
    console.log('\n🎉 Teste de email concluído com sucesso!');
    console.log('✅ O sistema FinFlow pode enviar emails automaticamente');
    console.log('✅ Funcionalidades disponíveis:');
    console.log('   - Email de boas-vindas');
    console.log('   - Redefinição de senha');
    console.log('   - Alertas de segurança');
    console.log('   - Lembretes de vencimento');
    
  } catch (error) {
    console.error('❌ Erro no teste de email:', error.message);
    console.error('\n🔧 Possíveis soluções:');
    console.error('1. Verifique se o EMAIL_USER e EMAIL_PASS estão corretos');
    console.error('2. Para Gmail, use "Senha de App" em vez da senha normal');
    console.error('3. Verifique se a autenticação de 2 fatores está configurada');
    console.error('4. Teste com outro provedor de email (Outlook, Yahoo, etc.)');
  }
}

testarEmail().catch(console.error); 