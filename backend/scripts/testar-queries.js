// Script para testar queries e descobrir o formato correto das tabelas
const pool = require('../src/database/connection');

async function testarQueries() {
  console.log('🔍 Testando queries para descobrir formato correto das tabelas...\n');
  
  const testes = [
    {
      nome: 'Usuario com aspas',
      query: 'SELECT COUNT(*) FROM "Usuario"'
    },
    {
      nome: 'Usuario sem aspas',
      query: 'SELECT COUNT(*) FROM usuario'
    },
    {
      nome: 'Receita com aspas',
      query: 'SELECT COUNT(*) FROM "Receita"'
    },
    {
      nome: 'Receita sem aspas',
      query: 'SELECT COUNT(*) FROM receita'
    },
    {
      nome: 'Despesa com aspas',
      query: 'SELECT COUNT(*) FROM "Despesa"'
    },
    {
      nome: 'Despesa sem aspas',
      query: 'SELECT COUNT(*) FROM despesa'
    },
    {
      nome: 'Conta com aspas',
      query: 'SELECT COUNT(*) FROM "Conta"'
    },
    {
      nome: 'Conta sem aspas',
      query: 'SELECT COUNT(*) FROM conta'
    }
  ];

  for (const teste of testes) {
    try {
      const result = await pool.query(teste.query);
      console.log(`✅ ${teste.nome}: FUNCIONOU (${result.rows[0].count} registros)`);
    } catch (err) {
      console.log(`❌ ${teste.nome}: ${err.message.split('\n')[0]}`);
    }
  }

  console.log('\n📋 Listando todas as tabelas do banco:');
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
  } catch (err) {
    console.error('❌ Erro ao listar tabelas:', err.message);
  }

  await pool.end();
}

testarQueries().catch(console.error);

