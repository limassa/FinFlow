// Carregar variáveis de ambiente
require('dotenv').config({ path: './backend/config.env' });
require('dotenv').config();

console.log('🔍 Verificando configuração do banco...');
console.log('📋 Variáveis de ambiente:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  NODE_ENV:', process.env.NODE_ENV);

// Verificar se está usando banco local ou Railway
if (process.env.DB_NAME === 'FinFlowTeste') {
  console.log('✅ Configurado para banco LOCAL (FinFlowTeste)');
} else if (process.env.DB_NAME === 'railway') {
  console.log('⚠️  Configurado para banco RAILWAY');
} else {
  console.log('❓ Banco não identificado:', process.env.DB_NAME);
} 