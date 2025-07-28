const express = require('express');
const cors = require('cors');
const userRepository = require('./src/database/userRepository');

const app = express();
app.use(cors());
app.use(express.json());

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
});

// Rota temporária para listar usuários (remover em produção)
app.get('/api/users', async (req, res) => {
  try {
    const result = await userRepository.getAllUsers();
    res.json(result);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Log para debug - todas as requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.post('/api/cadastro', async (req, res) => {
  const { nome, telefone, email, senha } = req.body;
  try {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    const user = await userRepository.createUser({ nome, telefone, email, senha });
    res.status(201).json(user);
  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await userRepository.loginUser(email, senha);
    if (user) {
      const userResponse = {
        id: user.id,
        nome: user.full_name,
        email: user.email,
        telefone: user.telefone
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

// Rotas para Receitas
app.get('/api/receitas', async (req, res) => {
  const { userId, mes } = req.query;
  try {
    const receitas = await userRepository.getReceitas(userId, mes);
    res.json(receitas);
  } catch (err) {
    console.error('Erro ao buscar receitas:', err);
    res.status(500).json({ error: 'Erro ao buscar receitas' });
  }
});

app.post('/api/receitas', async (req, res) => {
  const { descricao, valor, data, tipo, conta_id, usuario_id } = req.body;
  try {
    const receita = await userRepository.createReceita({ descricao, valor, data, tipo, conta_id, usuario_id });
    res.status(201).json(receita);
  } catch (err) {
    console.error('Erro ao criar receita:', err);
    res.status(500).json({ error: 'Erro ao criar receita' });
  }
});

app.put('/api/receitas/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, tipo, conta_id } = req.body;
  try {
    const receita = await userRepository.updateReceita(id, { descricao, valor, data, tipo, conta_id });
    res.json(receita);
  } catch (err) {
    console.error('Erro ao atualizar receita:', err);
    res.status(500).json({ error: 'Erro ao atualizar receita' });
  }
});

app.delete('/api/receitas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await userRepository.deleteReceita(id);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar receita:', err);
    res.status(500).json({ error: 'Erro ao deletar receita' });
  }
});

// Rotas para Despesas
app.get('/api/despesas', async (req, res) => {
  const { userId, mes } = req.query;
  try {
    const despesas = await userRepository.getDespesas(userId, mes);
    res.json(despesas);
  } catch (err) {
    console.error('Erro ao buscar despesas:', err);
    res.status(500).json({ error: 'Erro ao buscar despesas' });
  }
});

app.post('/api/despesas', async (req, res) => {
  const { descricao, valor, data, dataVencimento, tipo, pago, conta_id, usuario_id } = req.body;
  try {
    const despesa = await userRepository.createDespesa({ descricao, valor, data, dataVencimento, tipo, pago, conta_id, usuario_id });
    res.status(201).json(despesa);
  } catch (err) {
    console.error('Erro ao criar despesa:', err);
    res.status(500).json({ error: 'Erro ao criar despesa' });
  }
});

app.put('/api/despesas/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, dataVencimento, tipo, pago, conta_id } = req.body;
  try {
    const despesa = await userRepository.updateDespesa(id, { descricao, valor, data, dataVencimento, tipo, pago, conta_id });
    res.json(despesa);
  } catch (err) {
    console.error('Erro ao atualizar despesa:', err);
    res.status(500).json({ error: 'Erro ao atualizar despesa' });
  }
});

app.delete('/api/despesas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await userRepository.deleteDespesa(id);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar despesa:', err);
    res.status(500).json({ error: 'Erro ao deletar despesa' });
  }
});

// Rotas para Contas
app.get('/api/contas', async (req, res) => {
  const { userId } = req.query;
  try {
    const contas = await userRepository.getContas(userId);
    res.json(contas);
  } catch (err) {
    console.error('Erro ao buscar contas:', err);
    res.status(500).json({ error: 'Erro ao buscar contas' });
  }
});

app.post('/api/contas', async (req, res) => {
  const { nome, tipo, saldo, usuario_id } = req.body;
  try {
    const conta = await userRepository.createConta({ nome, tipo, saldo, usuario_id });
    res.status(201).json(conta);
  } catch (err) {
    console.error('Erro ao criar conta:', err);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

app.put('/api/contas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, saldo } = req.body;
  try {
    const conta = await userRepository.updateConta(id, { nome, tipo, saldo });
    res.json(conta);
  } catch (err) {
    console.error('Erro ao atualizar conta:', err);
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

app.delete('/api/contas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conta = await userRepository.deleteConta(id);
    res.json(conta);
  } catch (err) {
    console.error('Erro ao deletar conta:', err);
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
  console.log('Teste: http://localhost:3001/');
});