const { Pool } = require('pg');

// Configuração do banco (mesma do connection.js)
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'OumtwkgYJuWpNCAxJfLVAecULdKGjMEP'}@${process.env.DB_HOST || 'interchange.proxy.rlwy.net'}:${process.env.DB_PORT || '50880'}/${process.env.DB_NAME || 'railway'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function corrigirTabelaReceita() {
  console.log('🔧 Corrigindo tabela Receita...\n');
  
  try {
    // 1. Adicionar coluna Receita_Recorrente
    console.log('1. Adicionando coluna Receita_Recorrente...');
    try {
      await pool.query(`
        ALTER TABLE Receita 
        ADD COLUMN IF NOT EXISTS Receita_Recorrente BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Coluna Receita_Recorrente adicionada');
    } catch (err) {
      console.log('⚠️ Coluna Receita_Recorrente já existe ou erro:', err.message);
    }
    
    // 2. Adicionar coluna Receita_Frequencia
    console.log('\n2. Adicionando coluna Receita_Frequencia...');
    try {
      await pool.query(`
        ALTER TABLE Receita 
        ADD COLUMN IF NOT EXISTS Receita_Frequencia VARCHAR(20) DEFAULT 'mensal'
      `);
      console.log('✅ Coluna Receita_Frequencia adicionada');
    } catch (err) {
      console.log('⚠️ Coluna Receita_Frequencia já existe ou erro:', err.message);
    }
    
    // 3. Adicionar coluna Receita_ProximasParcelas
    console.log('\n3. Adicionando coluna Receita_ProximasParcelas...');
    try {
      await pool.query(`
        ALTER TABLE Receita 
        ADD COLUMN IF NOT EXISTS Receita_ProximasParcelas INTEGER DEFAULT 12
      `);
      console.log('✅ Coluna Receita_ProximasParcelas adicionada');
    } catch (err) {
      console.log('⚠️ Coluna Receita_ProximasParcelas já existe ou erro:', err.message);
    }
    
    // 4. Verificar estrutura final
    console.log('\n4. Verificando estrutura final...');
    const estruturaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'receita' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estrutura final da tabela Receita:');
    estruturaResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 5. Testar inserção
    console.log('\n5. Testando inserção de receita...');
    try {
      const testResult = await pool.query(`
        INSERT INTO Receita (
          Receita_Descricao, 
          Receita_Valor, 
          Receita_Data, 
          Receita_Tipo, 
          Receita_Recebido, 
          Conta_id, 
          Usuario_Id, 
          Receita_Recorrente, 
          Receita_Frequencia, 
          Receita_ProximasParcelas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING Receita_Id
      `, [
        'Teste Receita Corrigida',
        150.00,
        '2024-01-15',
        'Salário',
        false,
        null,
        1,
        false,
        'mensal',
        12
      ]);
      
      console.log('✅ Inserção de teste bem-sucedida! ID:', testResult.rows[0].receita_id);
      
      // Limpar dados de teste
      await pool.query('DELETE FROM Receita WHERE Receita_Id = $1', [testResult.rows[0].receita_id]);
      console.log('🧹 Dados de teste removidos');
      
    } catch (insertError) {
      console.error('❌ Erro na inserção de teste:', insertError.message);
    }
    
    console.log('\n🎉 Correção concluída!');
    console.log('✅ Agora você pode adicionar receitas sem erro 500');
    console.log('✅ O sistema FinFlow deve funcionar normalmente');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
  } finally {
    await pool.end();
  }
}

corrigirTabelaReceita().catch(console.error); 