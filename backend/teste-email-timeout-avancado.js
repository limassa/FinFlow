const nodemailer = require('nodemailer');

console.log('🧪 TESTE AVANÇADO DE EMAIL - DIAGNÓSTICO DE TIMEOUT');
console.log('====================================================\n');

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

// Testar diferentes configurações de timeout
const configuracaoes = [
  {
    name: 'Configuração Padrão (problemática)',
    config: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
        pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
      }
    }
  },
  {
    name: 'Configuração com Timeout Básico',
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
  },
  {
    name: 'Configuração com Timeout Otimizado',
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
  {
    name: 'Configuração com SMTP Explícito',
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
      maxConnections: 5,
      maxMessages: 100,
      retryDelay: 1000,
      maxRetries: 3,
      tls: {
        rejectUnauthorized: false
      }
    }
  }
];

async function testarConfiguracao(config, index) {
  console.log(`\n${index + 1}. TESTANDO: ${config.name}`);
  console.log('=' + '='.repeat(config.name.length + 10));
  
  try {
    const transporter = nodemailer.createTransport(config.config);
    
    console.log('   🔧 Transporter criado, testando conexão...');
    
    // Testar conexão
    await transporter.verify();
    console.log('   ✅ Conexão OK!');
    
    // Testar envio de email
    console.log('   📧 Testando envio de email...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
      to: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
      subject: `🧪 Teste ${index + 1} - ${config.name}`,
      html: `
        <h2>Teste de Configuração</h2>
        <p><strong>Configuração:</strong> ${config.name}</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Status:</strong> ✅ Funcionando</p>
        <hr>
        <p>Se você recebeu este email, a configuração está funcionando!</p>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`   ✅ Email enviado com sucesso!`);
    console.log(`   📧 Message ID: ${info.messageId}`);
    
    return { success: true, config: config.name };
    
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
    }
    
    return { success: false, config: config.name, error: error.message };
  }
}

async function executarTestes() {
  console.log('\n🚀 INICIANDO TESTES DE CONFIGURAÇÃO...');
  console.log('=====================================');
  
  const resultados = [];
  
  for (let i = 0; i < configuracaoes.length; i++) {
    const resultado = await testarConfiguracao(configuracaoes[i], i);
    resultados.push(resultado);
    
    // Aguardar um pouco entre os testes
    if (i < configuracaoes.length - 1) {
      console.log('   ⏳ Aguardando 3 segundos antes do próximo teste...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('=====================');
  
  const sucessos = resultados.filter(r => r.success);
  const falhas = resultados.filter(r => !r.success);
  
  console.log(`✅ Sucessos: ${sucessos.length}/${resultados.length}`);
  console.log(`❌ Falhas: ${falhas.length}/${resultados.length}`);
  
  if (sucessos.length > 0) {
    console.log('\n🎯 CONFIGURAÇÕES FUNCIONANDO:');
    sucessos.forEach(r => console.log(`   ✅ ${r.config}`));
  }
  
  if (falhas.length > 0) {
    console.log('\n🚨 CONFIGURAÇÕES COM PROBLEMAS:');
    falhas.forEach(r => console.log(`   ❌ ${r.config}: ${r.error}`));
  }
  
  // Recomendação
  if (sucessos.length > 0) {
    console.log('\n💡 RECOMENDAÇÃO:');
    console.log(`   Use a configuração: "${sucessos[0].config}"`);
    console.log('   Esta configuração resolve o problema de timeout!');
  } else {
    console.log('\n🚨 PROBLEMA CRÍTICO:');
    console.log('   Nenhuma configuração funcionou');
    console.log('   Verifique as credenciais e conectividade de rede');
  }
  
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('1. Aplique a configuração que funcionou no emailService.js');
  console.log('2. Faça o redeploy da aplicação');
  console.log('3. Teste novamente o cadastro de usuário');
}

// Executar testes
executarTestes().catch(console.error);
