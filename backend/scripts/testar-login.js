const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

// Simular a função loginUser do userRepository
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function testarLogin(email, senha) {
  console.log('🔍 Testando login com:', { email, senha });
  
  let result;
  
  // Tentar com aspas duplas primeiro (case-sensitive) - como faz o userRepository
  console.log('\n1️⃣ Tentando query com aspas duplas ("Usuario")...');
  try {
    result = await pool.query(
      'SELECT "Usuario_Id", "Usuario_Email", "Usuario_Nome", "Usuario_Senha" FROM "Usuario" WHERE "Usuario_Email" = $1 AND "Usuario_Ativo" = TRUE',
      [email]
    );
    console.log('   ✅ Query funcionou! Linhas:', result.rows.length);
  } catch (err) {
    console.log('   ❌ Query falhou:', err.message);
    
    // Se falhar, tentar sem aspas (minúscula)
    console.log('\n2️⃣ Tentando query com minúsculas (usuario)...');
    try {
      result = await pool.query(
        'SELECT usuario_id, usuario_email, usuario_nome, usuario_senha FROM usuario WHERE usuario_email = $1 AND usuario_ativo = TRUE',
        [email]
      );
      console.log('   ✅ Query funcionou! Linhas:', result.rows.length);
    } catch (err2) {
      console.log('   ❌ Query também falhou:', err2.message);
      await pool.end();
      return null;
    }
  }
  
  if (result.rows.length === 0) {
    console.log('\n❌ Usuário não encontrado ou inativo');
    await pool.end();
    return null;
  }
  
  const user = result.rows[0];
  console.log('\n📊 Usuário encontrado:', Object.keys(user));
  
  // Normalizar campos
  const usuarioSenha = user.usuario_senha || user.Usuario_Senha || user.USUARIO_SENHA;
  const usuarioId = user.usuario_id || user.Usuario_Id || user.USUARIO_ID;
  const usuarioEmail = user.usuario_email || user.Usuario_Email || user.USUARIO_EMAIL;
  const usuarioNome = user.usuario_nome || user.Usuario_Nome || user.USUARIO_NOME;
  
  console.log('   ID:', usuarioId);
  console.log('   Email:', usuarioEmail);
  console.log('   Nome:', usuarioNome);
  console.log('   Senha (hash):', usuarioSenha ? usuarioSenha.substring(0, 20) + '...' : 'NULL');
  
  if (!usuarioSenha) {
    console.log('\n❌ Senha não encontrada no resultado');
    await pool.end();
    return null;
  }
  
  // Verificar senha
  console.log('\n🔑 Verificando senha...');
  let senhaValida = false;
  
  if (usuarioSenha.startsWith('$2b$') || usuarioSenha.startsWith('$2a$')) {
    senhaValida = await bcrypt.compare(senha, usuarioSenha);
    console.log('   Comparação bcrypt:', senhaValida ? '✅ CORRETA' : '❌ INCORRETA');
  } else {
    senhaValida = (senha === usuarioSenha);
    console.log('   Comparação direta:', senhaValida ? '✅ CORRETA' : '❌ INCORRETA');
  }
  
  if (senhaValida) {
    console.log('\n✅ LOGIN BEM SUCEDIDO!');
  } else {
    console.log('\n❌ LOGIN FALHOU - Senha incorreta');
  }
  
  await pool.end();
  return senhaValida ? { usuario_id: usuarioId, usuario_email: usuarioEmail, usuario_nome: usuarioNome } : null;
}

testarLogin('teste@teste.com', '123456');
