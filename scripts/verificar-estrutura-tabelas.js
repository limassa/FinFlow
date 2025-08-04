const { Pool } = require('pg');

// Configurações de conexão
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'finflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function verificarEstruturaTabelas() {
  console.log('🔍 Verificando estrutura completa das tabelas...\n');

  try {
    // Listar todas as tabelas
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    console.log('📋 Tabelas encontradas:', tablesResult.rows.map(row => row.table_name));
    console.log('');

    // Para cada tabela, verificar estrutura completa
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`📊 Tabela: ${tableName}`);
      console.log('─'.repeat(50));

      // Verificar colunas
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await pool.query(columnsQuery, [tableName]);
      
      console.log('Colunas:');
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        
        console.log(`  - ${col.column_name}: ${col.data_type}${length} ${nullable} ${defaultVal}`);
      });

      // Verificar chaves primárias
      const pkQuery = `
        SELECT column_name
        FROM information_schema.key_column_usage
        WHERE table_name = $1 AND constraint_name LIKE '%_pkey'
        ORDER BY ordinal_position
      `;
      
      const pkResult = await pool.query(pkQuery, [tableName]);
      if (pkResult.rows.length > 0) {
        console.log('Chave Primária:', pkResult.rows.map(row => row.column_name).join(', '));
      }

      // Verificar chaves estrangeiras
      const fkQuery = `
        SELECT 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
      `;
      
      const fkResult = await pool.query(fkQuery, [tableName]);
      if (fkResult.rows.length > 0) {
        console.log('Chaves Estrangeiras:');
        fkResult.rows.forEach(fk => {
          console.log(`  - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }

      // Verificar índices
      const indexQuery = `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1
        ORDER BY indexname
      `;
      
      const indexResult = await pool.query(indexQuery, [tableName]);
      if (indexResult.rows.length > 0) {
        console.log('Índices:');
        indexResult.rows.forEach(idx => {
          console.log(`  - ${idx.indexname}`);
        });
      }

      // Contar registros
      const countQuery = `SELECT COUNT(*) as total FROM "${tableName}"`;
      const countResult = await pool.query(countQuery);
      console.log(`Total de registros: ${countResult.rows[0].total}`);
      
      console.log('');
    }

    // Verificar tabelas não utilizadas (sem registros)
    console.log('🔍 Tabelas vazias (possivelmente não utilizadas):');
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      const countQuery = `SELECT COUNT(*) as total FROM "${tableName}"`;
      const countResult = await pool.query(countQuery);
      
      if (parseInt(countResult.rows[0].total) === 0) {
        console.log(`  - ${tableName} (0 registros)`);
      }
    }

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  } finally {
    await pool.end();
  }
}

verificarEstruturaTabelas(); 