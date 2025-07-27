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

  async createReceita({ descricao, valor, data, tipo, usuario_id }) {
    const result = await pool.query(
      'INSERT INTO receita_transacao (descricao, valor, date, tipo, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [descricao, valor, data, tipo, usuario_id]
    );
    return result.rows[0];
  },

  async updateReceita(id, { descricao, valor, data, tipo }) {
    const result = await pool.query(
      'UPDATE receita_transacao SET descricao = $1, valor = $2, date = $3, tipo = $4 WHERE id = $5 RETURNING *',
      [descricao, valor, data, tipo, id]
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

  async createDespesa({ descricao, valor, data, tipo, usuario_id }) {
    const result = await pool.query(
      'INSERT INTO despesa_transacao (descricao, valor, date, tipo, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [descricao, valor, data, tipo, usuario_id]
    );
    return result.rows[0];
  },

  async updateDespesa(id, { descricao, valor, data, tipo }) {
    const result = await pool.query(
      'UPDATE despesa_transacao SET descricao = $1, valor = $2, date = $3, tipo = $4 WHERE id = $5 RETURNING *',
      [descricao, valor, data, tipo, id]
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

  // Outras funções reutilizáveis...
};

module.exports = userRepository;