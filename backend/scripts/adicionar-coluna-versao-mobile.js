const pool = require('../src/database/connection');

async function adicionarColunaVersaoMobile() {
  try {
    console.log('🔄 Adicionando coluna versao_mobile na tabela versao_sistema...\n');
    
    // Verificar se a coluna já existe
    const verificarColuna = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'versao_sistema' 
        AND column_name = 'versao_mobile'
    `);
    
    if (verificarColuna.rows.length > 0) {
      console.log('✅ Coluna versao_mobile já existe!\n');
      
      // Verificar se há dados
      const verificarDados = await pool.query(`
        SELECT COUNT(*) as total 
        FROM versao_sistema 
        WHERE versao_mobile IS NOT NULL
      `);
      
      console.log(`📊 Registros com versao_mobile: ${verificarDados.rows[0].total}\n`);
      
      // Se não houver nenhum, inserir versão inicial
      if (parseInt(verificarDados.rows[0].total) === 0) {
        console.log('📝 Inserindo versão mobile inicial (M.1.1.01)...\n');
        await pool.query(`
          UPDATE versao_sistema 
          SET versao_mobile = 'M.1.1.01'
          WHERE versao_status = 'ATIVA'
          LIMIT 1
        `);
        console.log('✅ Versão mobile inicial inserida!\n');
      }
      
      return;
    }
    
    // Adicionar coluna
    console.log('📝 Adicionando coluna versao_mobile...');
    await pool.query(`
      ALTER TABLE versao_sistema 
      ADD COLUMN versao_mobile VARCHAR(20)
    `);
    
    console.log('✅ Coluna versao_mobile adicionada com sucesso!\n');
    
    // Inserir versão inicial para registros ativos
    console.log('📝 Inserindo versão mobile inicial (M.1.1.01) para versões ativas...');
    const atualizar = await pool.query(`
      UPDATE versao_sistema 
      SET versao_mobile = 'M.1.1.01'
      WHERE versao_status = 'ATIVA'
    `);
    
    console.log(`✅ ${atualizar.rowCount} registro(s) atualizado(s) com versão mobile inicial!\n`);
    console.log('🎉 Coluna versao_mobile configurada com sucesso!\n');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
    
    // Tentar com case-sensitive
    if (error.message.includes('versao_sistema')) {
      try {
        console.log('🔄 Tentando com nome case-sensitive...');
        await pool.query(`
          ALTER TABLE "Versao_Sistema" 
          ADD COLUMN "Versao_Mobile" VARCHAR(20)
        `);
        console.log('✅ Coluna adicionada com sucesso (case-sensitive)!\n');
      } catch (err2) {
        console.error('❌ Erro ao adicionar coluna (case-sensitive):', err2.message);
      }
    }
  } finally {
    await pool.end();
  }
}

adicionarColunaVersaoMobile();
