const nodemailer = require('nodemailer');

console.log('🚂 TESTE ESPECÍFICO PARA RAILWAY - DIAGNÓSTICO DE TIMEOUT');
console.log('==========================================================\n');

// Configurações específicas para Railway
const configuracaoesRailway = [
  {
    name: 'Gmail Porta 465 (SSL)',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
        pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000
    }
  },
  {
    name: 'Gmail Porta 587 (TLS) - Sem Pool',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
        pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      pool: false, // Desabilita pool
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      }
    }
  },
  {
    name: 'Gmail Porta 587 (TLS) - Com Pool Otimizado',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
        pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      pool: true,
      maxConnections: 1, // Reduzido para Railway
      maxMessages: 10,   // Reduzido para Railway
      retryDelay: 2000,
      maxRetries: 2,
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Gmail Service (Automático)',
    config: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
        pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000
    }
  }
];

async function testarConfiguracaoRailway(config, index) {
  console.log(`\n${index + 1}. TESTANDO: ${config.name}`);
  console.log('=' + '='.repeat(config.name.length + 10));
  
  try {
    console.log(`   🔧 Criando transporter com porta ${config.port || 'automática'}...`);
    const transporter = nodemailer.createTransport(config.config);
    
    console.log('   🔍 Testando conexão...');
    
    // Testar conexão
    await transporter.verify();
    console.log('   ✅ Conexão OK!');
    
    // Testar envio de email
    console.log('   📧 Testando envio de email...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
      to: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
      subject: `🚂 Teste Railway ${index + 1} - ${config.name}`,
      html: `
        <h2>Teste Railway - Configuração</h2>
        <p><strong>Configuração:</strong> ${config.name}</p>
        <p><strong>Porta:</strong> ${config.port || 'Automática'}</p>
        <p><strong>Protocolo:</strong> ${config.secure ? 'SSL' : 'TLS'}</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Status:</strong> ✅ Funcionando no Railway</p>
        <hr>
        <p>Se você recebeu este email, a configuração está funcionando no Railway!</p>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`   ✅ Email enviado com sucesso!`);
    console.log(`   📧 Message ID: ${info.messageId}`);
    
    return { success: true, config: config.name, port: config.port };
    
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    console.log(`   🔍 Código: ${error.code || 'N/A'}`);
    console.log(`   📝 Comando: ${error.command || 'N/A'}`);
    
    if (error.message.includes('timeout')) {
      console.log(`   ⏰ Problema de timeout detectado`);
    } else if (error.message.includes('authentication')) {
      console.log(`   🔐 Problema de autenticação`);
    } else if (error.message.includes('connection')) {
      console.log(`   🌐 Problema de conexão`);
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log(`   🚫 Conexão recusada - porta pode estar bloqueada`);
    }
    
    return { success: false, config: config.name, error: error.message, port: config.port };
  }
}

async function executarTestesRailway() {
  console.log('🚀 INICIANDO TESTES ESPECÍFICOS PARA RAILWAY...');
  console.log('================================================');
  
  const resultados = [];
  
  for (let i = 0; i < configuracaoesRailway.length; i++) {
    const resultado = await testarConfiguracaoRailway(configuracaoesRailway[i], i);
    resultados.push(resultado);
    
    // Aguardar entre os testes
    if (i < configuracaoesRailway.length - 1) {
      console.log('   ⏳ Aguardando 2 segundos...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES RAILWAY');
  console.log('=============================');
  
  const sucessos = resultados.filter(r => r.success);
  const falhas = resultados.filter(r => !r.success);
  
  console.log(`✅ Sucessos: ${sucessos.length}/${resultados.length}`);
  console.log(`❌ Falhas: ${falhas.length}/${resultados.length}`);
  
  if (sucessos.length > 0) {
    console.log('\n🎯 CONFIGURAÇÕES FUNCIONANDO NO RAILWAY:');
    sucessos.forEach(r => console.log(`   ✅ ${r.config} (Porta: ${r.port || 'Auto'})`));
  }
  
  if (falhas.length > 0) {
    console.log('\n🚨 CONFIGURAÇÕES COM PROBLEMAS NO RAILWAY:');
    falhas.forEach(r => console.log(`   ❌ ${r.config} (Porta: ${r.port || 'Auto'}): ${r.error}`));
  }
  
  // Recomendação específica para Railway
  if (sucessos.length > 0) {
    console.log('\n💡 RECOMENDAÇÃO PARA RAILWAY:');
    const melhorConfig = sucessos[0];
    console.log(`   Use: "${melhorConfig.config}"`);
    console.log(`   Porta: ${melhorConfig.port || 'Automática'}`);
    console.log('   Esta configuração é compatível com as restrições do Railway!');
  } else {
    console.log('\n🚨 PROBLEMA CRÍTICO NO RAILWAY:');
    console.log('   Nenhuma configuração funcionou');
    console.log('   O Railway pode estar bloqueando todas as conexões SMTP');
    console.log('   Considere usar um serviço de email alternativo');
  }
  
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('1. Aplique a configuração que funcionou no emailService.js');
  console.log('2. Faça o redeploy no Railway');
  console.log('3. Teste o cadastro de usuário');
  console.log('4. Se nada funcionar, considere usar SendGrid ou Mailgun');
}

// Executar testes específicos para Railway
executarTestesRailway().catch(console.error);
