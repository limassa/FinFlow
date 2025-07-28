const pool = require('./connection');

const userRepository = {
  async createUser({ email, senha, nome, telefone }) {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, telefone) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, senha, nome, telefone]
    );
    return result.rows[0];
  },

  async findUserByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async loginUser(email, senha) {
    const result = await pool.query(
      'SELECT id, email, full_name, telefone FROM users WHERE email = $1 AND password_hash = $2',
      [email, senha]
    );
    return result.rows[0];
  },

  // Método temporário para debug
  async getAllUsers() {
    const result = await pool.query('SELECT id, email, full_name, telefone FROM users');
    return result.rows;
  },

  // Métodos para Receitas
  async getReceitas(userId, mes = null) {
    let query = 'SELECT * FROM receita_transacao WHERE usuario_id = $1 AND ativo = true';
    let params = [userId];
    
    if (mes) {
      query += ' AND DATE_TRUNC(\'month\', date) = DATE_TRUNC(\'month\', $2::date)';
      params.push(mes + '-01'); // Adiciona o dia 01 para formar uma data válida
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  async createReceita({ descricao, valor, data, tipo, conta_id, usuario_id }) {
    const result = await pool.query(
      'INSERT INTO receita_transacao (descricao, valor, date, tipo, conta_id, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [descricao, valor, data, tipo, conta_id || null, usuario_id]
    );
    return result.rows[0];
  },

  async updateReceita(id, { descricao, valor, data, tipo, conta_id }) {
    const result = await pool.query(
      'UPDATE receita_transacao SET descricao = $1, valor = $2, date = $3, tipo = $4, conta_id = $5 WHERE id = $6 RETURNING *',
      [descricao, valor, data, tipo, conta_id || null, id]
    );
    return result.rows[0];
  },

  async deleteReceita(id, userId) {
    const result = await pool.query(
      'UPDATE receita_transacao SET ativo = false, deleted_at = NOW(), deleted_by = $1 WHERE id = $2 RETURNING *',
      [userId, id]
    );
    return result.rows[0];
  },

  // Métodos para Despesas
  async getDespesas(userId, mes = null) {
    let query = 'SELECT * FROM despesa_transacao WHERE usuario_id = $1 AND ativo = true';
    let params = [userId];
    
    if (mes) {
      query += ' AND DATE_TRUNC(\'month\', date) = DATE_TRUNC(\'month\', $2::date)';
      params.push(mes + '-01'); // Adiciona o dia 01 para formar uma data válida
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  async createDespesa({ descricao, valor, data, dataVencimento, tipo, pago, conta_id, usuario_id }) {
    // Tratar dataVencimento vazio como NULL
    const dataVencimentoValue = dataVencimento && dataVencimento.trim() !== '' ? dataVencimento : null;
    
    const result = await pool.query(
      'INSERT INTO despesa_transacao (descricao, valor, date, despesa_dtVencimento, tipo, despesa_pago, conta_id, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [descricao, valor, data, dataVencimentoValue, tipo, pago || false, conta_id || null, usuario_id]
    );
    return result.rows[0];
  },

  async updateDespesa(id, { descricao, valor, data, dataVencimento, tipo, pago, conta_id }) {
    // Tratar dataVencimento vazio como NULL
    const dataVencimentoValue = dataVencimento && dataVencimento.trim() !== '' ? dataVencimento : null;
    
    const result = await pool.query(
      'UPDATE despesa_transacao SET descricao = $1, valor = $2, date = $3, despesa_dtVencimento = $4, tipo = $5, despesa_pago = $6, conta_id = $7 WHERE id = $8 RETURNING *',
      [descricao, valor, data, dataVencimentoValue, tipo, pago, conta_id || null, id]
    );
    return result.rows[0];
  },

  async deleteDespesa(id) {
    const result = await pool.query(
      'UPDATE despesa_transacao SET ativo = false, deleted_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Métodos para Contas
  async getContas(userId) {
    const result = await pool.query(
      'SELECT * FROM contas WHERE usuario_id = $1 AND ativo = true ORDER BY nome',
      [userId]
    );
    return result.rows;
  },

  async createConta({ nome, tipo, saldo, usuario_id }) {
    const result = await pool.query(
      'INSERT INTO contas (nome, tipo, saldo, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, tipo, saldo || 0, usuario_id]
    );
    return result.rows[0];
  },

  async updateConta(id, { nome, tipo, saldo }) {
    const result = await pool.query(
      'UPDATE contas SET nome = $1, tipo = $2, saldo = $3 WHERE id = $4 RETURNING *',
      [nome, tipo, saldo || 0, id]
    );
    return result.rows[0];
  },

  async deleteConta(id) {
    const result = await pool.query(
      'UPDATE contas SET ativo = false, deleted_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Outras funções reutilizáveis...
};

module.exports = userRepository;