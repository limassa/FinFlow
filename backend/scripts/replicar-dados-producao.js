// Script para replicar dados de produção (contas e despesas) para o banco de teste
const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

// URL do Railway (produção)
const RAILWAY_DB_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

// Pool para produção
const poolProducao = process.env.DATABASE_URL_PRODUCTION 
  ? new Pool({
      connectionString: process.env.DATABASE_URL_PRODUCTION,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      connectionString: RAILWAY_DB_URL,
      ssl: { rejectUnauthorized: false }
    });

// Pool para teste (local)
const poolTeste = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function replicarDados() {
  console.log('🔄 Replicando dados de produção para teste...\n');
  
  if (!poolProducao) {
    console.log('⚠️  DATABASE_URL_PRODUCTION não configurada');
    console.log('💡 Adicione no config.env:');
    console.log('   DATABASE_URL_PRODUCTION=postgresql://user:pass@host:port/db\n');
    console.log('📋 Tentando usar DATABASE_URL do config.env...\n');
    
    // Tentar usar DATABASE_URL se for de produção
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway') || process.env.DATABASE_URL.includes('production')) {
      console.log('✅ Usando DATABASE_URL para produção\n');
      const poolProd = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      await replicarDePool(poolProd, poolTeste);
      await poolProd.end();
    } else {
      console.log('❌ Não foi possível conectar à produção');
      console.log('💡 Configure DATABASE_URL_PRODUCTION no config.env\n');
      return;
    }
  } else {
    await replicarDePool(poolProducao, poolTeste);
  }
  
  await poolTeste.end();
}

