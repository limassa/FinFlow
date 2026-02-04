/**
 * Incrementa a versão do sistema: insere um novo registro na tabela versao_sistema.
 * A versão é incrementada no patch (ex: 1.0.1 -> 1.0.2).
 * Pode ser executado manualmente ou pelo git hook post-commit.
 *
 * Uso: node scripts/incrementar-versao.js [--descricao "Texto opcional"]
 *
 * Variáveis de ambiente: usa o mesmo .env/config do backend (DB_*, NODE_ENV).
 */
const pool = require('../src/database/connection');

function parseVersion(versaoNumero) {
  if (!versaoNumero || typeof versaoNumero !== 'string') return { major: 1, minor: 0, patch: 0 };
  const parts = versaoNumero.trim().split('.').map(n => parseInt(n, 10) || 0);
  return {
    major: parts[0] || 1,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  };
}

function incrementPatch(versaoNumero) {
  const { major, minor, patch } = parseVersion(versaoNumero);
  return `${major}.${minor}.${patch + 1}`;
}

async function incrementarVersao() {
  const descricaoArg = process.argv.find(a => a.startsWith('--descricao='));
  const descricao = descricaoArg ? descricaoArg.replace('--descricao=', '').trim() : null;

  try {
    let result;
    try {
      result = await pool.query(`
        SELECT versao_numero FROM versao_sistema
        ORDER BY versao_id DESC
        LIMIT 1
      `);
    } catch (err) {
      try {
        result = await pool.query(`
          SELECT "Versao_Numero" as versao_numero FROM "Versao_Sistema"
          ORDER BY "Versao_Id" DESC
          LIMIT 1
        `);
      } catch (err2) {
        console.error('⚠️ Tabela versao_sistema não encontrada. Execute: node scripts/criar-tabela-versao.js');
        process.exit(0);
      }
    }

    const ultimaVersao = result.rows.length > 0 ? (result.rows[0].versao_numero || '1.0.0') : '1.0.0';
    const novaVersao = incrementPatch(ultimaVersao);
    const ambiente = process.env.NODE_ENV || 'development';
    const descricaoFinal = descricao || `Commit ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;

    try {
      await pool.query(`
        INSERT INTO versao_sistema (versao_numero, versao_nome, versao_descricao, versao_status, versao_ambiente, versao_mobile)
        VALUES ($1, 'FinFlow', $2, 'ATIVA', $3, $1)
      `, [novaVersao, descricaoFinal, ambiente]);
    } catch (insertErr) {
      try {
        await pool.query(`
          INSERT INTO "Versao_Sistema" ("Versao_Numero", "Versao_Nome", "Versao_Descricao", "Versao_Status", "Versao_Ambiente", "Versao_Mobile")
          VALUES ($1, 'FinFlow', $2, 'ATIVA', $3, $1)
        `, [novaVersao, descricaoFinal, ambiente]);
      } catch (insertErr2) {
        console.error('❌ Erro ao inserir versão:', insertErr2.message);
        process.exit(0);
      }
    }

    console.log(`✅ Versão incrementada: ${ultimaVersao} → ${novaVersao}`);
  } catch (error) {
    console.error('⚠️ Erro ao incrementar versão (commit não foi afetado):', error.message);
    process.exit(0);
  } finally {
    await pool.end();
  }
}

incrementarVersao();
