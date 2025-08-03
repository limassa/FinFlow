const { Pool } = require('pg');

// Configurações do banco Railway
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testarEstruturaRailway() {
  try {
    console.log('🔄 Conectando ao banco Railway...');
    
    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se a tabela despesa existe
    console.log('\n📋 Verificando tabela despesa...');
    
    const tabelaQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'despesa'
    `;
    
    const tabelaResult = await client.query(tabelaQuery);
    
    if (tabelaResult.rows.length === 0) {
      console.log('❌ Tabela despesa não encontrada!');
      return;
    }
    
    console.log('✅ Tabela despesa encontrada!');
    
    // Verificar estrutura da tabela despesa
    console.log('\n📊 Verificando estrutura da tabela despesa...');
    
    const colunasQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'despesa'
      ORDER BY ordinal_position
    `;
    
    const colunasResult = await client.query(colunasQuery);
    console.log('Colunas da tabela despesa:');
    colunasResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    // Verificar se há dados na tabela
    const countQuery = `SELECT COUNT(*) as total FROM despesa`;
    const countResult = await client.query(countQuery);
    console.log(`\n📈 Total de despesas: ${countResult.rows[0].total}`);
    
    // Verificar se há usuários
    const userCountQuery = `SELECT COUNT(*) as total FROM usuario`;
    const userCountResult = await client.query(userCountQuery);
    console.log(`👥 Total de usuários: ${userCountResult.rows[0].total}`);
    
    // Verificar se há contas
    const contaCountQuery = `SELECT COUNT(*) as total FROM conta`;
    const contaCountResult = await client.query(contaCountQuery);
    console.log(`💳 Total de contas: ${contaCountResult.rows[0].total}`);
    
    client.release();
    console.log('\n🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error.message);
  } finally {
    await pool.end();
  }
}

testarEstruturaRailway(); 