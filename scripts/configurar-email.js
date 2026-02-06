const fs = require('fs');
const path = require('path');

function configurarEmail() {
  console.log('📧 Configurador de Email - FinFlow\n');
  
  console.log('Escolha seu provedor de email:');
  console.log('1. Gmail (Google)');
  console.log('2. Outlook/Hotmail (Microsoft)');
  console.log('3. Yahoo');
  console.log('4. Outro (SMTP personalizado)');
  console.log('5. Testar configuração atual');
  console.log('6. Sair');
  
  // Simular escolha do usuário (você pode modificar aqui)
  const escolha = 5; // Testar configuração atual
  
  switch (escolha) {
    case 1:
      configurarGmail();
      break;
    case 2:
      configurarOutlook();
      break;
    case 3:
      configurarYahoo();
      break;
    case 4:
      configurarSMTP();
      break;
    case 5:
      testarConfiguracaoAtual();
      break;
    case 6:
      console.log('👋 Até logo!');
      break;
    default:
      console.log('❌ Opção inválida');
  }
}

function configurarGmail() {
  console.log('\n📧 Configurando Gmail...');
  console.log('\n🔧 Passos para configurar Gmail:');
  console.log('1. Acesse: https://myaccount.google.com/security');
  console.log('2. Ative a "Verificação em duas etapas"');
  console.log('3. Vá em "Senhas de app"');
  console.log('4. Gere uma senha de app para "FinFlow"');
  console.log('5. Use essa senha no EMAIL_PASS');
  
  const config = {
    EMAIL_SERVICE: 'gmail',
    EMAIL_USER: 'seu-email@gmail.com',
    EMAIL_PASS: 'sua-senha-de-app'
  };
  
  salvarConfiguracao(config);
}

function configurarOutlook() {
  console.log('\n📧 Configurando Outlook/Hotmail...');
  console.log('\n🔧 Passos para configurar Outlook:');
  console.log('1. Acesse: https://account.live.com/proofs/AppPassword');
  console.log('2. Gere uma senha de app');
  console.log('3. Use essa senha no EMAIL_PASS');
  
  const config = {
    EMAIL_SERVICE: 'outlook',
    EMAIL_USER: 'seu-email@outlook.com',
    EMAIL_PASS: 'sua-senha-de-app'
  };
  
  salvarConfiguracao(config);
}

function configurarYahoo() {
  console.log('\n📧 Configurando Yahoo...');
  console.log('\n🔧 Passos para configurar Yahoo:');
  console.log('1. Acesse: https://login.yahoo.com/account/security');
  console.log('2. Ative a "Verificação em duas etapas"');
  console.log('3. Gere uma senha de app');
  console.log('4. Use essa senha no EMAIL_PASS');
  
  const config = {
    EMAIL_SERVICE: 'yahoo',
    EMAIL_USER: 'seu-email@yahoo.com',
    EMAIL_PASS: 'sua-senha-de-app'
  };
  
  salvarConfiguracao(config);
}

function configurarSMTP() {
  console.log('\n📧 Configurando SMTP personalizado...');
  console.log('\n🔧 Exemplo para provedores comuns:');
  
  const exemplos = {
    'Provedor Local': {
      host: 'smtp.seuprovedor.com',
      port: 587,
      secure: false
    },
    'Gmail SMTP': {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false
    },
    'Outlook SMTP': {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false
    }
  };
  
  console.log('Exemplos de configuração:');
  Object.entries(exemplos).forEach(([nome, config]) => {
    console.log(`\n${nome}:`);
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  Secure: ${config.secure}`);
  });
  
  const config = {
    EMAIL_SERVICE: 'smtp',
    EMAIL_HOST: 'smtp.seuprovedor.com',
    EMAIL_PORT: '587',
    EMAIL_SECURE: 'false',
    EMAIL_USER: 'seu-email@provedor.com',
    EMAIL_PASS: 'sua-senha'
  };
  
  salvarConfiguracao(config);
}

function testarConfiguracaoAtual() {
  console.log('\n🧪 Testando configuração atual...');
  
  // Executar o teste de email
  const { exec } = require('child_process');
  exec('node teste-email.js', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro ao executar teste:', error);
      return;
    }
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
  });
}

function salvarConfiguracao(config) {
  const configPath = path.join(__dirname, 'backend', 'config.env');
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Atualizar ou adicionar configurações
    Object.entries(config).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*`, 'm');
      if (regex.test(configContent)) {
        configContent = configContent.replace(regex, `${key}=${value}`);
      } else {
        configContent += `\n# ${key}\n${key}=${value}\n`;
      }
    });
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Configuração salva com sucesso!');
    console.log('📁 Arquivo atualizado:', configPath);
    
    console.log('\n🔧 Próximos passos:');
    console.log('1. Edite o arquivo config.env com suas credenciais');
    console.log('2. Execute: node teste-email.js');
    console.log('3. Verifique se o email foi recebido');
    
  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error.message);
  }
}

// Executar o configurador
configurarEmail(); 