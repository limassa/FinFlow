const { Pool } = require('pg');
const bcrypt = require('../backend/node_modules/bcrypt');

// Configuração do banco FinFlow (Railway)
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP'}@${process.env.DB_HOST || 'interchange.proxy.rlwy.net'}:${process.env.DB_PORT || '50880'}/${process.env.DB_NAME || 'railway'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verificarSenhaUsuario(email) {
  try {
    console.log(`🔍 Verificando senha do usuário: ${email}`);
    
    // Buscar usuário
    const result = await pool.query(`
      SELECT Usuario_ID, Usuario_Email, Usuario_Nome, Usuario_Senha, Usuario_Ativo 
      FROM Usuario 
      WHERE Usuario_Email = $1
    `, [email]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Usuário ${email} não encontrado`);
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ Usuário encontrado:', {
      id: user.usuario_id,
      email: user.usuario_email,
      nome: user.usuario_nome,
      ativo: user.usuario_ativo
    });
    
    console.log('🔐 Senha no banco:', user.usuario_senha);
    
    // Testar diferentes senhas
    const senhasParaTestar = [
      '123456',
      'admin123',
      'teste123',
      'password',
      'senha',
      '123',
      'admin',
      'teste'
    ];
    
    console.log('🧪 Testando senhas...');
    
    for (const senha of senhasParaTestar) {
      let senhaValida = false;
      
      if (user.usuario_senha.startsWith('$2b$') || user.usuario_senha.startsWith('$2a$')) {
        // Senha criptografada
        senhaValida = await bcrypt.compare(senha, user.usuario_senha);
      } else {
        // Senha não criptografada
        senhaValida = (senha === user.usuario_senha);
      }
      
      if (senhaValida) {
        console.log(`✅ Senha encontrada: "${senha}"`);
        return senha;
      }
    }
    
    console.log('❌ Nenhuma das senhas testadas funcionou');
    return null;
    
  } catch (err) {
    console.error('❌ Erro ao verificar senha:', err.message);
    return null;
  }
}

async function criarSenhaCriptografada(senha) {
  const saltRounds = 10;
  return await bcrypt.hash(senha, saltRounds);
}

async function atualizarSenhaUsuario(email, novaSenha) {
  try {
    console.log(`🔧 Atualizando senha do usuário: ${email}`);
    
    const senhaCriptografada = await criarSenhaCriptografada(novaSenha);
    
    const result = await pool.query(`
      UPDATE Usuario 
      SET Usuario_Senha = $1 
      WHERE Usuario_Email = $2
      RETURNING Usuario_ID, Usuario_Email, Usuario_Nome
    `, [senhaCriptografada, email]);
    
    if (result.rows.length > 0) {
      console.log('✅ Senha atualizada com sucesso!');
      console.log('📝 Nova senha:', novaSenha);
      return true;
    } else {
      console.log('❌ Usuário não encontrado para atualização');
      return false;
    }
    
  } catch (err) {
    console.error('❌ Erro ao atualizar senha:', err.message);
    return false;
  }
}

async function executarTestes() {
  console.log('🚀 Verificando senhas do FinFlow...\n');
  
  const email = 'teste@teste.com';
  
  // Teste 1: Verificar senha atual
  const senhaAtual = await verificarSenhaUsuario(email);
  
  console.log('');
  
  // Teste 2: Se não encontrou senha, definir uma nova
  if (!senhaAtual) {
    console.log('🔧 Definindo nova senha para o usuário...');
    const novaSenha = '123456';
    await atualizarSenhaUsuario(email, novaSenha);
    
    console.log('');
    
    // Teste 3: Verificar se a nova senha funciona
    console.log('🧪 Testando nova senha...');
    await verificarSenhaUsuario(email);
  }
  
  console.log('');
  console.log('📋 RESUMO:');
  console.log('✅ Usuário teste@teste.com verificado');
  console.log('✅ Senha para teste: 123456');
  console.log('');
  
  await pool.end();
}

// Executar testes
executarTestes().catch(console.error); 