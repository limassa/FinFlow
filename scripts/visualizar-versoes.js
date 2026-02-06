const { Pool } = require('pg');
require('dotenv').config({ path: './backend/config.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function visualizarVersoes() {
  try {
    console.log('📋 Histórico de Versões');
    console.log('========================');
    
    // Buscar todas as versões ordenadas por data
    const result = await pool.query(`
      SELECT 
        versao_id,
        versao_numero,
        versao_nome,
        versao_data,
        versao_descricao,
        versao_status,
        versao_ambiente,
        created_at
      FROM versao_sistema 
      ORDER BY created_at DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Nenhuma versão encontrada');
      return;
    }
    
    console.log(`\n📊 Total de versões: ${result.rows.length}\n`);
    
    // Agrupar por ambiente
    const versoesPorAmbiente = {};
    result.rows.forEach(versao => {
      const ambiente = versao.versao_ambiente;
      if (!versoesPorAmbiente[ambiente]) {
        versoesPorAmbiente[ambiente] = [];
      }
      versoesPorAmbiente[ambiente].push(versao);
    });
    
    // Exibir por ambiente
    Object.keys(versoesPorAmbiente).forEach(ambiente => {
      console.log(`\n🌍 AMBIENTE: ${ambiente}`);
      console.log('='.repeat(50));
      
      versoesPorAmbiente[ambiente].forEach(versao => {
        const status = versao.versao_status === 'ATIVA' ? '✅' : '⏸️';
        console.log(`${status} ${versao.versao_numero} - ${versao.versao_nome}`);
        console.log(`   Data: ${versao.versao_data}`);
        console.log(`   Status: ${versao.versao_status}`);
        console.log(`   Descrição: ${versao.versao_descricao}`);
        console.log(`   Criado: ${new Date(versao.created_at).toLocaleString()}`);
        console.log('');
      });
    });
    
    // Estatísticas
    console.log('\n📈 Estatísticas:');
    console.log('================');
    
    Object.keys(versoesPorAmbiente).forEach(ambiente => {
      const total = versoesPorAmbiente[ambiente].length;
      const ativas = versoesPorAmbiente[ambiente].filter(v => v.versao_status === 'ATIVA').length;
      console.log(`${ambiente}: ${total} versões (${ativas} ativas)`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao visualizar versões:', error);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  visualizarVersoes();
}

module.exports = { visualizarVersoes }; 