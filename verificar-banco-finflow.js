const { Pool } = require('pg');
require('dotenv').config({ path: './backend/config.env' });

console.log('🗄️ Verificando Banco de Dados - FinFlow\n');

// Configuração do banco
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'admin'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5433'}/${process.env.DB_NAME || 'finflowteste'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

async function verificarTabelas() {
  try {
    console.log('📋 Verificando tabelas...');
    
    const client = await pool.connect();
    
    // Verificar tabela Usuario
    const usuarios = await client.query('SELECT * FROM Usuario LIMIT 5');
    console.log('✅ Tabela Usuario:', usuarios.rows.length, 'usuários');
    
    // Verificar tabela Receita
    const receitas = await client.query('SELECT * FROM Receita LIMIT 5');
    console.log('✅ Tabela Receita:', receitas.rows.length, 'receitas');
    
    // Verificar tabela Despesa
    const despesas = await client.query('SELECT * FROM Despesa LIMIT 5');
    console.log('✅ Tabela Despesa:', despesas.rows.length, 'despesas');
    
    // Verificar estrutura da tabela Despesa
    const estruturaDespesa = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'despesa' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estrutura da tabela Despesa:');
    estruturaDespesa.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    client.release();
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
    return false;
  }
}

async function testarInserirDespesa() {
  try {
    console.log('\n💸 Testando inserir despesa diretamente no banco...');
    
    const client = await pool.connect();
    
    const dadosDespesa = {
      despesa_descricao: 'Teste Direto Banco',
      despesa_valor: 200.00,
      despesa_data: '2025-08-01',
      despesa_categoria: 'Teste',
      despesa_pago: true,
      despesa_recorrente: false,
      despesa_frequencia: null,
      despesa_proximasparcelas: null,
      despesa_datavencimento: '2025-08-01',
      despesa_observacoes: 'Teste direto no banco',
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
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao inserir despesa:', error.message);
    return false;
  }
}

async function executarVerificacao() {
  console.log('🚀 Iniciando verificação do banco de dados...\n');
  
  // Verificar tabelas
  const tabelasOk = await verificarTabelas();
  
  if (tabelasOk) {
    // Testar inserir despesa
    await testarInserirDespesa();
    
    console.log('\n🎉 Banco de dados funcionando!');
    console.log('✅ Tabelas criadas corretamente');
    console.log('✅ Estrutura correta');
  } else {
    console.log('\n❌ Problemas no banco de dados');
    console.log('💡 Execute o script SQL:');
    console.log('  psql -U postgres -d finflowteste -f ScriptSQL.sql');
  }
  
  await pool.end();
}

// Executar verificação
executarVerificacao().catch(console.error); 