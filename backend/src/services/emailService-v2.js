const nodemailer = require('nodemailer');

class EmailServiceV2 {
  constructor() {
    this.transporter = this.createTransporter();
  }
  
  createTransporter() {
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailSecure = process.env.EMAIL_SECURE === 'true';
    
    // Configuração baseada no serviço
    if (emailService === 'smtp' && emailHost) {
      // SMTP personalizado
      return nodemailer.createTransporter({
        host: emailHost,
        port: parseInt(emailPort) || 587,
        secure: emailSecure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Serviços predefinidos (gmail, outlook, yahoo, etc.)
      return nodemailer.createTransporter({
        service: emailService,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }
  
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Conexão com servidor de email OK!');
      return true;
    } catch (error) {
      console.error('❌ Erro na conexão com servidor de email:', error.message);
      return false;
    }
  }
  
  async sendTestEmail() {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: '🧪 Teste de Email - FinFlow',
      html: this.getTestEmailTemplate()
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de teste enviado com sucesso!');
      console.log(`📧 Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de teste:', error.message);
      return false;
    }
  }
  
  getTestEmailTemplate() {
    return `
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
              <strong>Servidor:</strong> ${process.env.EMAIL_SERVICE || 'Gmail'}<br>
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
    `;
  }
  
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Bem-vindo ao FinFlow! 🎉',
      html: this.getWelcomeEmailTemplate(user)
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email de boas-vindas enviado para:', user.email);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      return false;
    }
  }
  
  getWelcomeEmailTemplate(user) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo ao FinFlow!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Sua conta foi criada com sucesso</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${user.nome}!</h2>
          
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
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Acessar FinFlow
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Se você não criou esta conta, ignore este email.
          </p>
        </div>
      </div>
    `;
  }
  
  async sendPasswordResetEmail(user, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Redefinição de Senha - FinFlow',
      html: this.getPasswordResetTemplate(user, resetLink)
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email de redefinição de senha enviado para:', user.email);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      return false;
    }
  }
  
  getPasswordResetTemplate(user, resetLink) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🔐 Redefinição de Senha</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Segurança em primeiro lugar</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${user.nome}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Recebemos uma solicitação para redefinir sua senha. Se você não fez esta solicitação, 
            pode ignorar este email com segurança.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="color: #666; margin: 0;">
              <strong>Este link expira em 1 hora por questões de segurança.</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <span style="color: #667eea; word-break: break-all;">${resetLink}</span>
          </p>
        </div>
      </div>
    `;
  }
}

module.exports = new EmailServiceV2(); 