// Script para verificar qual banco está sendo usado e estado das tabelas
const pool = require('../src/database/connection');

async function verificarBanco() {
  console.log('🔍 Verificando banco de dados e tabelas...\n');
  
  try {
    // Informações do banco
    const dbInfo = await pool.query('SELECT current_database() as db_name, current_user as db_user, version() as db_version');
    console.log('📋 INFORMAÇÕES DO BANCO:');
    console.log(`   Nome: ${dbInfo.rows[0].db_name}`);
    console.log(`   Usuário: ${dbInfo.rows[0].db_user}`);
    console.log(`   Versão: ${dbInfo.rows[0].db_version.split(' ')[0]} ${dbInfo.rows[0].db_version.split(' ')[1]}\n`);
    
    // Listar TODAS as tabelas
    console.log('📋 TODAS AS TABELAS NO BANCO:');
    const todasTabelas = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`   Total de tabelas: ${todasTabelas.rows.length}\n`);
    
    // Separar tabelas do FinFlow das outras
    const tabelasFinFlow = [];
    const outrasTabelas = [];
    
    todasTabelas.rows.forEach(row => {
      const nome = row.table_name;
      if (['Usuario', 'Receita', 'Despesa', 'Conta'].includes(nome)) {
        tabelasFinFlow.push(row);
      } else {
        outrasTabelas.push(row);
      }
    });
    
    console.log('✅ TABELAS DO FINFLOW:');
    if (tabelasFinFlow.length > 0) {
      tabelasFinFlow.forEach(t => {
        console.log(`   - ${t.table_name} (${t.colunas} colunas)`);
      });
    } else {
      console.log('   ⚠️  Nenhuma tabela do FinFlow encontrada');
    }
    
    console.log(`\n📋 OUTRAS TABELAS (${outrasTabelas.length}):`);
    if (outrasTabelas.length > 0) {
      outrasTabelas.slice(0, 10).forEach(t => {
        console.log(`   - ${t.table_name}`);
      });
      if (outrasTabelas.length > 10) {
        console.log(`   ... e mais ${outrasTabelas.length - 10} tabelas`);
      }
    }
    
    // Verificar dados nas tabelas do FinFlow
    console.log('\n📊 DADOS NAS TABELAS DO FINFLOW:');
    
    const tabelas = ['Usuario', 'Receita', 'Despesa', 'Conta'];
    for (const tabela of tabelas) {
      try {
        const count = await pool.query(`SELECT COUNT(*) as total FROM "${tabela}"`);
        const total = parseInt(count.rows[0].total);
        console.log(`   ${tabela}: ${total} registro(s)`);
        
        if (total > 0 && total <= 5) {
          const dados = await pool.query(`SELECT * FROM "${tabela}" LIMIT 5`);
          dados.rows.forEach((row, i) => {
            if (tabela === 'Usuario') {
              console.log(`      ${i + 1}. ID: ${row.Usuario_Id}, Nome: ${row.Usuario_Nome}, Email: ${row.Usuario_Email}`);
            } else if (tabela === 'Receita') {
              console.log(`      ${i + 1}. ID: ${row.Receita_Id}, Descrição: ${row.Receita_Descricao}, Valor: R$ ${row.Receita_Valor}`);
            } else if (tabela === 'Despesa') {
              console.log(`      ${i + 1}. ID: ${row.Despesa_Id}, Descrição: ${row.Despesa_Descricao}, Valor: R$ ${row.Despesa_Valor}`);
            } else if (tabela === 'Conta') {
              console.log(`      ${i + 1}. ID: ${row.Conta_Id}, Nome: ${row.Conta_Nome}, Saldo: R$ ${row.Conta_Saldo}`);
            }
          });
        }
      } catch (err) {
        console.log(`   ${tabela}: ❌ Erro - ${err.message.split('\n')[0]}`);
      }
    }
    
    // Verificar se há limpeza necessária
    console.log('\n🧹 VERIFICAÇÃO DE LIMPEZA:');
    const tabelasEvolution = outrasTabelas.filter(t => 
      ['Instance', 'Message', 'Chat', 'Contact', 'Session'].includes(t.table_name)
    );
    
    if (tabelasEvolution.length > 0) {
      console.log(`   ⚠️  Encontradas ${tabelasEvolution.length} tabelas da Evolution API no mesmo banco`);
      console.log('   💡 As tabelas da Evolution API não afetam o FinFlow');
      console.log('   💡 Se quiser limpar, pode deletar apenas as tabelas do FinFlow');
    } else {
      console.log('   ✅ Banco contém apenas tabelas do FinFlow');
    }
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

verificarBanco().catch(console.error);

