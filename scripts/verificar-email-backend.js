const path = require('path');
const fs = require('fs');

console.log('🔍 VERIFICANDO CONFIGURAÇÃO DE EMAIL NO BACKEND');
console.log('================================================\n');

// 1. Verificar se o arquivo emailService.js existe
const emailServicePath = path.join(__dirname, '../backend/src/services/emailService.js');
const emailServiceV2Path = path.join(__dirname, '../backend/src/services/emailService-v2.js');

console.log('1. Verificando arquivos de serviço de email...');
console.log(`📁 emailService.js: ${fs.existsSync(emailServicePath) ? '✅ Existe' : '❌ Não existe'}`);
console.log(`📁 emailService-v2.js: ${fs.existsSync(emailServiceV2Path) ? '✅ Existe' : '❌ Não existe'}`);

// 2. Verificar qual serviço está sendo usado no app.js
const appJsPath = path.join(__dirname, '../backend/app.js');
console.log('\n2. Verificando importação no app.js...');

if (fs.existsSync(appJsPath)) {
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  
  // Verificar importação
  if (appJsContent.includes("require('./src/services/emailService')")) {
    console.log('✅ Usando emailService.js (versão 1)');
  } else if (appJsContent.includes("require('./src/services/emailService-v2')")) {
    console.log('✅ Usando emailService-v2.js (versão 2)');
  } else {
    console.log('❌ Nenhum serviço de email importado');
  }
  
  // Verificar uso do sendWelcomeEmail
  if (appJsContent.includes('sendWelcomeEmail')) {
    console.log('✅ Função sendWelcomeEmail está sendo usada');
    
    // Extrair contexto do uso
    const lines = appJsContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('sendWelcomeEmail')) {
        console.log(`📝 Linha ${i + 1}: ${lines[i].trim()}`);
        if (i > 0) console.log(`📝 Linha ${i}: ${lines[i - 1].trim()}`);
        if (i < lines.length - 1) console.log(`📝 Linha ${i + 2}: ${lines[i + 1].trim()}`);
        break;
      }
    }
  } else {
    console.log('❌ Função sendWelcomeEmail não encontrada');
  }
} else {
  console.log('❌ Arquivo app.js não encontrado');
}

// 3. Verificar configurações de ambiente
console.log('\n3. Verificando configurações de ambiente...');

const configEnvPath = path.join(__dirname, '../backend/config.env');
const configProdPath = path.join(__dirname, '../backend/config.production.js');

if (fs.existsSync(configEnvPath)) {
  console.log('✅ Arquivo config.env existe');
  const configContent = fs.readFileSync(configEnvPath, 'utf8');
  
  const emailVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_SERVICE', 'FRONTEND_URL'];
  emailVars.forEach(variavel => {
    if (configContent.includes(variavel)) {
      console.log(`✅ ${variavel} configurado`);
    } else {
      console.log(`❌ ${variavel} não configurado`);
    }
  });
} else {
  console.log('❌ Arquivo config.env não encontrado');
}

if (fs.existsSync(configProdPath)) {
  console.log('✅ Arquivo config.production.js existe');
} else {
  console.log('❌ Arquivo config.production.js não encontrado');
}

// 4. Verificar se o nodemailer está instalado
console.log('\n4. Verificando dependências...');

const packageJsonPath = path.join(__dirname, '../backend/package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.dependencies && packageJson.dependencies.nodemailer) {
    console.log(`✅ Nodemailer instalado (versão: ${packageJson.dependencies.nodemailer})`);
  } else {
    console.log('❌ Nodemailer não encontrado nas dependências');
  }
} else {
  console.log('❌ package.json não encontrado');
}

// 5. Verificar estrutura do emailService
console.log('\n5. Analisando estrutura do emailService...');

if (fs.existsSync(emailServicePath)) {
  const emailServiceContent = fs.readFileSync(emailServicePath, 'utf8');
  
  // Verificar se tem a classe EmailService
  if (emailServiceContent.includes('class EmailService')) {
    console.log('✅ Classe EmailService encontrada');
  } else {
    console.log('❌ Classe EmailService não encontrada');
  }
  
  // Verificar se tem o método sendWelcomeEmail
  if (emailServiceContent.includes('sendWelcomeEmail')) {
    console.log('✅ Método sendWelcomeEmail encontrado');
  } else {
    console.log('❌ Método sendWelcomeEmail não encontrado');
  }
  
  // Verificar configuração do transporter
  if (emailServiceContent.includes('nodemailer.createTransporter')) {
    console.log('✅ Configuração do transporter encontrada');
  } else {
    console.log('❌ Configuração do transporter não encontrada');
  }
  
  // Verificar uso de variáveis de ambiente
  if (emailServiceContent.includes('process.env.EMAIL_USER')) {
    console.log('✅ Usando variáveis de ambiente para EMAIL_USER');
  } else {
    console.log('❌ Não usa variáveis de ambiente para EMAIL_USER');
  }
  
  if (emailServiceContent.includes('process.env.EMAIL_PASS')) {
    console.log('✅ Usando variáveis de ambiente para EMAIL_PASS');
  } else {
    console.log('❌ Não usa variáveis de ambiente para EMAIL_PASS');
  }
}

// 6. Verificar se há tratamento de erro
console.log('\n6. Verificando tratamento de erros...');

if (fs.existsSync(emailServicePath)) {
  const emailServiceContent = fs.readFileSync(emailServicePath, 'utf8');
  
  if (emailServiceContent.includes('try {') && emailServiceContent.includes('catch (error)')) {
    console.log('✅ Tratamento de erro encontrado');
  } else {
    console.log('❌ Tratamento de erro não encontrado');
  }
  
  if (emailServiceContent.includes('console.error')) {
    console.log('✅ Logs de erro encontrados');
  } else {
    console.log('❌ Logs de erro não encontrados');
  }
}

// 7. Verificar se o serviço está sendo exportado corretamente
console.log('\n7. Verificando exportação do serviço...');

if (fs.existsSync(emailServicePath)) {
  const emailServiceContent = fs.readFileSync(emailServicePath, 'utf8');
  
  if (emailServiceContent.includes('module.exports')) {
    console.log('✅ Serviço está sendo exportado');
  } else {
    console.log('❌ Serviço não está sendo exportado');
  }
}

console.log('\n📋 RESUMO DO DIAGNÓSTICO');
console.log('==========================');
console.log('✅ Verificações concluídas');
console.log('\n🔧 PRÓXIMOS PASSOS:');
console.log('1. Execute o script de teste de email: node scripts/teste-email.js');
console.log('2. Verifique as variáveis de ambiente em produção');
console.log('3. Teste o cadastro de um novo usuário');
console.log('4. Monitore os logs do servidor para erros de email');
console.log('5. Verifique se o email está sendo enviado para spam'); 