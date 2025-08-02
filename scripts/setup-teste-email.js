const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🧪 Setup de Teste de Email - FinFlow\n');

async function setupTesteEmail() {
  try {
    // 1. Verificar se estamos em uma branch de teste
    console.log('1. Verificando branch atual...');
    const currentBranch = await getCurrentBranch();
    console.log(`📋 Branch atual: ${currentBranch}`);
    
    if (!currentBranch.includes('teste') && !currentBranch.includes('test')) {
      console.log('⚠️  Você não está em uma branch de teste');
      console.log('💡 Recomendado: git checkout -b teste-email');
    }
    
    // 2. Verificar arquivo de configuração
    console.log('\n2. Verificando configuração de email...');
    const configPath = path.join(__dirname, 'backend', 'config.env');
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const emailUser = configContent.match(/EMAIL_USER=(.+)/);
      const emailPass = configContent.match(/EMAIL_PASS=(.+)/);
      
      if (emailUser && emailPass) {
        console.log('✅ Configuração de email encontrada');
        console.log(`📧 Email: ${emailUser[1]}`);
        console.log(`🔑 Senha: ${emailPass[1] ? 'Configurada' : 'Não configurada'}`);
      } else {
        console.log('❌ Configuração de email incompleta');
        console.log('💡 Edite o arquivo backend/config.env');
      }
    } else {
      console.log('❌ Arquivo de configuração não encontrado');
      console.log('💡 Crie o arquivo backend/config.env');
    }
    
    // 3. Verificar dependências
    console.log('\n3. Verificando dependências...');
    const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
    
    if (fs.existsSync(backendPackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
      if (packageJson.dependencies && packageJson.dependencies.nodemailer) {
        console.log('✅ Nodemailer instalado');
      } else {
        console.log('⚠️  Nodemailer não encontrado');
        console.log('💡 Execute: cd backend && npm install nodemailer');
      }
    }
    
    // 4. Testar conexão de email
    console.log('\n4. Testando conexão de email...');
    await testarEmail();
    
    // 5. Instruções finais
    console.log('\n🎯 Próximos passos:');
    console.log('1. Configure seu email no backend/config.env');
    console.log('2. Execute: node teste-email.js');
    console.log('3. Se OK, execute: cd backend && npm start');
    console.log('4. Em outro terminal: npm start');
    console.log('5. Teste as funcionalidades no navegador');
    
  } catch (error) {
    console.error('❌ Erro durante setup:', error.message);
  }
}

async function getCurrentBranch() {
  return new Promise((resolve, reject) => {
    exec('git branch --show-current', (error, stdout, stderr) => {
      if (error) {
        resolve('main'); // fallback
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

async function testarEmail() {
  return new Promise((resolve, reject) => {
    exec('node teste-email.js', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Erro no teste de email');
        console.log('💡 Configure o email primeiro');
      } else {
        console.log('✅ Teste de email executado');
        console.log(stdout);
      }
      resolve();
    });
  });
}

// Executar setup
setupTesteEmail().catch(console.error); 