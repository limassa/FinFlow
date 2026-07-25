// Carregar variáveis de ambiente
if (process.env.NODE_ENV === 'production') {
  // Em produção, usar apenas variáveis de ambiente do Railway
  console.log('🚀 Ambiente de produção detectado');
} else {
  // Em desenvolvimento, carregar arquivos de configuração
  require('dotenv').config({ path: './config.env' });
  require('dotenv').config(); // Carregar .env se existir
  console.log('🔧 Ambiente de desenvolvimento detectado');
}

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const pool = require('./src/database/connection');
const userRepository = require('./src/database/userRepository');
const PasswordValidator = require('./src/utils/passwordValidator');
const emailService = require('./src/services/emailService');
const whatsappService = require('./src/services/whatsappService');

const app = express();
app.use(cors());
// Fotos de perfil em base64 precisam de limite maior que o padrão (~100kb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Rota de teste funcionando!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de teste de conexão com banco
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('🔍 Testando conexão com banco...');
    const pool = require('./src/database/connection');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexão com banco OK:', result.rows[0]);
    res.json({ 
      message: 'Conexão com banco OK!', 
      timestamp: result.rows[0].current_time,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    console.error('❌ Erro na conexão com banco:', err);
    res.status(500).json({ 
      error: 'Erro na conexão com banco',
      details: err.message 
    });
  }
});

// Rota de teste de usuários
app.get('/api/test-users', async (req, res) => {
  try {
    console.log('🔍 Testando busca de usuários...');
    const pool = require('./src/database/connection');
    const result = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario');
    console.log('✅ Usuários encontrados:', result.rows.length);
    res.json({ 
      message: 'Busca de usuários OK!', 
      count: result.rows.length,
      users: result.rows
    });
  } catch (err) {
    console.error('❌ Erro ao buscar usuários:', err);
    res.status(500).json({ 
      error: 'Erro ao buscar usuários',
      details: err.message 
    });
  }
});

// Rota de healthcheck para o Railway
app.get('/', (req, res) => {
  console.log('🔍 Healthcheck solicitado:', new Date().toISOString());
  res.status(200).json({ 
    message: 'Backend funcionando!', 
    timestamp: new Date().toISOString(),
    version: '2.1.2',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Backend funcionando!', 
    timestamp: new Date().toISOString(),
    version: '2.1.2',
    status: 'healthy'
  });
});

// Rota para buscar versão do sistema
app.get('/api/versao', async (req, res) => {
  try {
    const pool = require('./src/database/connection');
    
    // Tentar buscar com diferentes formatos de nome de tabela (case-sensitive)
    let result;
    try {
      // Tentar sem aspas primeiro (minúsculas - formato padrão do script SQL)
      result = await pool.query(`
        SELECT 
          versao_numero,
          versao_nome,
          versao_data,
          versao_descricao,
          versao_status,
          versao_ambiente,
          versao_mobile
        FROM versao_sistema 
        WHERE versao_status = 'ATIVA'
        ORDER BY versao_id DESC 
        LIMIT 1
      `);
    } catch (err1) {
      try {
        // Tentar com aspas (PostgreSQL case-sensitive)
        result = await pool.query(`
          SELECT 
            versao_numero,
            versao_nome,
            versao_data,
            versao_descricao,
            versao_status,
            versao_ambiente,
            versao_mobile
          FROM "Versao_Sistema" 
          WHERE "Versao_Status" = 'ATIVA'
          ORDER BY "Versao_Id" DESC 
          LIMIT 1
        `);
      } catch (err2) {
        // Tabela não existe - retornar versão padrão
        console.log('⚠️ Tabela versao_sistema não encontrada, retornando versão padrão');
        return res.json({
          success: true,
          versao: {
            versao_numero: '1.0.2',
            versao_nome: 'Claricash',
            versao_data: new Date().toISOString(),
            versao_descricao: 'Versão de desenvolvimento',
            versao_status: 'ATIVA',
            versao_ambiente: process.env.NODE_ENV || 'development'
          }
        });
      }
    }
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        versao: result.rows[0]
      });
    } else {
      // Nenhuma versão ativa encontrada - retornar versão padrão
      res.json({
        success: true,
        versao: {
          versao_numero: '1.0.2',
          versao_nome: 'Claricash',
          versao_data: new Date().toISOString(),
          versao_descricao: 'Versão de desenvolvimento',
          versao_status: 'ATIVA',
          versao_ambiente: process.env.NODE_ENV || 'development'
        }
      });
    }
  } catch (err) {
    // Em caso de erro, retornar versão padrão ao invés de erro 500
    console.error('❌ Erro ao buscar versão:', err.message);
    res.json({
      success: true,
      versao: {
        versao_numero: '1.0.2',
        versao_nome: 'Claricash',
        versao_data: new Date().toISOString(),
        versao_descricao: 'Versão de desenvolvimento',
        versao_status: 'ATIVA',
        versao_ambiente: process.env.NODE_ENV || 'development'
      }
    });
  }
});

