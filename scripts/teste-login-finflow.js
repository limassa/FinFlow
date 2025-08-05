const { Pool } = require('pg');
const bcrypt = require('../backend/node_modules/bcrypt');

// Configuração do banco FinFlow (Railway)
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP'}@${process.env.DB_HOST || 'interchange.proxy.rlwy.net'}:${process.env.DB_PORT || '50880'}/${process.env.DB_NAME || 'railway'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testarConexao() {
  try {
    console.log('🔍 Testando conexão com o banco FinFlow...');
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
    console.log('🔍 Listando usuários FinFlow...');
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

async function testarLoginUsuario(email, senha) {
  try {
    console.log(`🔍 Testando login do usuário: ${email}`);
    
    // Buscar usuário
    const result = await pool.query(`
      SELECT Usuario_ID, Usuario_Email, Usuario_Nome, Usuario_Senha, Usuario_Ativo 
      FROM Usuario 
      WHERE Usuario_Email = $1
    `, [email]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Usuário ${email} não encontrado`);
      return false;
    }
    
    const user = result.rows[0];
    console.log('✅ Usuário encontrado:', {
      id: user.usuario_id,
      email: user.usuario_email,
      nome: user.usuario_nome,
      ativo: user.usuario_ativo
    });
    
    // Testar senha
    let senhaValida = false;
    
    if (user.usuario_senha.startsWith('$2b$') || user.usuario_senha.startsWith('$2a$')) {
      // Senha criptografada
      senhaValida = await bcrypt.compare(senha, user.usuario_senha);
      console.log('🔐 Senha está criptografada');
    } else {
      // Senha não criptografada
      senhaValida = (senha === user.usuario_senha);
      console.log('🔓 Senha não está criptografada');
    }
    
    if (senhaValida) {
      console.log('✅ Senha está correta!');
      return true;
    } else {
      console.log('❌ Senha está incorreta');
      return false;
    }
    
  } catch (err) {
    console.error('❌ Erro ao testar login:', err.message);
    return false;
  }
}

async function testarAPI() {
  try {
    console.log('🔍 Testando API do FinFlow...');
    
    const axios = require('axios');
    const API_URL = 'https://finflow-production-e4b3.up.railway.app';
    
    // Teste de healthcheck
    console.log('📡 Testando healthcheck...');
    const healthResponse = await axios.get(`${API_URL}/`);
    console.log('✅ Healthcheck OK:', healthResponse.data);
    
    // Teste de login via API
    console.log('📡 Testando login via API...');
    const loginData = {
      email: 'teste@teste.com',
      senha: '123456'
    };
    
    const loginResponse = await axios.post(`${API_URL}/api/login`, loginData);
    console.log('✅ Login via API OK:', loginResponse.data);
    console.log('📊 Estrutura da resposta:', {
      success: loginResponse.data.success,
      hasUser: !!loginResponse.data.user,
      hasToken: !!loginResponse.data.token
    });
    
  } catch (err) {
    console.error('❌ Erro ao testar API:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
}

async function executarTestes() {
  console.log('🚀 Iniciando testes do FinFlow...\n');
  
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
    console.log('❌ Tabela Usuario não existe.');
    process.exit(1);
  }
  
  console.log('');
  
  // Teste 3: Listar usuários
  const usuarios = await listarUsuarios();
  
  console.log('');
  
  // Teste 4: Testar login com usuário existente
  if (usuarios.length > 0) {
    const primeiroUsuario = usuarios[0];
    await testarLoginUsuario(primeiroUsuario.usuario_email, '123456');
  }
  
  console.log('');
  
  // Teste 5: Testar API
  await testarAPI();
  
  console.log('');
  console.log('📋 RESUMO DOS TESTES:');
  console.log('✅ Conexão com banco: OK');
  console.log('✅ Tabela Usuario: OK');
  console.log('✅ Usuários encontrados:', usuarios.length);
  console.log('');
  
  await pool.end();
}

// Executar testes
executarTestes().catch(console.error); 