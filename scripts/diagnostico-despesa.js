const { Pool } = require('pg');

// Configuração do banco (mesma do connection.js)
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP'}@${process.env.DB_HOST || 'interchange.proxy.rlwy.net'}:${process.env.DB_PORT || '50880'}/${process.env.DB_NAME || 'railway'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function diagnosticarDespesa() {
  console.log('🔍 Diagnosticando problema com despesas...\n');
  
  try {
    // 1. Verificar se a tabela Despesa existe
    console.log('1. Verificando estrutura da tabela Despesa...');
    const estruturaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'despesa' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Colunas da tabela Despesa:');
    estruturaResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 2. Verificar se há dados de teste
    console.log('\n2. Verificando dados existentes...');
    const dadosResult = await pool.query('SELECT COUNT(*) as total FROM Despesa');
    console.log(`📊 Total de despesas: ${dadosResult.rows[0].total}`);
    
    // 3. Testar inserção de despesa
    console.log('\n3. Testando inserção de despesa...');
    const testData = {
      descricao: 'Teste Despesa',
      valor: 100.00,
      data: '2024-01-15',
      dataVencimento: '2024-01-20',
      tipo: 'Alimentação',
      pago: false,
      conta_id: null,
      usuario_id: 1,
      recorrente: false,
      frequencia: 'mensal',
      proximasParcelas: 12
    };
    
    try {
      const insertResult = await pool.query(`
        INSERT INTO Despesa (
          Despesa_Descricao, 
          Despesa_Valor, 
          Despesa_Data, 
          Despesa_DtVencimento,
          Despesa_Tipo, 
          Despesa_Pago, 
          Conta_id, 
          Usuario_Id, 
          Despesa_Recorrente, 
          Despesa_Frequencia, 
          Despesa_ProximasParcelas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING Despesa_Id
      `, [
        testData.descricao,
        testData.valor,
        testData.data,
        testData.dataVencimento,
        testData.tipo,
        testData.pago,
        testData.conta_id,
        testData.usuario_id,
        testData.recorrente,
        testData.frequencia,
        testData.proximasParcelas
      ]);
      
      console.log('✅ Inserção de teste bem-sucedida! ID:', insertResult.rows[0].despesa_id);
      
      // Limpar dados de teste
      await pool.query('DELETE FROM Despesa WHERE Despesa_Id = $1', [insertResult.rows[0].despesa_id]);
      console.log('🧹 Dados de teste removidos');
      
    } catch (insertError) {
      console.error('❌ Erro na inserção de teste:', insertError.message);
      console.error('Detalhes:', insertError);
    }
    
    // 4. Verificar se as colunas necessárias existem
    console.log('\n4. Verificando colunas necessárias...');
    const colunasNecessarias = [
      'Despesa_Recorrente',
      'Despesa_Frequencia', 
      'Despesa_ProximasParcelas'
    ];
    
    for (const coluna of colunasNecessarias) {
      const colunaResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'despesa' AND column_name = $1
      `, [coluna]);
      
      if (colunaResult.rows.length > 0) {
        console.log(`✅ Coluna ${coluna} existe`);
      } else {
        console.log(`❌ Coluna ${coluna} NÃO existe`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error.message);
  } finally {
    await pool.end();
  }
}

diagnosticarDespesa().catch(console.error); 