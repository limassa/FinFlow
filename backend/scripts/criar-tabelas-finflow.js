// Script para criar as tabelas do FinFlow no banco de dados
const pool = require('../src/database/connection');
const fs = require('fs');
const path = require('path');

async function criarTabelas() {
  console.log('🔧 Criando tabelas do FinFlow...\n');
  
  const sqlScript = fs.readFileSync(
    path.join(__dirname, '../../scripts/ScriptSQL_New.sql'),
    'utf8'
  );
  
  // Dividir o script em comandos individuais
  const comandos = sqlScript
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
  
  console.log(`📋 Executando ${comandos.length} comandos SQL...\n`);
  
  for (let i = 0; i < comandos.length; i++) {
    const comando = comandos[i];
    if (!comando || comando.length < 10) continue;
    
    try {
      await pool.query(comando);
      console.log(`✅ Comando ${i + 1}/${comandos.length} executado`);
    } catch (err) {
      // Ignorar erros de "já existe" ou "duplicado"
      if (err.message.includes('already exists') || 
          err.message.includes('duplicate') ||
          err.message.includes('já existe')) {
        console.log(`⚠️  Comando ${i + 1}: ${err.message.split('\n')[0]}`);
      } else {
        console.error(`❌ Erro no comando ${i + 1}:`, err.message.split('\n')[0]);
      }
    }
  }
  
  console.log('\n✅ Processo concluído!');
  console.log('\n📋 Verificando tabelas criadas...\n');
  
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('Usuario', 'Receita', 'Despesa', 'Conta', 'usuario', 'receita', 'despesa', 'conta')
      ORDER BY table_name
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Tabelas encontradas:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  Nenhuma tabela do FinFlow encontrada');
    }
  } catch (err) {
    console.error('❌ Erro ao verificar tabelas:', err.message);
  }
  
  await pool.end();
}

criarTabelas().catch(console.error);

