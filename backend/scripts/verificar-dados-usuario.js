// Script para verificar dados do usuário 1
const pool = require('../src/database/connection');

async function verificarDados() {
  console.log('🔍 Verificando dados do usuário 1...\n');
  
  try {
    // Verificar usuário
    console.log('📋 Verificando usuário...');
    const usuario = await pool.query('SELECT * FROM "Usuario" WHERE "Usuario_Id" = 1');
    if (usuario.rows.length > 0) {
      console.log(`✅ Usuário encontrado: ${usuario.rows[0].Usuario_Nome} (${usuario.rows[0].Usuario_Email})`);
    } else {
      console.log('❌ Usuário 1 não encontrado');
    }
    
    // Verificar receitas
    console.log('\n📋 Verificando receitas...');
    const receitas = await pool.query('SELECT * FROM "Receita" WHERE "Usuario_Id" = 1');
    console.log(`   Total de receitas: ${receitas.rows.length}`);
    if (receitas.rows.length > 0) {
      console.log('   Primeiras 3 receitas:');
      receitas.rows.slice(0, 3).forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.Receita_Descricao} - R$ ${r.Receita_Valor} - Ativo: ${r.Receita_Ativo}`);
      });
    }
    
    // Verificar despesas
    console.log('\n📋 Verificando despesas...');
    const despesas = await pool.query('SELECT * FROM "Despesa" WHERE "Usuario_Id" = 1');
    console.log(`   Total de despesas: ${despesas.rows.length}`);
    if (despesas.rows.length > 0) {
      console.log('   Primeiras 3 despesas:');
      despesas.rows.slice(0, 3).forEach((d, i) => {
        console.log(`   ${i + 1}. ${d.Despesa_Descricao} - R$ ${d.Despesa_Valor} - Ativo: ${d.Despesa_Ativo}`);
      });
    }
    
    // Verificar contas
    console.log('\n📋 Verificando contas...');
    const contas = await pool.query('SELECT * FROM "Conta" WHERE "Usuario_Id" = 1');
    console.log(`   Total de contas: ${contas.rows.length}`);
    if (contas.rows.length > 0) {
      console.log('   Contas:');
      contas.rows.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.Conta_Nome} - ${c.Conta_Tipo} - R$ ${c.Conta_Saldo} - Ativo: ${c.Conta_Ativo}`);
      });
    }
    
    // Verificar todas as receitas (sem filtro de usuário)
    console.log('\n📋 Verificando TODAS as receitas no banco...');
    const todasReceitas = await pool.query('SELECT COUNT(*) as total FROM "Receita"');
    console.log(`   Total geral: ${todasReceitas.rows[0].total}`);
    
    // Verificar todas as despesas (sem filtro de usuário)
    console.log('\n📋 Verificando TODAS as despesas no banco...');
    const todasDespesas = await pool.query('SELECT COUNT(*) as total FROM "Despesa"');
    console.log(`   Total geral: ${todasDespesas.rows[0].total}`);
    
    // Verificar se há dados em outras tabelas (minúsculas)
    console.log('\n📋 Verificando se há dados em tabelas minúsculas...');
    try {
      const receitasMin = await pool.query('SELECT COUNT(*) as total FROM receita');
      console.log(`   receita (minúscula): ${receitasMin.rows[0].total}`);
    } catch (err) {
      console.log('   receita (minúscula): não existe');
    }
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

verificarDados().catch(console.error);

