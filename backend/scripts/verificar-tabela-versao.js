const pool = require('../src/database/connection');

async function verificarTabelaVersao() {
  try {
    console.log('🔍 Verificando tabela de versão...\n');
    
    // 1. Listar todas as tabelas que contêm "versao"
    console.log('📋 Buscando tabelas com "versao" no nome...');
    const tabelas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name ILIKE '%versao%'
      ORDER BY table_name
    `);
    
    if (tabelas.rows.length === 0) {
      console.log('   ❌ Nenhuma tabela encontrada com "versao" no nome\n');
      console.log('💡 SOLUÇÃO:');
      console.log('   Execute o script: node scripts/criar-tabela-versao.js\n');
      return;
    }
    
    console.log(`   ✅ Encontradas ${tabelas.rows.length} tabela(s):`);
    tabelas.rows.forEach(t => {
      console.log(`      - ${t.table_name}`);
    });
    console.log('');
    
    // 2. Tentar buscar dados de cada tabela encontrada
    for (const tabela of tabelas.rows) {
      const nomeTabela = tabela.table_name;
      console.log(`🔍 Testando tabela: ${nomeTabela}`);
      
      try {
        // Tentar com o nome exato (pode ter case-sensitive)
        const result = await pool.query(`
          SELECT 
            versao_numero,
            versao_nome,
            versao_data,
            versao_descricao,
            versao_status,
            versao_ambiente
          FROM "${nomeTabela}"
          WHERE versao_status = 'ATIVA'
          ORDER BY versao_id DESC 
          LIMIT 1
        `);
        
        if (result.rows.length > 0) {
          console.log(`   ✅ Tabela "${nomeTabela}" encontrada e funcionando!`);
          console.log(`   📋 Versão ativa:`, result.rows[0]);
          console.log(`\n💡 Use este nome na query: "${nomeTabela}"\n`);
          return nomeTabela;
        }
      } catch (err1) {
        try {
          // Tentar sem aspas (minúsculas)
          const result = await pool.query(`
            SELECT 
              versao_numero,
              versao_nome,
              versao_data,
              versao_descricao,
              versao_status,
              versao_ambiente
            FROM ${nomeTabela.toLowerCase()}
            WHERE versao_status = 'ATIVA'
            ORDER BY versao_id DESC 
            LIMIT 1
          `);
          
          if (result.rows.length > 0) {
            console.log(`   ✅ Tabela "${nomeTabela.toLowerCase()}" encontrada e funcionando!`);
            console.log(`   📋 Versão ativa:`, result.rows[0]);
            console.log(`\n💡 Use este nome na query: ${nomeTabela.toLowerCase()}\n`);
            return nomeTabela.toLowerCase();
          }
        } catch (err2) {
          console.log(`   ❌ Erro ao acessar "${nomeTabela}":`, err2.message);
        }
      }
    }
    
    console.log('\n⚠️ Nenhuma tabela de versão funcionando encontrada\n');
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error.message);
  } finally {
    await pool.end();
  }
}

verificarTabelaVersao();

