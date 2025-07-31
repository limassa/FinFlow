// Script para testar conexão com banco do Railway
require('dotenv').config();

const { Pool } = require('pg');

console.log('🔍 Testando conexão com banco do Railway...');

// URL do banco de dados do Railway
const DATABASE_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

async function testRailwayConnection() {
  try {
    console.log('🔄 Tentando conectar ao Railway...');
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Conexão bem-sucedida!');
    console.log('  Hora atual:', result.rows[0].current_time);
    console.log('  Versão do PostgreSQL:', result.rows[0].db_version.split(' ')[0]);
    
    // Testar se a tabela Usuario existe
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuario'
      );
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('✅ Tabela Usuario encontrada');
      
      // Contar usuários
      const userCount = await pool.query('SELECT COUNT(*) as count FROM Usuario');
      console.log('  Número de usuários:', userCount.rows[0].count);
      
      // Listar alguns usuários (sem senhas)
      const users = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario LIMIT 5');
      console.log('  Usuários encontrados:');
      users.rows.forEach(user => {
        console.log(`    - ${user.usuario_nome} (${user.usuario_email})`);
      });
    } else {
      console.log('❌ Tabela Usuario não encontrada');
      console.log('  Criando tabela...');
      
      // Criar tabela se não existir
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS Usuario (
          Usuario_Id SERIAL PRIMARY KEY,
          Usuario_Email VARCHAR(255) UNIQUE NOT NULL,
          Usuario_Senha VARCHAR(255) NOT NULL,
          Usuario_Nome VARCHAR(255) NOT NULL,
          Usuario_Telefone VARCHAR(20),
          Usuario_Ativo BOOLEAN DEFAULT TRUE,
          Usuario_Data_Criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await pool.query(createTableSQL);
      console.log('✅ Tabela Usuario criada com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('  Código:', error.code);
    console.error('  Detalhes:', error.detail);
  } finally {
    await pool.end();
  }
}

testRailwayConnection(); 