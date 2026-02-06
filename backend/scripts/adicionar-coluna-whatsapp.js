// Script para adicionar coluna de lembretes WhatsApp na tabela Usuario
// Execute: node backend/scripts/adicionar-coluna-whatsapp.js
// Para produção: node backend/scripts/adicionar-coluna-whatsapp.js --production
// OU: CONFIG_FILE=config.production.env node backend/scripts/adicionar-coluna-whatsapp.js

// Verificar se deve usar configuração de produção
const useProduction = process.argv.includes('--production') || process.env.CONFIG_FILE;
const configFile = process.env.CONFIG_FILE || (useProduction ? './config.production.env' : './config.env');

console.log(`📁 Usando arquivo de configuração: ${configFile}`);

// Carregar variáveis de ambiente do arquivo especificado
require('dotenv').config({ path: configFile });

// Criar pool de conexão com as variáveis de ambiente carregadas
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

console.log(`🔌 Conectando ao banco:`);
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Porta: ${process.env.DB_PORT || 5432}`);
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log('');

async function adicionarColunaWhatsApp() {
  try {
    console.log('🔧 Verificando se a coluna Usuario_LembretesWhatsApp existe...');
    
    // Verificar se a coluna já existe (tentar com maiúsculas primeiro)
    let checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Usuario' 
      AND column_name = 'Usuario_LembretesWhatsApp'
    `);
    
    if (checkColumn.rows.length === 0) {
      // Tentar com minúsculas
      checkColumn = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'usuario' 
        AND column_name = 'usuario_lembreteswhatsapp'
      `);
    }
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Coluna Usuario_LembretesWhatsApp já existe!');
      console.log(`   Nome da coluna encontrada: ${checkColumn.rows[0].column_name}`);
      return;
    }
    
    console.log('📝 Adicionando coluna Usuario_LembretesWhatsApp...');
    
    // Tentar adicionar com maiúsculas primeiro
    try {
      await pool.query(`
        ALTER TABLE "Usuario" 
        ADD COLUMN "Usuario_LembretesWhatsApp" BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Coluna Usuario_LembretesWhatsApp adicionada com sucesso (maiúsculas)!');
      
      // Adicionar comentário (opcional)
      try {
        await pool.query(`
          COMMENT ON COLUMN "Usuario"."Usuario_LembretesWhatsApp" IS 'Ativa/desativa lembretes por WhatsApp'
        `);
        console.log('✅ Comentário adicionado na coluna');
      } catch (err) {
        console.log('⚠️ Não foi possível adicionar comentário (pode ser ignorado)');
      }
    } catch (err) {
      // Se falhar, tentar sem aspas (minúsculas)
      console.log('⚠️ Tentativa com maiúsculas falhou, tentando minúsculas...');
      await pool.query(`
        ALTER TABLE usuario 
        ADD COLUMN usuario_lembreteswhatsapp BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Coluna usuario_lembreteswhatsapp adicionada com sucesso (minúsculas)!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
    console.error('Detalhes:', error);
    
    // Verificar se é erro de conexão
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('');
      console.error('💡 Dica: Verifique se as credenciais do banco estão corretas no arquivo de configuração.');
      console.error(`   Arquivo usado: ${configFile}`);
    }
    
    process.exit(1);
  } finally {
    await pool.end();
    console.log('');
    console.log('🔌 Conexão encerrada.');
  }
}

adicionarColunaWhatsApp();

