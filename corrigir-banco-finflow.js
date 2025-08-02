const { Pool } = require('pg');
require('dotenv').config({ path: './backend/config.env' });

console.log('🔧 Corrigindo Banco de Dados - FinFlow\n');

// Configuração do banco
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'admin'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5433'}/${process.env.DB_NAME || 'finflowteste'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

async function verificarEstruturaTabelas() {
  try {
    console.log('📋 Verificando estrutura das tabelas...');
    
    const client = await pool.connect();
    
    // Verificar se as tabelas existem
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuario', 'receita', 'despesa', 'conta', 'categoria')
      ORDER BY table_name
    `);
    
    console.log('✅ Tabelas encontradas:', tabelas.rows.map(t => t.table_name));
    
    // Verificar estrutura da tabela Usuario
    const estruturaUsuario = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuario' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estrutura da tabela Usuario:');
    estruturaUsuario.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar estrutura da tabela Receita
    const estruturaReceita = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'receita' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estrutura da tabela Receita:');
    estruturaReceita.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar estrutura da tabela Despesa
    const estruturaDespesa = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'despesa' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estrutura da tabela Despesa:');
    estruturaDespesa.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    client.release();
    
    return {
      usuario: estruturaUsuario.rows,
      receita: estruturaReceita.rows,
      despesa: estruturaDespesa.rows
    };
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error.message);
    return null;
  }
}

async function corrigirTabelaDespesa() {
  try {
    console.log('\n🔧 Corrigindo tabela Despesa...');
    
    const client = await pool.connect();
    
    // Adicionar colunas que podem estar faltando
    const alteracoes = [
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_descricao VARCHAR(255) NOT NULL DEFAULT 'Despesa'",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_valor DECIMAL(10,2) NOT NULL DEFAULT 0.00",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_data DATE NOT NULL DEFAULT CURRENT_DATE",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_categoria VARCHAR(100) NOT NULL DEFAULT 'Geral'",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_pago BOOLEAN NOT NULL DEFAULT false",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_recorrente BOOLEAN NOT NULL DEFAULT false",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_frequencia VARCHAR(50)",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_proximasparcelas INTEGER",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_datavencimento DATE",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_observacoes TEXT",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuario(usuario_id)",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_ativo BOOLEAN NOT NULL DEFAULT true",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_datacriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_dataatualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];
    
    for (const alteracao of alteracoes) {
      try {
        await client.query(alteracao);
        console.log('✅ Executado:', alteracao.split(' ')[5]); // Mostra apenas o nome da coluna
      } catch (error) {
        console.log('⚠️  Coluna já existe ou erro:', error.message.split(' ')[0]);
      }
    }
    
    client.release();
    console.log('✅ Tabela Despesa corrigida!');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela Despesa:', error.message);
    return false;
  }
}

async function corrigirTabelaReceita() {
  try {
    console.log('\n🔧 Corrigindo tabela Receita...');
    
    const client = await pool.connect();
    
    // Adicionar colunas que podem estar faltando
    const alteracoes = [
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_descricao VARCHAR(255) NOT NULL DEFAULT 'Receita'",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_valor DECIMAL(10,2) NOT NULL DEFAULT 0.00",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_data DATE NOT NULL DEFAULT CURRENT_DATE",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_categoria VARCHAR(100) NOT NULL DEFAULT 'Geral'",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_recebido BOOLEAN NOT NULL DEFAULT false",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_recorrente BOOLEAN NOT NULL DEFAULT false",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_frequencia VARCHAR(50)",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_proximasparcelas INTEGER",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_observacoes TEXT",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuario(usuario_id)",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_ativo BOOLEAN NOT NULL DEFAULT true",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_datacriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_dataatualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];
    
    for (const alteracao of alteracoes) {
      try {
        await client.query(alteracao);
        console.log('✅ Executado:', alteracao.split(' ')[5]); // Mostra apenas o nome da coluna
      } catch (error) {
        console.log('⚠️  Coluna já existe ou erro:', error.message.split(' ')[0]);
      }
    }
    
    client.release();
    console.log('✅ Tabela Receita corrigida!');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela Receita:', error.message);
    return false;
  }
}

async function testarInserirDespesa() {
  try {
    console.log('\n💸 Testando inserir despesa após correção...');
    
    const client = await pool.connect();
    
    const dadosDespesa = {
      despesa_descricao: 'Teste Após Correção',
      despesa_valor: 250.00,
      despesa_data: '2025-08-01',
      despesa_categoria: 'Teste',
      despesa_pago: true,
      despesa_recorrente: false,
      despesa_frequencia: null,
      despesa_proximasparcelas: null,
      despesa_datavencimento: '2025-08-01',
      despesa_observacoes: 'Teste após correção do banco',
      usuario_id: 1
    };
    
    const query = `
      INSERT INTO Despesa (
        despesa_descricao, despesa_valor, despesa_data, despesa_categoria,
        despesa_pago, despesa_recorrente, despesa_frequencia, despesa_proximasparcelas,
        despesa_datavencimento, despesa_observacoes, usuario_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      dadosDespesa.despesa_descricao,
      dadosDespesa.despesa_valor,
      dadosDespesa.despesa_data,
      dadosDespesa.despesa_categoria,
      dadosDespesa.despesa_pago,
      dadosDespesa.despesa_recorrente,
      dadosDespesa.despesa_frequencia,
      dadosDespesa.despesa_proximasparcelas,
      dadosDespesa.despesa_datavencimento,
      dadosDespesa.despesa_observacoes,
      dadosDespesa.usuario_id
    ];
    
    const result = await client.query(query, values);
    
    console.log('✅ Despesa inserida com sucesso!');
    console.log('📊 ID:', result.rows[0].despesa_id);
    console.log('📝 Descrição:', result.rows[0].despesa_descricao);
    console.log('💰 Valor:', result.rows[0].despesa_valor);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao inserir despesa:', error.message);
    return false;
  }
}

async function executarCorrecao() {
  console.log('🚀 Iniciando correção do banco de dados...\n');
  
  // Verificar estrutura atual
  const estrutura = await verificarEstruturaTabelas();
  
  if (!estrutura) {
    console.log('❌ Não foi possível verificar a estrutura do banco');
    console.log('💡 Verifique se o banco existe e está acessível');
    return;
  }
  
  // Corrigir tabelas
  await corrigirTabelaDespesa();
  await corrigirTabelaReceita();
  
  // Testar inserção
  const testeOk = await testarInserirDespesa();
  
  if (testeOk) {
    console.log('\n🎉 Banco de dados corrigido com sucesso!');
    console.log('✅ Estrutura das tabelas atualizada');
    console.log('✅ Inserção de despesas funcionando');
    console.log('🌐 Agora você pode usar o FinFlow normalmente');
    console.log('📧 Login: admin@gmail.com');
    console.log('🔑 Senha: 123456');
  } else {
    console.log('\n❌ Ainda há problemas no banco de dados');
    console.log('💡 Verifique os logs acima para mais detalhes');
  }
  
  await pool.end();
}

// Executar correção
executarCorrecao().catch(console.error); 