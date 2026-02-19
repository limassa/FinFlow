/**
 * Script para adicionar coluna conta_banco na tabela Conta
 * Execute: node backend/scripts/add-conta-banco-column.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });
const { Pool } = require('pg');

const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connString,
  ssl: connString && (connString.includes('railway') || connString.includes('neon') || process.env.NODE_ENV === 'production')
    ? { rejectUnauthorized: false }
    : false,
});

async function addColumn() {
  const client = await pool.connect();
  try {
    // Adicionar em ambas as tabelas (Conta e conta) - IF NOT EXISTS evita erro
    try {
      await client.query(`ALTER TABLE "Conta" ADD COLUMN IF NOT EXISTS "Conta_Banco" VARCHAR(50);`);
      console.log('✅ Coluna "Conta_Banco" adicionada na tabela "Conta"');
    } catch (e) {
      console.log('   Tabela "Conta" não encontrada:', e.message.split('\n')[0]);
    }
    try {
      await client.query(`ALTER TABLE conta ADD COLUMN IF NOT EXISTS conta_banco VARCHAR(50);`);
      console.log('✅ Coluna conta_banco adicionada na tabela conta');
    } catch (e) {
      console.log('   Tabela conta não encontrada:', e.message.split('\n')[0]);
    }

    console.log('\n✅ Migração concluída.');
  } finally {
    client.release();
    await pool.end();
  }
}

addColumn().catch((err) => {
  console.error('Erro:', err);
  process.exit(1);
});
