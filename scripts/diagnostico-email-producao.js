const nodemailer = require('nodemailer');

// Função para verificar variáveis de ambiente
function verificarVariaveisAmbiente() {
  console.log('🔍 Verificando variáveis de ambiente...\n');
  
  const variaveis = [
    'EMAIL_USER',
    'EMAIL_PASS', 
    'EMAIL_SERVICE',
    'FRONTEND_URL',
    'NODE_ENV'
  ];
  
  variaveis.forEach(variavel => {
    const valor = process.env[variavel];
    if (valor) {
      if (variavel === 'EMAIL_PASS') {
        console.log(`✅ ${variavel}: ${valor.substring(0, 4)}...${valor.substring(valor.length - 4)}`);
      } else {
        console.log(`✅ ${variavel}: ${valor}`);
      }
    } else {
      console.log(`❌ ${variavel}: Não configurada`);
    }
  });
  
  console.log('');
}

// Função para testar conexão com servidor de email
async function testarConexaoEmail() {
  console.log('🔌 Testando conexão com servidor de email...\n');
  
  try {
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailSecure = process.env.EMAIL_SECURE === 'true';
    
    let transporter;
    
    if (emailService === 'smtp' && emailHost) {
      // SMTP personalizado
      console.log(`📧 Usando SMTP personalizado: ${emailHost}:${emailPort}`);
      transporter = nodemailer.createTransporter({
        host: emailHost,
        port: parseInt(emailPort) || 587,
        secure: emailSecure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Serviços predefinidos
      console.log(`📧 Usando serviço: ${emailService}`);
      transporter = nodemailer.createTransporter({
        service: emailService,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
    
    // Verificar conexão
    await transporter.verify();
    console.log('✅ Conexão com servidor de email OK!');
    
    return transporter;
    
  } catch (error) {
    console.error('❌ Erro na conexão com servidor de email:', error.message);
    console.error('\n🔧 Possíveis causas:');
    console.error('1. Credenciais incorretas (EMAIL_USER/EMAIL_PASS)');
    console.error('2. Para Gmail: senha de app necessária');
    console.error('3. Autenticação de 2 fatores não configurada');
    console.error('4. Servidor de email bloqueando conexões');
    console.error('5. Firewall ou proxy bloqueando conexão');
    
    return null;
  }
}

// Função para enviar email de teste
async function enviarEmailTeste(transporter) {
  console.log('\n📤 Enviando email de teste...\n');
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Enviar para o próprio email
      subject: '🧪 Teste de Email - FinFlow Produção',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🧪 Teste de Email - Produção</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Sistema de Email</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">✅ Email Funcionando em Produção!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Este é um email de teste para verificar se a configuração de email do FinFlow 
              está funcionando corretamente em produção.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📋 Detalhes do Teste:</h3>
              <p style="color: #666; margin: 0;">
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>Ambiente:</strong> Produção<br>
                <strong>Servidor:</strong> ${process.env.EMAIL_SERVICE || 'Gmail'}<br>
                <strong>Status:</strong> Funcionando ✅
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Se você recebeu este email, significa que a configuração está correta e o sistema 
              pode enviar emails automaticamente (boas-vindas, redefinição de senha, lembretes, etc.).
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://finflow.lizsoftware.com.br'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Acessar FinFlow
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Este é um email de teste automático do sistema FinFlow em produção.
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de teste enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Para: ${info.accepted.join(', ')}`);
    console.log(`📤 De: ${info.from}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de teste:', error.message);
    console.error('\n🔧 Detalhes do erro:');
    console.error('Código:', error.code);
    console.error('Comando:', error.command);
    console.error('Resposta:', error.response);
    
    return false;
  }
}

// Função para simular email de boas-vindas
async function simularEmailBoasVindas(transporter) {
  console.log('\n🎉 Simulando email de boas-vindas...\n');
  
  try {
    const user = {
      nome: 'Usuário Teste',
      email: process.env.EMAIL_USER
    };
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
              <a href="${process.env.FRONTEND_URL || 'https://finflow.lizsoftware.com.br'}" 
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
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de boas-vindas simulado enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas simulado:', error.message);
    return false;
  }
}

// Função principal
async function diagnosticoEmailProducao() {
  console.log('🔍 DIAGNÓSTICO DE EMAIL - PRODUÇÃO');
  console.log('=====================================\n');
  
  // 1. Verificar variáveis de ambiente
  verificarVariaveisAmbiente();
  
  // 2. Testar conexão
  const transporter = await testarConexaoEmail();
  
  if (!transporter) {
    console.log('❌ Não foi possível estabelecer conexão com servidor de email');
    console.log('🔧 Verifique as configurações e tente novamente');
    return;
  }
  
  // 3. Enviar email de teste
  const testeOk = await enviarEmailTeste(transporter);
  
  if (testeOk) {
    // 4. Simular email de boas-vindas
    await simularEmailBoasVindas(transporter);
    
    console.log('\n🎉 DIAGNÓSTICO CONCLUÍDO COM SUCESSO!');
    console.log('✅ O sistema de email está funcionando corretamente');
    console.log('✅ Emails de cadastro devem ser enviados normalmente');
    console.log('\n📋 Próximos passos:');
    console.log('1. Teste o cadastro de um novo usuário');
    console.log('2. Verifique se o email de boas-vindas chega');
    console.log('3. Monitore os logs do servidor para erros');
  } else {
    console.log('\n❌ DIAGNÓSTICO FALHOU');
    console.log('🔧 O sistema de email não está funcionando');
    console.log('📋 Verifique:');
    console.log('1. Credenciais de email (EMAIL_USER/EMAIL_PASS)');
    console.log('2. Configuração de autenticação (2FA, senha de app)');
    console.log('3. Configurações de firewall/proxy');
    console.log('4. Limites de envio do provedor de email');
  }
}

// Executar diagnóstico
diagnosticoEmailProducao().catch(console.error); 