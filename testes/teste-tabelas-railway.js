const { Pool } = require('pg');

// Configurações do banco Railway
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testarTabelasRailway() {
  try {
    console.log('🔄 Conectando ao banco Railway...');
    
    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se as tabelas principais existem
    console.log('\n📋 Verificando tabelas principais...');
    
    const tabelasQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuario', 'receita', 'despesa', 'conta', 'versao_sistema')
      ORDER BY table_name
    `;
    
    const tabelasResult = await client.query(tabelasQuery);
    console.log('Tabelas encontradas:', tabelasResult.rows.map(row => row.table_name));
    
    // Verificar estrutura da tabela despesa
    if (tabelasResult.rows.some(row => row.table_name === 'despesa')) {
      console.log('\n📊 Verificando estrutura da tabela despesa...');
      
      const despesaColumnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'despesa'
        ORDER BY ordinal_position
      `;
      
      const despesaColumnsResult = await client.query(despesaColumnsQuery);
      console.log('Colunas da tabela despesa:');
      despesaColumnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
      
      // Verificar se há dados na tabela despesa
      const countQuery = `SELECT COUNT(*) as total FROM despesa`;
      const countResult = await client.query(countQuery);
      console.log(`\n📈 Total de despesas: ${countResult.rows[0].total}`);
      
    } else {
      console.log('❌ Tabela despesa não encontrada!');
    }
    
    // Verificar estrutura da tabela usuario
    if (tabelasResult.rows.some(row => row.table_name === 'usuario')) {
      console.log('\n👤 Verificando estrutura da tabela usuario...');
      
      const usuarioColumnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'usuario'
        ORDER BY ordinal_position
      `;
      
      const usuarioColumnsResult = await client.query(usuarioColumnsQuery);
      console.log('Colunas da tabela usuario:');
      usuarioColumnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
      
      // Verificar se há usuários
      const userCountQuery = `SELECT COUNT(*) as total FROM usuario`;
      const userCountResult = await client.query(userCountQuery);
      console.log(`\n👥 Total de usuários: ${userCountResult.rows[0].total}`);
      
    } else {
      console.log('❌ Tabela usuario não encontrada!');
    }
    
    client.release();
    console.log('\n🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
  } finally {
    await pool.end();
  }
}

testarTabelasRailway(); 