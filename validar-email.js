const nodemailer = require('./backend/node_modules/nodemailer');
require('dotenv').config({ path: './backend/config.env' });

console.log('🔍 Validador de Email - FinFlow\n');

async function validarEmail() {
  try {
    // 1. Verificar configurações
    console.log('1. Verificando configurações...');
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    
    if (!emailUser || !emailPass) {
      console.log('❌ Configuração incompleta');
      console.log('💡 Configure EMAIL_USER e EMAIL_PASS no backend/config.env');
      return;
    }
    
    console.log(`📧 Email: ${emailUser}`);
    console.log(`🔧 Serviço: ${emailService}`);
    console.log(`🔑 Senha: ${emailPass ? 'Configurada' : 'Não configurada'}`);
    
    // 2. Criar transporter
    console.log('\n2. Criando conexão...');
    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    // 3. Testar conexão
    console.log('\n3. Testando conexão...');
    await transporter.verify();
    console.log('✅ Conexão OK!');
    
    // 4. Enviar email de validação
    console.log('\n4. Enviando email de validação...');
    
    const mailOptions = {
      from: emailUser,
      to: emailUser,
      subject: '✅ Validação de Email - FinFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">✅ Validação OK!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Sistema de Email</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">🎉 Email Funcionando!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Se você recebeu este email, significa que a configuração está correta e o sistema 
              pode enviar emails automaticamente.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin-top: 0;">📋 Detalhes da Validação:</h3>
              <p style="color: #666; margin: 0;">
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>Servidor:</strong> ${emailService}<br>
                <strong>Email:</strong> ${emailUser}<br>
                <strong>Status:</strong> ✅ Validado
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
              <h3 style="color: #333; margin-top: 0;">🚀 Próximos Passos:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>✅ Email configurado e funcionando</li>
                <li>🔄 Teste cadastro de usuário</li>
                <li>🔄 Teste redefinição de senha</li>
                <li>🔄 Teste lembretes de vencimento</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Acessar FinFlow
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Este é um email de validação automático do sistema FinFlow.
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de validação enviado!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Para: ${info.accepted.join(', ')}`);
    
    // 5. Resumo final
    console.log('\n🎉 Validação concluída com sucesso!');
    console.log('✅ Sistema de email funcionando');
    console.log('✅ Pronto para testes no navegador');
    console.log('✅ Funcionalidades disponíveis:');
    console.log('   - Email de boas-vindas');
    console.log('   - Redefinição de senha');
    console.log('   - Alertas de segurança');
    console.log('   - Lembretes de vencimento');
    
    console.log('\n🚀 Próximos passos:');
    console.log('1. Execute: cd backend && npm start');
    console.log('2. Em outro terminal: npm start');
    console.log('3. Teste no navegador: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
    console.error('\n🔧 Possíveis soluções:');
    console.error('1. Verifique EMAIL_USER e EMAIL_PASS no config.env');
    console.error('2. Para Gmail, use senha de app');
    console.error('3. Verifique verificação em duas etapas');
    console.error('4. Teste com outro provedor de email');
  }
}

validarEmail().catch(console.error); 