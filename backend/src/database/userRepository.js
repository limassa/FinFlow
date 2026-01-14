const pool = require('./connection');
const bcrypt = require('bcrypt');

const userRepository = {
  async createUser({ email, senha, nome, telefone }) {
    // Criptografar a senha antes de salvar
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
    
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'INSERT INTO "Usuario" ("Usuario_Email", "Usuario_Senha", "Usuario_Nome") VALUES ($1, $2, $3) RETURNING *',
        [email, senhaCriptografada, nome]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'INSERT INTO usuario (usuario_email, usuario_senha, usuario_nome) VALUES ($1, $2, $3) RETURNING *',
        [email, senhaCriptografada, nome]
      );
    }
    return result.rows[0];
  },

  async findUserByEmail(email) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'SELECT * FROM "Usuario" WHERE "Usuario_Email" = $1',
        [email]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'SELECT * FROM usuario WHERE usuario_email = $1',
        [email]
      );
    }
    return result.rows[0];
  },

  async loginUser(email, senha) {
    // Primeiro, buscar o usuário pelo email
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'SELECT "Usuario_Id", "Usuario_Email", "Usuario_Nome", "Usuario_Senha" FROM "Usuario" WHERE "Usuario_Email" = $1 AND "Usuario_Ativo" = TRUE',
        [email]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'SELECT usuario_id, usuario_email, usuario_nome, usuario_senha FROM usuario WHERE usuario_email = $1 AND usuario_ativo = TRUE',
        [email]
      );
    }
    
    if (result.rows.length === 0) {
      return null; // Usuário não encontrado
    }
    
    const user = result.rows[0];
    console.log('📊 Usuário encontrado na query:', Object.keys(user));
    
    // Normalizar campos (pode vir em maiúsculas ou minúsculas)
    const usuarioSenha = user.usuario_senha || user.Usuario_Senha || user.USUARIO_SENHA;
    const usuarioId = user.usuario_id || user.Usuario_Id || user.USUARIO_ID;
    const usuarioEmail = user.usuario_email || user.Usuario_Email || user.USUARIO_EMAIL;
    const usuarioNome = user.usuario_nome || user.Usuario_Nome || user.USUARIO_NOME;
    
    console.log('📊 Campos normalizados:', {
      temSenha: !!usuarioSenha,
      temId: !!usuarioId,
      temEmail: !!usuarioEmail,
      temNome: !!usuarioNome
    });
    
    if (!usuarioSenha) {
      console.error('❌ Senha não encontrada no resultado da query');
      console.error('   Campos disponíveis:', Object.keys(user));
      console.error('   Valores:', user);
      return null;
    }
    
    // Verificar se a senha está criptografada (senhas antigas podem não estar)
    let senhaValida = false;
    
    if (usuarioSenha.startsWith('$2b$') || usuarioSenha.startsWith('$2a$')) {
      // Senha está criptografada com bcrypt
      senhaValida = await bcrypt.compare(senha, usuarioSenha);
    } else {
      // Senha antiga (não criptografada) - comparar diretamente
      senhaValida = (senha === usuarioSenha);
    }
    
    if (!senhaValida) {
      return null; // Senha incorreta
    }
    
    // Retornar usuário normalizado sem a senha
    return {
      usuario_id: usuarioId,
      usuario_email: usuarioEmail,
      usuario_nome: usuarioNome
    };
  },

  // Método temporário para debug
  async getAllUsers() {
    const result = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario');
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
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      let query = 'SELECT * FROM "Receita" WHERE "Usuario_Id" = $1 AND "Receita_Ativo" = TRUE';
      let params = [userId];
      
      if (mes) {
        query += ' AND DATE_TRUNC(\'month\', "Receita_Data") = DATE_TRUNC(\'month\', $2::date)';
        params.push(mes + '-01');
      }
      
      query += ' ORDER BY "Receita_Data" DESC';
      
      result = await pool.query(query, params);
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      let query = 'SELECT * FROM receita WHERE usuario_id = $1 AND receita_ativo = TRUE';
      let params = [userId];
      
      if (mes) {
        query += ' AND DATE_TRUNC(\'month\', receita_data) = DATE_TRUNC(\'month\', $2::date)';
        params.push(mes + '-01');
      }
      
      query += ' ORDER BY receita_data DESC';
      
      result = await pool.query(query, params);
    }
    return result.rows;
  },

  async createReceita({ descricao, valor, data, tipo, recebido, conta_id, usuario_id, recorrente = false, frequencia = 'mensal', proximasParcelas = 12 }) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'INSERT INTO "Receita" ("Receita_Descricao", "Receita_Valor", "Receita_Data", "Receita_Tipo", "Receita_Recebido", "Conta_id", "Usuario_Id", "Receita_Recorrente", "Receita_Frequencia", "Receita_ProximasParcelas") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [descricao, valor, data, tipo, recebido || false, conta_id || null, usuario_id, recorrente, frequencia, proximasParcelas]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'INSERT INTO receita (receita_descricao, receita_valor, receita_data, receita_tipo, receita_recebido, conta_id, usuario_id, receita_recorrente, receita_frequencia, receita_proximasparcelas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [descricao, valor, data, tipo, recebido || false, conta_id || null, usuario_id, recorrente, frequencia, proximasParcelas]
      );
    }
    return result.rows[0];
  },

  async updateReceita(id, { descricao, valor, data, tipo, recebido, conta_id }) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'UPDATE "Receita" SET "Receita_Descricao" = $1, "Receita_Valor" = $2, "Receita_Data" = $3, "Receita_Tipo" = $4, "Receita_Recebido" = $5, "Conta_id" = $6 WHERE "Receita_Id" = $7 RETURNING *',
        [descricao, valor, data, tipo, recebido, conta_id || null, id]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'UPDATE receita SET receita_descricao = $1, receita_valor = $2, receita_data = $3, receita_tipo = $4, receita_recebido = $5, conta_id = $6 WHERE receita_id = $7 RETURNING *',
        [descricao, valor, data, tipo, recebido, conta_id || null, id]
      );
    }
    return result.rows[0];
  },

  async deleteReceita(id, userId) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'UPDATE "Receita" SET "Receita_Ativo" = FALSE, "Receita_DtDelete" = NOW(), "Receita_UsuarioDelete" = $1 WHERE "Receita_Id" = $2 RETURNING *',
        [userId, id]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'UPDATE receita SET receita_ativo = FALSE, receita_dtdelete = NOW(), receita_usuariodelete = $1 WHERE receita_id = $2 RETURNING *',
        [userId, id]
      );
    }
    return result.rows[0];
  },

  // Métodos para Despesas
  async getDespesas(userId, mes = null) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      let query = 'SELECT * FROM "Despesa" WHERE "Usuario_Id" = $1 AND "Despesa_Ativo" = TRUE';
      let params = [userId];
      
      if (mes) {
        query += ' AND DATE_TRUNC(\'month\', "Despesa_Data") = DATE_TRUNC(\'month\', $2::date)';
        params.push(mes + '-01');
      }
      
      query += ' ORDER BY "Despesa_Data" DESC';
      
      result = await pool.query(query, params);
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      let query = 'SELECT * FROM despesa WHERE usuario_id = $1 AND despesa_ativo = TRUE';
      let params = [userId];
      
      if (mes) {
        query += ' AND DATE_TRUNC(\'month\', despesa_data) = DATE_TRUNC(\'month\', $2::date)';
        params.push(mes + '-01');
      }
      
      query += ' ORDER BY despesa_data DESC';
      
      result = await pool.query(query, params);
    }
    return result.rows;
  },

  async createDespesa({ descricao, valor, data, dataVencimento, tipo, pago, conta_id, usuario_id, recorrente = false, frequencia = 'mensal', proximasParcelas = 12 }) {
    // Tratar dataVencimento vazio como NULL
    const dataVencimentoValue = dataVencimento && dataVencimento.trim() !== '' ? dataVencimento : null;
    
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'INSERT INTO "Despesa" ("Despesa_Descricao", "Despesa_Valor", "Despesa_Data", "Despesa_DtVencimento", "Despesa_Tipo", "Despesa_Pago", "Conta_id", "Usuario_Id", "Despesa_Recorrente", "Despesa_Frequencia", "Despesa_ProximasParcelas") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [descricao, valor, data, dataVencimentoValue, tipo, pago || false, conta_id || null, usuario_id, recorrente, frequencia, proximasParcelas]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'INSERT INTO despesa (despesa_descricao, despesa_valor, despesa_data, despesa_dtvencimento, despesa_tipo, despesa_pago, conta_id, usuario_id, despesa_recorrente, despesa_frequencia, despesa_proximasparcelas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [descricao, valor, data, dataVencimentoValue, tipo, pago || false, conta_id || null, usuario_id, recorrente, frequencia, proximasParcelas]
      );
    }
    return result.rows[0];
  },

  async updateDespesa(id, { descricao, valor, data, dataVencimento, tipo, pago, conta_id }) {
    // Tratar dataVencimento vazio como NULL
    const dataVencimentoValue = dataVencimento && dataVencimento.trim() !== '' ? dataVencimento : null;
    
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'UPDATE "Despesa" SET "Despesa_Descricao" = $1, "Despesa_Valor" = $2, "Despesa_Data" = $3, "Despesa_DtVencimento" = $4, "Despesa_Tipo" = $5, "Despesa_Pago" = $6, "Conta_id" = $7 WHERE "Despesa_Id" = $8 RETURNING *',
        [descricao, valor, data, dataVencimentoValue, tipo, pago, conta_id || null, id]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'UPDATE despesa SET despesa_descricao = $1, despesa_valor = $2, despesa_data = $3, despesa_dtvencimento = $4, despesa_tipo = $5, despesa_pago = $6, conta_id = $7 WHERE despesa_id = $8 RETURNING *',
        [descricao, valor, data, dataVencimentoValue, tipo, pago, conta_id || null, id]
      );
    }
    return result.rows[0];
  },

  async deleteDespesa(id) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'UPDATE "Despesa" SET "Despesa_Ativo" = FALSE, "Despesa_DtDelete" = NOW() WHERE "Despesa_Id" = $1 RETURNING *',
        [id]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'UPDATE despesa SET despesa_ativo = FALSE, despesa_dtdelete = NOW() WHERE despesa_id = $1 RETURNING *',
        [id]
      );
    }
    return result.rows[0];
  },

  // Métodos para Contas
  async getContas(userId) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'SELECT * FROM "Conta" WHERE "Usuario_Id" = $1 AND "Conta_Ativo" = TRUE ORDER BY "Conta_Nome"',
        [userId]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'SELECT * FROM conta WHERE usuario_id = $1 AND conta_ativo = TRUE ORDER BY conta_nome',
        [userId]
      );
    }
    return result.rows;
  },

  async createConta({ nome, tipo, saldo, incrementarSaldoTotal = true, usuario_id }) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'INSERT INTO "Conta" ("Conta_Nome", "Conta_Tipo", "Conta_Saldo", "Usuario_Id") VALUES ($1, $2, $3, $4) RETURNING *',
        [nome, tipo, saldo || 0, usuario_id]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'INSERT INTO conta (conta_nome, conta_tipo, conta_saldo, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [nome, tipo, saldo || 0, usuario_id]
      );
    }
    
    // Nota: Funcionalidade de saldo total removida pois a coluna não existe na tabela Usuario
    // Se incrementarSaldoTotal for true e houver saldo, apenas logar (não atualizar banco)
    if (incrementarSaldoTotal && saldo && parseFloat(saldo) > 0) {
      console.log(`💰 Saldo inicial de R$ ${parseFloat(saldo).toFixed(2)} adicionado à conta "${nome}"`);
    }
    
    return result.rows[0];
  },

  async updateConta(id, { nome, tipo, saldo }) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'UPDATE "Conta" SET "Conta_Nome" = $1, "Conta_Tipo" = $2, "Conta_Saldo" = $3 WHERE "Conta_Id" = $4 RETURNING *',
        [nome, tipo, saldo || 0, id]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'UPDATE conta SET conta_nome = $1, conta_tipo = $2, conta_saldo = $3 WHERE conta_id = $4 RETURNING *',
        [nome, tipo, saldo || 0, id]
      );
    }
    return result.rows[0];
  },

  async deleteConta(id) {
    // Validar ID
    if (!id || id === 'undefined') {
      throw new Error('ID da conta é obrigatório');
    }
    
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'UPDATE "Conta" SET "Conta_Ativo" = FALSE, "Conta_DtDelete" = NOW() WHERE "Conta_Id" = $1 RETURNING *',
        [id]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      try {
        result = await pool.query(
          'UPDATE conta SET conta_ativo = FALSE, conta_dtdelete = NOW() WHERE conta_id = $1 RETURNING *',
          [id]
        );
      } catch (err2) {
        // Se ainda falhar, pode ser que a tabela não existe ou o ID é inválido
        console.error('Erro ao deletar conta:', err2.message);
        throw err2;
      }
    }
    
    if (!result || result.rows.length === 0) {
      throw new Error('Conta não encontrada');
    }
    
    return result.rows[0];
  },

  // Métodos para redefinição de senha
  async saveResetToken(userId, resetToken, resetExpiry) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'UPDATE "Usuario" SET "Usuario_ResetToken" = $1, "Usuario_ResetExpiry" = $2 WHERE "Usuario_Id" = $3 RETURNING "Usuario_Id"',
        [resetToken, resetExpiry, userId]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'UPDATE usuario SET usuario_resettoken = $1, usuario_resetexpiry = $2 WHERE usuario_id = $3 RETURNING usuario_id',
        [resetToken, resetExpiry, userId]
      );
    }
    return result.rows[0];
  },

  async resetPasswordWithToken(token, newPassword) {
    // Buscar usuário com token válido
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'SELECT "Usuario_Id", "Usuario_Email", "Usuario_Nome" FROM "Usuario" WHERE "Usuario_ResetToken" = $1 AND "Usuario_ResetExpiry" > NOW()',
        [token]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'SELECT usuario_id, usuario_email, usuario_nome FROM usuario WHERE usuario_resettoken = $1 AND usuario_resetexpiry > NOW()',
        [token]
      );
    }
    
    if (result.rows.length === 0) {
      return null; // Token inválido ou expirado
    }
    
    const user = result.rows[0];
    
    // Criptografar nova senha
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(newPassword, saltRounds);
    
    // Atualizar senha e limpar token
    try {
      await pool.query(
        'UPDATE "Usuario" SET "Usuario_Senha" = $1, "Usuario_ResetToken" = NULL, "Usuario_ResetExpiry" = NULL WHERE "Usuario_Id" = $2',
        [senhaCriptografada, user.Usuario_Id || user.usuario_id]
      );
    } catch (err) {
      await pool.query(
        'UPDATE usuario SET usuario_senha = $1, usuario_resettoken = NULL, usuario_resetexpiry = NULL WHERE usuario_id = $2',
        [senhaCriptografada, user.usuario_id || user.Usuario_Id]
      );
    }
    
    return user;
  },

  // Métodos para lembretes
  async findUserById(userId) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'SELECT * FROM "Usuario" WHERE "Usuario_Id" = $1',
        [userId]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'SELECT * FROM usuario WHERE usuario_id = $1',
        [userId]
      );
    }
    return result.rows[0];
  },

  async updateLembretesConfig(userId, { lembretesAtivos, lembretesEmail, lembretesWhatsApp, lembretesDiasAntes, lembretesHorario }) {
    // Verificar se as colunas existem antes de tentar atualizar
    let whatsAppColumnExists = false;
    let horarioColumnExists = false;
    try {
      // Verificar colunas
      const checkColumns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE (table_name = 'Usuario' OR table_name = 'usuario')
        AND (
          column_name = 'Usuario_LembretesWhatsApp' OR column_name = 'usuario_lembreteswhatsapp'
          OR column_name = 'Usuario_LembretesHorario' OR column_name = 'usuario_lembreteshorario'
        )
      `);
      
      const columnNames = checkColumns.rows.map(row => row.column_name.toLowerCase());
      whatsAppColumnExists = columnNames.some(name => name.includes('whatsapp'));
      horarioColumnExists = columnNames.some(name => name.includes('horario'));
      
      if (whatsAppColumnExists) {
        console.log('✅ Coluna WhatsApp encontrada');
      } else {
        console.log('⚠️ Coluna WhatsApp não encontrada - será ignorada na atualização');
      }
      
      if (horarioColumnExists) {
        console.log('✅ Coluna Horário encontrada');
      } else {
        console.log('⚠️ Coluna Horário não encontrada - será ignorada na atualização');
      }
    } catch (err) {
      console.log('⚠️ Erro ao verificar colunas, assumindo que não existem:', err.message);
      whatsAppColumnExists = false;
      horarioColumnExists = false;
    }

    // Tentar com aspas duplas primeiro (case-sensitive)
    let query = 'UPDATE "Usuario" SET';
    let params = [];
    let paramIndex = 1;
    
    if (lembretesAtivos !== undefined) {
      query += ` "Usuario_LembretesAtivos" = $${paramIndex}`;
      params.push(lembretesAtivos);
      paramIndex++;
    }
    
    if (lembretesEmail !== undefined) {
      if (paramIndex > 1) query += ',';
      query += ` "Usuario_LembretesEmail" = $${paramIndex}`;
      params.push(lembretesEmail);
      paramIndex++;
    }
    
    // Só incluir WhatsApp se a coluna existir
    if (lembretesWhatsApp !== undefined && whatsAppColumnExists) {
      if (paramIndex > 1) query += ',';
      query += ` "Usuario_LembretesWhatsApp" = $${paramIndex}`;
      params.push(lembretesWhatsApp);
      paramIndex++;
    }
    
    if (lembretesDiasAntes !== undefined) {
      if (paramIndex > 1) query += ',';
      query += ` "Usuario_LembretesDiasAntes" = $${paramIndex}`;
      params.push(lembretesDiasAntes);
      paramIndex++;
    }
    
    // Só incluir Horário se a coluna existir
    if (lembretesHorario !== undefined && horarioColumnExists) {
      if (paramIndex > 1) query += ',';
      query += ` "Usuario_LembretesHorario" = $${paramIndex}`;
      params.push(lembretesHorario);
      paramIndex++;
    }
    
    query += ` WHERE "Usuario_Id" = $${paramIndex} RETURNING "Usuario_Id"`;
    params.push(userId);
    
    let result;
    try {
      result = await pool.query(query, params);
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      query = 'UPDATE usuario SET';
      params = [];
      paramIndex = 1;
      
      if (lembretesAtivos !== undefined) {
        query += ` usuario_lembretesativos = $${paramIndex}`;
        params.push(lembretesAtivos);
        paramIndex++;
      }
      
      if (lembretesEmail !== undefined) {
        if (paramIndex > 1) query += ',';
        query += ` usuario_lembretesemail = $${paramIndex}`;
        params.push(lembretesEmail);
        paramIndex++;
      }
      
      // Só incluir WhatsApp se a coluna existir
      if (lembretesWhatsApp !== undefined && whatsAppColumnExists) {
        if (paramIndex > 1) query += ',';
        query += ` usuario_lembreteswhatsapp = $${paramIndex}`;
        params.push(lembretesWhatsApp);
        paramIndex++;
      }
      
      if (lembretesDiasAntes !== undefined) {
        if (paramIndex > 1) query += ',';
        query += ` usuario_lembretesdiasantes = $${paramIndex}`;
        params.push(lembretesDiasAntes);
        paramIndex++;
      }
      
      // Só incluir Horário se a coluna existir
      if (lembretesHorario !== undefined && horarioColumnExists) {
        if (paramIndex > 1) query += ',';
        query += ` usuario_lembreteshorario = $${paramIndex}`;
        params.push(lembretesHorario);
        paramIndex++;
      }
      
      query += ` WHERE usuario_id = $${paramIndex} RETURNING usuario_id`;
      params.push(userId);
      
      result = await pool.query(query, params);
    }
    return result.rows[0];
  },

  async updateUserProfile(userId, { nome, email, telefone, senha }) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let query = 'UPDATE "Usuario" SET';
    let params = [];
    let paramIndex = 1;
    
    if (nome) {
      query += ` "Usuario_Nome" = $${paramIndex}`;
      params.push(nome);
      paramIndex++;
    }
    
    if (email) {
      if (paramIndex > 1) query += ',';
      query += ` "Usuario_Email" = $${paramIndex}`;
      params.push(email);
      paramIndex++;
    }
    
    if (telefone) {
      if (paramIndex > 1) query += ',';
      query += ` "Usuario_Telefone" = $${paramIndex}`;
      params.push(telefone);
      paramIndex++;
    }
    
    if (senha) {
      if (paramIndex > 1) query += ',';
      query += ` "Usuario_Senha" = $${paramIndex}`;
      params.push(senha);
      paramIndex++;
    }
    
    query += ` WHERE "Usuario_Id" = $${paramIndex} RETURNING "Usuario_Id"`;
    params.push(userId);
    
    let result;
    try {
      result = await pool.query(query, params);
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      query = 'UPDATE usuario SET';
      params = [];
      paramIndex = 1;
      
      if (nome) {
        query += ` usuario_nome = $${paramIndex}`;
        params.push(nome);
        paramIndex++;
      }
      
      if (email) {
        if (paramIndex > 1) query += ',';
        query += ` usuario_email = $${paramIndex}`;
        params.push(email);
        paramIndex++;
      }
      
      if (telefone) {
        if (paramIndex > 1) query += ',';
        query += ` usuario_telefone = $${paramIndex}`;
        params.push(telefone);
        paramIndex++;
      }
      
      if (senha) {
        if (paramIndex > 1) query += ',';
        query += ` usuario_senha = $${paramIndex}`;
        params.push(senha);
        paramIndex++;
      }
      
      query += ` WHERE usuario_id = $${paramIndex} RETURNING usuario_id`;
      params.push(userId);
      
      result = await pool.query(query, params);
    }
    return result.rows[0];
  },

  async getVencimentosProximos(userId) {
    // Primeiro, buscar o usuário para pegar os dias configurados
    const user = await this.findUserById(userId);
    if (!user) {
      return [];
    }
    
    // Normalizar campo de dias antes (pode vir em diferentes formatos)
    const diasAntes = user.usuario_lembretesdiasantes !== undefined 
      ? parseInt(user.usuario_lembretesdiasantes) 
      : (user.Usuario_LembretesDiasAntes !== undefined 
          ? parseInt(user.Usuario_LembretesDiasAntes) 
          : 5); // Padrão: 5 dias
    
    console.log(`📅 Buscando vencimentos para os próximos ${diasAntes} dias...`);
    
    // Calcular data limite (hoje + N dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + diasAntes);
    const dataLimiteStr = dataLimite.toISOString().split('T')[0];
    
    console.log(`   📅 Data atual: ${new Date().toISOString().split('T')[0]}`);
    console.log(`   📅 Data limite: ${dataLimiteStr} (${diasAntes} dias)`);
    
    // Buscar despesas com vencimento nos próximos N dias (configurado pelo usuário)
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(`
        SELECT 
          d."Despesa_Id",
          d."Despesa_Descricao",
          d."Despesa_Valor",
          d."Despesa_DtVencimento",
          d."Despesa_Pago",
          u."Usuario_Email",
          u."Usuario_Nome",
          u."Usuario_LembretesDiasAntes"
        FROM "Despesa" d
        JOIN "Usuario" u ON d."Usuario_Id" = u."Usuario_Id"
        WHERE d."Usuario_Id" = $1 
          AND d."Despesa_Ativo" = TRUE
          AND d."Despesa_Pago" = FALSE
          AND d."Despesa_DtVencimento" IS NOT NULL
          AND d."Despesa_DtVencimento" >= CURRENT_DATE
          AND d."Despesa_DtVencimento" <= $2
        ORDER BY d."Despesa_DtVencimento" ASC
      `, [userId, dataLimiteStr]);
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(`
        SELECT 
          d.despesa_id,
          d.despesa_descricao,
          d.despesa_valor,
          d.despesa_dtvencimento,
          d.despesa_pago,
          u.usuario_email,
          u.usuario_nome,
          u.usuario_lembretesdiasantes
        FROM despesa d
        JOIN usuario u ON d.usuario_id = u.usuario_id
        WHERE d.usuario_id = $1 
          AND d.despesa_ativo = TRUE
          AND d.despesa_pago = FALSE
          AND d.despesa_dtvencimento IS NOT NULL
          AND d.despesa_dtvencimento >= CURRENT_DATE
          AND d.despesa_dtvencimento <= $2
        ORDER BY d.despesa_dtvencimento ASC
      `, [userId, dataLimiteStr]);
    }
    
    // Normalizar campos retornados
    const vencimentosNormalizados = result.rows.map(venc => ({
      despesa_id: venc.despesa_id || venc.Despesa_Id || venc.id,
      despesa_descricao: venc.despesa_descricao || venc.Despesa_Descricao || venc.descricao,
      despesa_valor: venc.despesa_valor || venc.Despesa_Valor || venc.valor,
      despesa_dtvencimento: venc.despesa_dtvencimento || venc.Despesa_DtVencimento || venc.dataVencimento,
      despesa_pago: venc.despesa_pago !== undefined ? venc.despesa_pago : (venc.Despesa_Pago !== undefined ? venc.Despesa_Pago : false)
    }));
    
    console.log(`📊 Vencimentos encontrados: ${vencimentosNormalizados.length}`);
    if (vencimentosNormalizados.length > 0) {
      vencimentosNormalizados.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.despesa_descricao} - Vencimento: ${v.despesa_dtvencimento} - Valor: R$ ${v.despesa_valor}`);
      });
    } else {
      console.log('   ⚠️ Nenhuma despesa encontrada. Verifique:');
      console.log('      - Despesa está ativa (despesa_ativo = TRUE)');
      console.log('      - Despesa não está paga (despesa_pago = FALSE)');
      console.log('      - Data de vencimento está dentro dos próximos', diasAntes, 'dias');
      console.log('      - Data de vencimento não é NULL');
    }
    
    return vencimentosNormalizados;
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
    // Tentar com aspas duplas primeiro (case-sensitive)
    let item;
    try {
      const query = tipo === 'receita' 
        ? 'SELECT * FROM "Receita" WHERE "Receita_Id" = $1'
        : 'SELECT * FROM "Despesa" WHERE "Despesa_Id" = $1';
      item = await pool.query(query, [id]);
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      const query = tipo === 'receita' 
        ? 'SELECT * FROM receita WHERE receita_id = $1'
        : 'SELECT * FROM despesa WHERE despesa_id = $1';
      item = await pool.query(query, [id]);
    }
    
    if (item.rows.length === 0) {
      throw new Error('Item não encontrado');
    }
    
    const itemData = item.rows[0];
    const isRecorrente = tipo === 'receita' 
      ? itemData.receita_recorrente 
      : itemData.despesa_recorrente;
    
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      if (isRecorrente) {
        // Se é recorrente, marcar apenas esta parcela
        const updateQuery = tipo === 'receita'
          ? 'UPDATE "Receita" SET "Receita_Recebido" = $1 WHERE "Receita_Id" = $2 RETURNING *'
          : 'UPDATE "Despesa" SET "Despesa_Pago" = $1 WHERE "Despesa_Id" = $2 RETURNING *';
        
        result = await pool.query(updateQuery, [novoStatus, id]);
      } else {
        // Se não é recorrente, comportamento normal
        const updateQuery = tipo === 'receita'
          ? 'UPDATE "Receita" SET "Receita_Recebido" = $1 WHERE "Receita_Id" = $2 RETURNING *'
          : 'UPDATE "Despesa" SET "Despesa_Pago" = $1 WHERE "Despesa_Id" = $2 RETURNING *';
        
        result = await pool.query(updateQuery, [novoStatus, id]);
      }
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      if (isRecorrente) {
        const updateQuery = tipo === 'receita'
          ? 'UPDATE receita SET receita_recebido = $1 WHERE receita_id = $2 RETURNING *'
          : 'UPDATE despesa SET despesa_pago = $1 WHERE despesa_id = $2 RETURNING *';
        
        result = await pool.query(updateQuery, [novoStatus, id]);
      } else {
        const updateQuery = tipo === 'receita'
          ? 'UPDATE receita SET receita_recebido = $1 WHERE receita_id = $2 RETURNING *'
          : 'UPDATE despesa SET despesa_pago = $1 WHERE despesa_id = $2 RETURNING *';
        
        result = await pool.query(updateQuery, [novoStatus, id]);
      }
    }
    return result.rows[0];
  },

  // Função para calcular o saldo total das contas do usuário
  async getSaldoTotalContas(userId) {
    // Tentar com aspas duplas primeiro (case-sensitive)
    let result;
    try {
      result = await pool.query(
        'SELECT COALESCE(SUM("Conta_Saldo"), 0) as saldo_total FROM "Conta" WHERE "Usuario_Id" = $1 AND "Conta_Ativo" = TRUE',
        [userId]
      );
    } catch (err) {
      // Se falhar, tentar sem aspas (minúscula)
      result = await pool.query(
        'SELECT COALESCE(SUM(conta_saldo), 0) as saldo_total FROM conta WHERE usuario_id = $1 AND conta_ativo = TRUE',
        [userId]
      );
    }
    return parseFloat(result.rows[0].saldo_total || 0);
  },

  // Outras funções reutilizáveis...
};

module.exports = userRepository;