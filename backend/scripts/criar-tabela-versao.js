/**
 * Cria a tabela versao_sistema se não existir.
 * Colunas: versao_id, versao_numero, versao_nome, versao_data, versao_descricao, versao_status, versao_ambiente, versao_mobile
 * Execute: node scripts/criar-tabela-versao.js
 */
const pool = require('../src/database/connection');

async function criarTabelaVersao() {
  try {
    console.log('🔧 Criando tabela versao_sistema (se não existir)...\n');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS versao_sistema (
        versao_id SERIAL PRIMARY KEY,
        versao_numero VARCHAR(20) NOT NULL,
        versao_nome VARCHAR(100) NOT NULL DEFAULT 'Claricash',
        versao_data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        versao_descricao TEXT,
        versao_status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
        versao_ambiente VARCHAR(50) DEFAULT 'development',
        versao_mobile VARCHAR(20)
      )
    `);
    console.log('✅ Tabela versao_sistema criada ou já existe.\n');

    const count = await pool.query('SELECT COUNT(*) as total FROM versao_sistema');
    if (parseInt(count.rows[0].total) === 0) {
      console.log('📝 Inserindo versão inicial 1.0.0...');
      await pool.query(`
        INSERT INTO versao_sistema (versao_numero, versao_nome, versao_descricao, versao_status, versao_ambiente, versao_mobile)
        VALUES ('1.0.0', 'Claricash', 'Versão inicial', 'ATIVA', $1, '1.0.0')
      `, [process.env.NODE_ENV || 'development']);
      console.log('✅ Versão inicial 1.0.0 inserida.\n');
    }

    console.log('🎉 Configuração concluída. Use scripts/incrementar-versao.js a cada commit.\n');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

criarTabelaVersao();
