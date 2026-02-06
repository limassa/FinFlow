const nodemailer = require('nodemailer');

console.log('🚀 DIAGNÓSTICO DE EMAIL EM PRODUÇÃO (RAILWAY)');
console.log('================================================');

// Simular EXATAMENTE as variáveis do Railway
process.env.EMAIL_USER = 'contatoLizSoftware@gmail.com';
process.env.EMAIL_PASS = 'xdas ngdw yeao sgou';
process.env.EMAIL_SERVICE = 'gmail';
process.env.FRONTEND_URL = 'https://finflow.lizsoftwares.com';
process.env.NODE_ENV = 'production';

console.log('1. SIMULANDO VARIÁVEIS DO RAILWAY');
console.log('==================================');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado'}`);
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`🏭 NODE_ENV: ${process.env.NODE_ENV}`);

console.log('\n2. CONFIGURANDO TRANSPORTER');
console.log('=============================');
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('3. TESTANDO CONEXÃO');
console.log('====================');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro na conexão:', error.message);
    console.log('\n🔍 ANÁLISE DO ERRO:');
    
    if (error.message.includes('Missing credentials')) {
      console.log('   - As credenciais não estão sendo passadas corretamente');
      console.log('   - Verifique se EMAIL_USER e EMAIL_PASS estão definidos');
    } else if (error.message.includes('Invalid login')) {
      console.log('   - Login inválido no Gmail');
      console.log('   - Verifique se a senha de app está correta');
    } else if (error.message.includes('Username and Password not accepted')) {
      console.log('   - Usuário e senha não aceitos pelo Gmail');
      console.log('   - Verifique se a autenticação de 2 fatores está ativada');
    }
    
    console.log('\n📋 SOLUÇÕES:');
    console.log('   1. Verifique se as variáveis estão configuradas no Railway');
    console.log('   2. Confirme se a senha de app do Gmail está correta');
    console.log('   3. Verifique se a autenticação de 2 fatores está ativada');
    console.log('   4. Faça o redeploy da aplicação no Railway');
    return;
  }
  
  console.log('✅ Conexão com servidor de email OK!');
  
  console.log('\n4. ENVIANDO EMAIL DE TESTE');
  console.log('============================');
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'joaolmnmarket@gmail.com',
    subject: '🧪 Teste de Produção - FinFlow',
    html: `
      <h2>Teste de Email em Produção</h2>
      <p>Este é um teste para verificar se o sistema de email está funcionando em produção.</p>
      <p><strong>Variáveis de ambiente:</strong></p>
      <ul>
        <li>EMAIL_USER: ${process.env.EMAIL_USER}</li>
        <li>EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}</li>
        <li>FRONTEND_URL: ${process.env.FRONTEND_URL}</li>
        <li>NODE_ENV: ${process.env.NODE_ENV}</li>
      </ul>
      <p>Se você recebeu este email, o sistema de email em produção está funcionando!</p>
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
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('====================');
    console.log('✅ Sistema de email funcionando com variáveis de produção');
    console.log('✅ Conexão com Gmail OK');
    console.log('✅ Email enviado com sucesso');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Verifique se o email chegou em: joaolmnmarket@gmail.com');
    console.log('2. Faça o redeploy da aplicação no Railway');
    console.log('3. Teste o cadastro real de um usuário');
  });
}); 