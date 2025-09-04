const pool = require('./src/database/connection');

console.log('🔍 VERIFICANDO ESTRUTURA DAS TABELAS');
console.log('=====================================\n');

async function verificarEstrutura() {
  try {
    console.log('1. VERIFICANDO TABELA USUARIO');
    console.log('==============================');
    
    const usuarioColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'usuario' 
      ORDER BY ordinal_position
    `);
    
    console.log('   📋 Colunas da tabela Usuario:');
    usuarioColumns.rows.forEach(col => {
      console.log(`      - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n2. VERIFICANDO TABELA CONTA');
    console.log('============================');
    
    const contaColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'conta' 
      ORDER BY ordinal_position
    `);
    
    console.log('   📋 Colunas da tabela Conta:');
    contaColumns.rows.forEach(col => {
      console.log(`      - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n3. VERIFICANDO SE EXISTE COLUNA SALDO TOTAL');
    console.log('============================================');
    
    const saldoTotalExists = usuarioColumns.rows.find(col => 
      col.column_name.toLowerCase().includes('saldo') && 
      col.column_name.toLowerCase().includes('total')
    );
    
    if (saldoTotalExists) {
      console.log('   ✅ Coluna de saldo total encontrada:', saldoTotalExists.column_name);
    } else {
      console.log('   ❌ Coluna de saldo total NÃO encontrada!');
      console.log('   💡 Precisa adicionar a coluna ou remover a funcionalidade');
    }
    
  } catch (error) {
    console.log('💥 Erro ao verificar estrutura:', error.message);
  } finally {
    await pool.end();
  }
}

verificarEstrutura().catch(console.error);
