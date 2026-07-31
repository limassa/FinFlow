const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
let Resend = null;
try {
  const resendModule = require('resend');
  // Resend é exportado como { Resend }
  Resend = resendModule.Resend;
  if (!Resend) {
    console.log('⚠️ Resend.Resend não encontrado no módulo');
  }
} catch (e) {
  // Resend não instalado ainda
  console.log('⚠️ Resend não disponível:', e.message);
}

class EmailService {
  constructor() {
    // Configurar SendGrid se disponível
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('📧 SendGrid configurado como serviço principal');
    }
    
    // Configurações de fallback para diferentes cenários
    this.configuracoes = [
      // Configuração 1: Resend (prioridade máxima - funciona no Railway)
      {
        name: 'Resend API',
        type: 'resend',
        priority: 1,
        config: {
          apiKey: process.env.RESEND_API_KEY
        }
      },
      // Configuração 2: SendGrid (prioridade alta)
      {
        name: 'SendGrid API',
        type: 'sendgrid',
        priority: 2,
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
            user: process.env.EMAIL_USER || 'contatolizsoftware@gmail.com',
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
            user: process.env.EMAIL_USER || 'contatolizsoftware@gmail.com',
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
            user: process.env.EMAIL_USER || 'contatolizsoftware@gmail.com',
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
    this.lastEmailError = null;
  }
  
  // Método para testar e configurar o melhor transporter
  async configurarTransporter() {
    console.log('🔧 Configurando transporter de email...');
    
    for (const config of this.configuracoes) {
      try {
        console.log(`   🧪 Testando: ${config.name} (Prioridade: ${config.priority})`);
        
        if (config.type === 'resend') {
          // Testar Resend
          if (!process.env.RESEND_API_KEY) {
            console.log(`      ⚠️  Resend não configurado (RESEND_API_KEY ausente)`);
            continue;
          }
          
          if (!Resend) {
            console.log(`      ⚠️  Resend não instalado (npm install resend)`);
            continue;
          }
          
          // Resend não precisa de teste de conexão (remover aspas se vieram do env)
          console.log(`      ✅ Resend configurado e disponível`);
          this.transporter = new Resend(this._stripQuotes(process.env.RESEND_API_KEY));
          this.configuracaoAtual = config.name;
          this.tipoAtual = 'resend';
          return true;
          
        } else if (config.type === 'sendgrid') {
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
          // Testar Nodemailer com timeout maior
          const transporter = nodemailer.createTransport({
            ...config.config,
            connectionTimeout: 30000, // 30 segundos (aumentado)
            greetingTimeout: 15000,   // 15 segundos (aumentado)
            socketTimeout: 30000,     // 30 segundos (aumentado)
            // Desabilitar verificação SSL estrita
            tls: {
              rejectUnauthorized: false
            }
          });
          
          // Pular verificação - no Railway pode dar timeout mas o envio funciona
          // A verificação pode estar sendo bloqueada pelo firewall/rede do Railway
          console.log(`      ⏭️  Pulando verificação (pode dar timeout no Railway)`);
          console.log(`      ✅ Configuração pronta: ${config.name}`);
          
          // Configurar transporter sem verificar
          this.transporter = transporter;
          this.configuracaoAtual = config.name;
          this.tipoAtual = 'nodemailer';
          
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
  
  // Remove aspas que o Railway (ou .env) pode ter deixado no valor
  _stripQuotes(v) {
    if (v == null || typeof v !== 'string') return v;
    return v.replace(/^["']|["']$/g, '').trim();
  }

  // Método para enviar email com Resend
  async sendEmailResend(mailOptions) {
    try {
      if (!this.transporter || this.tipoAtual !== 'resend') {
        if (!process.env.RESEND_API_KEY) {
          return false;
        }
        this.transporter = new Resend(this._stripQuotes(process.env.RESEND_API_KEY));
      }

      const verifiedDomain = this._stripQuotes(process.env.RESEND_VERIFIED_DOMAIN);
      let fromEmail = this._stripQuotes(process.env.RESEND_FROM_EMAIL) || (verifiedDomain ? `noreply@${verifiedDomain}` : 'noreply@lizsoftware.com.br');

      // Se o email for gmail.com, usar domínio verificado ou Resend
      if (fromEmail.includes('@gmail.com') || fromEmail.includes('@gmail')) {
        console.log('   ⚠️  Gmail.com não pode ser verificado no Resend');
        if (verifiedDomain) {
          fromEmail = `noreply@${verifiedDomain}`;
          console.log(`   📧 Usando domínio verificado: ${fromEmail}`);
        } else {
          fromEmail = 'onboarding@resend.dev';
          console.log(`   📧 Usando email do Resend: ${fromEmail}`);
        }
      }

      console.log(`   📧 Resend: from=${fromEmail} to=${mailOptions.to}`);

      const { data, error } = await this.transporter.emails.send({
        from: fromEmail,
        to: Array.isArray(mailOptions.to) ? mailOptions.to[0] : mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html
      });
      
      if (error) {
        const msg = (error && error.message) ? error.message : String(error);
        console.error('❌ Resend falhou:', msg);
        this.lastEmailError = msg;
        if (error.message && error.message.includes('not verified')) {
          console.error('   💡 Solução: Verifique o domínio no Resend ou configure RESEND_VERIFIED_DOMAIN');
          console.error('   📖 Veja: backend/CONFIGURAR_RESEND.md');
        }
        // Se for erro de "only send to your own email", fazer fallback
        if (error.message && (error.message.includes('only send testing emails') || error.message.includes('verify a domain') || error.message.toLowerCase().includes('only send'))) {
          console.error('   ⚠️  Resend (conta gratuita) só permite enviar para o EMAIL DA SUA CONTA Resend.');
          console.error('   💡 Para enviar para qualquer email: verifique um domínio em https://resend.com/domains');
          return 'fallback';
        }
        return false;
      }
      
      console.log(`✅ Email enviado via Resend! ID: ${data?.id}`);
      return true;
      
    } catch (error) {
      console.error('❌ Erro Resend:', error.message);
      return false;
    }
  }

  // Método para enviar email com SendGrid
  async sendEmailSendGrid(mailOptions) {
    try {
      const msg = {
        to: mailOptions.to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@claricash.com.br',
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
        const transporter = nodemailer.createTransport({
          ...config.config,
          connectionTimeout: 30000, // 30 segundos (aumentado)
          greetingTimeout: 15000,   // 15 segundos (aumentado)
          socketTimeout: 30000,     // 30 segundos (aumentado)
          // Desabilitar verificação SSL estrita para evitar problemas
          tls: {
            rejectUnauthorized: false
          }
        });
        
        // Pular verificação - no Railway pode dar timeout mas o envio funciona
        // A verificação pode estar sendo bloqueada pelo firewall/rede do Railway
        console.log(`   ⏭️  Pulando verificação de conexão (pode dar timeout no Railway)`);
        console.log(`   📧 Tentando enviar email diretamente...`);
        const info = await Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao enviar email (60s)')), 60000)
          )
        ]);
        
        console.log(`✅ Email enviado via Gmail! Message ID: ${info.messageId}`);
        console.log(`   🔧 Configuração usada: ${config.name}`);
        
        // Atualizar transporter atual para Gmail
        this.transporter = transporter;
        this.configuracaoAtual = config.name;
        this.tipoAtual = 'nodemailer';
        
        return true;
      } catch (gmailError) {
        console.log(`   ❌ Falha com ${config.name}: ${gmailError.message}`);
        if (gmailError.message.includes('Invalid login') || 
            gmailError.message.includes('authentication') ||
            gmailError.message.includes('535')) {
          console.log(`   ⚠️  Erro de autenticação - verifique EMAIL_USER e EMAIL_PASS`);
          console.log(`   💡 Dica: Use uma senha de app do Gmail, não a senha normal`);
        } else if (gmailError.message.includes('Timeout')) {
          console.log(`   ⚠️  Timeout - pode ser problema de rede/firewall no Railway`);
        }
        continue;
      }
    }
    
    console.log('❌ Nenhuma configuração Gmail funcionou');
    console.log('💡 Verifique:');
    console.log('   1. EMAIL_USER e EMAIL_PASS estão corretos no Railway');
    console.log('   2. EMAIL_PASS é uma senha de app do Gmail (não a senha normal)');
    console.log('   3. Verificação em duas etapas está ativada no Gmail');
    return false;
  }
  
  // Método para enviar email com fallback
  async sendWelcomeEmail(user) {
    const temResend = !!process.env.RESEND_API_KEY;
    const temSendGrid = !!process.env.SENDGRID_API_KEY;
    const temGmail = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    console.log('📧 Boas-vindas: provedor=' + (this.tipoAtual || 'nenhum') + ', RESEND=' + (temResend ? 'sim' : 'não') + ', SENDGRID=' + (temSendGrid ? 'sim' : 'não') + ', Gmail=' + (temGmail ? 'sim' : 'não'));
    // Se RESEND_API_KEY existe mas não estamos usando Resend, forçar reconfig para priorizar Resend (domínio verificado)
    if (temResend && this.tipoAtual !== 'resend') {
      this.transporter = null;
      this.tipoAtual = null;
      console.log('📧 Forçando uso do Resend para boas-vindas (RESEND_API_KEY presente)');
    }
    // Se não temos transporter configurado, tentar configurar
    if (!this.transporter) {
      const configurado = await this.configurarTransporter();
      if (!configurado) {
        console.log('📧 Nenhum provedor de email configurado. Cadastro prossegue, mas email não será enviado.');
        return this.fallbackEmail(user);
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@claricash.com.br',
      to: user.email,
      subject: 'Bem-vindo ao Claricash! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo ao Claricash!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Sua conta foi criada com sucesso</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Olá, ${user.nome}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Estamos muito felizes em tê-lo conosco! O Claricash é a ferramenta perfeita para 
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
                Acessar Claricash
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
      } else if (this.tipoAtual === 'resend') {
        // Usar Resend
        const resultado = await this.sendEmailResend(mailOptions);
        if (resultado === true) {
          console.log('✅ Email de boas-vindas enviado via Resend!');
          console.log(`   🔧 Configuração usada: ${this.configuracaoAtual}`);
          return true;
        }
        console.log('📧 Resend não enviou (resultado=' + resultado + '). Veja "❌ Resend falhou" ou "❌ Erro Resend" acima. Para enviar para qualquer email: verifique domínio em https://resend.com/domains e configure RESEND_FROM_EMAIL=noreply@seudominio.com');
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
          } else if (this.tipoAtual === 'resend') {
            const resultado = await this.sendEmailResend(mailOptions);
            if (resultado === true) {
              console.log('✅ Email enviado na segunda tentativa via Resend!');
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
    
    // Se chegou aqui: provedor configurado mas envio falhou ou tipo não tratado
    console.log('📧 Motivo do fallback: provedor atual=' + (this.tipoAtual || 'nenhum') + '. Configure RESEND_API_KEY no Railway (Variáveis) para enviar emails.');
    return this.fallbackEmail(user);
  }
  
  // Fallback: simular envio de email
  async fallbackEmail(user) {
    console.log('📧 === FALLBACK DE EMAIL ===');
    console.log(`   Para: ${user.email}`);
    console.log(`   Assunto: Bem-vindo ao Claricash! 🎉`);
    console.log(`   Usuário: ${user.nome}`);
    console.log(`   Data: ${new Date().toLocaleString('pt-BR')}`);
    console.log('   Status: Email simulado (sistema de email indisponível)');
    console.log('   Ação: Usuário cadastrado com sucesso, mas email não enviado');
    console.log('   💡 Para o email chegar: 1) Verifique um domínio em https://resend.com/domains (ex: lizsoftware.com.br)');
    console.log('      2) No Railway: RESEND_FROM_EMAIL=noreply@lizsoftware.com.br e RESEND_VERIFIED_DOMAIN=lizsoftware.com.br (sem aspas)');
    console.log('      3) Conta gratuita Resend só envia para o email da conta até o domínio ser verificado.');
    console.log('📧 ===========================');
    
    // Retornar true para não bloquear o cadastro
    return true;
  }

  async sendSecurityAlert(user, evento) {
    if (!user || !user.email) {
      console.log('📧 sendSecurityAlert: usuário ou email ausente');
      return true;
    }
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@claricash.com.br',
      to: user.email,
      subject: `🔒 Alerta de Segurança - Claricash: ${evento}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔒 Alerta de Segurança</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">${evento}</p>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #666;">Olá, ${user.nome || 'usuário'}!</p>
            <p style="color: #666;">Informamos que a ação <strong>${evento}</strong> foi realizada na sua conta Claricash.</p>
            <p style="color: #999; font-size: 14px;">Se não foi você, altere sua senha imediatamente.</p>
          </div>
        </div>
      `
    };
    try {
      if (this.tipoAtual === 'resend') {
        const r = await this.sendEmailResend(mailOptions);
        if (r === true) console.log('✅ Alerta de segurança enviado via Resend');
        return true;
      }
      if (this.tipoAtual === 'nodemailer' && this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log('✅ Alerta de segurança enviado via Nodemailer');
        return true;
      }
    } catch (e) {
      console.error('Erro ao enviar alerta de segurança:', e.message);
    }
    return true;
  }
  
  async sendPasswordResetEmail(user, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    this.lastEmailError = null;

    const mailOptions = {
      from: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@claricash.com.br',
      to: user.email,
      subject: 'Redefinição de Senha - Claricash',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Redefinição de Senha</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Claricash - Segurança em primeiro lugar</p>
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

    const temResend = !!process.env.RESEND_API_KEY;
    const temSendGrid = !!process.env.SENDGRID_API_KEY;
    const temGmail = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    console.log(
      '📧 Redefinição: RESEND=' + (temResend ? 'sim' : 'não') +
      ', SENDGRID=' + (temSendGrid ? 'sim' : 'não') +
      ', Gmail=' + (temGmail ? 'sim' : 'não') +
      ', provedorAtual=' + (this.tipoAtual || 'nenhum')
    );

    // Priorizar Resend quando disponível (mesmo padrão do boas-vindas)
    if (temResend && this.tipoAtual !== 'resend') {
      this.transporter = null;
      this.tipoAtual = null;
    }

    if (!this.transporter) {
      const configurado = await this.configurarTransporter();
      if (!configurado) {
        this.lastEmailError = 'Nenhum provedor de email configurado no servidor.';
        return this.fallbackPasswordReset(user, resetToken);
      }
    }

    try {
      // 1) Tentar provedor atual
      if (this.tipoAtual === 'resend') {
        const resultado = await this.sendEmailResend(mailOptions);
        if (resultado === true) {
          console.log('✅ Email de redefinição enviado via Resend!');
          return true;
        }
        this.lastEmailError = 'Resend não conseguiu enviar o email (domínio/API).';
        console.log('📧 Resend falhou na redefinição. Tentando fallback...');
      } else if (this.tipoAtual === 'sendgrid') {
        const resultado = await this.sendEmailSendGrid(mailOptions);
        if (resultado) {
          console.log('✅ Email de redefinição enviado via SendGrid!');
          return true;
        }
      } else if (this.tipoAtual === 'nodemailer') {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email de redefinição enviado via Nodemailer!', info?.messageId || '');
        return true;
      }

      // 2) Se Resend estava ativo e falhou, tentar Gmail
      if (temGmail) {
        const gmailOk = await this.tentarEnviarComGmail(mailOptions);
        if (gmailOk) {
          console.log('✅ Email de redefinição enviado via Gmail (fallback)!');
          return true;
        }
      }

      // 3) Se ainda não enviou e há SendGrid, tentar
      if (temSendGrid && this.tipoAtual !== 'sendgrid') {
        const sgOk = await this.sendEmailSendGrid(mailOptions);
        if (sgOk) {
          console.log('✅ Email de redefinição enviado via SendGrid (fallback)!');
          return true;
        }
      }

      return this.fallbackPasswordReset(user, resetToken);
    } catch (error) {
      console.error('❌ Erro ao enviar email de redefinição:', error.message);
      this.lastEmailError = error.message;

      if (temGmail) {
        try {
          const gmailOk = await this.tentarEnviarComGmail(mailOptions);
          if (gmailOk) return true;
        } catch (e) {
          console.error('❌ Fallback Gmail também falhou:', e.message);
        }
      }

      return this.fallbackPasswordReset(user, resetToken);
    }
  }
  
  // Fallback para redefinição de senha (retorna false para API informar que o email não foi enviado)
  async fallbackPasswordReset(user, resetToken) {
    console.log('📧 === FALLBACK REDEFINIÇÃO DE SENHA ===');
    console.log(`   Para: ${user.email}`);
    console.log(`   Token: ${resetToken}`);
    console.log(`   Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
    console.log(`   Motivo: ${this.lastEmailError || 'provedor indisponível'}`);
    console.log('   Status: Email NÃO enviado (sistema de email indisponível)');
    console.log('   💡 Confira no Railway: RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_VERIFIED_DOMAIN');
    console.log('   💡 Domínio precisa estar verificado em https://resend.com/domains');
    console.log('📧 ======================================');
    
    return false;
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
      from: process.env.EMAIL_USER || process.env.SENDGRID_FROM_EMAIL || 'noreply@claricash.com.br',
      to: user.email,
      subject: `🔔 Lembretes de Vencimento - Claricash`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔔 Lembretes de Vencimento</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Claricash - Controle Financeiro</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Olá, ${user.nome}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Você tem <strong>${vencimentos.length} despesa(s)</strong> com vencimento próximo:
            </p>
            
            ${htmlVencimentos}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://claricash.com.br'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Acessar Claricash
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
      } else if (this.tipoAtual === 'resend') {
        const resultado = await this.sendEmailResend(mailOptions);
        if (resultado === true) {
          console.log('✅ Email de lembrete enviado via Resend!');
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
          } else if (this.tipoAtual === 'resend') {
            const resultado = await this.sendEmailResend(mailOptions);
            if (resultado === true) {
              console.log('✅ Email enviado na segunda tentativa via Resend!');
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
    
    // Se chegou aqui, algo deu errado (ex.: Resend configurado mas nenhum branch tratou)
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

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || 'contatolizsoftware@gmail.com';
    const mailOptions = {
      from: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_USER || process.env.SENDGRID_FROM_EMAIL || 'noreply@claricash.com.br',
      to: supportEmail,
      subject: `📧 Fale Conosco - Claricash: ${tipoTexto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📧 Nova Mensagem - Fale Conosco</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Claricash - Sistema de Controle Financeiro</p>
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
      if (this.tipoAtual === 'resend') {
        // Usar Resend
        const resultado = await this.sendEmailResend(mailOptions);
        if (resultado === 'fallback') {
          // Resend falhou por limitação, tentar SendGrid ou Gmail
          console.log('🔄 Resend não pode enviar, tentando SendGrid...');
          if (process.env.SENDGRID_API_KEY) {
            const resultadoSendGrid = await this.sendEmailSendGrid(mailOptions);
            if (resultadoSendGrid) {
              console.log('✅ Email de "Fale Conosco" enviado via SendGrid (fallback)!');
              console.log(`   📧 Para: contatolizsoftware@gmail.com`);
              console.log(`   📧 De: ${email} (${nome})`);
              return true;
            }
          }
          // Se SendGrid não funcionou, tentar Gmail
          console.log('🔄 SendGrid não disponível, tentando Gmail...');
          if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            // Reconfigurar para Gmail
            await this.configurarTransporter();
            if (this.tipoAtual === 'nodemailer') {
              const info = await this.transporter.sendMail(mailOptions);
              console.log('✅ Email de "Fale Conosco" enviado via Gmail (fallback)!');
              console.log(`   📧 Para: contatolizsoftware@gmail.com`);
              console.log(`   📧 De: ${email} (${nome})`);
              return true;
            }
          }
          console.log('❌ Nenhum serviço de fallback disponível');
          return false;
        } else if (resultado) {
          console.log('✅ Email de "Fale Conosco" enviado via Resend!');
          console.log(`   📧 Para: contatolizsoftware@gmail.com`);
          console.log(`   📧 De: ${email} (${nome})`);
          console.log(`   🔧 Configuração usada: ${this.configuracaoAtual}`);
          return true;
        } else {
          console.log('❌ Falha ao enviar via Resend');
          return false;
        }
      } else if (this.tipoAtual === 'sendgrid') {
        // Usar SendGrid
        const resultado = await this.sendEmailSendGrid(mailOptions);
        if (resultado) {
          console.log('✅ Email de "Fale Conosco" enviado via SendGrid!');
          console.log(`   📧 Para: contatolizsoftware@gmail.com`);
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
        console.log(`   📧 Para: contatolizsoftware@gmail.com`);
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
    console.log(`   Para: contatolizsoftware@gmail.com`);
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
      resendDisponivel: !!process.env.RESEND_API_KEY,
      sendgridDisponivel: !!process.env.SENDGRID_API_KEY,
      gmailDisponivel: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      resendFrom: process.env.RESEND_FROM_EMAIL || null,
      resendDomain: process.env.RESEND_VERIFIED_DOMAIN || null,
      lastEmailError: this.lastEmailError || null,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new EmailService(); 