// Teste com banco PostgreSQL local
const { Pool } = require('pg');

// Configuração para banco local (você precisará ter PostgreSQL instalado)
const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'finflow_test',
  user: 'postgres',
  password: 'postgres' // Altere para sua senha local
};

const pool = new Pool(LOCAL_DB_CONFIG);

async function setupLocalDatabase() {
  try {
    console.log('🔧 Configurando banco local...');
    
    // Criar tabela Usuario se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Usuario (
        Usuario_Id SERIAL PRIMARY KEY,
        Usuario_Nome VARCHAR(255) NOT NULL,
        Usuario_Email VARCHAR(255) UNIQUE NOT NULL,
        Usuario_Senha VARCHAR(255) NOT NULL,
        Usuario_Ativo BOOLEAN DEFAULT TRUE,
        Usuario_DataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela Usuario criada');
    
    // Criar usuário de teste
    const bcrypt = require('bcrypt');
    const senhaCriptografada = await bcrypt.hash('12345678', 10);
    
    await pool.query(`
      INSERT INTO Usuario (Usuario_Nome, Usuario_Email, Usuario_Senha) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (Usuario_Email) DO UPDATE SET 
        Usuario_Senha = EXCLUDED.Usuario_Senha
    `, ['Usuário Teste Local', 'teste@teste.com', senhaCriptografada]);
    
    console.log('✅ Usuário de teste criado');
    
    // Testar login
    const user = await pool.query(
      'SELECT Usuario_Id, Usuario_Email, Usuario_Nome, Usuario_Senha FROM Usuario WHERE Usuario_Email = $1',
      ['teste@teste.com']
    );
    
    if (user.rows.length > 0) {
      const senhaValida = await bcrypt.compare('12345678', user.rows[0].usuario_senha);
      console.log('✅ Login testado:', senhaValida);
    }
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco local:', error.message);
    console.log('💡 Certifique-se de que o PostgreSQL está instalado e rodando');
    console.log('💡 Crie um banco chamado "finflow_test"');
    console.log('💡 Ajuste as credenciais no script se necessário');
  } finally {
    await pool.end();
  }
}

setupLocalDatabase(); 