async function replicarDePool(poolProd, poolTeste) {
  try {
    // 1. Verificar conexão com produção
    console.log('🔍 Conectando à produção...');
    await poolProd.query('SELECT 1');
    console.log('✅ Conectado à produção\n');
    
    // 2. Buscar usuário na produção (assumindo que existe usuário com ID 1)
    console.log('📋 Buscando usuário na produção...');
    let usuarioProd;
    try {
      usuarioProd = await poolProd.query('SELECT * FROM "Usuario" WHERE "Usuario_Id" = 1');
    } catch (err) {
      // Tentar sem aspas (minúscula)
      try {
        usuarioProd = await poolProd.query('SELECT * FROM usuario WHERE usuario_id = 1');
      } catch (err2) {
        console.log('❌ Não foi possível encontrar tabela de usuários');
        console.log('💡 Verificando tabelas disponíveis...\n');
        const tabelas = await poolProd.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND (table_name ILIKE '%usuario%' OR table_name ILIKE '%user%')
          ORDER BY table_name
        `);
        if (tabelas.rows.length > 0) {
          console.log('📋 Tabelas encontradas:');
          tabelas.rows.forEach(t => console.log(`   - ${t.table_name}`));
        }
        return;
      }
    }
    
    if (usuarioProd.rows.length === 0) {
      console.log('⚠️  Usuário ID 1 não encontrado na produção');
      console.log('💡 Verificando se há outros usuários...\n');
      const todosUsuarios = await poolProd.query('SELECT "Usuario_Id", "Usuario_Email", "Usuario_Nome" FROM "Usuario" LIMIT 5');
      if (todosUsuarios.rows.length > 0) {
        console.log('📋 Usuários encontrados na produção:');
        todosUsuarios.rows.forEach(u => {
          console.log(`   ID: ${u.Usuario_Id} - ${u.Usuario_Nome} (${u.Usuario_Email})`);
        });
        console.log('\n💡 Use o ID do usuário que deseja replicar\n');
      }
      return;
    }
    
    const usuario = usuarioProd.rows[0];
    console.log(`✅ Usuário encontrado: ${usuario.Usuario_Nome} (ID: ${usuario.Usuario_Id})\n`);
    
    // 3. Verificar se usuário existe no teste
    console.log('📋 Verificando usuário no banco de teste...');
    let usuarioTeste;
    try {
      usuarioTeste = await poolTeste.query('SELECT * FROM "Usuario" WHERE "Usuario_Id" = 1');
    } catch (err) {
      usuarioTeste = await poolTeste.query('SELECT * FROM usuario WHERE usuario_id = 1');
    }
    
    if (usuarioTeste.rows.length === 0) {
      console.log('⚠️  Usuário não existe no teste. Criando...');
      await poolTeste.query(`
        INSERT INTO "Usuario" 
          ("Usuario_Id", "Usuario_Email", "Usuario_Senha", "Usuario_Nome", "Usuario_Telefone", 
           "Usuario_Ativo", "Usuario_LembretesAtivos", "Usuario_LembretesEmail", 
           "Usuario_LembretesWhatsApp", "Usuario_LembretesDiasAntes", "Usuario_LembretesHorario")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT ("Usuario_Id") DO NOTHING
      `, [
        usuario.Usuario_Id, usuario.Usuario_Email, usuario.Usuario_Senha, 
        usuario.Usuario_Nome, usuario.Usuario_Telefone || null,
        usuario.Usuario_Ativo !== false, 
        usuario.Usuario_LembretesAtivos || false,
        usuario.Usuario_LembretesEmail || false,
        usuario.Usuario_LembretesWhatsApp || false,
        usuario.Usuario_LembretesDiasAntes || 5,
        usuario.Usuario_LembretesHorario || null
      ]);
      console.log('✅ Usuário criado no teste\n');
    } else {
      console.log('✅ Usuário já existe no teste\n');
    }
    
    // 4. Replicar Contas
    console.log('📋 Replicando contas...');
    let contasProd;
    try {
      contasProd = await poolProd.query('SELECT * FROM "Conta" WHERE "Usuario_Id" = 1 AND "Conta_Ativo" = TRUE');
    } catch (err) {
      contasProd = await poolProd.query('SELECT * FROM conta WHERE usuario_id = 1 AND conta_ativo = TRUE');
    }
    console.log(`   Encontradas ${contasProd.rows.length} contas na produção`);
    
    for (const conta of contasProd.rows) {
      try {
        await poolTeste.query(`
          INSERT INTO "Conta" 
            ("Conta_Nome", "Conta_Tipo", "Conta_Saldo", "Usuario_Id", "Conta_Ativo", 
             "Conta_DtCriacao", "Conta_DtAtualizacao")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING
        `, [
          conta.Conta_Nome, conta.Conta_Tipo, conta.Conta_Saldo, 
          conta.Usuario_Id, conta.Conta_Ativo !== false,
          conta.Conta_DtCriacao || new Date(), conta.Conta_DtAtualizacao || new Date()
        ]);
        console.log(`   ✅ Conta replicada: ${conta.Conta_Nome}`);
      } catch (err) {
        console.log(`   ⚠️  Erro ao replicar conta ${conta.Conta_Nome}: ${err.message.split('\n')[0]}`);
      }
    }
    console.log('');
    
    // 5. Replicar Receitas
    console.log('📋 Replicando receitas...');
    let receitasProd;
    try {
      receitasProd = await poolProd.query('SELECT * FROM "Receita" WHERE "Usuario_Id" = 1 AND "Receita_Ativo" = TRUE');
    } catch (err) {
      receitasProd = await poolProd.query('SELECT * FROM receita WHERE usuario_id = 1 AND receita_ativo = TRUE');
    }
    console.log(`   Encontradas ${receitasProd.rows.length} receitas na produção`);
    
    for (const receita of receitasProd.rows) {
      try {
        await poolTeste.query(`
          INSERT INTO "Receita" 
            ("Receita_Descricao", "Receita_Valor", "Receita_Data", "Receita_Tipo", 
             "Usuario_Id", "Receita_Recebido", "Conta_id", "Receita_Ativo",
             "Receita_Recorrente", "Receita_Frequencia", "Receita_ProximasParcelas",
             "Receita_DtCriacao", "Receita_DtAtualizacao")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT DO NOTHING
        `, [
          receita.Receita_Descricao, receita.Receita_Valor, receita.Receita_Data,
          receita.Receita_Tipo, receita.Usuario_Id, receita.Receita_Recebido || false,
          receita.Conta_id || null, receita.Receita_Ativo !== false,
          receita.Receita_Recorrente || false, receita.Receita_Frequencia || 'mensal',
          receita.Receita_ProximasParcelas || 12,
          receita.Receita_DtCriacao || new Date(), receita.Receita_DtAtualizacao || new Date()
        ]);
        console.log(`   ✅ Receita replicada: ${receita.Receita_Descricao}`);
      } catch (err) {
        console.log(`   ⚠️  Erro ao replicar receita ${receita.Receita_Descricao}: ${err.message.split('\n')[0]}`);
      }
    }
    console.log('');
    
    // 6. Replicar Despesas
    console.log('📋 Replicando despesas...');
    let despesasProd;
    try {
      despesasProd = await poolProd.query('SELECT * FROM "Despesa" WHERE "Usuario_Id" = 1 AND "Despesa_Ativo" = TRUE');
    } catch (err) {
      despesasProd = await poolProd.query('SELECT * FROM despesa WHERE usuario_id = 1 AND despesa_ativo = TRUE');
    }
    console.log(`   Encontradas ${despesasProd.rows.length} despesas na produção`);
    
    for (const despesa of despesasProd.rows) {
      try {
        await poolTeste.query(`
          INSERT INTO "Despesa" 
            ("Despesa_Descricao", "Despesa_Valor", "Despesa_Data", "Despesa_DtVencimento",
             "Despesa_Tipo", "Despesa_Pago", "Conta_id", "Usuario_Id", "Despesa_Ativo",
             "Despesa_Recorrente", "Despesa_Frequencia", "Despesa_ProximasParcelas",
             "Despesa_DtCriacao", "Despesa_DtAtualizacao")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT DO NOTHING
        `, [
          despesa.Despesa_Descricao, despesa.Despesa_Valor, despesa.Despesa_Data,
          despesa.Despesa_DtVencimento || null, despesa.Despesa_Tipo,
          despesa.Despesa_Pago || false, despesa.Conta_id || null, despesa.Usuario_Id,
          despesa.Despesa_Ativo !== false,
          despesa.Despesa_Recorrente || false, despesa.Despesa_Frequencia || 'mensal',
          despesa.Despesa_ProximasParcelas || 12,
          despesa.Despesa_DtCriacao || new Date(), despesa.Despesa_DtAtualizacao || new Date()
        ]);
        console.log(`   ✅ Despesa replicada: ${despesa.Despesa_Descricao}`);
      } catch (err) {
        console.log(`   ⚠️  Erro ao replicar despesa ${despesa.Despesa_Descricao}: ${err.message.split('\n')[0]}`);
      }
    }
    console.log('');
    
    console.log('✅ Replicação concluída!\n');
    
    // Verificar dados replicados
    console.log('📊 Verificando dados replicados no teste:');
    const contasTeste = await poolTeste.query('SELECT COUNT(*) as total FROM "Conta" WHERE "Usuario_Id" = 1');
    const receitasTeste = await poolTeste.query('SELECT COUNT(*) as total FROM "Receita" WHERE "Usuario_Id" = 1');
    const despesasTeste = await poolTeste.query('SELECT COUNT(*) as total FROM "Despesa" WHERE "Usuario_Id" = 1');
    
    console.log(`   Contas: ${contasTeste.rows[0].total}`);
    console.log(`   Receitas: ${receitasTeste.rows[0].total}`);
    console.log(`   Despesas: ${despesasTeste.rows[0].total}\n`);
    
  } catch (err) {
    console.error('❌ Erro ao replicar:', err.message);
    if (err.code === '42P01') {
      console.error('   💡 Tabela não existe. Execute primeiro: node scripts/criar-tabelas-finflow-completo.js');
    }
  }
}

replicarDados().catch(console.error);

