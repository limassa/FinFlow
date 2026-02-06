const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🗄️ Configurador de Banco Local - FinFlow\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function configurarBancoLocal() {
  try {
    console.log('🎯 Vamos configurar o banco de dados local!\n');
    
    console.log('📋 Opções de banco:');
    console.log('1. PostgreSQL (Recomendado)');
    console.log('2. MySQL');
    console.log('3. SQLite (Para testes simples)');
    console.log('4. Manter configuração atual (Railway)');
    
    const opcao = await question('Escolha sua opção (1-4): ');
    
    switch (opcao) {
      case '1':
        await configurarPostgreSQL();
        break;
      case '2':
        await configurarMySQL();
        break;
      case '3':
        await configurarSQLite();
        break;
      case '4':
        console.log('✅ Mantendo configuração atual (Railway)');
        break;
      default:
        console.log('❌ Opção inválida');
        break;
    }
    
  } catch (error) {
    console.error('❌ Erro durante configuração:', error.message);
  } finally {
    rl.close();
  }
}

async function configurarPostgreSQL() {
  console.log('\n🐘 Configurando PostgreSQL...');
  
  const host = await question('Host (localhost): ') || 'localhost';
  const port = await question('Porta (5432): ') || '5432';
  const database = await question('Nome do banco (finflow_local): ') || 'finflow_local';
  const user = await question('Usuário (postgres): ') || 'postgres';
  const password = await question('Senha: ');
  
  const config = {
    DB_HOST: host,
    DB_PORT: port,
    DB_NAME: database,
    DB_USER: user,
    DB_PASSWORD: password,
    DATABASE_URL: `postgresql://${user}:${password}@${host}:${port}/${database}`
  };
  
  await salvarConfiguracao(config);
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Instale o PostgreSQL se ainda não tiver');
  console.log('2. Crie o banco de dados:', database);
  console.log('3. Execute: node corrigir-todas-tabelas.js');
  console.log('4. Teste a conexão');
}

async function configurarMySQL() {
  console.log('\n🐬 Configurando MySQL...');
  
  const host = await question('Host (localhost): ') || 'localhost';
  const port = await question('Porta (3306): ') || '3306';
  const database = await question('Nome do banco (finflow_local): ') || 'finflow_local';
  const user = await question('Usuário (root): ') || 'root';
  const password = await question('Senha: ');
  
  const config = {
    DB_HOST: host,
    DB_PORT: port,
    DB_NAME: database,
    DB_USER: user,
    DB_PASSWORD: password,
    DATABASE_URL: `mysql://${user}:${password}@${host}:${port}/${database}`
  };
  
  await salvarConfiguracao(config);
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Instale o MySQL se ainda não tiver');
  console.log('2. Crie o banco de dados:', database);
  console.log('3. Execute: node corrigir-todas-tabelas.js');
  console.log('4. Teste a conexão');
}

async function configurarSQLite() {
  console.log('\n📁 Configurando SQLite...');
  
  const database = await question('Nome do arquivo (finflow.db): ') || 'finflow.db';
  
  const config = {
    DB_TYPE: 'sqlite',
    DB_FILE: database,
    DATABASE_URL: `sqlite:./${database}`
  };
  
  await salvarConfiguracao(config);
  
  console.log('\n📋 Próximos passos:');
  console.log('1. SQLite será criado automaticamente');
  console.log('2. Execute: node corrigir-todas-tabelas.js');
  console.log('3. Teste a conexão');
}

async function salvarConfiguracao(config) {
  const configPath = path.join(__dirname, 'backend', 'config.env');
  
  try {
    let configContent = '';
    
    // Ler arquivo existente se existir
    if (fs.existsSync(configPath)) {
      configContent = fs.readFileSync(configPath, 'utf8');
    }
    
    // Remover configurações antigas de banco
    configContent = configContent.replace(/# Configurações do Banco.*?(?=\n#|\n$)/gs, '');
    
    // Adicionar novas configurações
    configContent += '\n# Configurações do Banco de Dados Local\n';
    Object.entries(config).forEach(([key, value]) => {
      configContent += `${key}=${value}\n`;
    });
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Configuração salva em backend/config.env');
    
  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error.message);
  }
}

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Executar configurador
configurarBancoLocal().catch(console.error); 