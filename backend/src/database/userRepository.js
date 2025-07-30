const pool = require('./connection');
const bcrypt = require('bcrypt');

const userRepository = {
  async createUser({ email, senha, nome, telefone }) {
    // Criptografar a senha antes de salvar
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
    
    const result = await pool.query(
      'INSERT INTO Usuario (Usuario_Email, Usuario_Senha, Usuario_Nome, Usuario_Telefone) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, senhaCriptografada, nome, telefone]
    );
    return result.rows[0];
  },

  async findUserByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM Usuario WHERE Usuario_Email = $1',
      [email]
    );
    return result.rows[0];
  },

  async loginUser(email, senha) {
    // Primeiro, buscar o usuário pelo email
    const result = await pool.query(
      'SELECT Usuario_Id, Usuario_Email, Usuario_Nome, Usuario_Telefone, Usuario_Senha FROM Usuario WHERE Usuario_Email = $1 AND Usuario_Ativo = TRUE',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null; // Usuário não encontrado
    }
    
    const user = result.rows[0];
    
    // Verificar se a senha está criptografada (senhas antigas podem não estar)
    let senhaValida = false;
    
    if (user.usuario_senha.startsWith('$2b$') || user.usuario_senha.startsWith('$2a$')) {
      // Senha está criptografada com bcrypt
      senhaValida = await bcrypt.compare(senha, user.usuario_senha);
    } else {
      // Senha antiga (não criptografada) - comparar diretamente
      senhaValida = (senha === user.usuario_senha);
    }
    
    if (!senhaValida) {
      return null; // Senha incorreta
    }
    
    // Retornar usuário sem a senha
    const { usuario_senha, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Método temporário para debug
  async getAllUsers() {
    const result = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Nome, Usuario_Telefone FROM Usuario');
    return result.rows;
  },

  // Função para migrar senhas antigas para criptografadas
  async migratePasswords() {
    const result = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Senha FROM Usuario');
    const users = result.rows;
    
    for (const user of users) {
      // Verificar se a senha já está criptografada
      if (!user.usuario_senha.startsWith('$2b$') && !user.usuario_senha.startsWith('$2a$')) {
        // Senha não está criptografada, vamos criptografá-la
        const saltRounds = 10;
        const senhaCriptografada = await bcrypt.hash(user.usuario_senha, saltRounds);
        
        await pool.query(
          'UPDATE Usuario SET Usuario_Senha = $1 WHERE Usuario_Id = $2',
          [senhaCriptografada, user.usuario_id]
        );
        
        console.log(`Senha migrada para usuário: ${user.usuario_email}`);
      }
    }
    
    console.log('Migração de senhas concluída!');
  },

  // Métodos para Receitas
  async getReceitas(userId, mes = null) {
    let query = 'SELECT * FROM Receita WHERE Usuario_Id = $1 AND Receita_Ativo = TRUE';
    let params = [userId];
    
          if (mes) {
        query += ' AND DATE_TRUNC(\'month\', Receita_Data) = DATE_TRUNC(\'month\', $2::date)';
        params.push(mes + '-01'); // Adiciona o dia 01 para formar uma data válida
      }
    
    query += ' ORDER BY Receita_Data DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  async createReceita({ descricao, valor, data, tipo, recebido, conta_id, usuario_id, recorrente = false, frequencia = 'mensal', proximasParcelas = 12 }) {
    const result = await pool.query(
      'INSERT INTO Receita (Receita_Descricao, Receita_Valor, Receita_Data, Receita_Tipo, Receita_Recebido, Conta_id, Usuario_Id, Receita_Recorrente, Receita_Frequencia, Receita_ProximasParcelas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [descricao, valor, data, tipo, recebido || false, conta_id || null, usuario_id, recorrente, frequencia, proximasParcelas]
    );
    return result.rows[0];
  },

  async updateReceita(id, { descricao, valor, data, tipo, recebido, conta_id }) {
    const result = await pool.query(
      'UPDATE Receita SET Receita_Descricao = $1, Receita_Valor = $2, Receita_Data = $3, Receita_Tipo = $4, Receita_Recebido = $5, Conta_id = $6 WHERE Receita_Id = $7 RETURNING *',
      [descricao, valor, data, tipo, recebido, conta_id || null, id]
    );
    return result.rows[0];
  },

  async deleteReceita(id, userId) {
    const result = await pool.query(
      'UPDATE Receita SET Receita_Ativo = FALSE, Receita_DtDelete = NOW(), Receita_UsuarioDelete = $1 WHERE Receita_Id = $2 RETURNING *',
      [userId, id]
    );
    return result.rows[0];
  },

  // Métodos para Despesas
  async getDespesas(userId, mes = null) {
    let query = 'SELECT * FROM Despesa WHERE Usuario_Id = $1 AND Despesa_Ativo = TRUE';
    let params = [userId];
    
    if (mes) {
      query += ' AND DATE_TRUNC(\'month\', Despesa_Data) = DATE_TRUNC(\'month\', $2::date)';
      params.push(mes + '-01'); // Adiciona o dia 01 para formar uma data válida
    }
    
    query += ' ORDER BY Despesa_Data DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  async createDespesa({ descricao, valor, data, dataVencimento, tipo, pago, conta_id, usuario_id, recorrente = false, frequencia = 'mensal', proximasParcelas = 12 }) {
    // Tratar dataVencimento vazio como NULL
    const dataVencimentoValue = dataVencimento && dataVencimento.trim() !== '' ? dataVencimento : null;
    
    const result = await pool.query(
      'INSERT INTO Despesa (Despesa_Descricao, Despesa_Valor, Despesa_Data, Despesa_DtVencimento, Despesa_Tipo, Despesa_Pago, Conta_id, Usuario_Id, Despesa_Recorrente, Despesa_Frequencia, Despesa_ProximasParcelas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [descricao, valor, data, dataVencimentoValue, tipo, pago || false, conta_id || null, usuario_id, recorrente, frequencia, proximasParcelas]
    );
    return result.rows[0];
  },

  async updateDespesa(id, { descricao, valor, data, dataVencimento, tipo, pago, conta_id }) {
    // Tratar dataVencimento vazio como NULL
    const dataVencimentoValue = dataVencimento && dataVencimento.trim() !== '' ? dataVencimento : null;
    
    const result = await pool.query(
      'UPDATE Despesa SET Despesa_Descricao = $1, Despesa_Valor = $2, Despesa_Data = $3, Despesa_DtVencimento = $4, Despesa_Tipo = $5, Despesa_Pago = $6, Conta_id = $7 WHERE Despesa_Id = $8 RETURNING *',
      [descricao, valor, data, dataVencimentoValue, tipo, pago, conta_id || null, id]
    );
    return result.rows[0];
  },

  async deleteDespesa(id) {
    const result = await pool.query(
      'UPDATE Despesa SET Despesa_Ativo = FALSE, Despesa_DtDelete = NOW() WHERE Despesa_Id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Métodos para Contas
  async getContas(userId) {
    const result = await pool.query(
      'SELECT * FROM Conta WHERE Usuario_Id = $1 AND Conta_Ativo = TRUE ORDER BY Conta_Nome',
      [userId]
    );
    return result.rows;
  },

  async createConta({ nome, tipo, saldo, usuario_id }) {
    const result = await pool.query(
      'INSERT INTO Conta (Conta_Nome, Conta_Tipo, Conta_Saldo, Usuario_Id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, tipo, saldo || 0, usuario_id]
    );
    return result.rows[0];
  },

  async updateConta(id, { nome, tipo, saldo }) {
    const result = await pool.query(
      'UPDATE Conta SET Conta_Nome = $1, Conta_Tipo = $2, Conta_Saldo = $3 WHERE Conta_Id = $4 RETURNING *',
      [nome, tipo, saldo || 0, id]
    );
    return result.rows[0];
  },

  async deleteConta(id) {
    const result = await pool.query(
      'UPDATE Conta SET Conta_Ativo = FALSE, Conta_DtDelete = NOW() WHERE Conta_Id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Métodos para redefinição de senha
  async saveResetToken(userId, resetToken, resetExpiry) {
    const result = await pool.query(
      'UPDATE Usuario SET Usuario_ResetToken = $1, Usuario_ResetExpiry = $2 WHERE Usuario_Id = $3 RETURNING Usuario_Id',
      [resetToken, resetExpiry, userId]
    );
    return result.rows[0];
  },

  async resetPasswordWithToken(token, newPassword) {
    // Buscar usuário com token válido
    const result = await pool.query(
      'SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario WHERE Usuario_ResetToken = $1 AND Usuario_ResetExpiry > NOW()',
      [token]
    );
    
    if (result.rows.length === 0) {
      return null; // Token inválido ou expirado
    }
    
    const user = result.rows[0];
    
    // Criptografar nova senha
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(newPassword, saltRounds);
    
    // Atualizar senha e limpar token
    await pool.query(
      'UPDATE Usuario SET Usuario_Senha = $1, Usuario_ResetToken = NULL, Usuario_ResetExpiry = NULL WHERE Usuario_Id = $2',
      [senhaCriptografada, user.usuario_id]
    );
    
    return user;
  },

  // Métodos para lembretes
  async findUserById(userId) {
    const result = await pool.query(
      'SELECT * FROM Usuario WHERE Usuario_Id = $1',
      [userId]
    );
    return result.rows[0];
  },

  async updateLembretesConfig(userId, lembretesAtivos) {
    const result = await pool.query(
      'UPDATE Usuario SET Usuario_LembretesAtivos = $1 WHERE Usuario_Id = $2 RETURNING Usuario_Id',
      [lembretesAtivos, userId]
    );
    return result.rows[0];
  },

  async getVencimentosProximos(userId) {
    // Buscar despesas com vencimento nos próximos 5 dias
    const result = await pool.query(`
      SELECT 
        d.Despesa_Id,
        d.Despesa_Descricao,
        d.Despesa_Valor,
        d.Despesa_DtVencimento,
        d.Despesa_Pago,
        u.Usuario_Email,
        u.Usuario_Nome,
        u.Usuario_LembretesDiasAntes
      FROM Despesa d
      JOIN Usuario u ON d.Usuario_Id = u.Usuario_Id
      WHERE d.Usuario_Id = $1 
        AND d.Despesa_Ativo = TRUE
        AND d.Despesa_Pago = FALSE
        AND d.Despesa_DtVencimento IS NOT NULL
        AND d.Despesa_DtVencimento BETWEEN CURRENT_DATE 
          AND (CURRENT_DATE + INTERVAL '5 days')
      ORDER BY d.Despesa_DtVencimento ASC
    `, [userId]);
    
    return result.rows;
  },

  // Métodos para recorrência
  async createReceitaRecorrente({ descricao, valor, data, tipo, recebido, conta_id, usuario_id, recorrente, frequencia, proximasParcelas }) {
    const receitas = [];
    
    if (recorrente && proximasParcelas > 0) {
      let dataAtual = new Date(data);
      
      for (let i = 0; i < proximasParcelas; i++) {
        const receita = await this.createReceita({
          descricao: `${descricao} (${i + 1}/${proximasParcelas})`,
          valor,
          data: dataAtual.toISOString().split('T')[0],
          tipo,
          recebido,
          conta_id,
          usuario_id,
          recorrente: true,
          frequencia,
          proximasParcelas
        });
        
        receitas.push(receita);
        
        // Calcular próxima data baseada na frequência
        if (frequencia === 'mensal') {
          dataAtual.setMonth(dataAtual.getMonth() + 1);
        } else if (frequencia === 'semanal') {
          dataAtual.setDate(dataAtual.getDate() + 7);
        } else if (frequencia === 'quinzenal') {
          dataAtual.setDate(dataAtual.getDate() + 15);
        }
      }
    } else {
      // Criar apenas uma receita
      const receita = await this.createReceita({
        descricao,
        valor,
        data,
        tipo,
        recebido,
        conta_id,
        usuario_id
      });
      receitas.push(receita);
    }
    
    return receitas;
  },

  async createDespesaRecorrente({ descricao, valor, data, dataVencimento, tipo, pago, conta_id, usuario_id, recorrente, frequencia, proximasParcelas }) {
    const despesas = [];
    
    if (recorrente && proximasParcelas > 0) {
      let dataAtual = new Date(data);
      let vencimentoAtual = dataVencimento ? new Date(dataVencimento) : new Date(data);
      
      for (let i = 0; i < proximasParcelas; i++) {
        const despesa = await this.createDespesa({
          descricao: `${descricao} (${i + 1}/${proximasParcelas})`,
          valor,
          data: dataAtual.toISOString().split('T')[0],
          dataVencimento: vencimentoAtual.toISOString().split('T')[0],
          tipo,
          pago,
          conta_id,
          usuario_id,
          recorrente: true,
          frequencia,
          proximasParcelas
        });
        
        despesas.push(despesa);
        
        // Calcular próxima data baseada na frequência
        if (frequencia === 'mensal') {
          dataAtual.setMonth(dataAtual.getMonth() + 1);
          vencimentoAtual.setMonth(vencimentoAtual.getMonth() + 1);
        } else if (frequencia === 'semanal') {
          dataAtual.setDate(dataAtual.getDate() + 7);
          vencimentoAtual.setDate(vencimentoAtual.getDate() + 7);
        } else if (frequencia === 'quinzenal') {
          dataAtual.setDate(dataAtual.getDate() + 15);
          vencimentoAtual.setDate(vencimentoAtual.getDate() + 15);
        }
      }
    } else {
      // Criar apenas uma despesa
      const despesa = await this.createDespesa({
        descricao,
        valor,
        data,
        dataVencimento,
        tipo,
        pago,
        conta_id,
        usuario_id
      });
      despesas.push(despesa);
    }
    
    return despesas;
  },

  // Função para marcar apenas a parcela atual como paga/recebida
  async updateParcelaAtual(id, tipo, novoStatus) {
    // Buscar o item para verificar se é recorrente
    const query = tipo === 'receita' 
      ? 'SELECT * FROM Receita WHERE Receita_Id = $1'
      : 'SELECT * FROM Despesa WHERE Despesa_Id = $1';
    
    const item = await pool.query(query, [id]);
    
    if (item.rows.length === 0) {
      throw new Error('Item não encontrado');
    }
    
    const itemData = item.rows[0];
    const isRecorrente = tipo === 'receita' 
      ? itemData.receita_recorrente 
      : itemData.despesa_recorrente;
    
    if (isRecorrente) {
      // Se é recorrente, marcar apenas esta parcela
      const updateQuery = tipo === 'receita'
        ? 'UPDATE Receita SET Receita_Recebido = $1 WHERE Receita_Id = $2 RETURNING *'
        : 'UPDATE Despesa SET Despesa_Pago = $1 WHERE Despesa_Id = $2 RETURNING *';
      
      const result = await pool.query(updateQuery, [novoStatus, id]);
      return result.rows[0];
    } else {
      // Se não é recorrente, comportamento normal
      const updateQuery = tipo === 'receita'
        ? 'UPDATE Receita SET Receita_Recebido = $1 WHERE Receita_Id = $2 RETURNING *'
        : 'UPDATE Despesa SET Despesa_Pago = $1 WHERE Despesa_Id = $2 RETURNING *';
      
      const result = await pool.query(updateQuery, [novoStatus, id]);
      return result.rows[0];
    }
  },

  // Outras funções reutilizáveis...
};

module.exports = userRepository;