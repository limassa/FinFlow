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
const userRepository = require('./src/database/userRepository');
const PasswordValidator = require('./src/utils/passwordValidator');
const emailService = require('./src/services/emailService');
const whatsappService = require('./src/services/whatsappService');

const app = express();
app.use(cors());
app.use(express.json());

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
            versao_numero: '1.0.0',
            versao_nome: 'FinFlow',
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
          versao_numero: '1.0.0',
          versao_nome: 'FinFlow',
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
        versao_numero: '1.0.0',
        versao_nome: 'FinFlow',
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
            versao_nome: 'FinFlow Mobile',
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
          versao_nome: 'FinFlow Mobile',
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
        versao_nome: 'FinFlow Mobile',
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
  console.log('🔍 Tentativa de login:', { email, senha });
  
  try {
    console.log('📡 Chamando userRepository.loginUser...');
    const user = await userRepository.loginUser(email, senha);
    console.log('📊 Resultado do login:', user);
    
    if (user) {
      // Normalizar campos do usuário (pode vir em maiúsculas ou minúsculas)
      const userId = user.usuario_id || user.Usuario_Id || user.id;
      const userNome = user.usuario_nome || user.Usuario_Nome || user.nome;
      const userEmail = user.usuario_email || user.Usuario_Email || user.email;
      
      const userResponse = {
        success: true,
        user: {
          id: userId,
          usuario_nome: userNome, 
          usuario_email: userEmail
        },
        token: 'dummy-token' // Token temporário
      };
      console.log('✅ Login bem-sucedido:', userResponse);
      res.json(userResponse);
    } else {
      console.log('❌ Login falhou - usuário não encontrado ou senha incorreta');
      res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }
  } catch (err) {
    console.error('💥 Erro no login:', err);
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
  const { nome, tipo, saldo, incrementarSaldoTotal, usuario_id } = req.body;
  try {
    const conta = await userRepository.createConta({ nome, tipo, saldo, incrementarSaldoTotal, usuario_id });
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
      : (user.Usuario_LembretesDiasAntes !== undefined ? user.Usuario_LembretesDiasAntes : 5);
    
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
    const result = await userRepository.updateLembretesConfig(userId, {
      lembretesAtivos,
      lembretesEmail,
      lembretesWhatsApp,
      lembretesDiasAntes,
      lembretesHorario
    });
    if (result) {
      res.json({ message: 'Configuração de lembretes atualizada com sucesso!' });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao atualizar configuração de lembretes:', err);
    const errorMessage = err.message || 'Erro ao atualizar configuração';
    // Verificar se o erro é relacionado à coluna WhatsApp não existir
    if (errorMessage.includes('Usuario_LembretesWhatsApp') || errorMessage.includes('usuario_lembreteswhatsapp') || errorMessage.includes('column') || errorMessage.includes('does not exist')) {
      res.status(500).json({ 
        error: 'A coluna de WhatsApp não foi criada no banco de dados. Execute o script adicionar-coluna-whatsapp.js primeiro.',
        details: errorMessage
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
    console.log(`   Instância: ${process.env.EVOLUTION_INSTANCE_NAME || 'finflow'}`);
    console.log(`   API Key configurada: ${!!process.env.EVOLUTION_API_KEY}`);
    
    const isConnected = await whatsappService.checkConnection();
    if (!isConnected) {
      console.log('❌ Instância do WhatsApp não está conectada');
      return res.status(500).json({ 
        error: 'Instância do WhatsApp não está conectada',
        details: 'Verifique se a Evolution API está rodando e se a instância está conectada (QR Code escaneado)',
        url: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
        instance: process.env.EVOLUTION_INSTANCE_NAME || 'finflow'
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
          instance: process.env.EVOLUTION_INSTANCE_NAME || 'finflow',
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
        instance: process.env.EVOLUTION_INSTANCE_NAME || 'finflow',
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
    const emailEnviado = await emailService.sendContactFormEmail({
      nome,
      email,
      telefone: telefone || 'Não informado',
      tipo: tipo || 'Geral',
      mensagem
    });
    
    if (emailEnviado) {
      console.log('✅ Email de "Fale Conosco" enviado com sucesso!');
      res.json({ 
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        status: 'success'
      });
    } else {
      console.log('❌ Falha ao enviar email de "Fale Conosco"');
      res.status(500).json({ error: 'Erro ao enviar mensagem. Tente novamente.' });
    }
    
  } catch (err) {
    console.error('❌ Erro ao processar "Fale Conosco":', err);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔍 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
