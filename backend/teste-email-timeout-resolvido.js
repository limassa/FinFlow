const nodemailer = require('nodemailer');
const emailConfig = require('./config-email-producao');

console.log('🧪 TESTE DE EMAIL - TIMEOUT RESOLVIDO');
console.log('======================================\n');

// Carregar variáveis de ambiente
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Ambiente de produção detectado');
} else {
  require('dotenv').config({ path: './config.env' });
  console.log('🔧 Ambiente de desenvolvimento detectado');
}

console.log('1. VERIFICANDO CONFIGURAÇÕES');
console.log('=============================');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER || 'Não configurado'}`);
console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado'}`);
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL || 'Não configurado'}`);
console.log(`🏭 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

console.log('\n2. CONFIGURANDO TRANSPORTER COM TIMEOUT OTIMIZADO');
console.log('==================================================');

// Configurar transporter com configurações otimizadas
const transporter = nodemailer.createTransporter({
  service: emailConfig.smtp.service,
  host: emailConfig.smtp.host,
  port: emailConfig.smtp.port,
  secure: emailConfig.smtp.secure,
  auth: {
    user: process.env.EMAIL_USER || emailConfig.smtp.auth.user,
    pass: process.env.EMAIL_PASS || emailConfig.smtp.auth.pass
  },
  // Configurações para resolver problemas de timeout
  connectionTimeout: emailConfig.smtp.connectionTimeout,
  greetingTimeout: emailConfig.smtp.greetingTimeout,
  socketTimeout: emailConfig.smtp.socketTimeout,
  // Configurações de pool
  pool: emailConfig.smtp.pool,
  maxConnections: emailConfig.smtp.maxConnections,
  maxMessages: emailConfig.smtp.maxMessages,
  // Configurações de retry
  retryDelay: emailConfig.smtp.retryDelay,
  maxRetries: emailConfig.smtp.maxRetries,
  // Configurações de TLS
  tls: emailConfig.smtp.tls
});

console.log('✅ Transporter configurado com timeout otimizado');
console.log(`   - Connection Timeout: ${emailConfig.smtp.connectionTimeout/1000}s`);
console.log(`   - Greeting Timeout: ${emailConfig.smtp.greetingTimeout/1000}s`);
console.log(`   - Socket Timeout: ${emailConfig.smtp.socketTimeout/1000}s`);
console.log(`   - Pool: ${emailConfig.smtp.pool ? 'Ativado' : 'Desativado'}`);
console.log(`   - Max Connections: ${emailConfig.smtp.maxConnections}`);
console.log(`   - Max Retries: ${emailConfig.smtp.maxRetries}`);

console.log('\n3. TESTANDO CONEXÃO COM TIMEOUT OTIMIZADO');
console.log('============================================');

// Testar conexão
async function testarConexao() {
  try {
    await transporter.verify();
    console.log('✅ Conexão com servidor de email OK!');
    console.log('✅ Timeout otimizado funcionando');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Código:', error.code);
    console.error('Comando:', error.command);
    
    console.log('\n🔍 ANÁLISE DO ERRO:');
    if (error.message.includes('timeout')) {
      console.log('   - Problema de timeout persistente');
      console.log('   - Verifique conectividade de rede');
      console.log('   - Verifique configurações de firewall');
    } else if (error.message.includes('authentication')) {
      console.log('   - Problema de autenticação');
      console.log('   - Verifique senha de app do Gmail');
      console.log('   - Verifique se a verificação 2FA está ativa');
    } else if (error.message.includes('connection')) {
      console.log('   - Problema de conexão de rede');
      console.log('   - Verifique se a porta 587 está liberada');
      console.log('   - Verifique configurações de proxy');
    }
    return false;
  }
}

// Enviar email de teste
async function enviarEmailTeste() {
  try {
    console.log('\n4. ENVIANDO EMAIL DE TESTE COM NOVAS CONFIGURAÇÕES');
    console.log('========================================================');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || emailConfig.email.from,
      to: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
      subject: '🧪 Teste de Timeout Resolvido - FinFlow Produção',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🧪 Teste de Timeout Resolvido</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Sistema de Email em Produção</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">✅ Problema de Timeout Resolvido!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Este é um email de teste para verificar se o problema de timeout na conexão SMTP 
              foi resolvido com as novas configurações otimizadas.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📋 Configurações Aplicadas:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Connection Timeout:</strong> ${emailConfig.smtp.connectionTimeout/1000}s</li>
                <li><strong>Greeting Timeout:</strong> ${emailConfig.smtp.greetingTimeout/1000}s</li>
                <li><strong>Socket Timeout:</strong> ${emailConfig.smtp.socketTimeout/1000}s</li>
                <li><strong>Pool:</strong> ${emailConfig.smtp.pool ? 'Ativado' : 'Desativado'}</li>
                <li><strong>Max Connections:</strong> ${emailConfig.smtp.maxConnections}</li>
                <li><strong>Max Retries:</strong> ${emailConfig.smtp.maxRetries}</li>
              </ul>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin-top: 0;">🎯 Resultado:</h3>
              <p style="color: #666; margin: 0;">
                <strong>Status:</strong> ✅ Funcionando<br>
                <strong>Problema:</strong> ❌ Timeout resolvido<br>
                <strong>Performance:</strong> 🚀 Otimizada
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Se você recebeu este email, significa que o problema de timeout foi resolvido e o sistema 
              pode enviar emails automaticamente (boas-vindas, redefinição de senha, lembretes, etc.).
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || emailConfig.email.frontendUrl}" 
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
    console.log(`📬 Para: ${mailOptions.to}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    console.error('Código:', error.code);
    console.error('Comando:', error.command);
    return false;
  }
}

// Função principal
async function executarTeste() {
  console.log('\n🚀 INICIANDO TESTE COMPLETO...');
  console.log('================================');
  
  const conexaoOk = await testarConexao();
  
  if (!conexaoOk) {
    console.log('\n❌ Teste falhou na conexão');
    console.log('🔧 Verifique as configurações e tente novamente');
    return;
  }
  
  const emailTesteOk = await enviarEmailTeste();
  
  if (emailTesteOk) {
    console.log('\n🎉 PROBLEMA DE TIMEOUT RESOLVIDO!');
    console.log('====================================');
    console.log('✅ Conexão SMTP funcionando com timeout otimizado');
    console.log('✅ Email enviado com sucesso');
    console.log('✅ Sistema de email funcionando em produção');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Faça o redeploy da aplicação no Railway');
    console.log('2. Teste o cadastro real de um usuário');
    console.log('3. Os emails de boas-vindas devem funcionar normalmente');
    console.log('4. Monitore os logs para confirmar funcionamento');
    
    console.log('\n🔧 CONFIGURAÇÕES APLICADAS:');
    console.log(`   - Connection Timeout: ${emailConfig.smtp.connectionTimeout/1000}s`);
    console.log(`   - Greeting Timeout: ${emailConfig.smtp.greetingTimeout/1000}s`);
    console.log(`   - Socket Timeout: ${emailConfig.smtp.socketTimeout/1000}s`);
    console.log(`   - Pool: ${emailConfig.smtp.pool ? 'Ativado' : 'Desativado'}`);
    console.log(`   - Max Retries: ${emailConfig.smtp.maxRetries}`);
  } else {
    console.log('\n❌ Teste falhou no envio de email');
    console.log('🔧 Verifique as configurações de email');
  }
}

// Executar teste
executarTeste().catch(console.error);
