const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configurações SMTP múltiplas para fallback
    this.smtpConfigs = [
      // Configuração 1: Gmail com porta 587 (STARTTLS)
      {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
          pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
        },
        connectionTimeout: 30000, // Reduzido para 30s
        greetingTimeout: 30000,   // Reduzido para 30s
        socketTimeout: 30000,     // Reduzido para 30s
        pool: false,              // Desabilitado pool para evitar problemas
        maxConnections: 1,
        maxMessages: 1,
        tls: {
          rejectUnauthorized: false
        }
      },
      // Configuração 2: Gmail com porta 465 (SSL)
      {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
          pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        pool: false,
        maxConnections: 1,
        maxMessages: 1,
        tls: {
          rejectUnauthorized: false
        }
      },
      // Configuração 3: Outlook como fallback
      {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
          pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        pool: false,
        maxConnections: 1,
        maxMessages: 1,
        tls: {
          rejectUnauthorized: false
        }
      }
    ];
    
    this.currentConfigIndex = 0;
    this.transporter = null;
  }
  
  async createTransporter(configIndex = 0) {
    if (configIndex >= this.smtpConfigs.length) {
      throw new Error('Todas as configurações SMTP falharam');
    }
    
    const config = this.smtpConfigs[configIndex];
    console.log(`🔧 Tentando configuração SMTP ${configIndex + 1}:`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Secure: ${config.secure}`);
    console.log(`   Timeout: ${config.connectionTimeout}ms`);
    
    return nodemailer.createTransport(config);
  }
  
  async sendEmailWithFallback(mailOptions, maxRetries = 2) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`📧 Tentativa ${attempt}/${maxRetries} de envio de email...`);
      
      // Tentar cada configuração SMTP
      for (let configIndex = 0; configIndex < this.smtpConfigs.length; configIndex++) {
        try {
          console.log(`   🔧 Testando configuração SMTP ${configIndex + 1}...`);
          
          const transporter = await this.createTransporter(configIndex);
          
          // Verificar conexão primeiro (timeout reduzido)
          console.log('   🔍 Verificando conexão SMTP...');
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Timeout na verificação de conexão'));
            }, 15000); // 15 segundos para verificação
            
            transporter.verify((error, success) => {
              clearTimeout(timeout);
              if (error) {
                console.log(`   ❌ Falha na verificação: ${error.message}`);
                reject(error);
              } else {
                console.log('   ✅ Conexão SMTP verificada com sucesso!');
                resolve(success);
              }
            });
          });
          
          // Enviar email
          console.log('   🚀 Enviando email...');
          const info = await transporter.sendMail(mailOptions);
          
          console.log('✅ Email enviado com sucesso!');
          console.log(`   Message ID: ${info.messageId}`);
          console.log(`   Configuração: SMTP ${configIndex + 1}`);
          
          return true;
          
        } catch (error) {
          lastError = error;
          console.log(`   ❌ Falha na configuração ${configIndex + 1}: ${error.message}`);
          
          if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
            console.log('   ⏰ Timeout detectado - tentando próxima configuração...');
          } else if (error.code === 'ECONNREFUSED') {
            console.log('   🚫 Conexão recusada - tentando próxima configuração...');
          } else {
            console.log(`   💥 Erro: ${error.code || 'Desconhecido'} - tentando próxima configuração...`);
          }
          
          // Aguardar antes da próxima tentativa
          if (configIndex < this.smtpConfigs.length - 1) {
            console.log('   ⏳ Aguardando 2 segundos antes da próxima configuração...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      // Se chegou aqui, todas as configurações falharam nesta tentativa
      if (attempt < maxRetries) {
        console.log(`   🔄 Todas as configurações falharam na tentativa ${attempt}.`);
        console.log(`   ⏳ Aguardando 3 segundos antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Todas as tentativas falharam
    console.log('💥 Todas as tentativas de envio falharam!');
    console.log('📊 Resumo dos erros:');
    console.log(`   Tentativas: ${maxRetries}`);
    console.log(`   Configurações testadas: ${this.smtpConfigs.length}`);
    console.log(`   Último erro: ${lastError.message}`);
    
    throw lastError;
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
      console.log('📧 Iniciando envio de email de boas-vindas...');
      
      // Tentar configuração principal (Gmail 587)
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
            pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
          },
          connectionTimeout: 20000, // 20 segundos
          greetingTimeout: 20000,   // 20 segundos
          socketTimeout: 20000,     // 20 segundos
          tls: {
            rejectUnauthorized: false
          }
        });
        
        console.log('   🔧 Tentando Gmail SMTP (porta 587)...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado com sucesso via Gmail!');
        console.log(`   Message ID: ${info.messageId}`);
        return true;
        
      } catch (gmailError) {
        console.log(`   ❌ Gmail falhou: ${gmailError.message}`);
        console.log('   🔧 Tentando configuração alternativa...');
        
        // Tentar configuração alternativa (Gmail 465)
        try {
          const transporterAlt = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
              pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
            },
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 20000,
            tls: {
              rejectUnauthorized: false
            }
          });
          
          console.log('   🔧 Tentando Gmail SSL (porta 465)...');
          const infoAlt = await transporterAlt.sendMail(mailOptions);
          console.log('✅ Email enviado com sucesso via Gmail SSL!');
          console.log(`   Message ID: ${infoAlt.messageId}`);
          return true;
          
        } catch (sslError) {
          console.log(`   ❌ Gmail SSL falhou: ${sslError.message}`);
          console.log('❌ Todas as configurações de email falharam');
          return false;
        }
      }
      
    } catch (error) {
      console.error('💥 Erro final ao enviar email de boas-vindas:', error.message);
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
      console.log('📧 Iniciando envio de email de redefinição de senha com sistema de fallback...');
      return await this.sendEmailWithFallback(mailOptions, 2);
    } catch (error) {
      console.error('💥 Erro final ao enviar email de redefinição de senha:', error.message);
      console.error('   Stack:', error.stack);
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
      console.log('📧 Iniciando envio de alerta de segurança com sistema de fallback...');
      return await this.sendEmailWithFallback(mailOptions, 2);
    } catch (error) {
      console.error('💥 Erro final ao enviar alerta de segurança:', error.message);
      console.error('   Stack:', error.stack);
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
      console.log('📧 Iniciando envio de lembrete de vencimento com sistema de fallback...');
      return await this.sendEmailWithFallback(mailOptions, 2);
    } catch (error) {
      console.error('💥 Erro final ao enviar lembrete de vencimento:', error.message);
      console.error('   Stack:', error.stack);
      return false;
    }
  }

  async sendContactFormEmail(contactData) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@finflow.com',
      to: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com', // Email do suporte
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
      console.log('📧 Iniciando envio de email de "Fale Conosco" com sistema de fallback...');
      return await this.sendEmailWithFallback(mailOptions, 2);
    } catch (error) {
      console.error('💥 Erro final ao enviar email de "Fale Conosco":', error.message);
      console.error('   Stack:', error.stack);
      return false;
    }
  }
}

module.exports = new EmailService(); 