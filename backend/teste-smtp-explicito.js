const nodemailer = require('nodemailer');

console.log('🧪 TESTE SMTP EXPLÍCITO - RESOLVENDO TIMEOUT');
console.log('==============================================');

// Simular variáveis de produção
process.env.EMAIL_USER = 'contatoLizSoftware@gmail.com';
process.env.EMAIL_PASS = 'xdas ngdw yeao sgou';
process.env.FRONTEND_URL = 'https://finflow.lizsoftwares.com';
process.env.NODE_ENV = 'production';

console.log('1. CONFIGURAÇÕES DE PRODUÇÃO');
console.log('==============================');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado'}`);
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`🏭 NODE_ENV: ${process.env.NODE_ENV}`);

console.log('\n2. CONFIGURANDO TRANSPORTER SMTP EXPLÍCITO');
console.log('============================================');

// Usar as mesmas configurações do email service atualizado
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Configurações para resolver problemas de timeout
  connectionTimeout: 120000, // 2 minutos para conectar
  greetingTimeout: 60000,    // 1 minuto para greeting
  socketTimeout: 120000,     // 2 minutos para operações socket
  // Configurações de pool para melhor performance
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  // Configurações de retry
  retryDelay: 2000,
  maxRetries: 5,
  // Configurações de TLS
  tls: {
    rejectUnauthorized: false
  }
});

console.log('✅ Transporter configurado com SMTP explícito');
console.log('   - Host: smtp.gmail.com');
console.log('   - Port: 587');
console.log('   - Secure: false (STARTTLS)');
console.log('   - Connection Timeout: 120s');
console.log('   - Greeting Timeout: 60s');
console.log('   - Socket Timeout: 120s');
console.log('   - Pool: Ativado');
console.log('   - Max Connections: 3');
console.log('   - Max Retries: 5');
console.log('   - TLS: rejectUnauthorized: false');

console.log('\n3. TESTANDO CONEXÃO SMTP EXPLÍCITA');
console.log('=====================================');

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro na conexão:', error.message);
    console.log('\n🔍 ANÁLISE DO ERRO:');
    
    if (error.message.includes('timeout')) {
      console.log('   - Problema de timeout persistente');
      console.log('   - Verifique conectividade de rede do Railway');
    } else if (error.message.includes('authentication')) {
      console.log('   - Problema de autenticação');
      console.log('   - Verifique senha de app do Gmail');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   - Conexão recusada pelo Gmail');
      console.log('   - Verifique se a porta 587 está bloqueada');
    }
    
    return;
  }
  
  console.log('✅ Conexão SMTP explícita OK!');
  console.log('✅ Timeout otimizado funcionando');
  
  console.log('\n4. ENVIANDO EMAIL DE TESTE COM SMTP EXPLÍCITO');
  console.log('==================================================');
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'joaolmnmarket@gmail.com',
    subject: '🧪 Teste SMTP Explícito - FinFlow',
    html: `
      <h2>Teste SMTP Explícito</h2>
      <p>Este é um teste para verificar se o problema de timeout foi resolvido com SMTP explícito.</p>
      <p><strong>Configurações aplicadas:</strong></p>
      <ul>
        <li>Host: smtp.gmail.com</li>
        <li>Port: 587</li>
        <li>Secure: false (STARTTLS)</li>
        <li>Connection Timeout: 120s</li>
        <li>Greeting Timeout: 60s</li>
        <li>Socket Timeout: 120s</li>
        <li>Pool: Ativado</li>
        <li>Max Retries: 5</li>
        <li>TLS: rejectUnauthorized: false</li>
      </ul>
      <p>Se você recebeu este email, o problema de timeout foi resolvido com SMTP explícito!</p>
      <hr>
      <p><small>Enviado em: ${new Date().toLocaleString('pt-BR')}</small></p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ Erro ao enviar email:', error.message);
      console.log(`   Código: ${error.code || 'Não disponível'}`);
      return;
    }
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Para: ${mailOptions.to}`);
    
    console.log('\n🎉 PROBLEMA DE TIMEOUT RESOLVIDO COM SMTP EXPLÍCITO!');
    console.log('========================================================');
    console.log('✅ Conexão SMTP explícita funcionando');
    console.log('✅ Timeout otimizado funcionando');
    console.log('✅ Email enviado com sucesso');
    console.log('✅ Sistema de email funcionando em produção');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Faça o redeploy da aplicação no Railway');
    console.log('2. Teste o cadastro real de um usuário');
    console.log('3. Os emails de boas-vindas devem funcionar normalmente');
  });
}); 