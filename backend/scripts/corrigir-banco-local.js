/**
 * Script para corrigir estrutura do banco local e criar usuário de teste
 * Execute: node scripts/corrigir-banco-local.js
 */

const path = require('path');
const configPath = path.join(__dirname, '..', 'config.env');
console.log('📄 Carregando configurações de:', configPath);
require('dotenv').config({ path: configPath });

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

console.log('🏠 Conectando ao banco LOCAL:');
console.log('   Host:', process.env.DB_HOST || 'localhost');
console.log('   Porta:', process.env.DB_PORT || 5433);
console.log('   Database:', process.env.DB_NAME || 'FinFlowTeste');

async function corrigirBanco() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔧 Corrigindo estrutura do banco de dados...\n');

    // Adicionar coluna usuario_lembretesativos se não existir
    console.log('📋 Verificando coluna usuario_lembretesativos...');
    try {
      await client.query(`
        ALTER TABLE usuario 
        ADD COLUMN IF NOT EXISTS usuario_lembretesativos BOOLEAN DEFAULT TRUE
      `);
      console.log('✅ Coluna usuario_lembretesativos adicionada/verificada!\n');
    } catch (e) {
      if (e.code === '42701') {
        console.log('   Coluna já existe\n');
      } else {
        console.log('   Erro:', e.message, '\n');
      }
    }

    // Verificar se o usuário de teste existe
    console.log('👤 Verificando usuário de teste...');
    const userCheck = await client.query(
      "SELECT usuario_id, usuario_email FROM usuario WHERE usuario_email = 'teste@teste.com'"
    );

    if (userCheck.rows.length > 0) {
      console.log('   Usuário de teste já existe (ID:', userCheck.rows[0].usuario_id, ')\n');
      
      // Atualizar senha do usuário existente (hash bcrypt para "123456")
      console.log('🔑 Atualizando senha do usuário de teste...');
      const senhaHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
      await client.query(
        'UPDATE usuario SET usuario_senha = $1 WHERE usuario_email = $2',
        [senhaHash, 'teste@teste.com']
      );
      console.log('✅ Senha atualizada! (nova senha: 123456)\n');
    } else {
      // Criar usuário de teste
      console.log('   Criando usuário de teste...');
      const senhaHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
      
      const result = await client.query(`
        INSERT INTO usuario (usuario_email, usuario_senha, usuario_nome, usuario_telefone, usuario_lembretesativos)
        VALUES ('teste@teste.com', $1, 'Usuário Teste', '11999999999', true)
        RETURNING usuario_id
      `, [senhaHash]);
      
      const userId = result.rows[0].usuario_id;
      console.log('✅ Usuário de teste criado (ID:', userId, ')\n');

      // Criar conta padrão para o usuário
      console.log('🏦 Criando conta padrão...');
      await client.query(`
        INSERT INTO conta (usuario_id, conta_nome, conta_tipo, conta_saldo, conta_banco)
        VALUES ($1, 'Conta Principal', 'Conta Corrente', 0, 'Nubank')
      `, [userId]);
      console.log('✅ Conta padrão criada!\n');
    }

    // Listar usuários existentes
    console.log('📋 Usuários no banco:');
    const users = await client.query('SELECT usuario_id, usuario_email, usuario_nome FROM usuario');
    users.rows.forEach(u => {
      console.log(`   - ID: ${u.usuario_id}, Email: ${u.usuario_email}, Nome: ${u.usuario_nome}`);
    });

    console.log('\n✅ Banco de dados corrigido com sucesso!');
    console.log('\n📧 Login de teste:');
    console.log('   Email: teste@teste.com');
    console.log('   Senha: 123456');

  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

corrigirBanco();
