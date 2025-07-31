// Script para verificar estrutura completa do banco de dados
require('dotenv').config();

const { Pool } = require('pg');

console.log('🔍 Verificando estrutura completa do banco de dados...');

// URL do banco de dados do Railway
const DATABASE_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Estrutura esperada das tabelas
const expectedTables = {
  'usuario': [
    'usuario_id',
    'usuario_nome', 
    'usuario_email',
    'usuario_senha',
    'usuario_ativo',
    'usuario_datacriacao'
  ],
  'receita': [
    'receita_id',
    'receita_descricao',
    'receita_valor',
    'receita_data',
    'receita_tipo',
    'receita_recebido',
    'usuario_id',
    'conta_id',
    'receita_ativo',
    'receita_datacriacao'
  ],
  'despesa': [
    'despesa_id',
    'despesa_descricao',
    'despesa_valor',
    'despesa_data',
    'despesa_datavencimento',
    'despesa_tipo',
    'despesa_pago',
    'usuario_id',
    'conta_id',
    'despesa_ativo',
    'despesa_datacriacao'
  ],
  'conta': [
    'conta_id',
    'conta_nome',
    'conta_tipo',
    'conta_saldo',
    'usuario_id',
    'conta_ativo',
    'conta_datacriacao'
  ],
  'lembrete': [
    'lembrete_id',
    'usuario_id',
    'lembrete_titulo',
    'lembrete_descricao',
    'lembrete_data',
    'lembrete_ativo',
    'lembrete_datacriacao'
  ]
};

async function checkDatabaseStructure() {
  try {
    console.log('🔄 Conectando ao banco...');
    
    // 1. Listar todas as tabelas
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tabelas encontradas:');
    const existingTables = tablesResult.rows.map(row => row.table_name);
    existingTables.forEach(table => {
      console.log(`  ✅ ${table}`);
    });
    
    // 2. Verificar estrutura de cada tabela
    for (const [tableName, expectedColumns] of Object.entries(expectedTables)) {
      console.log(`\n🔍 Verificando tabela: ${tableName}`);
      
      if (!existingTables.includes(tableName)) {
        console.log(`  ❌ Tabela ${tableName} NÃO EXISTE`);
        continue;
      }
      
      // Verificar colunas da tabela
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);
      
      const existingColumns = columnsResult.rows.map(row => row.column_name);
      
      console.log(`  📊 Colunas encontradas (${existingColumns.length}):`);
      existingColumns.forEach(col => {
        console.log(`    ✅ ${col}`);
      });
      
      // Verificar colunas faltantes
      const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
      if (missingColumns.length > 0) {
        console.log(`  ⚠️  Colunas faltantes:`);
        missingColumns.forEach(col => {
          console.log(`    ❌ ${col}`);
        });
      } else {
        console.log(`  ✅ Todas as colunas esperadas estão presentes`);
      }
      
      // Contar registros
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  📈 Registros: ${countResult.rows[0].count}`);
    }
    
    // 3. Verificar dados de exemplo
    console.log('\n👥 Dados de exemplo:');
    
    // Usuários
    const usersResult = await pool.query('SELECT Usuario_Id, Usuario_Email, Usuario_Nome FROM Usuario LIMIT 3');
    if (usersResult.rows.length > 0) {
      console.log('  👤 Usuários:');
      usersResult.rows.forEach(user => {
        console.log(`    - ${user.usuario_nome} (${user.usuario_email})`);
      });
    }
    
    // Receitas
    const receitasResult = await pool.query('SELECT Receita_Id, Receita_Descricao, Receita_Valor FROM Receita LIMIT 3');
    if (receitasResult.rows.length > 0) {
      console.log('  💰 Receitas:');
      receitasResult.rows.forEach(receita => {
        console.log(`    - ${receita.receita_descricao}: R$ ${receita.receita_valor}`);
      });
    }
    
    // Despesas
    const despesasResult = await pool.query('SELECT Despesa_Id, Despesa_Descricao, Despesa_Valor FROM Despesa LIMIT 3');
    if (despesasResult.rows.length > 0) {
      console.log('  💸 Despesas:');
      despesasResult.rows.forEach(despesa => {
        console.log(`    - ${despesa.despesa_descricao}: R$ ${despesa.despesa_valor}`);
      });
    }
    
    // Contas
    const contasResult = await pool.query('SELECT Conta_Id, Conta_Nome, Conta_Tipo FROM Conta LIMIT 3');
    if (contasResult.rows.length > 0) {
      console.log('  🏦 Contas:');
      contasResult.rows.forEach(conta => {
        console.log(`    - ${conta.conta_nome} (${conta.conta_tipo})`);
      });
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseStructure(); 