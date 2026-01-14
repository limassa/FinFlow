const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    // Configurar SendGrid se disponível
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('📧 SendGrid configurado como serviço principal');
    }
    
    // Configurações de fallback para diferentes cenários
    this.configuracoes = [
      // Configuração 1: SendGrid (prioridade máxima)
      {
        name: 'SendGrid API',
        type: 'sendgrid',
        priority: 1,
        config: {
          apiKey: process.env.SENDGRID_API_KEY
        }
      },
      // Configuração 2: Gmail com timeout otimizado
      {
        name: 'Gmail Timeout Otimizado',
        type: 'nodemailer',
        priority: 2,
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
      // Configuração 3: Gmail porta 465 (SSL) - mais compatível
      {
        name: 'Gmail Porta 465 SSL',
        type: 'nodemailer',
        priority: 3,
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
      // Configuração 4: Gmail porta 587 sem pool - menos restritivo
      {
        name: 'Gmail Porta 587 Sem Pool',
        type: 'nodemailer',
        priority: 4,
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
    
    // Ordenar por prioridade
    this.configuracoes.sort((a, b) => a.priority - b.priority);
    
    // Transporter principal (será configurado dinamicamente)
    this.transporter = null;
    this.configuracaoAtual = null;
    this.tipoAtual = null;
  }
  
  // Método para testar e configurar o melhor transporter
  async configurarTransporter() {
    console.log('🔧 Configurando transporter de email...');
    
    for (const config of this.configuracoes) {
      try {
        console.log(`   🧪 Testando: ${config.name} (Prioridade: ${config.priority})`);
        
        if (config.type === 'sendgrid') {
          // Testar SendGrid
          if (!process.env.SENDGRID_API_KEY) {
            console.log(`      ⚠️  SendGrid não configurado (SENDGRID_API_KEY ausente)`);
            continue;
          }
          
          // Configurar SendGrid novamente para garantir
          try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            console.log(`      ✅ SendGrid configurado e disponível`);
            console.log(`      📧 API Key: ${process.env.SENDGRID_API_KEY.substring(0, 10)}...`);
            this.transporter = 'sendgrid';
            this.configuracaoAtual = config.name;
            this.tipoAtual = 'sendgrid';
            return true;
          } catch (sgError) {
            console.log(`      ❌ Erro ao configurar SendGrid: ${sgError.message}`);
            continue;
          }
          
        } else if (config.type === 'nodemailer') {
          // Testar Nodemailer com timeout
          const transporter = nodemailer.createTransport({
            ...config.config,
            connectionTimeout: 10000, // 10 segundos
            greetingTimeout: 5000,   // 5 segundos
            socketTimeout: 10000      // 10 segundos
          });
          
          // Testar conexão com timeout
          await Promise.race([
            transporter.verify(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout ao verificar conexão')), 10000)
            )
          ]);
          
          // Se chegou aqui, a configuração funciona
          this.transporter = transporter;
          this.configuracaoAtual = config.name;
          this.tipoAtual = 'nodemailer';
          
          console.log(`      ✅ Configuração funcionando: ${config.name}`);
          return true;
        }
        
      } catch (error) {
        console.log(`      ❌ Falha na configuração: ${config.name}`);
        console.log(`         Erro: ${error.message}`);
        
        // Continuar para próxima configuração
        continue;
      }
    }
    
    // Se nenhuma configuração funcionou
    console.log('🚨 Nenhuma configuração de email funcionou!');
    console.log('📧 Implementando fallback com console.log...');
    
    return false;
  }
  
  // Método para enviar email com SendGrid
  async sendEmailSendGrid(mailOptions) {
    try {
      const msg = {
        to: mailOptions.to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@finflow.com',
        subject: mailOptions.subject,
        html: mailOptions.html
      };
      
      const response = await sgMail.send(msg);
      console.log(`✅ Email enviado via SendGrid! Status: ${response[0].statusCode}`);
      return true;
      
    } catch (error) {
      console.error('❌ Erro SendGrid:', error.message);
      if (error.response) {
        console.error('   Detalhes:', error.response.body);
        // Se for erro de créditos excedidos, marcar SendGrid como indisponível
        if (error.response.body && 
            (error.response.body.errors || []).some(e => 
              e.message && e.message.includes('Maximum credits exceeded')
            )) {
          console.log('   ⚠️ SendGrid sem créditos, tentando Gmail...');
          // Tentar usar Gmail como fallback
          return await this.tentarEnviarComGmail(mailOptions);
        }
      }
      return false;
    }
  }

  // Método auxiliar para tentar enviar com Gmail quando SendGrid falha
  async tentarEnviarComGmail(mailOptions) {
    console.log('🔄 Tentando enviar via Gmail (Nodemailer)...');
    
    // Tentar configurar Gmail
    const gmailConfigs = this.configuracoes.filter(c => c.type === 'nodemailer');
    
    for (const config of gmailConfigs) {
      try {
        console.log(`   🧪 Tentando: ${config.name}`);
        const transporter = nodemailer.createTransport(config.config);
        
        // Testar conexão
        await transporter.verify();
        
        // Enviar email
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado via Gmail! Message ID: ${info.messageId}`);
        console.log(`   🔧 Configuração usada: ${config.name}`);
        
        // Atualizar transporter atual para Gmail
        this.transporter = transporter;
        this.configuracaoAtual = config.name;
        this.tipoAtual = 'nodemailer';
        
        return true;
      } catch (gmailError) {
        console.log(`   ❌ Falha com ${config.name}: ${gmailError.message}`);
        continue;
      }
    }
    
    console.log('❌ Nenhuma configuração Gmail funcionou');
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
      if (this.tipoAtual === 'sendgrid') {
        // Usar SendGrid
        const resultado = await this.sendEmailSendGrid(mailOptions);
        if (resultado) {
          console.log('✅ Email de boas-vindas enviado via SendGrid!');
          console.log(`   🔧 Configuração usada: ${this.configuracaoAtual}`);
          return true;
        }
      } else if (this.tipoAtual === 'nodemailer') {
        // Usar Nodemailer
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email de boas-vindas enviado via Nodemailer!');
        console.log(`   📧 Message ID: ${info.messageId}`);
        console.log(`   🔧 Configuração usada: ${this.configuracaoAtual}`);
        return true;
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
      
      // Tentar reconfigurar o transporter
      console.log('🔄 Tentando reconfigurar transporter...');
      const reconfigurado = await this.configurarTransporter();
      
      if (reconfigurado) {
        // Tentar novamente com nova configuração
        try {
          if (this.tipoAtual === 'sendgrid') {
            const resultado = await this.sendEmailSendGrid(mailOptions);
            if (resultado) {
              console.log('✅ Email enviado na segunda tentativa via SendGrid!');
              return true;
            }
          } else if (this.tipoAtual === 'nodemailer') {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado na segunda tentativa via Nodemailer!');
            return true;
          }
        } catch (retryError) {
          console.error('❌ Falha na segunda tentativa:', retryError.message);
        }
      }
      
      // Se tudo falhou, usar fallback
      console.log('📧 Usando fallback de email...');
      return this.fallbackEmail(user);
    }
    
    // Se chegou aqui, algo deu errado
    return this.fallbackEmail(user);
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
      
      if (this.tipoAtual === 'sendgrid') {
        const resultado = await this.sendEmailSendGrid(mailOptions);
        if (resultado) {
          console.log('✅ Email de redefinição enviado via SendGrid!');
          return true;
        }
      } else if (this.tipoAtual === 'nodemailer') {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email de redefinição enviado via Nodemailer!');
        return true;
      }
      
      return this.fallbackPasswordReset(user, resetToken);
      
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
  
  // Método para enviar lembrete de vencimento por email
  async sendReminderEmail(user, vencimentos) {
    if (!vencimentos || vencimentos.length === 0) {
      console.log('⚠️ Nenhum vencimento para enviar por email');
      return false;
    }

    // Se não temos transporter configurado, tentar configurar
    if (!this.transporter) {
      const configurado = await this.configurarTransporter();
      if (!configurado) {
        return this.fallbackReminderEmail(user, vencimentos);
      }
    }

    // Montar HTML do email
    let htmlVencimentos = '';
    vencimentos.forEach((venc, index) => {
      const valor = Number(venc.despesa_valor || venc.despesa_Valor || 0).toFixed(2).replace('.', ',');
      const dataVenc = new Date(venc.despesa_dtvencimento || venc.Despesa_DtVencimento).toLocaleDateString('pt-BR');
      const status = venc.despesa_pago || venc.Despesa_Pago ? '✅ Pago' : '⏳ Pendente';
      
      htmlVencimentos += `
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f44336;">
          <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">
            ${index + 1}. ${venc.despesa_descricao || venc.Despesa_Descricao}
          </h3>
          <p style="color: #666; margin: 5px 0;"><strong>💰 Valor:</strong> R$ ${valor}</p>
          <p style="color: #666; margin: 5px 0;"><strong>📅 Vencimento:</strong> ${dataVenc}</p>
          <p style="color: #666; margin: 5px 0;"><strong>⚠️ Status:</strong> ${status}</p>
        </div>
      `;
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SENDGRID_FROM_EMAIL || 'noreply@finflow.com',
      to: user.email,
      subject: `🔔 Lembretes de Vencimento - FinFlow`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔔 Lembretes de Vencimento</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Controle Financeiro</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Olá, ${user.nome}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Você tem <strong>${vencimentos.length} despesa(s)</strong> com vencimento próximo:
            </p>
            
            ${htmlVencimentos}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://finflow.lizsoftware.com.br'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Acessar FinFlow
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Esta é uma mensagem automática. Não responda.
            </p>
          </div>
        </div>
      `
    };

    try {
      if (this.tipoAtual === 'sendgrid') {
        // Usar SendGrid
        const resultado = await this.sendEmailSendGrid(mailOptions);
        if (resultado) {
          console.log('✅ Email de lembrete enviado via SendGrid!');
          console.log(`   📧 Para: ${user.email}`);
          console.log(`   🔧 Configuração usada: ${this.configuracaoAtual}`);
          return true;
        }
      } else if (this.tipoAtual === 'nodemailer') {
        // Usar Nodemailer
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email de lembrete enviado via Nodemailer!');
        console.log(`   📧 Para: ${user.email}`);
        console.log(`   📧 Message ID: ${info.messageId}`);
        console.log(`   🔧 Configuração usada: ${this.configuracaoAtual}`);
        return true;
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de lembrete:', error.message);
      
      // Tentar reconfigurar o transporter
      console.log('🔄 Tentando reconfigurar transporter...');
      const reconfigurado = await this.configurarTransporter();
      
      if (reconfigurado) {
        // Tentar novamente com nova configuração
        try {
          if (this.tipoAtual === 'sendgrid') {
            const resultado = await this.sendEmailSendGrid(mailOptions);
            if (resultado) {
              console.log('✅ Email enviado na segunda tentativa via SendGrid!');
              return true;
            }
          } else if (this.tipoAtual === 'nodemailer') {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado na segunda tentativa via Nodemailer!');
            return true;
          }
        } catch (retryError) {
          console.error('❌ Falha na segunda tentativa:', retryError.message);
        }
      }
      
      // Se tudo falhou, usar fallback
      console.log('📧 Usando fallback de email...');
      return this.fallbackReminderEmail(user, vencimentos);
    }
    
    // Se chegou aqui, algo deu errado
    return this.fallbackReminderEmail(user, vencimentos);
  }

  // Método para enviar email do formulário "Fale Conosco"
  async sendContactFormEmail({ nome, email, telefone, tipo, mensagem }) {
    console.log('📧 Iniciando envio de email Fale Conosco...');
    console.log(`   Transporter atual: ${this.transporter ? 'Configurado' : 'Não configurado'}`);
    console.log(`   Tipo atual: ${this.tipoAtual || 'Nenhum'}`);
    console.log(`   SendGrid disponível: ${!!process.env.SENDGRID_API_KEY}`);
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'Não configurado'}`);
    
    // Se não temos transporter configurado, tentar configurar
    if (!this.transporter) {
      console.log('🔄 Transporter não configurado, tentando configurar...');
      const configurado = await this.configurarTransporter();
      if (!configurado) {
        console.log('❌ Não foi possível configurar transporter');
        console.log('   Verifique as variáveis de ambiente: SENDGRID_API_KEY ou EMAIL_USER/EMAIL_PASS');
        this.fallbackContactFormEmail({ nome, email, telefone, tipo, mensagem });
        return false;
      }
      console.log(`✅ Transporter configurado: ${this.configuracaoAtual}`);
    }

    const tipoLabels = {
      sugestao: 'Sugestão',
      duvida: 'Dúvida',
      problema: 'Reportar Problema',
      elogio: 'Elogio',
      outro: 'Outro'
    };

    const tipoTexto = tipoLabels[tipo] || tipo || 'Não especificado';

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SENDGRID_FROM_EMAIL || 'noreply@finflow.com',
      to: 'contatoLizSoftware@gmail.com', // Email de destino fixo
      subject: `📧 Fale Conosco - FinFlow: ${tipoTexto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📧 Nova Mensagem - Fale Conosco</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Sistema de Controle Financeiro</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                Informações do Contato
              </h2>
              
              <p style="color: #666; margin: 10px 0;">
                <strong style="color: #333;">Nome:</strong> ${nome}
              </p>
              
              <p style="color: #666; margin: 10px 0;">
                <strong style="color: #333;">Email:</strong> 
                <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
              </p>
              
              <p style="color: #666; margin: 10px 0;">
                <strong style="color: #333;">Telefone:</strong> ${telefone || 'Não informado'}
              </p>
              
              <p style="color: #666; margin: 10px 0;">
                <strong style="color: #333;">Tipo:</strong> ${tipoTexto}
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">Mensagem</h3>
              <p style="color: #666; line-height: 1.8; white-space: pre-wrap;">${mensagem}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      if (this.tipoAtual === 'sendgrid') {
        // Usar SendGrid
        const resultado = await this.sendEmailSendGrid(mailOptions);
        if (resultado) {
          console.log('✅ Email de "Fale Conosco" enviado via SendGrid!');
          console.log(`   📧 Para: contatoLizSoftware@gmail.com`);
          console.log(`   📧 De: ${email} (${nome})`);
          console.log(`   🔧 Configuração usada: ${this.configuracaoAtual}`);
          return true;
        } else {
          console.log('❌ Falha ao enviar via SendGrid');
          return false;
        }
      } else if (this.tipoAtual === 'nodemailer') {
        // Usar Nodemailer
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email de "Fale Conosco" enviado via Nodemailer!');
        console.log(`   📧 Para: contatoLizSoftware@gmail.com`);
        console.log(`   📧 De: ${email} (${nome})`);
        console.log(`   📧 Message ID: ${info.messageId}`);
        console.log(`   🔧 Configuração usada: ${this.configuracaoAtual}`);
        return true;
      } else {
        console.log('❌ Nenhum transporter configurado');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de "Fale Conosco":', error.message);
      
      // Tentar reconfigurar o transporter
      console.log('🔄 Tentando reconfigurar transporter...');
      const reconfigurado = await this.configurarTransporter();
      
      if (reconfigurado) {
        // Tentar novamente com nova configuração
        try {
          if (this.tipoAtual === 'sendgrid') {
            const resultado = await this.sendEmailSendGrid(mailOptions);
            if (resultado) {
              console.log('✅ Email enviado na segunda tentativa via SendGrid!');
              return true;
            }
          } else if (this.tipoAtual === 'nodemailer') {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado na segunda tentativa via Nodemailer!');
            return true;
          }
        } catch (retryError) {
          console.error('❌ Falha na segunda tentativa:', retryError.message);
        }
      }
      
      // Se tudo falhou, usar fallback mas retornar false
      console.log('📧 Usando fallback de email...');
      this.fallbackContactFormEmail({ nome, email, telefone, tipo, mensagem });
      return false; // Retornar false para indicar que não foi enviado
    }
    
    // Se chegou aqui, algo deu errado
    console.log('❌ Nenhum método de envio funcionou');
    this.fallbackContactFormEmail({ nome, email, telefone, tipo, mensagem });
    return false; // Retornar false para indicar que não foi enviado
  }

  // Fallback para formulário de contato
  async fallbackContactFormEmail({ nome, email, telefone, tipo, mensagem }) {
    console.log('📧 === FALLBACK EMAIL FALE CONOSCO ===');
    console.log(`   Para: contatoLizSoftware@gmail.com`);
    console.log(`   De: ${email} (${nome})`);
    console.log(`   Telefone: ${telefone || 'Não informado'}`);
    console.log(`   Tipo: ${tipo || 'Não especificado'}`);
    console.log(`   Mensagem: ${mensagem}`);
    console.log(`   Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log('   Status: Email registrado nos logs (sistema de email indisponível)');
    console.log('   ⚠️  IMPORTANTE: Verifique os logs do servidor para ver a mensagem completa');
    console.log('📧 ====================================');
    
    // Retornar true para não bloquear o formulário
    // A mensagem foi registrada nos logs e pode ser consultada
    return true;
  }

  // Fallback para lembrete de vencimento
  async fallbackReminderEmail(user, vencimentos) {
    console.log('📧 === FALLBACK EMAIL DE LEMBRETE ===');
    console.log(`   Para: ${user.email}`);
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Vencimentos: ${vencimentos.length}`);
    vencimentos.forEach((venc, index) => {
      const valor = Number(venc.despesa_valor || venc.despesa_Valor || 0).toFixed(2).replace('.', ',');
      const dataVenc = new Date(venc.despesa_dtvencimento || venc.Despesa_DtVencimento).toLocaleDateString('pt-BR');
      console.log(`   ${index + 1}. ${venc.despesa_descricao || venc.Despesa_Descricao} - R$ ${valor} - ${dataVenc}`);
    });
    console.log('   Status: Email simulado (sistema de email indisponível)');
    console.log('📧 ====================================');
    
    // Retornar false para indicar que não foi enviado
    return false;
  }

  // Método para verificar status do serviço
  async getStatus() {
    return {
      configurado: !!this.transporter,
      configuracaoAtual: this.configuracaoAtual,
      tipoAtual: this.tipoAtual,
      sendgridDisponivel: !!process.env.SENDGRID_API_KEY,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new EmailService(); 