// Script para encontrar usuário com mais dados na produção
const { Pool } = require('pg');

const RAILWAY_DB_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: RAILWAY_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function encontrarUsuario() {
  console.log('🔍 Encontrando usuário com mais dados na produção...\n');
  
  try {
    const result = await pool.query(`
      SELECT 
        u.usuario_id,
        u.usuario_nome,
        u.usuario_email,
        COUNT(DISTINCT c.conta_id) as total_contas,
        COUNT(DISTINCT r.receita_id) as total_receitas,
        COUNT(DISTINCT d.despesa_id) as total_despesas,
        (COUNT(DISTINCT c.conta_id) + COUNT(DISTINCT r.receita_id) + COUNT(DISTINCT d.despesa_id)) as total_geral
      FROM usuario u
      LEFT JOIN conta c ON c.usuario_id = u.usuario_id AND c.conta_ativo = TRUE
      LEFT JOIN receita r ON r.usuario_id = u.usuario_id AND r.receita_ativo = TRUE
      LEFT JOIN despesa d ON d.usuario_id = u.usuario_id AND d.despesa_ativo = TRUE
      GROUP BY u.usuario_id, u.usuario_nome, u.usuario_email
      HAVING (COUNT(DISTINCT c.conta_id) + COUNT(DISTINCT r.receita_id) + COUNT(DISTINCT d.despesa_id)) > 0
      ORDER BY total_geral DESC
      LIMIT 10
    `);
    
    if (result.rows.length === 0) {
      console.log('⚠️  Nenhum usuário com dados encontrado');
      return;
    }
    
    console.log('📊 Usuários com dados (ordenados por total):\n');
    result.rows.forEach((u, i) => {
      console.log(`${i + 1}. ID: ${u.usuario_id} - ${u.usuario_nome}`);
      console.log(`   Email: ${u.usuario_email}`);
      console.log(`   Contas: ${u.total_contas} | Receitas: ${u.total_receitas} | Despesas: ${u.total_despesas}`);
      console.log(`   Total: ${u.total_geral} registros\n`);
    });
    
    const melhorUsuario = result.rows[0];
    console.log(`✅ Melhor candidato: ID ${melhorUsuario.usuario_id} - ${melhorUsuario.usuario_nome}`);
    console.log(`   Total: ${melhorUsuario.total_geral} registros\n`);
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    if (err.detail) {
      console.error('   Detalhes:', err.detail);
    }
  } finally {
    await pool.end();
  }
}

encontrarUsuario().catch(console.error);

