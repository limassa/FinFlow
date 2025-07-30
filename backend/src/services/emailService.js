const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configuração do transporter (você pode usar Gmail, Outlook, ou outros serviços)
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // ou 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER || 'seu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'sua-senha-de-app'
      }
    });
  }
  
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@finflow.com',
      to: user.email,
      subject: 'Bem-vindo ao FinFlow! 🎉',
      html: `
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
      `
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
  
  async sendPasswordResetEmail(user, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@finflow.com',
      to: user.email,
      subject: 'Redefinição de Senha - FinFlow',
      html: `
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
      `
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
  
  async sendSecurityAlert(user, action) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@finflow.com',
      to: user.email,
      subject: 'Alerta de Segurança - FinFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">⚠️ Alerta de Segurança</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Protegendo sua conta</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Olá, ${user.nome}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Detectamos uma atividade em sua conta que pode ser de interesse para você:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
              <h3 style="color: #333; margin-top: 0;">📋 Detalhes da Atividade:</h3>
              <p style="color: #666; margin: 0;">
                <strong>Ação:</strong> ${action}<br>
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>IP:</strong> Detectado automaticamente
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Se você reconhece esta atividade, não é necessário fazer nada. 
              Caso contrário, recomendamos que você altere sua senha imediatamente.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Verificar Conta
              </a>
            </div>
          </div>
        </div>
      `
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Alerta de segurança enviado para:', user.email);
      return true;
    } catch (error) {
      console.error('Erro ao enviar alerta de segurança:', error);
      return false;
    }
  },

  async sendReminderEmail(user, vencimentos) {
    if (!vencimentos || vencimentos.length === 0) {
      return false;
    }

    const vencimentosList = vencimentos.map(venc => `
      <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ff6b6b;">
        <h4 style="color: #333; margin: 0 0 10px 0;">${venc.despesa_descricao}</h4>
        <p style="color: #666; margin: 5px 0;">
          <strong>Valor:</strong> R$ ${venc.despesa_valor.toFixed(2).replace('.', ',')}<br>
          <strong>Vencimento:</strong> ${new Date(venc.despesa_dtvencimento).toLocaleDateString('pt-BR')}<br>
          <strong>Status:</strong> ${venc.despesa_pago ? 'Pago' : 'Pendente'}
        </p>
      </div>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@finflow.com',
      to: user.email,
      subject: '🔔 Lembretes de Vencimento - FinFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔔 Lembretes de Vencimento</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Controle suas despesas</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Olá, ${user.nome}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Você tem <strong>${vencimentos.length}</strong> despesa(s) com vencimento próximo:
            </p>
            
            ${vencimentosList}
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">💡 Dica:</h3>
              <p style="color: #666; margin: 0;">
                Configure lembretes automáticos nas suas configurações para receber 
                notificações antes do vencimento das suas despesas.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/principal" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Acessar FinFlow
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Este email foi enviado automaticamente pelo sistema FinFlow.
            </p>
          </div>
        </div>
      `
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Lembrete de vencimento enviado para:', user.email);
      return true;
    } catch (error) {
      console.error('Erro ao enviar lembrete de vencimento:', error);
      return false;
    }
  }
}

module.exports = new EmailService(); 