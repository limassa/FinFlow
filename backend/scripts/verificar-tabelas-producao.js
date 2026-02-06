// Script para verificar tabelas e dados na produção
const { Pool } = require('pg');

const RAILWAY_DB_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: RAILWAY_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function verificarProducao() {
  console.log('🔍 Verificando banco de produção (Railway)...\n');
  
  try {
    // Listar todas as tabelas
    console.log('📋 Listando todas as tabelas...');
    const tabelas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`   Total: ${tabelas.rows.length} tabelas\n`);
    
    // Separar tabelas do FinFlow
    const tabelasFinFlow = tabelas.rows.filter(t => {
      const nome = t.table_name.toLowerCase();
      return nome.includes('usuario') || nome.includes('user') ||
             nome.includes('receita') || nome.includes('despesa') ||
             nome.includes('conta') || nome.includes('account');
    });
    
    console.log('📋 TABELAS DO FINFLOW:');
    if (tabelasFinFlow.length > 0) {
      tabelasFinFlow.forEach(t => console.log(`   - ${t.table_name}`));
    } else {
      console.log('   ⚠️  Nenhuma tabela do FinFlow encontrada');
    }
    console.log('');
    
    // Verificar dados em cada formato possível
    const formatos = [
      { nome: 'Usuario (maiúscula com aspas)', query: 'SELECT COUNT(*) as total FROM "Usuario"' },
      { nome: 'usuario (minúscula)', query: 'SELECT COUNT(*) as total FROM usuario' },
      { nome: 'Receita (maiúscula com aspas)', query: 'SELECT COUNT(*) as total FROM "Receita"' },
      { nome: 'receita (minúscula)', query: 'SELECT COUNT(*) as total FROM receita' },
      { nome: 'Despesa (maiúscula com aspas)', query: 'SELECT COUNT(*) as total FROM "Despesa"' },
      { nome: 'despesa (minúscula)', query: 'SELECT COUNT(*) as total FROM despesa' },
      { nome: 'Conta (maiúscula com aspas)', query: 'SELECT COUNT(*) as total FROM "Conta"' },
      { nome: 'conta (minúscula)', query: 'SELECT COUNT(*) as total FROM conta' }
    ];
    
    console.log('📊 VERIFICANDO DADOS:');
    for (const formato of formatos) {
      try {
        const result = await pool.query(formato.query);
        const total = parseInt(result.rows[0].total);
        if (total > 0) {
          console.log(`   ✅ ${formato.nome}: ${total} registro(s)`);
        }
      } catch (err) {
        // Ignorar erros de tabela não existe
      }
    }
    console.log('');
    
    // Tentar buscar usuários de diferentes formas
    console.log('👤 BUSCANDO USUÁRIOS:');
    const formatosUsuario = [
      { nome: '"Usuario"', query: 'SELECT "Usuario_Id", "Usuario_Email", "Usuario_Nome" FROM "Usuario" LIMIT 5' },
      { nome: 'usuario', query: 'SELECT usuario_id, usuario_email, usuario_nome FROM usuario LIMIT 5' },
      { nome: 'users', query: 'SELECT id, email, full_name FROM users LIMIT 5' }
    ];
    
    for (const formato of formatosUsuario) {
      try {
        const result = await pool.query(formato.query);
        if (result.rows.length > 0) {
          console.log(`   ✅ Tabela ${formato.nome}:`);
          result.rows.forEach(u => {
            const id = u.Usuario_Id || u.usuario_id || u.id;
            const email = u.Usuario_Email || u.usuario_email || u.email;
            const nome = u.Usuario_Nome || u.usuario_nome || u.full_name;
            console.log(`      ID: ${id} - ${nome} (${email})`);
          });
        }
      } catch (err) {
        // Ignorar
      }
    }
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

verificarProducao().catch(console.error);

