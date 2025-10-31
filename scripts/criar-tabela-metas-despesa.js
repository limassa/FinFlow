const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './backend/config.env' });

async function criarTabelaMetasDespesa() {
  let pool;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    
    // Verificar qual ambiente usar
    const branchName = require('child_process').execSync('git branch --show-current').toString().trim();
    
    if (branchName === 'production' || branchName === 'homologacao') {
      console.log('🚀 Usando configuração do Railway...');
      pool = new Pool({
        host: 'interchange.proxy.rlwy.net',
        port: '50880',
        database: 'railway',
        user: 'postgres',
        password: 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP',
      });
    } else {
      console.log('🏠 Usando configuração local...');
      pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
    }

    // Ler script SQL
    const sqlPath = path.join(__dirname, 'ScriptSQL_MetasDespesa.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executando script SQL...');
    
    // Executar script
    await pool.query(sqlScript);

    console.log('✅ Tabela de metas de despesa criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'meta_despesa'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verificação: Tabela meta_despesa existe no banco');
    } else {
      console.log('⚠️  Aviso: Tabela meta_despesa não encontrada');
    }

    // Mostrar estrutura da tabela
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'meta_despesa'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Estrutura da tabela meta_despesa:');
    console.log('────────────────────────────────────────────────────────────────');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(20)} | ${col.data_type.padEnd(20)} | ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('────────────────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message);
    if (error.code === '42P07') {
      console.log('ℹ️  A tabela meta_despesa já existe no banco');
    } else {
      throw error;
    }
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  criarTabelaMetasDespesa()
    .then(() => {
      console.log('✅ Processo concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { criarTabelaMetasDespesa };

