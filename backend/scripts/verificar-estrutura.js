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

async function check() {
  console.log('=== Colunas da tabela DESPESA ===');
  const d = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'despesa' 
    ORDER BY ordinal_position
  `);
  d.rows.forEach(r => console.log('  -', r.column_name, ':', r.data_type));
  
  console.log('\n=== Colunas da tabela RECEITA ===');
  const r2 = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'receita' 
    ORDER BY ordinal_position
  `);
  r2.rows.forEach(r => console.log('  -', r.column_name, ':', r.data_type));

  console.log('\n=== TODOS os registros de DESPESA (incluindo inativos) ===');
  const allD = await pool.query('SELECT despesa_id, despesa_descricao, despesa_valor, despesa_ativo FROM despesa');
  console.log('Total:', allD.rows.length);
  allD.rows.forEach(r => console.log('  -', r.despesa_id, '|', r.despesa_descricao, '| Valor:', r.despesa_valor, '| Ativo:', r.despesa_ativo));

  console.log('\n=== TODOS os registros de RECEITA (incluindo inativos) ===');
  const allR = await pool.query('SELECT receita_id, receita_descricao, receita_valor, receita_ativo FROM receita');
  console.log('Total:', allR.rows.length);
  allR.rows.forEach(r => console.log('  -', r.receita_id, '|', r.receita_descricao, '| Valor:', r.receita_valor, '| Ativo:', r.receita_ativo));
  
  pool.end();
}

check().catch(e => { console.error(e.message); pool.end(); });
