// Carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const userRepository = require('./src/database/userRepository');
const PasswordValidator = require('./src/utils/passwordValidator');
const emailService = require('./src/services/emailService');

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
    // Validação de email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    // Validação de senha
    const passwordValidation = PasswordValidator.validatePassword(senha);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Senha não atende aos requisitos de segurança',
        passwordErrors: passwordValidation.errors,
        requirements: PasswordValidator.getPasswordRequirements()
      });
    }
    
    // Verificar se usuário já existe
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    
    // Criar usuário
    const user = await userRepository.createUser({ nome, telefone, email, senha });
    
    // Enviar email de boas-vindas (em background para não bloquear a resposta)
    emailService.sendWelcomeEmail({
      nome: user.usuario_nome,
      email: user.usuario_email
    }).catch(err => {
      console.error('Erro ao enviar email de boas-vindas:', err);
    });
    
    res.status(201).json({
      ...user,
      message: 'Usuário cadastrado com sucesso! Verifique seu email.'
    });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Rota de debug para verificar usuários
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    console.log('Todos os usuários:', users);
    res.json(users);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Rota de debug para verificar estrutura das tabelas
app.get('/api/debug/tables', async (req, res) => {
  try {
    const pool = require('./src/database/connection');
    
    // Verificar se as tabelas existem
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuario', 'receita', 'despesa', 'conta')
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    console.log('Tabelas encontradas:', tablesResult.rows);
    
    // Verificar estrutura da tabela usuario
    const usuarioColumnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuario'
    `;
    
    const usuarioColumnsResult = await pool.query(usuarioColumnsQuery);
    console.log('Colunas da tabela usuario:', usuarioColumnsResult.rows);
    
    res.json({
      tables: tablesResult.rows,
      usuarioColumns: usuarioColumnsResult.rows
    });
  } catch (err) {
    console.error('Erro ao verificar tabelas:', err);
    res.status(500).json({ error: 'Erro ao verificar tabelas' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await userRepository.loginUser(email, senha);
    if (user) {
      const userResponse = {
        id: user.usuario_id,
        nome: user.usuario_nome, 
        email: user.usuario_email,
        telefone: user.usuario_telefone
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
  console.log('GET /api/receitas - userId:', userId, 'mes:', mes);
  try {
    const receitas = await userRepository.getReceitas(userId, mes);
    console.log('Receitas encontradas:', receitas.length);
    res.json(receitas);
  } catch (err) {
    console.error('Erro ao buscar receitas:', err);
    res.status(500).json({ error: 'Erro ao buscar receitas' });
  }
});

app.post('/api/receitas', async (req, res) => {
  const { descricao, valor, data, tipo, recebido, conta_id, usuario_id, recorrente, frequencia, proximasParcelas } = req.body;
  try {
    let receitas;
    if (recorrente) {
      receitas = await userRepository.createReceitaRecorrente({ 
        descricao, 
        valor, 
        data, 
        tipo, 
        recebido, 
        conta_id, 
        usuario_id, 
        recorrente, 
        frequencia, 
        proximasParcelas 
      });
    } else {
      const receita = await userRepository.createReceita({ descricao, valor, data, tipo, recebido, conta_id, usuario_id });
      receitas = [receita];
    }
    res.status(201).json(receitas);
  } catch (err) {
    console.error('Erro ao criar receita:', err);
    res.status(500).json({ error: 'Erro ao criar receita' });
  }
});

app.put('/api/receitas/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, tipo, recebido, conta_id } = req.body;
  try {
    const receita = await userRepository.updateReceita(id, { descricao, valor, data, tipo, recebido, conta_id });
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
  const { descricao, valor, data, dataVencimento, tipo, pago, conta_id, usuario_id, recorrente, frequencia, proximasParcelas } = req.body;
  try {
    let despesas;
    if (recorrente) {
      despesas = await userRepository.createDespesaRecorrente({ 
        descricao, 
        valor, 
        data, 
        dataVencimento, 
        tipo, 
        pago, 
        conta_id, 
        usuario_id, 
        recorrente, 
        frequencia, 
        proximasParcelas 
      });
    } else {
      const despesa = await userRepository.createDespesa({ descricao, valor, data, dataVencimento, tipo, pago, conta_id, usuario_id });
      despesas = [despesa];
    }
    res.status(201).json(despesas);
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
  console.log('GET /api/contas - userId:', userId);
  try {
    const contas = await userRepository.getContas(userId);
    console.log('Contas encontradas:', contas.length);
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

// Rota para migrar senhas antigas para criptografadas (executar apenas uma vez)
app.post('/api/migrate-passwords', async (req, res) => {
  try {
    await userRepository.migratePasswords();
    res.json({ message: 'Migração de senhas concluída com sucesso!' });
  } catch (err) {
    console.error('Erro na migração de senhas:', err);
    res.status(500).json({ error: 'Erro na migração de senhas' });
  }
});

// Rota para solicitar redefinição de senha
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Email não encontrado' });
    }
    
    // Gerar token de redefinição (expira em 1 hora)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    
    // Salvar token no banco (você precisará adicionar campos na tabela usuario)
    await userRepository.saveResetToken(user.usuario_id, resetToken, resetExpiry);
    
    // Enviar email de redefinição
    const emailSent = await emailService.sendPasswordResetEmail({
      nome: user.usuario_nome,
      email: user.usuario_email
    }, resetToken);
    
    if (emailSent) {
      res.json({ message: 'Email de redefinição enviado com sucesso!' });
    } else {
      res.status(500).json({ error: 'Erro ao enviar email de redefinição' });
    }
  } catch (err) {
    console.error('Erro na redefinição de senha:', err);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

// Rota para redefinir senha com token
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    // Validar nova senha
    const passwordValidation = PasswordValidator.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Nova senha não atende aos requisitos de segurança',
        passwordErrors: passwordValidation.errors,
        requirements: PasswordValidator.getPasswordRequirements()
      });
    }
    
    // Verificar token e redefinir senha
    const user = await userRepository.resetPasswordWithToken(token, newPassword);
    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
    
    // Enviar alerta de segurança
    emailService.sendSecurityAlert({
      nome: user.usuario_nome,
      email: user.usuario_email
    }, 'Redefinição de senha').catch(err => {
      console.error('Erro ao enviar alerta de segurança:', err);
    });
    
    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error('Erro na redefinição de senha:', err);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// Rota para obter requisitos de senha
app.get('/api/password-requirements', (req, res) => {
  res.json(PasswordValidator.getPasswordRequirements());
});

// Rotas para gerenciar lembretes do usuário
app.get('/api/user/lembretes', async (req, res) => {
  const { userId } = req.query;
  
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      lembretesAtivos: user.usuario_lembretesativos,
      lembretesEmail: user.usuario_lembretesemail,
      lembretesDiasAntes: user.usuario_lembretesdiasantes
    });
  } catch (err) {
    console.error('Erro ao buscar configuração de lembretes:', err);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

app.put('/api/user/lembretes', async (req, res) => {
  const { userId, lembretesAtivos } = req.body;
  
  try {
    const result = await userRepository.updateLembretesConfig(userId, lembretesAtivos);
    if (result) {
      res.json({ message: 'Configuração de lembretes atualizada com sucesso!' });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao atualizar configuração de lembretes:', err);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
});

// Rota para buscar despesas com vencimento próximo
app.get('/api/lembretes/vencimentos', async (req, res) => {
  const { userId } = req.query;
  
  try {
    const vencimentos = await userRepository.getVencimentosProximos(userId);
    res.json(vencimentos);
  } catch (err) {
    console.error('Erro ao buscar vencimentos próximos:', err);
    res.status(500).json({ error: 'Erro ao buscar vencimentos' });
  }
});

// Rota para testar envio de lembretes por email
app.post('/api/lembretes/teste-email', async (req, res) => {
  const { userId } = req.body;
  
  try {
    // Buscar usuário
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar se lembretes por email estão ativos
    if (!user.usuario_lembretesemail) {
      return res.status(400).json({ error: 'Lembretes por email estão desativados para este usuário' });
    }
    
    // Buscar vencimentos próximos
    const vencimentos = await userRepository.getVencimentosProximos(userId);
    
    if (vencimentos.length === 0) {
      return res.status(404).json({ 
        message: 'Nenhuma despesa com vencimento próximo encontrada',
        info: 'Para testar, crie uma despesa com vencimento nos próximos 5 dias'
      });
    }
    
    // Enviar email de teste
    const emailEnviado = await emailService.sendReminderEmail({
      nome: user.usuario_nome,
      email: user.usuario_email
    }, vencimentos);
    
    if (emailEnviado) {
      res.json({ 
        message: 'Email de teste enviado com sucesso!',
        vencimentos: vencimentos.length,
        destinatario: user.usuario_email
      });
    } else {
      res.status(500).json({ error: 'Erro ao enviar email de teste' });
    }
    
  } catch (err) {
    console.error('Erro ao testar envio de lembretes:', err);
    res.status(500).json({ error: 'Erro ao testar envio de lembretes' });
  }
});

// Rota para marcar parcela atual como paga/recebida
app.put('/api/parcela-atual/:tipo/:id', async (req, res) => {
  const { tipo, id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await userRepository.updateParcelaAtual(id, tipo, status);
    res.json(result);
  } catch (err) {
    console.error('Erro ao atualizar parcela:', err);
    res.status(500).json({ error: 'Erro ao atualizar parcela' });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
  console.log('Teste: http://localhost:3001/');
});