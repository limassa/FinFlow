/**
 * Script para criar toda a estrutura do banco de dados local
 * Execute: node scripts/criar-banco-local.js
 */

const path = require('path');
const configPath = path.join(__dirname, '..', 'config.env');
console.log('📄 Carregando configurações de:', configPath);
require('dotenv').config({ path: configPath });

const { Pool } = require('pg');

// Forçar conexão LOCAL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

console.log('🏠 Conectando ao banco LOCAL:');
console.log('   Host:', process.env.DB_HOST || 'localhost');
console.log('   Porta:', process.env.DB_PORT || 5433);
console.log('   Database:', process.env.DB_NAME || 'FinFlowTeste');

async function criarEstrutura() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔧 Criando estrutura do banco de dados...\n');

    // 1. Tabela USUARIO
    console.log('👤 Criando tabela usuario...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuario (
        usuario_id SERIAL PRIMARY KEY,
        usuario_email VARCHAR(255) UNIQUE NOT NULL,
        usuario_senha VARCHAR(255) NOT NULL,
        usuario_nome VARCHAR(255) NOT NULL,
        usuario_telefone VARCHAR(50),
        usuario_ativo BOOLEAN DEFAULT TRUE,
        usuario_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario_resettoken VARCHAR(255),
        usuario_resetexpiry TIMESTAMP,
        usuario_lembretes_email BOOLEAN DEFAULT FALSE,
        usuario_lembretes_whatsapp BOOLEAN DEFAULT FALSE,
        usuario_lembretes_horario TIME DEFAULT '08:00',
        usuario_whatsapp VARCHAR(20),
        usuario_foto TEXT,
        usuario_foto_atualizada_em TIMESTAMP
      )
    `);
    console.log('✅ Tabela usuario criada!\n');

    // 2. Tabela CONTA
    console.log('🏦 Criando tabela conta...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS conta (
        conta_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
        conta_nome VARCHAR(255) NOT NULL,
        conta_tipo VARCHAR(100),
        conta_saldo DECIMAL(15,2) DEFAULT 0,
        conta_banco VARCHAR(100),
        conta_ativo BOOLEAN DEFAULT TRUE,
        conta_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela conta criada!\n');

    // 3. Tabela RECEITA
    console.log('💰 Criando tabela receita...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS receita (
        receita_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
        conta_id INTEGER REFERENCES conta(conta_id),
        receita_descricao VARCHAR(255) NOT NULL,
        receita_valor DECIMAL(15,2) NOT NULL,
        receita_data DATE NOT NULL,
        receita_tipo VARCHAR(100),
        receita_recebido BOOLEAN DEFAULT FALSE,
        receita_recorrente BOOLEAN DEFAULT FALSE,
        receita_frequencia VARCHAR(50),
        receita_proximasparcelas INTEGER DEFAULT 0,
        receita_ativo BOOLEAN DEFAULT TRUE,
        receita_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_receita_usuario ON receita(usuario_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_receita_data ON receita(receita_data)');
    console.log('✅ Tabela receita criada!\n');

    // 4. Tabela DESPESA
    console.log('💸 Criando tabela despesa...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS despesa (
        despesa_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
        conta_id INTEGER REFERENCES conta(conta_id),
        despesa_descricao VARCHAR(255) NOT NULL,
        despesa_valor DECIMAL(15,2) NOT NULL,
        despesa_data DATE NOT NULL,
        despesa_dtvencimento DATE,
        despesa_tipo VARCHAR(100),
        despesa_pago BOOLEAN DEFAULT FALSE,
        despesa_recorrente BOOLEAN DEFAULT FALSE,
        despesa_frequencia VARCHAR(50),
        despesa_proximasparcelas INTEGER DEFAULT 0,
        despesa_ativo BOOLEAN DEFAULT TRUE,
        despesa_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_despesa_usuario ON despesa(usuario_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_despesa_data ON despesa(despesa_data)');
    console.log('✅ Tabela despesa criada!\n');

    // 5. Tabela META_DESPESA
    console.log('🎯 Criando tabela meta_despesa...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS meta_despesa (
        meta_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
        categoria VARCHAR(100) NOT NULL,
        valor_meta DECIMAL(15,2) NOT NULL,
        periodo VARCHAR(50) DEFAULT 'mensal',
        mes INTEGER,
        ano INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_meta_usuario ON meta_despesa(usuario_id)');
    console.log('✅ Tabela meta_despesa criada!\n');

    // 6. Tabela EVENTO
    console.log('📅 Criando tabela evento...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS evento (
        evento_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
        evento_titulo VARCHAR(200) NOT NULL,
        evento_descricao TEXT,
        evento_data DATE NOT NULL,
        evento_hora_inicio TIME,
        evento_hora_fim TIME,
        evento_tipo VARCHAR(50) DEFAULT 'geral',
        evento_cor VARCHAR(20) DEFAULT '#4F46E5',
        evento_recorrente BOOLEAN DEFAULT FALSE,
        evento_frequencia VARCHAR(20),
        evento_lembrete BOOLEAN DEFAULT TRUE,
        evento_lembrete_minutos INTEGER DEFAULT 30,
        receita_id INTEGER REFERENCES receita(receita_id),
        despesa_id INTEGER REFERENCES despesa(despesa_id),
        evento_ativo BOOLEAN DEFAULT TRUE,
        evento_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        evento_atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_evento_usuario ON evento(usuario_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_evento_data ON evento(evento_data)');
    console.log('✅ Tabela evento criada!\n');

    // 7. Tabela CARTAO_CREDITO
    console.log('💳 Criando tabela cartao_credito...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cartao_credito (
        cartao_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
        cartao_nome VARCHAR(100) NOT NULL,
        cartao_bandeira VARCHAR(50),
        cartao_limite DECIMAL(15,2) DEFAULT 0,
        cartao_dia_fechamento INTEGER DEFAULT 1,
        cartao_dia_vencimento INTEGER DEFAULT 10,
        cartao_cor VARCHAR(20) DEFAULT '#4F46E5',
        cartao_ativo BOOLEAN DEFAULT TRUE,
        cartao_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_cartao_usuario ON cartao_credito(usuario_id)');
    console.log('✅ Tabela cartao_credito criada!\n');

    // 8. Tabela COMPRA_CARTAO
    console.log('🛒 Criando tabela compra_cartao...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS compra_cartao (
        compra_id SERIAL PRIMARY KEY,
        cartao_id INTEGER NOT NULL REFERENCES cartao_credito(cartao_id),
        usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
        compra_descricao VARCHAR(200) NOT NULL,
        compra_valor_total DECIMAL(15,2) NOT NULL,
        compra_data DATE NOT NULL,
        compra_categoria VARCHAR(100),
        compra_parcelas INTEGER DEFAULT 1,
        compra_parcela_atual INTEGER DEFAULT 1,
        compra_valor_parcela DECIMAL(15,2),
        compra_mes_fatura VARCHAR(7),
        compra_ativo BOOLEAN DEFAULT TRUE,
        compra_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_compra_cartao ON compra_cartao(cartao_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_compra_usuario ON compra_cartao(usuario_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_compra_mes_fatura ON compra_cartao(compra_mes_fatura)');
    console.log('✅ Tabela compra_cartao criada!\n');

    // 9. Tabela CATEGORIA_CUSTOMIZADA
    console.log('🏷️ Criando tabela categoria_customizada...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categoria_customizada (
        categoria_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
        categoria_nome VARCHAR(100) NOT NULL,
        categoria_tipo VARCHAR(20) NOT NULL,
        categoria_icone VARCHAR(50) DEFAULT 'ellipsis-horizontal',
        categoria_cor VARCHAR(20) DEFAULT '#6B7280',
        categoria_ordem INTEGER DEFAULT 0,
        categoria_ativo BOOLEAN DEFAULT TRUE,
        categoria_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, categoria_nome, categoria_tipo)
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_categoria_usuario ON categoria_customizada(usuario_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_categoria_tipo ON categoria_customizada(categoria_tipo)');
    console.log('✅ Tabela categoria_customizada criada!\n');

    // 10. Tabela ORCAMENTO_MENSAL
    console.log('📊 Criando tabela orcamento_mensal...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orcamento_mensal (
        orcamento_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(usuario_id),
        orcamento_categoria VARCHAR(100) NOT NULL,
        orcamento_valor DECIMAL(15,2) NOT NULL,
        orcamento_mes VARCHAR(7) NOT NULL,
        orcamento_ativo BOOLEAN DEFAULT TRUE,
        orcamento_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, orcamento_categoria, orcamento_mes)
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_orcamento_usuario ON orcamento_mensal(usuario_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orcamento_mes ON orcamento_mensal(orcamento_mes)');
    console.log('✅ Tabela orcamento_mensal criada!\n');

    // 11. Tabela VERSAO_SISTEMA
    console.log('📌 Criando tabela versao_sistema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS versao_sistema (
        id SERIAL PRIMARY KEY,
        versao VARCHAR(50) NOT NULL,
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        descricao TEXT,
        commit_hash VARCHAR(100),
        branch VARCHAR(100)
      )
    `);
    console.log('✅ Tabela versao_sistema criada!\n');

    // 12. Tabela FALE_CONOSCO
    console.log('📧 Criando tabela fale_conosco...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fale_conosco (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuario(usuario_id),
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        assunto VARCHAR(255),
        mensagem TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        respondido BOOLEAN DEFAULT FALSE,
        resposta TEXT,
        respondido_em TIMESTAMP
      )
    `);
    console.log('✅ Tabela fale_conosco criada!\n');

    // Criar usuário de teste (hash bcrypt pré-gerada para senha "123456")
    console.log('👤 Criando usuário de teste...');
    const senhaHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // senha: 123456
    
    try {
      await client.query(`
        INSERT INTO usuario (usuario_email, usuario_senha, usuario_nome, usuario_telefone)
        VALUES ('teste@teste.com', $1, 'Usuário Teste', '11999999999')
        ON CONFLICT (usuario_email) DO NOTHING
      `, [senhaHash]);
      console.log('✅ Usuário de teste criado (email: teste@teste.com, senha: 123456)\n');
    } catch (e) {
      console.log('   Usuário de teste já existe\n');
    }

    // Criar conta padrão para o usuário de teste
    console.log('🏦 Criando conta padrão...');
    try {
      const userResult = await client.query("SELECT usuario_id FROM usuario WHERE usuario_email = 'teste@teste.com'");
      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].usuario_id;
        await client.query(`
          INSERT INTO conta (usuario_id, conta_nome, conta_tipo, conta_saldo, conta_banco)
          VALUES ($1, 'Conta Principal', 'Corrente', 1000.00, 'Nubank')
          ON CONFLICT DO NOTHING
        `, [userId]);
        console.log('✅ Conta padrão criada!\n');
      }
    } catch (e) {
      console.log('   Conta padrão já existe\n');
    }

    console.log('🎉 ============================================');
    console.log('🎉 BANCO DE DADOS LOCAL CONFIGURADO COM SUCESSO!');
    console.log('🎉 ============================================');
    console.log('\n📋 Usuário de teste:');
    console.log('   Email: teste@teste.com');
    console.log('   Senha: 123456');
    console.log('\n🚀 Agora você pode iniciar o backend: npm start');
    
  } catch (error) {
    console.error('❌ Erro ao criar estrutura:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

criarEstrutura()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
