// Teste do backend com banco local
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração para banco local
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'finflow_test',
  user: 'postgres',
  password: 'postgres' // Altere para sua senha local
};

const pool = new Pool(LOCAL_DB_CONFIG);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Backend local funcionando!', timestamp: new Date().toISOString() });
});

// Rota de teste para login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  console.log('🔍 Tentativa de login:', { email, senha });
  
  try {
    // Buscar usuário
    const result = await pool.query(
      'SELECT Usuario_Id, Usuario_Email, Usuario_Nome, Usuario_Senha FROM Usuario WHERE Usuario_Email = $1 AND Usuario_Ativo = TRUE',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }
    
    const user = result.rows[0];
    console.log('📊 Usuário encontrado:', user.usuario_email);
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.usuario_senha);
    console.log('🔐 Senha válida:', senhaValida);
    
    if (!senhaValida) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }
    
    const userResponse = {
      id: user.usuario_id,
      nome: user.usuario_nome, 
      email: user.usuario_email
    };
    
    console.log('✅ Login bem-sucedido:', userResponse);
    res.json(userResponse);
    
  } catch (err) {
    console.error('💥 Erro no login:', err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Rota para verificar usuários
app.get('/api/users', async (req, res) => {
  try {
    const users = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario');
    console.log('👥 Usuários encontrados:', users.rows);
    res.json(users.rows);
  } catch (err) {
    console.error('❌ Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor local rodando na porta ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log('💡 Teste: http://localhost:3001/');
}); 