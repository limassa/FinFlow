const nodemailer = require('nodemailer');

console.log('🔍 DIAGNÓSTICO COMPLETO DE EMAIL');
console.log('==================================');

// 1. Verificar se estamos no ambiente correto
console.log('\n1. VERIFICAÇÃO DE AMBIENTE');
console.log('============================');
console.log(`🏭 NODE_ENV: ${process.env.NODE_ENV || 'Não definido'}`);
console.log(`📁 Diretório atual: ${process.cwd()}`);

// 2. Verificar variáveis de ambiente
console.log('\n2. VARIÁVEIS DE AMBIENTE');
console.log('==========================');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER || 'Não configurado'}`);
console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado'}`);
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL || 'Não configurado'}`);
console.log(`📧 EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'Não configurado'}`);

// 3. Verificar se o nodemailer está funcionando
console.log('\n3. TESTE DO NODEMAILER');
console.log('========================');
try {
  console.log('✅ Nodemailer carregado com sucesso');
  console.log(`📦 Versão: ${nodemailer.version || 'Não disponível'}`);
} catch (error) {
  console.log('❌ Erro ao carregar nodemailer:', error.message);
  process.exit(1);
}

// 4. Testar configuração do transporter
console.log('\n4. CONFIGURAÇÃO DO TRANSPORTER');
console.log('================================');
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('✅ Transporter configurado com sucesso');
} catch (error) {
  console.log('❌ Erro ao configurar transporter:', error.message);
  process.exit(1);
}

// 5. Testar conexão com servidor de email
console.log('\n5. TESTE DE CONEXÃO');
console.log('====================');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro na conexão:', error.message);
    console.log('\n🔍 POSSÍVEIS CAUSAS:');
    console.log('   - Senha de app do Gmail incorreta');
    console.log('   - Autenticação de 2 fatores não configurada');
    console.log('   - Bloqueio de segurança do Google');
    console.log('   - Limite de envio excedido (500 emails/dia)');
    return;
  }
  
  console.log('✅ Conexão com servidor de email OK!');
  
  // 6. Testar envio de email
  console.log('\n6. TESTE DE ENVIO');
  console.log('==================');
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'joaolmnmarket@gmail.com',
    subject: '🧪 Teste de Diagnóstico - FinFlow',
    html: `
      <h2>Teste de Diagnóstico de Email</h2>
      <p>Este é um teste para verificar se o sistema de email está funcionando.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>Ambiente:</strong> ${process.env.NODE_ENV || 'Não definido'}</p>
      <hr>
      <p><small>Enviado pelo sistema de diagnóstico</small></p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ Erro ao enviar email:', error.message);
      console.log('\n🔍 DETALHES DO ERRO:');
      console.log(`   Código: ${error.code || 'Não disponível'}`);
      console.log(`   Comando: ${error.command || 'Não disponível'}`);
      console.log(`   Resposta: ${error.response || 'Não disponível'}`);
      return;
    }
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Para: ${mailOptions.to}`);
    
    // 7. Verificar se o email chegou na caixa de saída
    console.log('\n7. VERIFICAÇÃO DE ENVIO');
    console.log('========================');
    console.log('📤 Email enviado para o servidor Gmail');
    console.log('📬 Verifique se chegou em: joaolmnmarket@gmail.com');
    console.log('📁 Verifique também a pasta de spam/lixo eletrônico');
    
    console.log('\n🎉 DIAGNÓSTICO CONCLUÍDO!');
    console.log('==========================');
    console.log('✅ Sistema de email funcionando localmente');
    console.log('✅ Conexão com Gmail OK');
    console.log('✅ Email enviado com sucesso');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Verifique se o email chegou em: joaolmnmarket@gmail.com');
    console.log('2. Se não chegou, verifique a pasta de spam');
    console.log('3. Faça o redeploy da aplicação no Railway');
    console.log('4. Teste o cadastro real de um usuário');
  });
}); 