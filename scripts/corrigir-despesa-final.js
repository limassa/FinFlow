const { Pool } = require('pg');

// Configuração do banco (mesma do connection.js)
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP'}@${process.env.DB_HOST || 'interchange.proxy.rlwy.net'}:${process.env.DB_PORT || '50880'}/${process.env.DB_NAME || 'railway'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function corrigirDespesaFinal() {
  console.log('🔧 Corrigindo problema específico da tabela Despesa...\n');
  
  try {
    // 1. Verificar nomes das colunas de vencimento
    console.log('1. Verificando colunas de vencimento...');
    const colunasVencimento = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'despesa' AND column_name LIKE '%vencimento%'
    `);
    
    console.log('📊 Colunas de vencimento encontradas:');
    colunasVencimento.rows.forEach(col => {
      console.log(`  - ${col.column_name}`);
    });
    
    // 2. Testar inserção com o nome correto da coluna
    console.log('\n2. Testando inserção com nome correto...');
    
    try {
      const testDespesa = await pool.query(`
        INSERT INTO Despesa (
          Despesa_Descricao, Despesa_Valor, Despesa_Data, Despesa_Datavencimento,
          Despesa_Tipo, Despesa_Pago, Conta_id, Usuario_Id, Despesa_Recorrente, 
          Despesa_Frequencia, Despesa_ProximasParcelas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING Despesa_Id
      `, ['Teste Despesa Final', 50.00, '2024-01-15', '2024-01-20', 'Alimentação', false, null, 1, false, 'mensal', 12]);
      
      console.log('✅ Inserção de despesa OK - ID:', testDespesa.rows[0].despesa_id);
      await pool.query('DELETE FROM Despesa WHERE Despesa_Id = $1', [testDespesa.rows[0].despesa_id]);
      
    } catch (err) {
      console.error('❌ Erro na inserção de despesa:', err.message);
      
      // 3. Se ainda houver erro, tentar sem a coluna de vencimento
      console.log('\n3. Tentando inserção sem coluna de vencimento...');
      try {
        const testDespesa2 = await pool.query(`
          INSERT INTO Despesa (
            Despesa_Descricao, Despesa_Valor, Despesa_Data,
            Despesa_Tipo, Despesa_Pago, Conta_id, Usuario_Id, Despesa_Recorrente, 
            Despesa_Frequencia, Despesa_ProximasParcelas
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
          RETURNING Despesa_Id
        `, ['Teste Despesa Sem Vencimento', 50.00, '2024-01-15', 'Alimentação', false, null, 1, false, 'mensal', 12]);
        
        console.log('✅ Inserção de despesa sem vencimento OK - ID:', testDespesa2.rows[0].despesa_id);
        await pool.query('DELETE FROM Despesa WHERE Despesa_Id = $1', [testDespesa2.rows[0].despesa_id]);
        
      } catch (err2) {
        console.error('❌ Erro na inserção sem vencimento:', err2.message);
      }
    }
    
    // 4. Verificar estrutura final
    console.log('\n4. Estrutura final da tabela Despesa:');
    const estruturaFinal = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'despesa' 
      ORDER BY ordinal_position
    `);
    
    estruturaFinal.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n🎉 Diagnóstico da tabela Despesa concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error.message);
  } finally {
    await pool.end();
  }
}

corrigirDespesaFinal().catch(console.error); 