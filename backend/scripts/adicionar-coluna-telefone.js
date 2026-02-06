// Script para garantir que a coluna de telefone existe na tabela Usuario
// Execute na pasta backend: node scripts/adicionar-coluna-telefone.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });
const pool = require('../src/database/connection');

async function adicionarColunaTelefone() {
  try {
    console.log('🔧 Verificando coluna de telefone na tabela Usuario...');

    // Verificar se a coluna já existe (PostgreSQL pode retornar em minúsculas)
    const check = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (table_name = 'Usuario' OR table_name = 'usuario')
        AND (column_name = 'Usuario_Telefone' OR column_name = 'usuario_telefone')
    `);

    if (check.rows.length > 0) {
      console.log('✅ Coluna de telefone já existe!');
      return;
    }

    console.log('📝 Adicionando coluna Usuario_Telefone...');
    await pool.query(`
      ALTER TABLE "Usuario"
      ADD COLUMN "Usuario_Telefone" VARCHAR(20) NULL
    `);
    console.log('✅ Coluna Usuario_Telefone adicionada com sucesso!');
  } catch (err) {
    try {
      await pool.query(`
        ALTER TABLE usuario
        ADD COLUMN usuario_telefone VARCHAR(20) NULL
      `);
      console.log('✅ Coluna usuario_telefone adicionada (tabela minúscula)!');
    } catch (err2) {
      console.error('❌ Erro:', err2.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

adicionarColunaTelefone();
