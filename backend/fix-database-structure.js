// Script para corrigir estrutura do banco de dados
require('dotenv').config();

const { Pool } = require('pg');

console.log('🔧 Corrigindo estrutura do banco de dados...');

// URL do banco de dados do Railway
const DATABASE_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixDatabaseStructure() {
  try {
    console.log('🔄 Conectando ao banco...');
    
    // 1. Criar tabela Conta se não existir
    console.log('\n📋 Criando tabela Conta...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Conta (
        Conta_Id SERIAL PRIMARY KEY,
        Conta_Nome VARCHAR(255) NOT NULL,
        Conta_Tipo VARCHAR(100) NOT NULL,
        Conta_Saldo DECIMAL(10,2) DEFAULT 0,
        Usuario_Id INTEGER NOT NULL,
        Conta_Ativo BOOLEAN DEFAULT TRUE,
        Conta_DataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (Usuario_Id) REFERENCES Usuario(Usuario_Id)
      );
    `);
    console.log('✅ Tabela Conta criada/verificada');
    
    // 2. Criar tabela Lembrete se não existir
    console.log('\n📋 Criando tabela Lembrete...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Lembrete (
        Lembrete_Id SERIAL PRIMARY KEY,
        Usuario_Id INTEGER NOT NULL,
        Lembrete_Titulo VARCHAR(255) NOT NULL,
        Lembrete_Descricao TEXT,
        Lembrete_Data DATE NOT NULL,
        Lembrete_Ativo BOOLEAN DEFAULT TRUE,
        Lembrete_DataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (Usuario_Id) REFERENCES Usuario(Usuario_Id)
      );
    `);
    console.log('✅ Tabela Lembrete criada/verificada');
    
    // 3. Adicionar colunas faltantes na tabela Receita
    console.log('\n📋 Corrigindo tabela Receita...');
    
    // Verificar se coluna receita_tipo existe
    const receitaTipoExists = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'receita' AND column_name = 'receita_tipo';
    `);
    
    if (receitaTipoExists.rows.length === 0) {
      await pool.query('ALTER TABLE Receita ADD COLUMN Receita_Tipo VARCHAR(100);');
      console.log('✅ Coluna Receita_Tipo adicionada');
    }
    
    // Verificar se coluna receita_recebido existe
    const receitaRecebidoExists = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'receita' AND column_name = 'receita_recebido';
    `);
    
    if (receitaRecebidoExists.rows.length === 0) {
      await pool.query('ALTER TABLE Receita ADD COLUMN Receita_Recebido BOOLEAN DEFAULT FALSE;');
      console.log('✅ Coluna Receita_Recebido adicionada');
    }
    
    // Verificar se coluna conta_id existe
    const receitaContaIdExists = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'receita' AND column_name = 'conta_id';
    `);
    
    if (receitaContaIdExists.rows.length === 0) {
      await pool.query('ALTER TABLE Receita ADD COLUMN Conta_Id INTEGER REFERENCES Conta(Conta_Id);');
      console.log('✅ Coluna Conta_Id adicionada à Receita');
    }
    
    // 4. Adicionar colunas faltantes na tabela Despesa
    console.log('\n📋 Corrigindo tabela Despesa...');
    
    // Verificar se coluna despesa_tipo existe
    const despesaTipoExists = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'despesa' AND column_name = 'despesa_tipo';
    `);
    
    if (despesaTipoExists.rows.length === 0) {
      await pool.query('ALTER TABLE Despesa ADD COLUMN Despesa_Tipo VARCHAR(100);');
      console.log('✅ Coluna Despesa_Tipo adicionada');
    }
    
    // Verificar se coluna conta_id existe
    const despesaContaIdExists = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'despesa' AND column_name = 'conta_id';
    `);
    
    if (despesaContaIdExists.rows.length === 0) {
      await pool.query('ALTER TABLE Despesa ADD COLUMN Conta_Id INTEGER REFERENCES Conta(Conta_Id);');
      console.log('✅ Coluna Conta_Id adicionada à Despesa');
    }
    
    // Renomear despesa_dtvencimento para despesa_datavencimento se necessário
    const dtVencimentoExists = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'despesa' AND column_name = 'despesa_dtvencimento';
    `);
    
    const dataVencimentoExists = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'despesa' AND column_name = 'despesa_datavencimento';
    `);
    
    if (dtVencimentoExists.rows.length > 0 && dataVencimentoExists.rows.length === 0) {
      await pool.query('ALTER TABLE Despesa RENAME COLUMN Despesa_DtVencimento TO Despesa_DataVencimento;');
      console.log('✅ Coluna Despesa_DtVencimento renomeada para Despesa_DataVencimento');
    }
    
    // 5. Verificar estrutura final
    console.log('\n📋 Verificando estrutura final...');
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('✅ Tabelas existentes:');
    tablesResult.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Verificar colunas de cada tabela
    const tables = ['usuario', 'receita', 'despesa', 'conta', 'lembrete'];
    
    for (const table of tables) {
      const columnsResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [table]);
      
      console.log(`\n📊 Colunas da tabela ${table}:`);
      columnsResult.rows.forEach(col => {
        console.log(`  ✅ ${col.column_name}`);
      });
    }
    
    console.log('\n🎉 Estrutura do banco corrigida com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir estrutura:', error.message);
  } finally {
    await pool.end();
  }
}

fixDatabaseStructure(); 