// Script para testar o backend
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const userRepository = require('./src/database/userRepository');

const app = express();
app.use(cors());
app.use(express.json());

// Forçar ambiente de produção para usar SSL
process.env.NODE_ENV = 'production';

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
});

// Rota de teste para login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  console.log('Tentativa de login:', { email, senha });
  
  try {
    const user = await userRepository.loginUser(email, senha);
    console.log('Resultado do login:', user);
    
    if (user) {
      const userResponse = {
        id: user.usuario_id,
        nome: user.usuario_nome, 
        email: user.usuario_email
      };
      res.json(userResponse);
    } else {
      res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Rota para verificar usuários
app.get('/api/users', async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 Teste: http://localhost:${PORT}/`);
}); 