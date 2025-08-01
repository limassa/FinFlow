const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuração do banco (mesma do connection.js)
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP'}@${process.env.DB_HOST || 'interchange.proxy.rlwy.net'}:${process.env.DB_PORT || '50880'}/${process.env.DB_NAME || 'railway'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testarConexao() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexão OK:', result.rows[0].current_time);
    return true;
  } catch (err) {
    console.error('❌ Erro na conexão:', err.message);
    return false;
  }
}

async function verificarTabelaUsuario() {
  try {
    console.log('🔍 Verificando tabela Usuario...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'usuario'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Tabela Usuario existe');
      return true;
    } else {
      console.log('❌ Tabela Usuario não encontrada');
      return false;
    }
  } catch (err) {
    console.error('❌ Erro ao verificar tabela:', err.message);
    return false;
  }
}

async function listarUsuarios() {
  try {
    console.log('🔍 Listando usuários...');
    const result = await pool.query('SELECT Usuario_ID, Usuario_Email, Usuario_Nome, Usuario_Ativo FROM Usuario');
    console.log('📊 Usuários encontrados:', result.rows.length);
    
    result.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.usuario_id}, Email: ${user.usuario_email}, Nome: ${user.usuario_nome}, Ativo: ${user.usuario_ativo}`);
    });
    
    return result.rows;
  } catch (err) {
    console.error('❌ Erro ao listar usuários:', err.message);
    return [];
  }
}

async function testarLoginAdmin() {
  try {
    console.log('🔍 Testando login do admin...');
    
    // Buscar usuário admin
    const result = await pool.query(`
      SELECT Usuario_ID, Usuario_Email, Usuario_Nome, Usuario_Senha, Usuario_Ativo 
      FROM Usuario 
      WHERE Usuario_Email = 'admin@pdv.com'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário admin@pdv.com não encontrado');
      return false;
    }
    
    const user = result.rows[0];
    console.log('✅ Usuário admin encontrado:', {
      id: user.usuario_id,
      email: user.usuario_email,
      nome: user.usuario_nome,
      ativo: user.usuario_ativo
    });
    
    // Testar senha
    const senhaTeste = 'admin123';
    let senhaValida = false;
    
    if (user.usuario_senha.startsWith('$2b$') || user.usuario_senha.startsWith('$2a$')) {
      // Senha criptografada
      senhaValida = await bcrypt.compare(senhaTeste, user.usuario_senha);
      console.log('🔐 Senha está criptografada');
    } else {
      // Senha não criptografada
      senhaValida = (senhaTeste === user.usuario_senha);
      console.log('🔓 Senha não está criptografada');
    }
    
    if (senhaValida) {
      console.log('✅ Senha do admin está correta!');
      return true;
    } else {
      console.log('❌ Senha do admin está incorreta');
      return false;
    }
    
  } catch (err) {
    console.error('❌ Erro ao testar login:', err.message);
    return false;
  }
}

async function criarUsuarioAdmin() {
  try {
    console.log('🔍 Criando usuário admin...');
    
    // Verificar se já existe
    const checkResult = await pool.query('SELECT Usuario_ID FROM Usuario WHERE Usuario_Email = $1', ['admin@pdv.com']);
    
    if (checkResult.rows.length > 0) {
      console.log('⚠️ Usuário admin já existe');
      return false;
    }
    
    // Criar senha criptografada
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash('admin123', saltRounds);
    
    // Inserir usuário admin
    const result = await pool.query(`
      INSERT INTO Usuario (Usuario_Nome, Usuario_Email, Usuario_Senha, Usuario_Tipo, Usuario_Ativo) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING Usuario_ID, Usuario_Email, Usuario_Nome
    `, ['Administrador', 'admin@pdv.com', senhaCriptografada, 'admin', true]);
    
    console.log('✅ Usuário admin criado com sucesso:', result.rows[0]);
    return true;
    
  } catch (err) {
    console.error('❌ Erro ao criar usuário admin:', err.message);
    return false;
  }
}

async function executarTestes() {
  console.log('🚀 Iniciando testes do sistema PDV...\n');
  
  // Teste 1: Conexão com banco
  const conexaoOk = await testarConexao();
  if (!conexaoOk) {
    console.log('❌ Falha na conexão. Abortando testes.');
    process.exit(1);
  }
  
  console.log('');
  
  // Teste 2: Verificar tabela Usuario
  const tabelaOk = await verificarTabelaUsuario();
  if (!tabelaOk) {
    console.log('❌ Tabela Usuario não existe. Execute o script SQL primeiro.');
    process.exit(1);
  }
  
  console.log('');
  
  // Teste 3: Listar usuários
  await listarUsuarios();
  
  console.log('');
  
  // Teste 4: Testar login admin
  const loginOk = await testarLoginAdmin();
  
  if (!loginOk) {
    console.log('');
    console.log('🔧 Tentando criar usuário admin...');
    await criarUsuarioAdmin();
  }
  
  console.log('');
  console.log('📋 RESUMO DOS TESTES:');
  console.log('✅ Conexão com banco: OK');
  console.log('✅ Tabela Usuario: OK');
  console.log(loginOk ? '✅ Login admin: OK' : '❌ Login admin: FALHOU');
  console.log('');
  console.log('🔑 CREDENCIAIS DE TESTE:');
  console.log('   Email: admin@pdv.com');
  console.log('   Senha: admin123');
  console.log('');
  
  await pool.end();
}

// Executar testes
executarTestes().catch(console.error); 