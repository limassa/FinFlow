const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configurações do banco de dados
const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'FinFlowTeste',
  user: 'postgres',
  password: 'admin'
});

async function criarTabelaVersao() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    
    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'ScriptSQL_Versao.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executando script SQL da tabela de versão...');
    
    // Executar o SQL
    await client.query(sqlContent);
    
    console.log('✅ Tabela de versão criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const result = await client.query(`
      SELECT 
        versao_numero,
        versao_nome,
        versao_data,
        versao_status,
        versao_ambiente
      FROM versao_sistema 
      WHERE versao_status = 'ATIVA'
      ORDER BY versao_id DESC 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      const versao = result.rows[0];
      console.log('\n📋 Versão atual do sistema:');
      console.log(`   Número: ${versao.versao_numero}`);
      console.log(`   Nome: ${versao.versao_nome}`);
      console.log(`   Data: ${versao.versao_data}`);
      console.log(`   Status: ${versao.versao_status}`);
      console.log(`   Ambiente: ${versao.versao_ambiente}`);
    }
    
    client.release();
    console.log('\n🎉 Tabela de versão configurada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela de versão:', error.message);
    
    if (error.code === '23505') {
      console.log('ℹ️  A versão já existe no banco de dados.');
    } else if (error.code === '42P07') {
      console.log('ℹ️  A tabela já existe no banco de dados.');
    }
  } finally {
    await pool.end();
  }
}

criarTabelaVersao(); 