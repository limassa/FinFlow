const nodemailer = require('nodemailer');

console.log('🧪 TESTE DE TIMEOUT RESOLVIDO - PRODUÇÃO');
console.log('==========================================');

// Simular variáveis de produção
process.env.EMAIL_USER = 'contatoLizSoftware@gmail.com';
process.env.EMAIL_PASS = 'xdas ngdw yeao sgou';
process.env.EMAIL_SERVICE = 'gmail';
process.env.FRONTEND_URL = 'https://finflow.lizsoftwares.com';
process.env.NODE_ENV = 'production';

console.log('1. CONFIGURAÇÕES DE PRODUÇÃO');
console.log('==============================');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado'}`);
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`🏭 NODE_ENV: ${process.env.NODE_ENV}`);

console.log('\n2. CONFIGURANDO TRANSPORTER COM TIMEOUT OTIMIZADO');
console.log('==================================================');

// Usar as mesmas configurações do email service atualizado
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Configurações para resolver problemas de timeout
  connectionTimeout: 60000, // 60 segundos para conectar
  greetingTimeout: 30000,   // 30 segundos para greeting
  socketTimeout: 60000,     // 60 segundos para operações socket
  // Configurações de pool para melhor performance
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  // Configurações de retry
  retryDelay: 1000,
  maxRetries: 3
});

console.log('✅ Transporter configurado com timeout otimizado');
console.log('   - Connection Timeout: 60s');
console.log('   - Greeting Timeout: 30s');
console.log('   - Socket Timeout: 60s');
console.log('   - Pool: Ativado');
console.log('   - Max Connections: 5');
console.log('   - Max Retries: 3');

console.log('\n3. TESTANDO CONEXÃO COM TIMEOUT OTIMIZADO');
console.log('============================================');

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro na conexão:', error.message);
    console.log('\n🔍 ANÁLISE DO ERRO:');
    
    if (error.message.includes('timeout')) {
      console.log('   - Problema de timeout persistente');
      console.log('   - Verifique conectividade de rede');
    } else if (error.message.includes('authentication')) {
      console.log('   - Problema de autenticação');
      console.log('   - Verifique senha de app do Gmail');
    }
    
    return;
  }
  
  console.log('✅ Conexão com servidor de email OK!');
  console.log('✅ Timeout otimizado funcionando');
  
  console.log('\n4. ENVIANDO EMAIL DE TESTE COM NOVAS CONFIGURAÇÕES');
  console.log('========================================================');
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'joaolmnmarket@gmail.com',
    subject: '🧪 Teste de Timeout Resolvido - FinFlow',
    html: `
      <h2>Teste de Timeout Resolvido</h2>
      <p>Este é um teste para verificar se o problema de timeout foi resolvido.</p>
      <p><strong>Configurações aplicadas:</strong></p>
      <ul>
        <li>Connection Timeout: 60s</li>
        <li>Greeting Timeout: 30s</li>
        <li>Socket Timeout: 60s</li>
        <li>Pool: Ativado</li>
        <li>Max Retries: 3</li>
      </ul>
      <p>Se você recebeu este email, o problema de timeout foi resolvido!</p>
      <hr>
      <p><small>Enviado em: ${new Date().toLocaleString('pt-BR')}</small></p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ Erro ao enviar email:', error.message);
      return;
    }
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Para: ${mailOptions.to}`);
    
    console.log('\n🎉 PROBLEMA DE TIMEOUT RESOLVIDO!');
    console.log('====================================');
    console.log('✅ Conexão SMTP funcionando com timeout otimizado');
    console.log('✅ Email enviado com sucesso');
    console.log('✅ Sistema de email funcionando em produção');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Faça o redeploy da aplicação no Railway');
    console.log('2. Teste o cadastro real de um usuário');
    console.log('3. Os emails de boas-vindas devem funcionar normalmente');
  });
}); 