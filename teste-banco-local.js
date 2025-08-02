const { Pool } = require('pg');
require('dotenv').config({ path: './backend/config.env' });

console.log('🗄️ Teste de Conexão - Banco Local\n');

// Configuração do banco local
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'admin'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5433'}/${process.env.DB_NAME || 'finflow_teste'}`;

console.log('📋 Configurações:');
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Port:', process.env.DB_PORT || '5433');
console.log('  Database:', process.env.DB_NAME || 'finflow_teste');
console.log('  User:', process.env.DB_USER || 'postgres');
console.log('  Password:', process.env.DB_PASSWORD ? '***' : 'admin');
console.log('  URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@'));

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false // Desabilitar SSL para local
});

async function testarConexao() {
  try {
    console.log('\n🔌 Testando conexão...');
    
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida!');
    
    // Testar query simples
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Query executada com sucesso!');
    console.log('  Hora atual:', result.rows[0].current_time);
    console.log('  Versão PostgreSQL:', result.rows[0].version.split(' ')[0]);
    
    // Verificar se o banco existe
    const dbResult = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datname = '${process.env.DB_NAME || 'finflow_teste'}'
    `);
    
    if (dbResult.rows.length > 0) {
      console.log('✅ Banco de dados encontrado!');
    } else {
      console.log('⚠️  Banco de dados não encontrado');
      console.log('💡 Execute: CREATE DATABASE finflow_teste;');
    }
    
    client.release();
    
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('✅ Banco local configurado corretamente');
    
  } catch (error) {
    console.error('\n❌ Erro na conexão:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possíveis soluções:');
      console.log('1. Verifique se o PostgreSQL está rodando');
      console.log('2. Verifique se a porta 5433 está correta');
      console.log('3. Execute: pg_ctl start -D /path/to/data');
    } else if (error.code === '28P01') {
      console.log('\n💡 Erro de autenticação:');
      console.log('1. Verifique usuário e senha');
      console.log('2. Verifique se o usuário postgres existe');
    } else if (error.code === '3D000') {
      console.log('\n💡 Banco não encontrado:');
      console.log('1. Execute: CREATE DATABASE finflow_teste;');
      console.log('2. Verifique se o nome do banco está correto');
    }
    
  } finally {
    await pool.end();
  }
}

// Executar teste
testarConexao().catch(console.error); 