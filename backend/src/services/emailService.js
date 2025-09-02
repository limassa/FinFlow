const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configurações de fallback para diferentes cenários
    this.configuracoes = [
      // Configuração 1: Gmail com timeout otimizado
      {
        name: 'Gmail Timeout Otimizado',
        config: {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
            pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
          },
          connectionTimeout: 60000,
          greetingTimeout: 30000,
          socketTimeout: 60000,
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          retryDelay: 1000,
          maxRetries: 3
        }
      },
      // Configuração 2: Gmail porta 465 (SSL) - mais compatível
      {
        name: 'Gmail Porta 465 SSL',
        config: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
            pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
          },
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000
        }
      },
      // Configuração 3: Gmail porta 587 sem pool - menos restritivo
      {
        name: 'Gmail Porta 587 Sem Pool',
        config: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
            pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
          },
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
          pool: false,
          tls: {
            rejectUnauthorized: false
          }
        }
      }
    ];
    
    // Transporter principal (será configurado dinamicamente)
    this.transporter = null;
    this.configuracaoAtual = null;
  }
  
  // Método para testar e configurar o melhor transporter
  async configurarTransporter() {
    console.log('🔧 Configurando transporter de email...');
    
    for (const config of this.configuracoes) {
      try {
        console.log(`   🧪 Testando: ${config.name}`);
        
        const transporter = nodemailer.createTransport(config.config);
        
        // Testar conexão
        await transporter.verify();
        
        // Se chegou aqui, a configuração funciona
        this.transporter = transporter;
        this.configuracaoAtual = config.name;
        
        console.log(`   ✅ Configuração funcionando: ${config.name}`);
        return true;
        
      } catch (error) {
        console.log(`   ❌ Falha na configuração: ${config.name}`);
        console.log(`      Erro: ${error.message}`);
        
        // Continuar para próxima configuração
        continue;
      }
    }
    
    // Se nenhuma configuração funcionou
    console.log('🚨 Nenhuma configuração de email funcionou!');
    console.log('📧 Implementando fallback com console.log...');
    
    return false;
  }
  
  // Método para enviar email com fallback
  async sendWelcomeEmail(user) {
    // Se não temos transporter configurado, tentar configurar
    if (!this.transporter) {
      const configurado = await this.configurarTransporter();
      if (!configurado) {
        // Fallback: apenas logar o email
        return this.fallbackEmail(user);
      }
    }
    
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
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de boas-vindas enviado com sucesso!');
      console.log(`   📧 Message ID: ${info.messageId}`);
      console.log(`   🔧 Configuração usada: ${this.configuracaoAtual}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
      
      // Tentar reconfigurar o transporter
      console.log('🔄 Tentando reconfigurar transporter...');
      const reconfigurado = await this.configurarTransporter();
      
      if (reconfigurado) {
        // Tentar novamente com nova configuração
        try {
          const info = await this.transporter.sendMail(mailOptions);
          console.log('✅ Email enviado na segunda tentativa!');
          console.log(`   🔧 Nova configuração: ${this.configuracaoAtual}`);
          return true;
        } catch (retryError) {
          console.error('❌ Falha na segunda tentativa:', retryError.message);
        }
      }
      
      // Se tudo falhou, usar fallback
      console.log('📧 Usando fallback de email...');
      return this.fallbackEmail(user);
    }
  }
  
  // Fallback: simular envio de email
  async fallbackEmail(user) {
    console.log('📧 === FALLBACK DE EMAIL ===');
    console.log(`   Para: ${user.email}`);
    console.log(`   Assunto: Bem-vindo ao FinFlow! 🎉`);
    console.log(`   Usuário: ${user.nome}`);
    console.log(`   Data: ${new Date().toLocaleString('pt-BR')}`);
    console.log('   Status: Email simulado (sistema de email indisponível)');
    console.log('   Ação: Usuário cadastrado com sucesso, mas email não enviado');
    console.log('📧 ===========================');
    
    // Retornar true para não bloquear o cadastro
    return true;
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
              Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Importante:</strong> Este link expira em 1 hora por questões de segurança.
            </p>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Se você não solicitou esta redefinição, ignore este email.
            </p>
          </div>
        </div>
      `
    };
    
    try {
      if (!this.transporter) {
        const configurado = await this.configurarTransporter();
        if (!configurado) {
          return this.fallbackPasswordReset(user, resetToken);
        }
      }
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de redefinição enviado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de redefinição:', error.message);
      return this.fallbackPasswordReset(user, resetToken);
    }
  }
  
  // Fallback para redefinição de senha
  async fallbackPasswordReset(user, resetToken) {
    console.log('📧 === FALLBACK REDEFINIÇÃO DE SENHA ===');
    console.log(`   Para: ${user.email}`);
    console.log(`   Token: ${resetToken}`);
    console.log(`   Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
    console.log('   Status: Email simulado (sistema de email indisponível)');
    console.log('📧 ======================================');
    
    return true;
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
  }

  async sendReminderEmail(user, vencimentos) {
    if (!vencimentos || vencimentos.length === 0) {
      return false;
    }

    const vencimentosList = vencimentos.map(venc => `
      <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ff6b6b;">
        <h4 style="color: #333; margin: 0 0 10px 0;">${venc.despesa_descricao}</h4>
        <p style="color: #666; margin: 5px 0;">
          <strong>Valor:</strong> R$ ${Number(venc.despesa_valor).toFixed(2).replace('.', ',')}<br>
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

  async sendContactFormEmail(contactData) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@finflow.com',
      to: process.env.EMAIL_USER || 'joaolmnmarket@gmail.com', // Email do suporte
      subject: '📧 Nova mensagem - Fale Conosco FinFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📧 Nova Mensagem</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Fale Conosco</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Nova mensagem recebida</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📋 Detalhes do Contato:</h3>
              <p style="color: #666; margin: 5px 0;">
                <strong>Nome:</strong> ${contactData.nome}<br>
                <strong>Email:</strong> ${contactData.email}<br>
                <strong>Telefone:</strong> ${contactData.telefone}<br>
                <strong>Tipo:</strong> ${contactData.tipo}<br>
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
              <h3 style="color: #333; margin-top: 0;">💬 Mensagem:</h3>
              <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${contactData.mensagem}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${contactData.email}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Responder ao Cliente
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Esta mensagem foi enviada através do formulário "Fale Conosco" do FinFlow.
            </p>
          </div>
        </div>
      `
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email de "Fale Conosco" enviado para o suporte');
      return true;
    } catch (error) {
      console.error('Erro ao enviar email de "Fale Conosco":', error);
      return false;
    }
  }

  // Método para verificar status do serviço
  async getStatus() {
    return {
      configurado: !!this.transporter,
      configuracaoAtual: this.configuracaoAtual,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new EmailService(); 