// Rota para buscar versão mobile
app.get('/api/versao/mobile', async (req, res) => {
  try {
    const pool = require('./src/database/connection');
    
    // Tentar buscar versão mobile
    let result;
    try {
      result = await pool.query(`
        SELECT 
          versao_mobile,
          versao_nome,
          versao_data,
          versao_descricao,
          versao_status,
          versao_ambiente
        FROM versao_sistema 
        WHERE versao_status = 'ATIVA'
          AND versao_mobile IS NOT NULL
        ORDER BY versao_id DESC 
        LIMIT 1
      `);
    } catch (err1) {
      try {
        result = await pool.query(`
          SELECT 
            "Versao_Mobile" as versao_mobile,
            "Versao_Nome" as versao_nome,
            "Versao_Data" as versao_data,
            "Versao_Descricao" as versao_descricao,
            "Versao_Status" as versao_status,
            "Versao_Ambiente" as versao_ambiente
          FROM "Versao_Sistema" 
          WHERE "Versao_Status" = 'ATIVA'
            AND "Versao_Mobile" IS NOT NULL
          ORDER BY "Versao_Id" DESC 
          LIMIT 1
        `);
      } catch (err2) {
        // Retornar versão padrão
        return res.json({
          success: true,
          versao: {
            versao_mobile: 'M.1.1.01',
            versao_nome: 'Claricash Mobile',
            versao_data: new Date().toISOString(),
            versao_descricao: 'Versão de desenvolvimento',
            versao_status: 'ATIVA',
            versao_ambiente: process.env.NODE_ENV || 'development'
          }
        });
      }
    }
    
    if (result.rows.length > 0 && result.rows[0].versao_mobile) {
      res.json({
        success: true,
        versao: result.rows[0]
      });
    } else {
      // Nenhuma versão mobile encontrada - retornar versão padrão
      res.json({
        success: true,
        versao: {
          versao_mobile: 'M.1.1.01',
          versao_nome: 'Claricash Mobile',
          versao_data: new Date().toISOString(),
          versao_descricao: 'Versão de desenvolvimento',
          versao_status: 'ATIVA',
          versao_ambiente: process.env.NODE_ENV || 'development'
        }
      });
    }
  } catch (err) {
    console.error('❌ Erro ao buscar versão mobile:', err.message);
    res.json({
      success: true,
      versao: {
        versao_mobile: 'M.1.1.01',
        versao_nome: 'Claricash Mobile',
        versao_data: new Date().toISOString(),
        versao_descricao: 'Versão de desenvolvimento',
        versao_status: 'ATIVA',
        versao_ambiente: process.env.NODE_ENV || 'development'
      }
    });
  }
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
  const { nome, email, senha } = req.body;
  // Garantir que telefone seja lido (pode vir como undefined se o cliente não enviar a chave)
  const telefoneRaw = req.body.telefone;
  const telefone = telefoneRaw != null && String(telefoneRaw).trim() !== '' ? String(telefoneRaw).trim() : null;
  if (process.env.NODE_ENV !== 'production') {
    console.log('📋 Cadastro recebido:', { nome: !!nome, email: !!email, telefone: telefone != null ? '(preenchido)' : '(vazio/ausente)' });
  } else {
    console.log('📋 Cadastro: telefone no body=', typeof telefoneRaw, 'valor preenchido=', !!telefone);
  }
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
    
    // Normalizar campos (PostgreSQL pode retornar Usuario_Email ou usuario_email)
    const userNome = user.usuario_nome || user.Usuario_Nome || nome;
    const userEmail = user.usuario_email || user.Usuario_Email || email;
    
    // Enviar email de boas-vindas (em background para não bloquear a resposta)
    emailService.sendWelcomeEmail({
      nome: userNome,
      email: userEmail
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
  const { email, senha, origem } = req.body;
  console.log('🔍 Tentativa de login:', { email, senha: senha ? '***' : undefined, origem });
  
  try {
    console.log('📡 Chamando userRepository.loginUser...');
    const user = await userRepository.loginUser(email, senha);
    console.log('📊 Resultado do login:', user);
    
    if (user) {
      // Normalizar campos do usuário (pode vir em maiúsculas ou minúsculas)
      const userId = user.usuario_id || user.Usuario_Id || user.id;
      const userNome = user.usuario_nome || user.Usuario_Nome || user.nome;
      const userEmail = user.usuario_email || user.Usuario_Email || user.email;
      const userTipo = (user.usuario_tipo || user.Usuario_Tipo || 'user').toString().toLowerCase();

      // Registrar acesso em background — NÃO pode atrasar/falhar o login
      setImmediate(() => {
        userRepository.recordUserAccess(userId, origem || 'web').catch((accessErr) => {
          console.warn('⚠️ Falha ao registrar acesso:', accessErr.message);
        });
      });

      const allowlist = userRepository.getAdminEmailsAllowlist();
      const isAdmin =
        userTipo === 'admin' ||
        allowlist.includes(String(userEmail || '').toLowerCase());

      const userResponse = {
        success: true,
        user: {
          id: userId,
          usuario_nome: userNome,
          usuario_email: userEmail,
          usuario_tipo: isAdmin ? 'admin' : userTipo,
          isAdmin,
        },
        token: 'dummy-token',
      };
      console.log('✅ Login bem-sucedido:', { id: userId, email: userEmail, isAdmin });
      res.json(userResponse);
    } else {
      console.log('❌ Login falhou - usuário não encontrado ou senha incorreta');
      res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }
  } catch (err) {
    console.error('💥 Erro ao fazer login:', err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// =====================================================
// ADMIN DASHBOARD (somente usuários admin)
// =====================================================
app.get('/api/admin/stats', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório' });
  }

  try {
    const isAdmin = await userRepository.isAdminUser(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    const stats = await userRepository.getAdminDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Erro ao buscar stats admin:', err);
    res.status(500).json({ error: 'Erro ao carregar dashboard admin' });
  }
});

app.get('/api/admin/me', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório' });
  }
  try {
    const isAdmin = await userRepository.isAdminUser(userId);
    res.json({ success: true, isAdmin });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao verificar admin' });
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
  
  // Validar se o ID é válido
  if (!id || id === 'undefined' || isNaN(parseInt(id))) {
    console.error('ID inválido para deleção de receita:', id);
    return res.status(400).json({ error: 'ID inválido para deleção' });
  }
  
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
  
  // Validar se o ID é válido
  if (!id || id === 'undefined' || isNaN(parseInt(id))) {
    console.error('ID inválido para deleção:', id);
    return res.status(400).json({ error: 'ID inválido para deleção' });
  }
  
  try {
    await userRepository.deleteDespesa(id);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar despesa:', err);
    res.status(500).json({ error: 'Erro ao deletar despesa' });
  }
});

// Rotas para Metas de Despesa
app.get('/api/metas-despesa', async (req, res) => {
  const { userId } = req.query;
  try {
    const pool = require('./src/database/connection');
    const result = await pool.query(
      `SELECT * FROM meta_despesa WHERE usuario_id = $1 AND is_active = true ORDER BY categoria`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar metas:', err);
    res.status(500).json({ error: 'Erro ao buscar metas de despesa' });
  }
});

app.post('/api/metas-despesa', async (req, res) => {
  const { categoria, valor_meta, periodo, mes, ano, usuario_id } = req.body;
  try {
    const pool = require('./src/database/connection');
    
    // Verificar se já existe uma meta para esta categoria/periodo
    const existing = await pool.query(
      `SELECT * FROM meta_despesa 
       WHERE usuario_id = $1 AND categoria = $2 AND periodo = $3 
       AND ano = $4 AND (mes = $5 OR $5 IS NULL) AND is_active = true`,
      [usuario_id, categoria, periodo, ano, mes]
    );
    
    let result;
    if (existing.rows.length > 0) {
      // Atualizar meta existente
      result = await pool.query(
        `UPDATE meta_despesa 
         SET valor_meta = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE meta_id = $2 
         RETURNING *`,
        [valor_meta, existing.rows[0].meta_id]
      );
    } else {
      // Criar nova meta
      result = await pool.query(
        `INSERT INTO meta_despesa (categoria, valor_meta, periodo, mes, ano, usuario_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [categoria, valor_meta, periodo, mes, ano, usuario_id]
      );
    }
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar/atualizar meta:', err);
    res.status(500).json({ error: 'Erro ao salvar meta de despesa' });
  }
});

app.put('/api/metas-despesa/:id', async (req, res) => {
  const { id } = req.params;
  const { valor_meta } = req.body;
  try {
    const pool = require('./src/database/connection');
    const result = await pool.query(
      `UPDATE meta_despesa SET valor_meta = $1, updated_at = CURRENT_TIMESTAMP WHERE meta_id = $2 RETURNING *`,
      [valor_meta, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar meta:', err);
    res.status(500).json({ error: 'Erro ao atualizar meta de despesa' });
  }
});

app.delete('/api/metas-despesa/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = require('./src/database/connection');
    // Soft delete - apenas desativa a meta
    await pool.query(
      `UPDATE meta_despesa SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE meta_id = $1`,
      [id]
    );
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar meta:', err);
    res.status(500).json({ error: 'Erro ao deletar meta de despesa' });
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
  const { nome, tipo, saldo, incrementarSaldoTotal, usuario_id, banco } = req.body;
  const bancoVal = (banco !== undefined && banco !== null && String(banco).trim() !== '') ? String(banco).trim() : null;
  console.log('[contas POST] banco recebido:', JSON.stringify(banco), '-> bancoVal:', JSON.stringify(bancoVal));
  try {
    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id é obrigatório' });
    }
    if (!nome || !tipo) {
      return res.status(400).json({ error: 'nome e tipo são obrigatórios' });
    }
    const conta = await userRepository.createConta({ nome, tipo, saldo, incrementarSaldoTotal, usuario_id, banco: bancoVal });
    res.status(201).json(conta);
  } catch (err) {
    console.error('Erro ao criar conta:', err);
    res.status(500).json({ error: 'Erro ao criar conta', details: err.message });
  }
});

app.put('/api/contas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, saldo, banco } = req.body;
  const bancoVal = (banco !== undefined && banco !== null && String(banco).trim() !== '') ? String(banco).trim() : null;
  console.log('=== CONTAS PUT === id:', id, 'banco:', banco, 'bancoVal:', bancoVal);
  try {
    const conta = await userRepository.updateConta(id, { nome, tipo, saldo, banco: bancoVal });
    res.json(conta);
  } catch (err) {
    console.error('Erro ao atualizar conta:', err);
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

app.delete('/api/contas/:id', async (req, res) => {
  const { id } = req.params;
  
  // Validar ID
  if (!id || id === 'undefined' || id === 'null') {
    console.error('Erro ao deletar conta: ID inválido ou undefined');
    return res.status(400).json({ error: 'ID da conta é obrigatório' });
  }
  
  try {
    const conta = await userRepository.deleteConta(id);
    if (!conta) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    res.json(conta);
  } catch (err) {
    console.error('Erro ao deletar conta:', err);
    res.status(500).json({ 
      error: 'Erro ao deletar conta',
      details: err.message 
    });
  }
});

// Rota para calcular o saldo total das contas
app.get('/api/contas/saldo-total', async (req, res) => {
  const { userId } = req.query;
  try {
    const saldoTotal = await userRepository.getSaldoTotalContas(userId);
    res.json({ saldoTotal });
  } catch (err) {
    console.error('Erro ao calcular saldo total:', err);
    res.status(500).json({ error: 'Erro ao calcular saldo total' });
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
    
    const userId = user.usuario_id || user.Usuario_Id || user.USUARIO_ID;
    const userNome = user.usuario_nome || user.Usuario_Nome;
    const userEmail = user.usuario_email || user.Usuario_Email;
    
    // Gerar token de redefinição (expira em 1 hora)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    
    // Salvar token no banco
    await userRepository.saveResetToken(userId, resetToken, resetExpiry);
    
    // Enviar email de redefinição
    const emailSent = await emailService.sendPasswordResetEmail({
      nome: userNome,
      email: userEmail
    }, resetToken);
    
    if (emailSent) {
      res.json({ message: 'Email de redefinição enviado com sucesso! Verifique sua caixa de entrada e spam.' });
    } else {
      res.status(500).json({
        error: 'Não foi possível enviar o email de redefinição. Verifique se o servidor está configurado para envio de emails (RESEND_API_KEY, SENDGRID_API_KEY ou EMAIL_USER/EMAIL_PASS). Tente novamente mais tarde ou entre em contato com o suporte.'
      });
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
    
    // Normalizar campos (PostgreSQL pode retornar Usuario_Nome ou usuario_nome)
    const userNome = user.usuario_nome || user.Usuario_Nome;
    const userEmail = user.usuario_email || user.Usuario_Email;
    
    // Enviar alerta de segurança (não bloqueia a resposta)
    emailService.sendSecurityAlert({ nome: userNome, email: userEmail }, 'Redefinição de senha').catch(err => {
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
    
    // Normalizar campos (pode vir em maiúsculas ou minúsculas)
    const lembretesAtivos = user.usuario_lembretesativos !== undefined 
      ? user.usuario_lembretesativos 
      : (user.Usuario_LembretesAtivos !== undefined ? user.Usuario_LembretesAtivos : false);
    
    const lembretesEmail = user.usuario_lembretesemail !== undefined 
      ? user.usuario_lembretesemail 
      : (user.Usuario_LembretesEmail !== undefined ? user.Usuario_LembretesEmail : false);
    
    const lembretesWhatsApp = user.usuario_lembreteswhatsapp !== undefined 
      ? user.usuario_lembreteswhatsapp 
      : (user.Usuario_LembretesWhatsApp !== undefined ? user.Usuario_LembretesWhatsApp : false);
    
    const lembretesDiasAntes = user.usuario_lembretesdiasantes !== undefined 
      ? user.usuario_lembretesdiasantes 
      : (user.Usuario_LembretesDiasAntes !== undefined ? user.Usuario_LembretesDiasAntes : 0);
    
    const lembretesHorario = user.usuario_lembreteshorario || user.Usuario_LembretesHorario || '18:15';
    
    res.json({
      lembretesAtivos,
      lembretesEmail,
      lembretesWhatsApp,
      lembretesDiasAntes,
      lembretesHorario
    });
  } catch (err) {
    console.error('Erro ao buscar configuração de lembretes:', err);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

app.put('/api/user/lembretes', async (req, res) => {
  const { userId, lembretesAtivos, lembretesEmail, lembretesWhatsApp, lembretesDiasAntes, lembretesHorario } = req.body;
  
  try {
    // Verificar se a coluna WhatsApp existe antes de tentar atualizar
    let whatsAppColumnExists = false;
    if (lembretesWhatsApp !== undefined) {
      try {
        const checkColumn = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE (table_name = 'Usuario' OR table_name = 'usuario')
          AND (column_name = 'Usuario_LembretesWhatsApp' OR column_name = 'usuario_lembreteswhatsapp')
        `);
        whatsAppColumnExists = checkColumn.rows.length > 0;
        
        if (!whatsAppColumnExists && lembretesWhatsApp === true) {
          // Se está tentando ativar WhatsApp mas a coluna não existe
          return res.status(400).json({ 
            error: 'A coluna de WhatsApp não foi criada no banco de dados. Execute o script adicionar-coluna-whatsapp.js primeiro.',
            whatsAppAvailable: false
          });
        }
      } catch (checkErr) {
        console.log('⚠️ Erro ao verificar coluna WhatsApp:', checkErr.message);
        // Se não conseguir verificar e está tentando ativar, retornar erro
        if (lembretesWhatsApp === true) {
          return res.status(400).json({ 
            error: 'Não foi possível verificar a coluna de WhatsApp. Execute o script adicionar-coluna-whatsapp.js primeiro.',
            whatsAppAvailable: false
          });
        }
      }
    }
    
    const result = await userRepository.updateLembretesConfig(userId, {
      lembretesAtivos,
      lembretesEmail,
      lembretesWhatsApp,
      lembretesDiasAntes,
      lembretesHorario
    });
    if (result) {
      res.json({ 
        message: 'Configuração de lembretes atualizada com sucesso!',
        whatsAppAvailable: whatsAppColumnExists || lembretesWhatsApp === undefined
      });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao atualizar configuração de lembretes:', err);
    const errorMessage = err.message || 'Erro ao atualizar configuração';
    
    // Verificar se o erro é relacionado à coluna WhatsApp não existir
    if (lembretesWhatsApp !== undefined && 
        (errorMessage.includes('Usuario_LembretesWhatsApp') || 
         errorMessage.includes('usuario_lembreteswhatsapp') || 
         (errorMessage.includes('column') && errorMessage.includes('does not exist')))) {
      res.status(500).json({ 
        error: 'A coluna de WhatsApp não foi criada no banco de dados. Execute o script adicionar-coluna-whatsapp.js primeiro.',
        details: errorMessage,
        whatsAppAvailable: false
      });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
});

// Rotas para gerenciar perfil do usuário
app.get('/api/user/perfil', async (req, res) => {
  const { userId } = req.query;
  
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Normalizar campos (pode vir em maiúsculas ou minúsculas)
    const usuarioNome = user.usuario_nome || user.Usuario_Nome || user.USUARIO_NOME || user.nome || '';
    const usuarioEmail = user.usuario_email || user.Usuario_Email || user.USUARIO_EMAIL || user.email || '';
    const usuarioTelefone = user.usuario_telefone || user.Usuario_Telefone || user.USUARIO_TELEFONE || user.telefone || '';
    
    console.log('📊 Dados do perfil normalizados:', {
      nome: usuarioNome,
      email: usuarioEmail,
      telefone: usuarioTelefone
    });
    
    res.json({
      nome: usuarioNome,
      email: usuarioEmail,
      telefone: usuarioTelefone
    });
  } catch (err) {
    console.error('Erro ao buscar perfil do usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

app.put('/api/user/perfil', async (req, res) => {
  const { userId, nome, email, telefone, novaSenha, senhaAtual } = req.body;
  
  try {
    // Verificar se o usuário existe
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Normalizar campos do usuário atual (pode vir em maiúsculas ou minúsculas)
    const usuarioNomeAtual = user.usuario_nome || user.Usuario_Nome || user.USUARIO_NOME || user.nome || '';
    const usuarioEmailAtual = user.usuario_email || user.Usuario_Email || user.USUARIO_EMAIL || user.email || '';
    const usuarioTelefoneAtual = user.usuario_telefone || user.Usuario_Telefone || user.USUARIO_TELEFONE || user.telefone || '';
    
    // Se uma nova senha foi fornecida, verificar senha atual primeiro
    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' });
      }
      
      // Normalizar senha do usuário
      const usuarioSenha = user.usuario_senha || user.Usuario_Senha || user.USUARIO_SENHA || user.senha;
      
      const bcrypt = require('bcrypt');
      let senhaValida = false;
      
      if (usuarioSenha && (usuarioSenha.startsWith('$2b$') || usuarioSenha.startsWith('$2a$'))) {
        senhaValida = await bcrypt.compare(senhaAtual, usuarioSenha);
      } else {
        senhaValida = (senhaAtual === usuarioSenha);
      }
      
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }
      
      const saltRounds = 10;
      const senhaCriptografada = await bcrypt.hash(novaSenha, saltRounds);
      
      // Atualizar dados do usuário (incluindo senha)
      const updateData = {
        nome: nome || usuarioNomeAtual,
        email: email || usuarioEmailAtual,
        telefone: telefone || usuarioTelefoneAtual,
        senha: senhaCriptografada
      };
      
      const result = await userRepository.updateUserProfile(userId, updateData);
      if (result) {
        // Buscar dados atualizados para retornar
        const userAtualizado = await userRepository.findUserById(userId);
        const usuarioNome = userAtualizado.usuario_nome || userAtualizado.Usuario_Nome || userAtualizado.USUARIO_NOME || userAtualizado.nome || '';
        const usuarioEmail = userAtualizado.usuario_email || userAtualizado.Usuario_Email || userAtualizado.USUARIO_EMAIL || userAtualizado.email || '';
        const usuarioTelefone = userAtualizado.usuario_telefone || userAtualizado.Usuario_Telefone || userAtualizado.USUARIO_TELEFONE || userAtualizado.telefone || '';
        
        res.json({ 
          message: 'Perfil atualizado com sucesso!',
          nome: usuarioNome,
          email: usuarioEmail,
          telefone: usuarioTelefone
        });
      } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } else {
      // Atualizar dados do usuário (sem senha)
      const updateData = {
        nome: nome || usuarioNomeAtual,
        email: email || usuarioEmailAtual,
        telefone: telefone || usuarioTelefoneAtual
      };
      
      const result = await userRepository.updateUserProfile(userId, updateData);
      if (result) {
        // Buscar dados atualizados para retornar
        const userAtualizado = await userRepository.findUserById(userId);
        const usuarioNome = userAtualizado.usuario_nome || userAtualizado.Usuario_Nome || userAtualizado.USUARIO_NOME || userAtualizado.nome || '';
        const usuarioEmail = userAtualizado.usuario_email || userAtualizado.Usuario_Email || userAtualizado.USUARIO_EMAIL || userAtualizado.email || '';
        const usuarioTelefone = userAtualizado.usuario_telefone || userAtualizado.Usuario_Telefone || userAtualizado.USUARIO_TELEFONE || userAtualizado.telefone || '';
        
        console.log('📊 Perfil atualizado - dados retornados:', {
          nome: usuarioNome,
          email: usuarioEmail,
          telefone: usuarioTelefone
        });
        
        res.json({ 
          message: 'Perfil atualizado com sucesso!',
          nome: usuarioNome,
          email: usuarioEmail,
          telefone: usuarioTelefone
        });
      } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
      }
    }
  } catch (err) {
    console.error('Erro ao atualizar perfil do usuário:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
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

// Rota para testar envio de lembretes por WhatsApp
app.post('/api/lembretes/teste-whatsapp', async (req, res) => {
  const { userId } = req.body;
  
  console.log('📱 Teste de lembretes WhatsApp iniciado para userId:', userId);
  
  try {
    // Buscar usuário
    console.log('📋 Buscando usuário...');
    const user = await userRepository.findUserById(userId);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Normalizar campos do usuário (pode vir em maiúsculas ou minúsculas)
    const usuarioNome = user.usuario_nome || user.Usuario_Nome || user.USUARIO_NOME || user.nome || '';
    const usuarioTelefone = user.usuario_telefone || user.Usuario_Telefone || user.USUARIO_TELEFONE || user.telefone || '';
    const usuarioLembretesWhatsApp = user.usuario_lembreteswhatsapp !== undefined 
      ? user.usuario_lembreteswhatsapp 
      : (user.Usuario_LembretesWhatsApp !== undefined 
          ? user.Usuario_LembretesWhatsApp 
          : (user.USUARIO_LEMBRETESWHATSAPP !== undefined 
              ? user.USUARIO_LEMBRETESWHATSAPP 
              : false));
    
    console.log('✅ Usuário encontrado:', usuarioNome, usuarioTelefone);
    console.log('📊 Campos normalizados:', {
      nome: usuarioNome,
      telefone: usuarioTelefone,
      lembretesWhatsApp: usuarioLembretesWhatsApp,
      camposDisponiveis: Object.keys(user)
    });
    
    // Verificar se lembretes por WhatsApp estão ativos
    if (!usuarioLembretesWhatsApp) {
      console.log('❌ Lembretes por WhatsApp desativados');
      console.log('   Campo no banco:', user.Usuario_LembretesWhatsApp, user.usuario_lembreteswhatsapp);
      return res.status(400).json({ error: 'Lembretes por WhatsApp estão desativados para este usuário' });
    }
    
    // Verificar se usuário tem telefone cadastrado
    if (!usuarioTelefone) {
      console.log('❌ Usuário não possui telefone cadastrado');
      return res.status(400).json({ error: 'Usuário não possui telefone cadastrado' });
    }
    
    // Buscar vencimentos próximos
    console.log('📅 Buscando vencimentos próximos...');
    const vencimentos = await userRepository.getVencimentosProximos(userId);
    console.log('📊 Vencimentos encontrados:', vencimentos.length);
    
    if (vencimentos.length === 0) {
      console.log('❌ Nenhum vencimento próximo encontrado');
      console.log('   💡 Verifique:');
      console.log('      - Despesa está ativa');
      console.log('      - Despesa não está paga');
      console.log('      - Data de vencimento está dentro do período configurado');
      console.log('      - Data de vencimento não é NULL');
      
      // Buscar todas as despesas do usuário para debug
      try {
        const todasDespesas = await userRepository.getDespesas(userId);
        console.log(`   📋 Total de despesas do usuário: ${todasDespesas.length}`);
        if (todasDespesas.length > 0) {
          console.log('   📋 Despesas encontradas:');
          todasDespesas.slice(0, 5).forEach((d, i) => {
            const despesaAtiva = d.despesa_ativo !== false && d.Despesa_Ativo !== false;
            const despesaPaga = d.despesa_pago || d.Despesa_Pago;
            const dataVenc = d.despesa_dtvencimento || d.Despesa_DtVencimento;
            console.log(`      ${i + 1}. ${d.despesa_descricao || d.Despesa_Descricao}`);
            console.log(`         Ativa: ${despesaAtiva}, Paga: ${despesaPaga}, Vencimento: ${dataVenc}`);
          });
        }
      } catch (debugErr) {
        console.log('   ⚠️ Erro ao buscar despesas para debug:', debugErr.message);
      }
      
      return res.status(404).json({ 
        message: 'Nenhuma despesa com vencimento próximo encontrada',
        info: 'Para testar, crie uma despesa com vencimento nos próximos dias (conforme configurado nas configurações)',
        debug: 'Verifique os logs do backend para mais detalhes'
      });
    }
    
    // Verificar conexão com Evolution API antes de enviar
    console.log('🔍 Verificando conexão com Evolution API...');
    console.log(`   URL: ${process.env.EVOLUTION_API_URL || 'http://localhost:8080'}`);
    console.log(`   Instância: ${process.env.EVOLUTION_INSTANCE_NAME || 'claricash'}`);
    console.log(`   API Key configurada: ${!!process.env.EVOLUTION_API_KEY}`);
    
    const isConnected = await whatsappService.checkConnection();
    if (!isConnected) {
      console.log('❌ Instância do WhatsApp não está conectada');
      return res.status(500).json({ 
        error: 'Instância do WhatsApp não está conectada',
        details: 'Verifique se a Evolution API está rodando e se a instância está conectada (QR Code escaneado)',
        url: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
        instance: process.env.EVOLUTION_INSTANCE_NAME || 'claricash'
      });
    }
    
    console.log('✅ Conexão com Evolution API OK!');
    
    // Formatar número de telefone
    const phoneNumber = whatsappService.formatPhoneNumber(usuarioTelefone);
    console.log(`📱 Telefone formatado: ${phoneNumber}`);
    
    if (!phoneNumber) {
      console.log('❌ Número de telefone inválido');
      return res.status(400).json({ 
        error: 'Número de telefone inválido',
        telefone: usuarioTelefone
      });
    }
    
    // Enviar WhatsApp de teste
    console.log('📱 Enviando WhatsApp de teste...');
    console.log(`   Destinatário: ${phoneNumber}`);
    console.log(`   Vencimentos: ${vencimentos.length}`);
    
    try {
      const whatsappEnviado = await whatsappService.sendReminderMessage({
        nome: usuarioNome,
        telefone: usuarioTelefone
      }, vencimentos);
      
      if (whatsappEnviado) {
        console.log('✅ WhatsApp enviado com sucesso!');
        res.json({ 
          message: 'WhatsApp de teste enviado com sucesso!',
          vencimentos: vencimentos.length,
          destinatario: usuarioTelefone,
          phoneNumber: phoneNumber
        });
      } else {
        console.log('❌ Falha ao enviar WhatsApp');
        console.log('   Verifique os logs acima para mais detalhes');
        res.status(500).json({ 
          error: 'Erro ao enviar WhatsApp de teste',
          details: 'O envio falhou. Verifique os logs do backend para mais detalhes.',
          url: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
          instance: process.env.EVOLUTION_INSTANCE_NAME || 'claricash',
          phoneNumber: phoneNumber
        });
      }
    } catch (sendError) {
      console.error('❌ Erro ao enviar WhatsApp:', sendError);
      console.error('   Stack:', sendError.stack);
      if (sendError.response) {
        console.error('   Status HTTP:', sendError.response.status);
        console.error('   Resposta:', JSON.stringify(sendError.response.data));
      }
      res.status(500).json({ 
        error: 'Erro ao enviar WhatsApp de teste',
        details: sendError.message || 'Erro desconhecido',
        url: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
        instance: process.env.EVOLUTION_INSTANCE_NAME || 'claricash',
        phoneNumber: phoneNumber
      });
    }
    
  } catch (err) {
    console.error('❌ Erro detalhado:', err);
    console.error('   Stack:', err.stack);
    res.status(500).json({ 
      error: 'Erro ao testar envio de lembretes',
      details: err.message || 'Erro desconhecido'
    });
  }
});

// Rota para testar envio de lembretes por email
app.post('/api/lembretes/teste-email', async (req, res) => {
  const { userId } = req.body;
  
  console.log('🔔 Teste de lembretes iniciado para userId:', userId);
  
  try {
    // Buscar usuário
    console.log('📋 Buscando usuário...');
    const user = await userRepository.findUserById(userId);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    console.log('✅ Usuário encontrado:', user.usuario_nome, user.usuario_email);
    
    // Verificar se lembretes por email estão ativos
    if (!user.usuario_lembretesemail) {
      console.log('❌ Lembretes por email desativados');
      return res.status(400).json({ error: 'Lembretes por email estão desativados para este usuário' });
    }
    
    // Buscar vencimentos próximos
    console.log('📅 Buscando vencimentos próximos...');
    const vencimentos = await userRepository.getVencimentosProximos(userId);
    console.log('📊 Vencimentos encontrados:', vencimentos.length);
    
    if (vencimentos.length === 0) {
      console.log('❌ Nenhum vencimento próximo encontrado');
      return res.status(404).json({ 
        message: 'Nenhuma despesa com vencimento próximo encontrada',
        info: 'Para testar, crie uma despesa com vencimento nos próximos 5 dias'
      });
    }
    
    // Enviar email de teste
    console.log('📧 Enviando email de teste...');
    const emailEnviado = await emailService.sendReminderEmail({
      nome: user.usuario_nome,
      email: user.usuario_email
    }, vencimentos);
    
    if (emailEnviado) {
      console.log('✅ Email enviado com sucesso!');
      res.json({ 
        message: 'Email de teste enviado com sucesso!',
        vencimentos: vencimentos.length,
        destinatario: user.usuario_email
      });
    } else {
      console.log('❌ Falha ao enviar email');
      res.status(500).json({ error: 'Erro ao enviar email de teste' });
    }
    
  } catch (err) {
    console.error('❌ Erro detalhado:', err);
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

// Rota para testar configuração de email
app.get('/api/email/teste', async (req, res) => {
  try {
    console.log('🧪 Testando configuração de email...');
    
    const status = await emailService.getStatus();
    console.log('📊 Status do emailService:', status);
    
    // Tentar configurar se não estiver configurado
    if (!status.configurado) {
      console.log('🔄 Tentando configurar transporter...');
      const configurado = await emailService.configurarTransporter();
      if (configurado) {
        const novoStatus = await emailService.getStatus();
        return res.json({
          success: true,
          message: 'Email configurado com sucesso!',
          status: novoStatus
        });
      }
    }
    
    // Testar envio de email de teste
    if (status.configurado) {
      console.log('📧 Testando envio de email...');
      const emailTeste = await emailService.sendContactFormEmail({
        nome: 'Teste Sistema',
        email: 'teste@claricash.com.br',
        telefone: '(00) 00000-0000',
        tipo: 'teste',
        mensagem: 'Este é um email de teste do sistema Claricash para verificar a configuração.'
      });
      
      return res.json({
        success: emailTeste,
        message: emailTeste 
          ? 'Email de teste enviado com sucesso!' 
          : 'Falha ao enviar email de teste. Verifique os logs.',
        status: status,
        emailEnviado: emailTeste
      });
    }
    
    res.json({
      success: false,
      message: 'Email não configurado',
      status: status,
      instrucoes: {
        sendgrid: 'Configure SENDGRID_API_KEY e SENDGRID_FROM_EMAIL',
        gmail: 'Configure EMAIL_USER e EMAIL_PASS (senha de app do Gmail)'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar email:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Rota para "Fale Conosco"
app.post('/api/fale-conosco', async (req, res) => {
  const { nome, email, telefone, tipo, mensagem } = req.body;
  
  console.log('📧 Recebida mensagem de "Fale Conosco":', { nome, email, tipo });
  
  try {
    // Validar campos obrigatórios
    if (!nome || !email || !mensagem) {
      return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios' });
    }
    
    // Enviar email para o suporte
    let emailEnviado = false;
    let emailError = null;
    
    try {
      emailEnviado = await emailService.sendContactFormEmail({
        nome,
        email,
        telefone: telefone || 'Não informado',
        tipo: tipo || 'Geral',
        mensagem
      });
      
      if (emailEnviado) {
        console.log('✅ Email de "Fale Conosco" enviado com sucesso!');
      } else {
        console.log('⚠️ Email não foi enviado, mas mensagem foi registrada nos logs');
        emailError = 'Email não foi enviado, mas mensagem foi registrada nos logs';
      }
    } catch (err) {
      console.error('❌ Erro ao processar email:', err);
      emailError = err.message || 'Erro ao enviar email';
    }
    
    // Sempre retornar sucesso, mas indicar se houve problema com email
    if (emailEnviado) {
      res.json({ 
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        status: 'success'
      });
    } else {
      // Retornar erro para que o frontend saiba que o email não foi enviado
      res.status(500).json({ 
        error: 'Não foi possível enviar o email. Por favor, tente novamente ou entre em contato diretamente.',
        details: emailError,
        status: 'error'
      });
    }
    
  } catch (err) {
    console.error('❌ Erro ao processar "Fale Conosco":', err);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

const PORT = process.env.PORT || 3001;
// Rota de webhook para ser chamada por serviços externos de cron (ex: cron-job.org)
// Esta rota pode ser chamada periodicamente por um serviço externo
app.post('/api/lembretes/webhook', async (req, res) => {
  // Verificar token de segurança (opcional, mas recomendado)
  const webhookToken = process.env.WEBHOOK_TOKEN || 'claricash-webhook-secret';
  const providedToken = req.headers['x-webhook-token'] || req.body.token;
  
  if (providedToken !== webhookToken) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  try {
    await enviarLembretesAgendados();
    res.json({ 
      success: true, 
      message: 'Lembretes processados com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao processar webhook de lembretes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao processar lembretes',
      message: error.message
    });
  }
});

// Rota GET para facilitar testes (sem autenticação para facilitar)
app.get('/api/lembretes/processar', async (req, res) => {
  try {
    await enviarLembretesAgendados();
    res.json({ 
      success: true, 
      message: 'Lembretes processados com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao processar lembretes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao processar lembretes',
      message: error.message
    });
  }
});

// Variável para controlar execução simultânea (lock)
let processandoLembretes = false;
// Cache de últimos envios por usuário e horário (para evitar duplicação)
const ultimosEnvios = new Map();

// Função para enviar lembretes agendados
async function enviarLembretesAgendados() {
  // Verificar se já está processando (evitar execução simultânea)
  if (processandoLembretes) {
    console.log('⚠️ Processamento de lembretes já em andamento, ignorando chamada duplicada');
    return;
  }
  
  // Ativar lock
  processandoLembretes = true;
  
  try {
    console.log('🔔 Verificando lembretes agendados...');
    
    // Obter horário atual no fuso horário do Brasil (America/Sao_Paulo = UTC-3)
    const agora = new Date();
    
    // Converter para horário de Brasília usando Intl.DateTimeFormat (mais confiável)
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const partes = formatter.formatToParts(agora);
    const horaAtual = parseInt(partes.find(p => p.type === 'hour').value);
    const minutoAtual = parseInt(partes.find(p => p.type === 'minute').value);
    const horarioAtual = `${String(horaAtual).padStart(2, '0')}:${String(minutoAtual).padStart(2, '0')}`;
    
    // Log com informações de debug
    const utcHorario = `${String(agora.getUTCHours()).padStart(2, '0')}:${String(agora.getUTCMinutes()).padStart(2, '0')}`;
    console.log(`   ⏰ Horário UTC: ${utcHorario}`);
    console.log(`   ⏰ Horário Brasil (Brasília): ${horarioAtual}`);
    
    // Buscar todos os usuários com lembretes ativos
    let usuarios;
    try {
      usuarios = await pool.query(`
        SELECT 
          "Usuario_Id" as usuario_id,
          "Usuario_Nome" as usuario_nome,
          "Usuario_Email" as usuario_email,
          "Usuario_Telefone" as usuario_telefone,
          "Usuario_LembretesAtivos" as usuario_lembretesativos,
          "Usuario_LembretesEmail" as usuario_lembretesemail,
          "Usuario_LembretesWhatsApp" as usuario_lembreteswhatsapp,
          "Usuario_LembretesHorario" as usuario_lembreteshorario
        FROM "Usuario"
        WHERE "Usuario_Ativo" = TRUE
          AND ("Usuario_LembretesAtivos" = TRUE OR usuario_lembretesativos = TRUE)
      `);
    } catch (err) {
      // Tentar sem aspas (minúscula)
      usuarios = await pool.query(`
        SELECT 
          usuario_id,
          usuario_nome,
          usuario_email,
          usuario_telefone,
          usuario_lembretesativos,
          usuario_lembretesemail,
          usuario_lembreteswhatsapp,
          usuario_lembreteshorario
        FROM usuario
        WHERE usuario_ativo = TRUE
          AND usuario_lembretesativos = TRUE
      `);
    }
    
    console.log(`   👥 Usuários com lembretes ativos: ${usuarios.rows.length}`);
    
    let lembretesEnviados = 0;
    
    for (const user of usuarios.rows) {
      // Normalizar campos
      const lembretesAtivos = user.usuario_lembretesativos || user.Usuario_LembretesAtivos || false;
      const lembretesEmail = user.usuario_lembretesemail || user.Usuario_LembretesEmail || false;
      const lembretesWhatsApp = user.usuario_lembreteswhatsapp || user.Usuario_LembretesWhatsApp || false;
      const lembretesHorario = user.usuario_lembreteshorario || user.Usuario_LembretesHorario || '18:15';
      const userId = user.usuario_id || user.Usuario_Id;
      
      // Verificar se é exatamente o horário configurado (sem tolerância)
      // Comparar horário configurado (horário de Brasília) com horário atual (também de Brasília)
      const [horaConfig, minutoConfig] = lembretesHorario.split(':').map(Number);
      
      // Corresponder APENAS se for exatamente o mesmo horário (sem tolerância)
      // Isso evita envios em minutos consecutivos
      if (horaConfig === horaAtual && minutoConfig === minutoAtual) {
        
        // Criar chave única para este usuário e horário CONFIGURADO (não o horário atual)
        // Isso garante que mesmo que o job rode em minutos diferentes, só envia 1x por horário configurado
        const chaveEnvio = `${userId}_${lembretesHorario}`;
        const ultimoEnvio = ultimosEnvios.get(chaveEnvio);
        const agoraTimestamp = agora.getTime();
        
        // Verificar se já foi enviado hoje para este horário configurado (evitar duplicação)
        // Usamos 1 hora como janela para garantir que só envia 1x por dia por horário
        if (ultimoEnvio) {
          const umDiaAtras = agoraTimestamp - (24 * 60 * 60 * 1000);
          if (ultimoEnvio > umDiaAtras) {
            console.log(`   ⏭️  Lembrete já enviado hoje para usuário ${userId} no horário configurado ${lembretesHorario}, ignorando...`);
            continue;
          }
        }
        
        console.log(`   ✅ Horário correspondente para usuário ${userId} (${user.usuario_nome || user.Usuario_Nome})`);
        console.log(`      ⏰ Horário configurado: ${lembretesHorario} | Horário atual: ${horarioAtual}`);
        
        // Buscar vencimentos próximos
        const vencimentos = await userRepository.getVencimentosProximos(userId);
        
        if (vencimentos.length > 0) {
          console.log(`      📅 ${vencimentos.length} vencimento(s) encontrado(s)`);
          
          // Marcar como enviado ANTES de enviar (para evitar duplicação se houver erro)
          ultimosEnvios.set(chaveEnvio, agoraTimestamp);
          
          // Limpar cache antigo (manter apenas últimos 24 horas)
          const umDiaAtras = agoraTimestamp - (24 * 60 * 60 * 1000);
          for (const [chave, timestamp] of ultimosEnvios.entries()) {
            if (timestamp < umDiaAtras) {
              ultimosEnvios.delete(chave);
            }
          }
          
          // Enviar por email se ativado
          if (lembretesEmail) {
            try {
              const emailEnviado = await emailService.sendReminderEmail({
                nome: user.usuario_nome || user.Usuario_Nome,
                email: user.usuario_email || user.Usuario_Email
              }, vencimentos);
              
              if (emailEnviado) {
                console.log(`      ✅ Email enviado com sucesso`);
                lembretesEnviados++;
              } else {
                console.log(`      ⚠️ Falha ao enviar email`);
              }
            } catch (err) {
              console.error(`      ❌ Erro ao enviar email:`, err.message);
            }
          }
          
          // Enviar por WhatsApp se ativado
          if (lembretesWhatsApp) {
            try {
              const whatsappEnviado = await whatsappService.sendReminderMessage({
                nome: user.usuario_nome || user.Usuario_Nome,
                telefone: user.usuario_telefone || user.Usuario_Telefone
              }, vencimentos);
              
              if (whatsappEnviado) {
                console.log(`      ✅ WhatsApp enviado com sucesso`);
                lembretesEnviados++;
              } else {
                console.log(`      ⚠️ Falha ao enviar WhatsApp`);
              }
            } catch (err) {
              console.error(`      ❌ Erro ao enviar WhatsApp:`, err.message);
            }
          }
        } else {
          console.log(`      ℹ️ Nenhum vencimento próximo para este usuário`);
        }
      }
    }
    
    console.log(`✅ Verificação concluída. ${lembretesEnviados} lembrete(s) enviado(s)`);
  } catch (error) {
    console.error('❌ Erro ao processar lembretes agendados:', error);
  } finally {
    // Sempre liberar o lock, mesmo em caso de erro
    processandoLembretes = false;
  }
}

// =====================================================
// NOVAS ROTAS: EVENTOS (Agenda/Calendário)
// =====================================================

// Lembretes de eventos pendentes (para pop-up web - não usa email/WhatsApp)
app.get('/api/eventos/lembretes-pendentes', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId obrigatório' });
  }
  try {
    // Horário atual em Brasília (UTC-3)
    const agora = new Date();
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const partes = formatter.formatToParts(agora);
    const getPart = (t) => partes.find(p => p.type === t)?.value || '00';
    const dataAtual = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    const horaAtual = `${getPart('hour')}:${getPart('minute')}`;
    
    const result = await pool.query(`
      SELECT * FROM evento 
      WHERE usuario_id = $1 AND evento_ativo = TRUE 
        AND evento_lembrete = TRUE
        AND evento_data >= (CURRENT_DATE - INTERVAL '1 day')
        AND evento_data <= (CURRENT_DATE + INTERVAL '7 days')
      ORDER BY evento_data, evento_hora_inicio
    `, [userId]);
    
    // Filtrar no JS: lembrete deve ser mostrado quando
    // (data + hora_inicio - lembrete_minutos) está entre (agora - 2min) e (agora + 1min)
    const nowMin = new Date(agora.getTime() - 2 * 60 * 1000);
    const nowMax = new Date(agora.getTime() + 1 * 60 * 1000);
    
    const pendentes = result.rows.filter(ev => {
      const data = String(ev.evento_data || ev.evento_Data || '').slice(0, 10);
      const hinicio = String(ev.evento_hora_inicio || ev.evento_hora_Inicio || '00:00').slice(0, 5);
      const mins = parseInt(ev.evento_lembrete_minutos || ev.evento_lembrete_Minutos || 30, 10);
      // Usar timezone Brasil (-03:00) para o horário do evento
      const lembreteDate = new Date(data + 'T' + hinicio + ':00-03:00');
      lembreteDate.setMinutes(lembreteDate.getMinutes() - mins);
      return lembreteDate >= nowMin && lembreteDate <= nowMax;
    });
    
    res.json(pendentes);
  } catch (err) {
    console.error('Erro ao buscar lembretes de eventos:', err);
    res.status(500).json({ error: 'Erro ao buscar lembretes' });
  }
});

// Listar eventos (suporta mes ou dataInicio/dataFim para agenda semanal)
app.get('/api/eventos', async (req, res) => {
  const { userId, mes, dataInicio, dataFim } = req.query;
  try {
    let query = 'SELECT * FROM evento WHERE usuario_id = $1 AND evento_ativo = TRUE';
    const params = [userId];
    let paramIndex = 2;
    
    if (dataInicio && dataFim) {
      query += ` AND evento_data >= $${paramIndex}::date AND evento_data <= $${paramIndex + 1}::date`;
      params.push(dataInicio, dataFim);
    } else if (mes) {
      query += ` AND TO_CHAR(evento_data, 'YYYY-MM') = $${paramIndex}`;
      params.push(mes);
    }
    
    query += ' ORDER BY evento_data, evento_hora_inicio';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar eventos:', err);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// Criar evento
app.post('/api/eventos', async (req, res) => {
  const { 
    usuario_id, titulo, descricao, data, hora_inicio, hora_fim, 
    tipo, cor, recorrente, frequencia, lembrete, lembrete_minutos,
    receita_id, despesa_id 
  } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO evento (
        usuario_id, evento_titulo, evento_descricao, evento_data, 
        evento_hora_inicio, evento_hora_fim, evento_tipo, evento_cor,
        evento_recorrente, evento_frequencia, evento_lembrete, 
        evento_lembrete_minutos, receita_id, despesa_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      usuario_id, titulo, descricao, data, hora_inicio || null, hora_fim || null,
      tipo || 'geral', cor || '#4F46E5', recorrente || false, frequencia || null,
      lembrete !== false, lembrete_minutos || 30, receita_id || null, despesa_id || null
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// Atualizar evento
app.put('/api/eventos/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    titulo, descricao, data, hora_inicio, hora_fim, 
    tipo, cor, recorrente, frequencia, lembrete, lembrete_minutos 
  } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE evento SET 
        evento_titulo = $1, evento_descricao = $2, evento_data = $3,
        evento_hora_inicio = $4, evento_hora_fim = $5, evento_tipo = $6,
        evento_cor = $7, evento_recorrente = $8, evento_frequencia = $9,
        evento_lembrete = $10, evento_lembrete_minutos = $11,
        evento_atualizado_em = CURRENT_TIMESTAMP
      WHERE evento_id = $12
      RETURNING *
    `, [titulo, descricao, data, hora_inicio, hora_fim, tipo, cor, 
        recorrente, frequencia, lembrete, lembrete_minutos, id]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar evento:', err);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// Deletar evento
app.delete('/api/eventos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE evento SET evento_ativo = FALSE WHERE evento_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar evento:', err);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
});

// =====================================================
// NOVAS ROTAS: CARTÕES DE CRÉDITO
// =====================================================

// Listar cartões
app.get('/api/cartoes', async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM cartao_credito WHERE usuario_id = $1 AND cartao_ativo = TRUE ORDER BY cartao_nome',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar cartões:', err);
    res.status(500).json({ error: 'Erro ao buscar cartões' });
  }
});

// Criar cartão
app.post('/api/cartoes', async (req, res) => {
  const { usuario_id, nome, bandeira, limite, dia_fechamento, dia_vencimento, cor } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO cartao_credito (
        usuario_id, cartao_nome, cartao_bandeira, cartao_limite, 
        cartao_dia_fechamento, cartao_dia_vencimento, cartao_cor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [usuario_id, nome, bandeira || null, limite || 0, 
        dia_fechamento || 1, dia_vencimento || 10, cor || '#4F46E5']);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar cartão:', err);
    res.status(500).json({ error: 'Erro ao criar cartão' });
  }
});

// Atualizar cartão
app.put('/api/cartoes/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, bandeira, limite, dia_fechamento, dia_vencimento, cor } = req.body;
  try {
    const result = await pool.query(`
      UPDATE cartao_credito SET 
        cartao_nome = $1, cartao_bandeira = $2, cartao_limite = $3,
        cartao_dia_fechamento = $4, cartao_dia_vencimento = $5, cartao_cor = $6
      WHERE cartao_id = $7
      RETURNING *
    `, [nome, bandeira, limite, dia_fechamento, dia_vencimento, cor, id]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar cartão:', err);
    res.status(500).json({ error: 'Erro ao atualizar cartão' });
  }
});

// Deletar cartão
app.delete('/api/cartoes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE cartao_credito SET cartao_ativo = FALSE WHERE cartao_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar cartão:', err);
    res.status(500).json({ error: 'Erro ao deletar cartão' });
  }
});

// =====================================================
// NOVAS ROTAS: COMPRAS NO CARTÃO
// =====================================================

// Listar compras
app.get('/api/compras-cartao', async (req, res) => {
  const { userId, cartaoId, mes } = req.query;
  try {
    let query = 'SELECT c.*, cc.cartao_nome, cc.cartao_bandeira FROM compra_cartao c JOIN cartao_credito cc ON c.cartao_id = cc.cartao_id WHERE c.usuario_id = $1 AND c.compra_ativo = TRUE';
    const params = [userId];
    let paramIndex = 2;
    
    if (cartaoId) {
      query += ` AND c.cartao_id = $${paramIndex}`;
      params.push(cartaoId);
      paramIndex++;
    }
    
    if (mes) {
      query += ` AND c.compra_mes_fatura = $${paramIndex}`;
      params.push(mes);
    }
    
    query += ' ORDER BY c.compra_data DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar compras:', err);
    res.status(500).json({ error: 'Erro ao buscar compras' });
  }
});

// Criar compra (com suporte a parcelas)
app.post('/api/compras-cartao', async (req, res) => {
  const { 
    usuario_id, cartao_id, descricao, valor_total, data, 
    categoria, parcelas 
  } = req.body;
  
  try {
    const numParcelas = parcelas || 1;
    const valorParcela = valor_total / numParcelas;
    const comprasCriadas = [];
    
    // Calcular mês da primeira fatura (baseado no dia de fechamento do cartão)
    const cartaoResult = await pool.query(
      'SELECT cartao_dia_fechamento FROM cartao_credito WHERE cartao_id = $1',
      [cartao_id]
    );
    const diaFechamento = cartaoResult.rows[0]?.cartao_dia_fechamento || 1;
    
    const dataCompra = new Date(data);
    let mesInicial = new Date(dataCompra.getFullYear(), dataCompra.getMonth(), 1);
    
    // Se a compra foi após o fechamento, vai para o próximo mês
    if (dataCompra.getDate() >= diaFechamento) {
      mesInicial.setMonth(mesInicial.getMonth() + 1);
    }
    
    // Criar cada parcela como uma entrada separada
    for (let i = 0; i < numParcelas; i++) {
      const mesFatura = new Date(mesInicial);
      mesFatura.setMonth(mesFatura.getMonth() + i);
      const mesFaturaStr = mesFatura.toISOString().slice(0, 7);
      
      const result = await pool.query(`
        INSERT INTO compra_cartao (
          cartao_id, usuario_id, compra_descricao, compra_valor_total,
          compra_data, compra_categoria, compra_parcelas, compra_parcela_atual,
          compra_valor_parcela, compra_mes_fatura
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        cartao_id, usuario_id, 
        numParcelas > 1 ? `${descricao} (${i + 1}/${numParcelas})` : descricao,
        valor_total, data, categoria || null, numParcelas, i + 1,
        valorParcela, mesFaturaStr
      ]);
      
      comprasCriadas.push(result.rows[0]);
    }
    
    res.status(201).json(comprasCriadas);
  } catch (err) {
    console.error('Erro ao criar compra:', err);
    res.status(500).json({ error: 'Erro ao criar compra' });
  }
});

// Deletar compra (e todas as parcelas relacionadas)
app.delete('/api/compras-cartao/:id', async (req, res) => {
  const { id } = req.params;
  const { deletarParcelas } = req.query;
  
  try {
    if (deletarParcelas === 'true') {
      // Buscar a compra para encontrar parcelas relacionadas
      const compra = await pool.query(
        'SELECT compra_descricao, compra_data, cartao_id FROM compra_cartao WHERE compra_id = $1',
        [id]
      );
      
      if (compra.rows.length > 0) {
        const { compra_descricao, compra_data, cartao_id } = compra.rows[0];
        // Extrair descrição base (sem o "(X/Y)")
        const descBase = compra_descricao.replace(/\s*\(\d+\/\d+\)$/, '');
        
        await pool.query(`
          UPDATE compra_cartao SET compra_ativo = FALSE 
          WHERE cartao_id = $1 AND compra_data = $2 
          AND compra_descricao LIKE $3
        `, [cartao_id, compra_data, `${descBase}%`]);
      }
    } else {
      await pool.query('UPDATE compra_cartao SET compra_ativo = FALSE WHERE compra_id = $1', [id]);
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar compra:', err);
    res.status(500).json({ error: 'Erro ao deletar compra' });
  }
});

// Resumo da fatura por mês
app.get('/api/cartoes/:id/fatura', async (req, res) => {
  const { id } = req.params;
  const { mes } = req.query;
  
  try {
    const result = await pool.query(`
      SELECT 
        cc.cartao_id, cc.cartao_nome, cc.cartao_bandeira, cc.cartao_limite,
        cc.cartao_dia_vencimento,
        COALESCE(SUM(c.compra_valor_parcela), 0) as valor_fatura,
        COUNT(c.compra_id) as total_compras
      FROM cartao_credito cc
      LEFT JOIN compra_cartao c ON cc.cartao_id = c.cartao_id 
        AND c.compra_ativo = TRUE 
        AND c.compra_mes_fatura = $2
      WHERE cc.cartao_id = $1
      GROUP BY cc.cartao_id
    `, [id, mes]);
    
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error('Erro ao buscar fatura:', err);
    res.status(500).json({ error: 'Erro ao buscar fatura' });
  }
});

// =====================================================
// NOVAS ROTAS: CATEGORIAS CUSTOMIZÁVEIS
// =====================================================

// Listar categorias
app.get('/api/categorias', async (req, res) => {
  const { userId, tipo } = req.query;
  try {
    let query = 'SELECT * FROM categoria_customizada WHERE usuario_id = $1 AND categoria_ativo = TRUE';
    const params = [userId];
    
    if (tipo) {
      query += ' AND categoria_tipo = $2';
      params.push(tipo);
    }
    
    query += ' ORDER BY categoria_ordem, categoria_nome';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Criar categoria
app.post('/api/categorias', async (req, res) => {
  const { usuario_id, nome, tipo, icone, cor, ordem } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO categoria_customizada (
        usuario_id, categoria_nome, categoria_tipo, categoria_icone, 
        categoria_cor, categoria_ordem
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [usuario_id, nome, tipo, icone || 'ellipsis', 
        cor || '#6B7280', ordem || 0]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Categoria já existe' });
    } else {
      console.error('Erro ao criar categoria:', err);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }
});

// Atualizar categoria
app.put('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, icone, cor, ordem } = req.body;
  try {
    const result = await pool.query(`
      UPDATE categoria_customizada SET 
        categoria_nome = $1, categoria_icone = $2, 
        categoria_cor = $3, categoria_ordem = $4
      WHERE categoria_id = $5
      RETURNING *
    `, [nome, icone, cor, ordem, id]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// Deletar categoria
app.delete('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE categoria_customizada SET categoria_ativo = FALSE WHERE categoria_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar categoria:', err);
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
});

// =====================================================
// NOVAS ROTAS: ORÇAMENTO MENSAL
// =====================================================

// Listar orçamentos
app.get('/api/orcamentos', async (req, res) => {
  const { userId, mes } = req.query;
  try {
    // Buscar orçamentos (padrão PascalCase, fallback minúsculas)
    let orcResult;
    try {
      orcResult = await pool.query(
        'SELECT * FROM "Orcamento_Mensal" WHERE "Usuario_Id" = $1 AND "Orcamento_Ativo" = TRUE' + (mes ? ' AND "Orcamento_Mes" = $2' : '') + ' ORDER BY "Orcamento_Categoria"',
        mes ? [userId, mes] : [userId]
      );
    } catch (e) {
      let orcQuery = 'SELECT * FROM orcamento_mensal WHERE usuario_id = $1 AND orcamento_ativo = TRUE';
      const orcParams = [userId];
      if (mes) { orcQuery += ' AND orcamento_mes = $2'; orcParams.push(mes); }
      orcQuery += ' ORDER BY orcamento_categoria';
      orcResult = await pool.query(orcQuery, orcParams);
    }

    // Buscar despesas (padrão PascalCase, fallback minúsculas)
    let despesas = [];
    try {
      const despRes = await pool.query(
        'SELECT "Despesa_Id", "Usuario_Id", "Despesa_Valor", "Despesa_Tipo", "Despesa_Data", "Despesa_DtVencimento", "Despesa_Ativo" FROM "Despesa" WHERE "Usuario_Id" = $1 AND "Despesa_Ativo" = TRUE',
        [userId]
      );
      despesas = despRes.rows.map(r => ({
        usuario_id: r.Usuario_Id ?? r.usuario_id,
        despesa_valor: r.Despesa_Valor ?? r.despesa_valor,
        despesa_tipo: r.Despesa_Tipo ?? r.despesa_tipo,
        despesa_data: r.Despesa_Data ?? r.despesa_data,
        despesa_dtvencimento: r.Despesa_DtVencimento ?? r.despesa_dtvencimento,
        despesa_ativo: r.Despesa_Ativo ?? r.despesa_ativo
      }));
    } catch (e) {
      try {
        const despRes = await pool.query(
          'SELECT despesa_id, usuario_id, despesa_valor, despesa_tipo, despesa_data, despesa_dtvencimento, despesa_ativo FROM despesa WHERE usuario_id = $1 AND despesa_ativo = TRUE',
          [userId]
        );
        despesas = despRes.rows;
      } catch (e2) {
        console.error('Erro ao buscar despesas para orçamento:', e2);
      }
    }

    // Buscar compras de cartão (para incluir no valor_realizado)
    let comprasCartao = [];
    try {
      const compRes = await pool.query(
        'SELECT c.usuario_id, c.compra_valor_parcela, c.compra_categoria, c.compra_mes_fatura FROM compra_cartao c WHERE c.usuario_id = $1 AND c.compra_ativo = TRUE',
        [userId]
      );
      comprasCartao = compRes.rows.map(r => ({
        usuario_id: r.usuario_id,
        compra_valor_parcela: r.compra_valor_parcela,
        compra_categoria: r.compra_categoria,
        compra_mes_fatura: (r.compra_mes_fatura || '').trim().slice(0, 7)
      }));
    } catch (e2) {
      /* compra_cartao pode não existir */
    }

    // Calcular valor_realizado para cada orçamento
    const categoriasMatch = (dTipo, oCat) => {
      const dt = (dTipo || '').trim();
      const oc = (oCat || '').trim();
      if (dt === oc) return true;
      if (['Investimento', 'Investimentos'].includes(dt) && ['Investimento', 'Investimentos'].includes(oc)) return true;
      return false;
    };

    const getMes = (d) => {
      const data = d.despesa_dtvencimento || d.despesa_data;
      if (!data) return null;
      let s;
      if (data instanceof Date) {
        s = data.toISOString ? data.toISOString().slice(0, 10) : null;
      } else {
        s = String(data).split('T')[0] || String(data).slice(0, 10);
      }
      return s ? s.slice(0, 7) : null; // YYYY-MM
    };

    const orcamentos = orcResult.rows.map(o => {
      const oUserId = String(o.usuario_id || o.Usuario_Id || '');
      const oMes = String(o.orcamento_mes || o.Orcamento_Mes || '').trim();
      const oCat = String(o.orcamento_categoria || o.Orcamento_Categoria || '').trim();

      let valorRealizado = 0;
      for (const d of despesas) {
        const dUserId = String(d.usuario_id ?? d.Usuario_Id ?? '');
        if (dUserId !== oUserId) continue;
        if (!categoriasMatch(d.despesa_tipo, oCat)) continue;
        const dMes = getMes(d);
        if (!dMes || dMes !== oMes) continue;
        valorRealizado += parseFloat(d.despesa_valor || 0);
      }
      for (const c of comprasCartao) {
        const cUserId = String(c.usuario_id ?? '');
        if (cUserId !== oUserId) continue;
        if (!categoriasMatch(c.compra_categoria, oCat)) continue;
        if (!c.compra_mes_fatura || c.compra_mes_fatura !== oMes) continue;
        valorRealizado += parseFloat(c.compra_valor_parcela || 0);
      }

      // Normalizar para o frontend (sempre lowercase)
      return {
        orcamento_id: o.Orcamento_Id ?? o.orcamento_id,
        usuario_id: o.Usuario_Id ?? o.usuario_id,
        orcamento_categoria: o.Orcamento_Categoria ?? o.orcamento_categoria,
        orcamento_valor: o.Orcamento_Valor ?? o.orcamento_valor,
        orcamento_mes: o.Orcamento_Mes ?? o.orcamento_mes,
        orcamento_ativo: o.Orcamento_Ativo ?? o.orcamento_ativo,
        orcamento_criado_em: o.Orcamento_Criado_Em ?? o.orcamento_criado_em,
        valor_realizado: valorRealizado
      };
    });

    res.json(orcamentos);
  } catch (err) {
    console.error('Erro ao buscar orçamentos:', err);
    res.status(500).json({ error: 'Erro ao buscar orçamentos' });
  }
});

// Criar ou atualizar orçamento (padrão PascalCase, fallback minúsculas)
app.post('/api/orcamentos', async (req, res) => {
  const { usuario_id, categoria, valor, mes } = req.body;
  try {
    let result;
    try {
      result = await pool.query(`
        INSERT INTO "Orcamento_Mensal" ("Usuario_Id", "Orcamento_Categoria", "Orcamento_Valor", "Orcamento_Mes")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("Usuario_Id", "Orcamento_Categoria", "Orcamento_Mes") 
        DO UPDATE SET "Orcamento_Valor" = $3, "Orcamento_Ativo" = TRUE
        RETURNING *
      `, [usuario_id, categoria, valor, mes]);
    } catch (e) {
      result = await pool.query(`
        INSERT INTO orcamento_mensal (usuario_id, orcamento_categoria, orcamento_valor, orcamento_mes)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (usuario_id, orcamento_categoria, orcamento_mes) 
        DO UPDATE SET orcamento_valor = $3, orcamento_ativo = TRUE
        RETURNING *
      `, [usuario_id, categoria, valor, mes]);
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar orçamento:', err);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
});

// Atualizar orçamento (padrão PascalCase, fallback minúsculas)
app.put('/api/orcamentos/:id', async (req, res) => {
  const { id } = req.params;
  const { categoria, valor } = req.body;
  try {
    let result;
    try {
      result = await pool.query(`
        UPDATE "Orcamento_Mensal" 
        SET "Orcamento_Categoria" = $1, "Orcamento_Valor" = $2 
        WHERE "Orcamento_Id" = $3 AND "Orcamento_Ativo" = TRUE
        RETURNING *
      `, [categoria, valor, id]);
    } catch (e) {
      result = await pool.query(`
        UPDATE orcamento_mensal 
        SET orcamento_categoria = $1, orcamento_valor = $2 
        WHERE orcamento_id = $3 AND orcamento_ativo = TRUE
        RETURNING *
      `, [categoria, valor, id]);
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar orçamento:', err);
    res.status(500).json({ error: 'Erro ao atualizar orçamento' });
  }
});

// Deletar orçamento (padrão PascalCase, fallback minúsculas)
app.delete('/api/orcamentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    try {
      await pool.query('UPDATE "Orcamento_Mensal" SET "Orcamento_Ativo" = FALSE WHERE "Orcamento_Id" = $1', [id]);
    } catch (e) {
      await pool.query('UPDATE orcamento_mensal SET orcamento_ativo = FALSE WHERE orcamento_id = $1', [id]);
    }
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar orçamento:', err);
    res.status(500).json({ error: 'Erro ao deletar orçamento' });
  }
});

// =====================================================
// NOVAS ROTAS: FOTO DO USUÁRIO
// =====================================================

// Upload de foto do usuário (base64)
app.put('/api/user/foto', async (req, res) => {
  const { userId, foto } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório' });
  }
  
  try {
    try {
      await pool.query(
        'UPDATE "Usuario" SET "Usuario_Foto" = $1, "Usuario_Foto_Atualizada_Em" = CURRENT_TIMESTAMP WHERE "Usuario_Id" = $2',
        [foto, userId]
      );
    } catch (e) {
      await pool.query(
        'UPDATE usuario SET usuario_foto = $1, usuario_foto_atualizada_em = CURRENT_TIMESTAMP WHERE usuario_id = $2',
        [foto, userId]
      );
    }
    
    res.json({ success: true, message: 'Foto atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar foto:', err);
    res.status(500).json({ error: 'Erro ao atualizar foto' });
  }
});

// Buscar foto do usuário
app.get('/api/user/foto', async (req, res) => {
  const { userId } = req.query;
  
  try {
    let result;
    try {
      result = await pool.query(
        'SELECT "Usuario_Foto" as usuario_foto FROM "Usuario" WHERE "Usuario_Id" = $1',
        [userId]
      );
    } catch (e) {
      result = await pool.query(
        'SELECT usuario_foto FROM usuario WHERE usuario_id = $1',
        [userId]
      );
    }
    
    res.json({ foto: result.rows[0]?.usuario_foto || null });
  } catch (err) {
    console.error('Erro ao buscar foto:', err);
    res.status(500).json({ error: 'Erro ao buscar foto' });
  }
});

// Job agendado: executar a cada minuto para verificar lembretes
// NOTA: No Railway, este cron pode não funcionar se o servidor ficar inativo
// Use um serviço externo (cron-job.org, EasyCron) para chamar /api/lembretes/webhook
// Formato cron: segundo minuto hora dia mês dia-da-semana
// '* * * * *' = a cada minuto
if (process.env.ENABLE_INTERNAL_CRON !== 'false') {
  cron.schedule('* * * * *', () => {
    enviarLembretesAgendados();
  });
  console.log('⏰ Job de lembretes agendado iniciado (verifica a cada minuto)');
  console.log('⚠️  Para produção no Railway, configure um serviço externo de cron');
  console.log('   URL do webhook: https://seu-dominio.com/api/lembretes/webhook');
} else {
  console.log('⏰ Cron interno desabilitado. Use serviço externo para chamar o webhook.');
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔍 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);

  userRepository.ensureAdminSchema()
    .then(() => console.log('✅ Schema admin verificado'))
    .catch((err) => console.warn('⚠️ Schema admin:', err.message));
});
