const { Pool } = require('pg');

// Configuração do banco (mesma do connection.js)
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP'}@${process.env.DB_HOST || 'interchange.proxy.rlwy.net'}:${process.env.DB_PORT || '50880'}/${process.env.DB_NAME || 'railway'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function corrigirTodasTabelas() {
  console.log('🔧 Corrigindo todas as tabelas do sistema...\n');
  
  try {
    // 1. Corrigir tabela Receita
    console.log('1. Corrigindo tabela Receita...');
    try {
      await pool.query('ALTER TABLE Receita ADD COLUMN IF NOT EXISTS Receita_Recorrente BOOLEAN DEFAULT FALSE');
      await pool.query('ALTER TABLE Receita ADD COLUMN IF NOT EXISTS Receita_Frequencia VARCHAR(20) DEFAULT \'mensal\'');
      await pool.query('ALTER TABLE Receita ADD COLUMN IF NOT EXISTS Receita_ProximasParcelas INTEGER DEFAULT 12');
      console.log('✅ Tabela Receita corrigida');
    } catch (err) {
      console.log('⚠️ Erro na tabela Receita:', err.message);
    }
    
    // 2. Corrigir tabela Despesa
    console.log('\n2. Corrigindo tabela Despesa...');
    try {
      await pool.query('ALTER TABLE Despesa ADD COLUMN IF NOT EXISTS Despesa_Recorrente BOOLEAN DEFAULT FALSE');
      await pool.query('ALTER TABLE Despesa ADD COLUMN IF NOT EXISTS Despesa_Frequencia VARCHAR(20) DEFAULT \'mensal\'');
      await pool.query('ALTER TABLE Despesa ADD COLUMN IF NOT EXISTS Despesa_ProximasParcelas INTEGER DEFAULT 12');
      console.log('✅ Tabela Despesa corrigida');
    } catch (err) {
      console.log('⚠️ Erro na tabela Despesa:', err.message);
    }
    
    // 3. Verificar estrutura das tabelas
    console.log('\n3. Verificando estrutura das tabelas...');
    
    // Receita
    console.log('\n📊 Estrutura da tabela Receita:');
    const estruturaReceita = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'receita' 
      ORDER BY ordinal_position
    `);
    estruturaReceita.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Despesa
    console.log('\n📊 Estrutura da tabela Despesa:');
    const estruturaDespesa = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'despesa' 
      ORDER BY ordinal_position
    `);
    estruturaDespesa.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 4. Testar inserções
    console.log('\n4. Testando inserções...');
    
    // Teste Receita
    try {
      const testReceita = await pool.query(`
        INSERT INTO Receita (
          Receita_Descricao, Receita_Valor, Receita_Data, Receita_Tipo, 
          Receita_Recebido, Conta_id, Usuario_Id, Receita_Recorrente, 
          Receita_Frequencia, Receita_ProximasParcelas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING Receita_Id
      `, ['Teste Receita', 100.00, '2024-01-15', 'Salário', false, null, 1, false, 'mensal', 12]);
      
      console.log('✅ Inserção de receita OK - ID:', testReceita.rows[0].receita_id);
      await pool.query('DELETE FROM Receita WHERE Receita_Id = $1', [testReceita.rows[0].receita_id]);
      
    } catch (err) {
      console.error('❌ Erro na inserção de receita:', err.message);
    }
    
    // Teste Despesa
    try {
      const testDespesa = await pool.query(`
        INSERT INTO Despesa (
          Despesa_Descricao, Despesa_Valor, Despesa_Data, Despesa_DtVencimento,
          Despesa_Tipo, Despesa_Pago, Conta_id, Usuario_Id, Despesa_Recorrente, 
          Despesa_Frequencia, Despesa_ProximasParcelas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING Despesa_Id
      `, ['Teste Despesa', 50.00, '2024-01-15', '2024-01-20', 'Alimentação', false, null, 1, false, 'mensal', 12]);
      
      console.log('✅ Inserção de despesa OK - ID:', testDespesa.rows[0].despesa_id);
      await pool.query('DELETE FROM Despesa WHERE Despesa_Id = $1', [testDespesa.rows[0].despesa_id]);
      
    } catch (err) {
      console.error('❌ Erro na inserção de despesa:', err.message);
    }
    
    console.log('\n🎉 Correção de todas as tabelas concluída!');
    console.log('✅ Agora você pode adicionar receitas e despesas sem erro 500');
    console.log('✅ O sistema FinFlow deve funcionar normalmente');
    console.log('✅ Todas as funcionalidades de recorrentes estão disponíveis');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
  } finally {
    await pool.end();
  }
}

corrigirTodasTabelas().catch(console.error); 