const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function adicionarColunas() {
  console.log('🔧 Adicionando colunas de lembretes...\n');
  
  const colunas = [
    { nome: 'usuario_lembretesativos', tipo: 'BOOLEAN DEFAULT TRUE' },
    { nome: 'usuario_lembretesemail', tipo: 'BOOLEAN DEFAULT FALSE' },
    { nome: 'usuario_lembreteswhatsapp', tipo: 'BOOLEAN DEFAULT FALSE' },
    { nome: 'usuario_lembreteshorario', tipo: 'TIME DEFAULT \'08:00\'' },
    { nome: 'usuario_lembretesdiasantes', tipo: 'INTEGER DEFAULT 5' },
  ];
  
  try {
    for (const col of colunas) {
      try {
        await pool.query(`ALTER TABLE usuario ADD COLUMN IF NOT EXISTS ${col.nome} ${col.tipo}`);
        console.log(`✅ Coluna ${col.nome} adicionada/verificada`);
      } catch (e) {
        if (e.code === '42701') {
          console.log(`   Coluna ${col.nome} já existe`);
        } else {
          console.log(`   Erro em ${col.nome}:`, e.message);
        }
      }
    }
    
    // Atualizar usuário de teste para ter lembretes ativos
    await pool.query(`
      UPDATE usuario 
      SET usuario_lembretesativos = TRUE,
          usuario_lembretesemail = FALSE,
          usuario_lembreteswhatsapp = FALSE
      WHERE usuario_email = 'teste@teste.com'
    `);
    console.log('\n✅ Usuário de teste atualizado');
    
    // Listar estrutura da tabela usuario
    console.log('\n📋 Colunas da tabela usuario:');
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuario'
      ORDER BY ordinal_position
    `);
    result.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n✅ Colunas adicionadas com sucesso!');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

adicionarColunas();
