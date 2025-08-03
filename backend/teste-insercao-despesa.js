const { Pool } = require('pg');

// Configurações do banco Railway
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testarInsercaoDespesa() {
  try {
    console.log('🔄 Conectando ao banco Railway...');
    
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Dados de teste
    const despesaTeste = {
      descricao: 'Teste de Inserção',
      valor: 100.00,
      data: '2024-12-19',
      dataVencimento: '2024-12-25',
      tipo: 'Alimentação',
      pago: false,
      conta_id: 1,
      usuario_id: 1,
      recorrente: false,
      frequencia: 'mensal',
      proximasParcelas: 12
    };
    
    console.log('\n📝 Testando inserção com nomes de colunas corretos...');
    
    // Testar com nomes de colunas corretos (lowercase)
    const queryCorreta = `
      INSERT INTO despesa (
        despesa_descricao, 
        despesa_valor, 
        despesa_data, 
        despesa_datavencimento, 
        despesa_tipo, 
        despesa_pago, 
        conta_id, 
        usuario_id, 
        despesa_recorrente, 
        despesa_frequencia, 
        despesa_proximasparcelas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `;
    
    const params = [
      despesaTeste.descricao,
      despesaTeste.valor,
      despesaTeste.data,
      despesaTeste.dataVencimento,
      despesaTeste.tipo,
      despesaTeste.pago,
      despesaTeste.conta_id,
      despesaTeste.usuario_id,
      despesaTeste.recorrente,
      despesaTeste.frequencia,
      despesaTeste.proximasParcelas
    ];
    
    const result = await client.query(queryCorreta, params);
    console.log('✅ Inserção bem-sucedida:', result.rows[0]);
    
    // Limpar o teste
    await client.query('DELETE FROM despesa WHERE despesa_id = $1', [result.rows[0].despesa_id]);
    console.log('🧹 Teste removido do banco');
    
    client.release();
    console.log('\n🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro na inserção:', error.message);
    console.error('📋 Detalhes:', error);
  } finally {
    await pool.end();
  }
}

testarInsercaoDespesa(); 