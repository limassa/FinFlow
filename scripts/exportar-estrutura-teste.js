const { Pool } = require('pg');
require('dotenv').config({ path: './backend/config.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function exportarEstruturaTabelas() {
  try {
    console.log('📋 Exportando estrutura das tabelas da branch TESTE...');
    console.log('==================================================');
    
    // 1. Listar todas as tabelas
    console.log('\n📊 Listando tabelas...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('✅ Tabelas encontradas:', tables);
    
    // 2. Exportar estrutura de cada tabela
    let estruturaCompleta = '';
    
    for (const tableName of tables) {
      console.log(`\n📋 Exportando estrutura da tabela: ${tableName}`);
      
      // Obter estrutura da tabela
      const structureQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `;
      
      const structureResult = await pool.query(structureQuery, [tableName]);
      
      // Obter constraints
      const constraintsQuery = `
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = $1;
      `;
      
      const constraintsResult = await pool.query(constraintsQuery, [tableName]);
      
      // Obter índices
      const indexesQuery = `
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = $1;
      `;
      
      const indexesResult = await pool.query(indexesQuery, [tableName]);
      
      // Gerar CREATE TABLE
      estruturaCompleta += `\n-- ===========================================\n`;
      estruturaCompleta += `-- Tabela: ${tableName}\n`;
      estruturaCompleta += `-- ===========================================\n\n`;
      
      estruturaCompleta += `CREATE TABLE ${tableName} (\n`;
      
      const columns = structureResult.rows;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        let columnDef = `  ${col.column_name} ${col.data_type}`;
        
        if (col.character_maximum_length) {
          columnDef += `(${col.character_maximum_length})`;
        } else if (col.numeric_precision && col.numeric_scale) {
          columnDef += `(${col.numeric_precision},${col.numeric_scale})`;
        } else if (col.numeric_precision) {
          columnDef += `(${col.numeric_precision})`;
        }
        
        if (col.column_default) {
          columnDef += ` DEFAULT ${col.column_default}`;
        }
        
        if (col.is_nullable === 'NO') {
          columnDef += ` NOT NULL`;
        }
        
        if (i < columns.length - 1) {
          columnDef += ',';
        }
        
        estruturaCompleta += columnDef + '\n';
      }
      
      // Adicionar constraints
      const primaryKeys = constraintsResult.rows.filter(c => c.constraint_type === 'PRIMARY KEY');
      const foreignKeys = constraintsResult.rows.filter(c => c.constraint_type === 'FOREIGN KEY');
      
      if (primaryKeys.length > 0) {
        const pkColumns = primaryKeys.map(pk => pk.column_name).join(', ');
        estruturaCompleta += `  PRIMARY KEY (${pkColumns}),\n`;
      }
      
      for (const fk of foreignKeys) {
        estruturaCompleta += `  CONSTRAINT ${fk.constraint_name} FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name}),\n`;
      }
      
      // Remover última vírgula se existir
      if (estruturaCompleta.endsWith(',\n')) {
        estruturaCompleta = estruturaCompleta.slice(0, -2) + '\n';
      }
      
      estruturaCompleta += `);\n\n`;
      
      // Adicionar índices
      if (indexesResult.rows.length > 0) {
        estruturaCompleta += `-- Índices para ${tableName}\n`;
        for (const idx of indexesResult.rows) {
          if (!idx.indexname.includes('_pkey')) { // Ignorar índices de primary key
            estruturaCompleta += `${idx.indexdef};\n`;
          }
        }
        estruturaCompleta += '\n';
      }
      
      console.log(`✅ Estrutura da tabela ${tableName} exportada`);
    }
    
    // 3. Salvar em arquivo
    const fs = require('fs');
    const fileName = `scripts/estrutura-tabelas-teste-${new Date().toISOString().split('T')[0]}.sql`;
    
    fs.writeFileSync(fileName, estruturaCompleta);
    console.log(`\n💾 Estrutura salva em: ${fileName}`);
    
    // 4. Estatísticas
    console.log('\n📊 Estatísticas da Exportação:');
    console.log(`   - Total de tabelas: ${tables.length}`);
    console.log(`   - Arquivo gerado: ${fileName}`);
    
    return fileName;
    
  } catch (error) {
    console.error('❌ Erro ao exportar estrutura:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

exportarEstruturaTabelas(); 