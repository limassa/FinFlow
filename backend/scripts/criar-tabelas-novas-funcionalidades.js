/**
 * Script para criar as novas tabelas:
 * - evento (Agenda/Calendário)
 * - cartao_credito (Cartões de Crédito)
 * - compra_cartao (Compras no Cartão)
 * - categoria_customizada (Categorias Customizáveis)
 * - orcamento_mensal (Orçamento Mensal)
 * - Coluna usuario_foto na tabela usuario
 */

require('dotenv').config({ path: '../config.env' });
require('dotenv').config();

const { Pool } = require('pg');

// Configuração do banco
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_PUBLIC_URL ou DATABASE_URL não configurada!');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function criarTabelas() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Iniciando criação das novas tabelas...\n');

    // 1. Tabela EVENTO
    console.log('📅 Criando tabela evento...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS evento (
        evento_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
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
        receita_id INTEGER,
        despesa_id INTEGER,
        evento_ativo BOOLEAN DEFAULT TRUE,
        evento_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        evento_atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_evento_usuario ON evento(usuario_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_evento_data ON evento(evento_data)');
    console.log('✅ Tabela evento criada!\n');

    // 2. Tabela CARTAO_CREDITO
    console.log('💳 Criando tabela cartao_credito...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cartao_credito (
        cartao_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
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

    // 3. Tabela COMPRA_CARTAO
    console.log('🛒 Criando tabela compra_cartao...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS compra_cartao (
        compra_id SERIAL PRIMARY KEY,
        cartao_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
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

    // 4. Tabela CATEGORIA_CUSTOMIZADA
    console.log('🏷️ Criando tabela categoria_customizada...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categoria_customizada (
        categoria_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        categoria_nome VARCHAR(100) NOT NULL,
        categoria_tipo VARCHAR(20) NOT NULL,
        categoria_icone VARCHAR(50) DEFAULT 'ellipsis-horizontal',
        categoria_cor VARCHAR(20) DEFAULT '#6B7280',
        categoria_ordem INTEGER DEFAULT 0,
        categoria_ativo BOOLEAN DEFAULT TRUE,
        categoria_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_categoria_usuario ON categoria_customizada(usuario_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_categoria_tipo ON categoria_customizada(categoria_tipo)');
    // Tentar criar constraint única (pode falhar se já existe)
    try {
      await client.query(`
        ALTER TABLE categoria_customizada 
        ADD CONSTRAINT uk_categoria_usuario_nome_tipo 
        UNIQUE(usuario_id, categoria_nome, categoria_tipo)
      `);
    } catch (e) {
      console.log('   (Constraint já existe)');
    }
    console.log('✅ Tabela categoria_customizada criada!\n');

    // 5. Tabela ORCAMENTO_MENSAL
    console.log('📊 Criando tabela orcamento_mensal...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orcamento_mensal (
        orcamento_id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        orcamento_categoria VARCHAR(100) NOT NULL,
        orcamento_valor DECIMAL(15,2) NOT NULL,
        orcamento_mes VARCHAR(7) NOT NULL,
        orcamento_ativo BOOLEAN DEFAULT TRUE,
        orcamento_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_orcamento_usuario ON orcamento_mensal(usuario_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orcamento_mes ON orcamento_mensal(orcamento_mes)');
    try {
      await client.query(`
        ALTER TABLE orcamento_mensal 
        ADD CONSTRAINT uk_orcamento_usuario_cat_mes 
        UNIQUE(usuario_id, orcamento_categoria, orcamento_mes)
      `);
    } catch (e) {
      console.log('   (Constraint já existe)');
    }
    console.log('✅ Tabela orcamento_mensal criada!\n');

    // 6. Adicionar coluna usuario_foto na tabela usuario
    console.log('📸 Adicionando coluna usuario_foto...');
    try {
      await client.query('ALTER TABLE usuario ADD COLUMN IF NOT EXISTS usuario_foto TEXT');
      await client.query('ALTER TABLE usuario ADD COLUMN IF NOT EXISTS usuario_foto_atualizada_em TIMESTAMP');
    } catch (e) {
      // Tentar com nome em maiúsculas
      try {
        await client.query('ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "Usuario_Foto" TEXT');
        await client.query('ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "Usuario_Foto_Atualizada_Em" TIMESTAMP');
      } catch (e2) {
        console.log('   (Coluna já existe ou tabela com outro formato)');
      }
    }
    console.log('✅ Coluna usuario_foto adicionada!\n');

    console.log('🎉 Todas as tabelas foram criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

criarTabelas()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
