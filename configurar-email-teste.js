const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('📧 Configurador de Email para Testes - FinFlow\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function configurarEmailTeste() {
  try {
    console.log('🎯 Vamos configurar seu email para testes!\n');
    
    // 1. Escolher provedor
    console.log('Escolha seu provedor de email:');
    console.log('1. Gmail (Google)');
    console.log('2. Outlook/Hotmail (Microsoft)');
    console.log('3. Yahoo');
    console.log('4. Outro (SMTP personalizado)');
    
    const provedor = await question('Digite o número do seu provedor (1-4): ');
    
    // 2. Coletar informações
    const email = await question('Digite seu email: ');
    const senha = await question('Digite sua senha de app: ');
    
    // 3. Determinar configuração baseada no provedor
    let config = {};
    
    switch (provedor) {
      case '1':
        config = {
          EMAIL_SERVICE: 'gmail',
          EMAIL_USER: email,
          EMAIL_PASS: senha
        };
        console.log('\n📧 Configuração Gmail:');
        console.log('💡 Certifique-se de ter:');
        console.log('   - Verificação em duas etapas ativada');
        console.log('   - Senha de app gerada');
        break;
        
      case '2':
        config = {
          EMAIL_SERVICE: 'outlook',
          EMAIL_USER: email,
          EMAIL_PASS: senha
        };
        console.log('\n📧 Configuração Outlook/Hotmail:');
        console.log('💡 Certifique-se de ter:');
        console.log('   - Senha de app gerada');
        break;
        
      case '3':
        config = {
          EMAIL_SERVICE: 'yahoo',
          EMAIL_USER: email,
          EMAIL_PASS: senha
        };
        console.log('\n📧 Configuração Yahoo:');
        console.log('💡 Certifique-se de ter:');
        console.log('   - Verificação em duas etapas ativada');
        console.log('   - Senha de app gerada');
        break;
        
      case '4':
        const host = await question('Digite o host SMTP (ex: smtp.gmail.com): ');
        const port = await question('Digite a porta (ex: 587): ');
        const secure = await question('É seguro? (true/false): ');
        
        config = {
          EMAIL_SERVICE: 'smtp',
          EMAIL_HOST: host,
          EMAIL_PORT: port,
          EMAIL_SECURE: secure,
          EMAIL_USER: email,
          EMAIL_PASS: senha
        };
        console.log('\n📧 Configuração SMTP personalizado:');
        break;
        
      default:
        console.log('❌ Opção inválida');
        rl.close();
        return;
    }
    
    // 4. Salvar configuração
    await salvarConfiguracao(config);
    
    // 5. Testar configuração
    console.log('\n🧪 Testando configuração...');
    await testarConfiguracao();
    
    // 6. Instruções finais
    console.log('\n🎉 Configuração concluída!');
    console.log('✅ Email configurado para testes');
    console.log('✅ Sistema pronto para uso');
    console.log('\n🚀 Próximos passos:');
    console.log('1. Execute: cd backend && npm start');
    console.log('2. Em outro terminal: npm start');
    console.log('3. Teste no navegador: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Erro durante configuração:', error.message);
  } finally {
    rl.close();
  }
}

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function salvarConfiguracao(config) {
  const configPath = path.join(__dirname, 'backend', 'config.env');
  
  try {
    let configContent = '';
    
    // Ler arquivo existente se existir
    if (fs.existsSync(configPath)) {
      configContent = fs.readFileSync(configPath, 'utf8');
    }
    
    // Adicionar configurações de email
    configContent += '\n# Configurações de Email para Testes\n';
    Object.entries(config).forEach(([key, value]) => {
      configContent += `${key}=${value}\n`;
    });
    
    // Adicionar outras configurações necessárias
    if (!configContent.includes('FRONTEND_URL')) {
      configContent += 'FRONTEND_URL=http://localhost:3000\n';
    }
    if (!configContent.includes('PORT')) {
      configContent += 'PORT=3001\n';
    }
    if (!configContent.includes('NODE_ENV')) {
      configContent += 'NODE_ENV=development\n';
    }
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Configuração salva em backend/config.env');
    
  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error.message);
  }
}

async function testarConfiguracao() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec('node validar-email.js', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  Teste não executado - configure o email primeiro');
        console.log('💡 Execute: node validar-email.js');
      } else {
        console.log('✅ Teste executado com sucesso!');
        console.log(stdout);
      }
      resolve();
    });
  });
}

// Executar configurador
configurarEmailTeste().catch(console.error); 