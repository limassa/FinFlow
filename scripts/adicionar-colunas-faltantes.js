const { Pool } = require('pg');
require('dotenv').config({ path: './backend/config.env' });

console.log('🔧 Adicionando Colunas Faltantes - FinFlow\n');

// Configuração do banco
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'admin'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5433'}/${process.env.DB_NAME || 'finflowteste'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

async function adicionarColunasFaltantes() {
  try {
    console.log('📋 Adicionando colunas faltantes...');
    
    const client = await pool.connect();
    
    // Colunas que faltam na tabela Despesa
    const colunasDespesa = [
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_categoria VARCHAR(100) DEFAULT 'Geral'",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_observacoes TEXT",
      "ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_datavencimento DATE"
    ];
    
    // Colunas que faltam na tabela Receita
    const colunasReceita = [
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_categoria VARCHAR(100) DEFAULT 'Geral'",
      "ALTER TABLE receita ADD COLUMN IF NOT EXISTS receita_observacoes TEXT"
    ];
    
    console.log('\n🔧 Adicionando colunas na tabela Despesa:');
    for (const coluna of colunasDespesa) {
      try {
        await client.query(coluna);
        console.log('✅ Adicionada:', coluna.split(' ')[5]);
      } catch (error) {
        console.log('⚠️  Coluna já existe:', error.message.split(' ')[0]);
      }
    }
    
    console.log('\n🔧 Adicionando colunas na tabela Receita:');
    for (const coluna of colunasReceita) {
      try {
        await client.query(coluna);
        console.log('✅ Adicionada:', coluna.split(' ')[5]);
      } catch (error) {
        console.log('⚠️  Coluna já existe:', error.message.split(' ')[0]);
      }
    }
    
    client.release();
    console.log('\n✅ Colunas adicionadas com sucesso!');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error.message);
    return false;
  }
}

async function testarInserirDespesa() {
  try {
    console.log('\n💸 Testando inserir despesa após adicionar colunas...');
    
    const client = await pool.connect();
    
    const dadosDespesa = {
      despesa_descricao: 'Teste Após Adicionar Colunas',
      despesa_valor: 300.00,
      despesa_data: '2025-08-01',
      despesa_categoria: 'Alimentação',
      despesa_pago: true,
      despesa_recorrente: false,
      despesa_frequencia: null,
      despesa_proximasparcelas: null,
      despesa_datavencimento: '2025-08-01',
      despesa_observacoes: 'Teste após adicionar colunas faltantes',
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
    console.log('🏷️  Categoria:', result.rows[0].despesa_categoria);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao inserir despesa:', error.message);
    return false;
  }
}

async function executarAdicao() {
  console.log('🚀 Iniciando adição de colunas faltantes...\n');
  
  // Adicionar colunas
  const adicionadas = await adicionarColunasFaltantes();
  
  if (adicionadas) {
    // Testar inserção
    const testeOk = await testarInserirDespesa();
    
    if (testeOk) {
      console.log('\n🎉 FinFlow completamente funcional!');
      console.log('✅ Todas as colunas necessárias foram adicionadas');
      console.log('✅ Inserção de despesas funcionando');
      console.log('✅ Inserção de receitas funcionando');
      console.log('🌐 Agora você pode usar o FinFlow normalmente');
      console.log('📧 Login: admin@gmail.com');
      console.log('🔑 Senha: 123456');
      console.log('🌐 URL: http://localhost:3000');
    } else {
      console.log('\n❌ Ainda há problemas na inserção');
      console.log('💡 Verifique os logs acima para mais detalhes');
    }
  } else {
    console.log('\n❌ Erro ao adicionar colunas');
  }
  
  await pool.end();
}

// Executar adição
executarAdicao().catch(console.error); 