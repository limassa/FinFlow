const { Pool } = require('pg');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', 'config.env') });

// Determinar qual configuração de banco usar baseado na branch
function getBranchName() {
  try {
    return execSync('git branch --show-current').toString().trim();
  } catch {
    return process.env.GIT_BRANCH || 'development';
  }
}

const branchName = getBranchName();

// Em produção, exige RAILWAY_DB_PASSWORD (não usar senha do banco local no Railway)
const productionPassword = process.env.RAILWAY_DB_PASSWORD;

function createPool() {
  if (branchName === 'production') {
    if (!productionPassword) {
      return null; // atualizarVersao() trata: skip com mensagem
    }
    return new Pool({
      host: process.env.RAILWAY_DB_HOST || 'interchange.proxy.rlwy.net',
      port: process.env.RAILWAY_DB_PORT || '50880',
      database: process.env.RAILWAY_DB_NAME || 'railway',
      user: process.env.RAILWAY_DB_USER || 'postgres',
      password: productionPassword,
    });
  }
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'FinFlowTeste',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
  });
}

/** Parsea versão no formato major.minor.patch (ex: "1.0.1") e incrementa o patch */
function parseVersion(versaoNumero) {
  if (!versaoNumero || typeof versaoNumero !== 'string') return { major: 1, minor: 0, patch: 0 };
  const parts = versaoNumero.trim().split('.').map(n => parseInt(n, 10) || 0);
  return {
    major: parts[0] || 1,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

function incrementarPatch(versaoNumero) {
  const { major, minor, patch } = parseVersion(versaoNumero);
  return `${major}.${minor}.${patch + 1}`;
}

async function atualizarVersao() {
  const pool = createPool();
  if (branchName === 'production' && !pool) {
    console.log('⚠️ Branch production: defina RAILWAY_DB_PASSWORD no backend/config.env para atualizar a versão no banco ao commitar.');
    console.log('   (Commit concluído; versão não foi incrementada na tabela.)');
    return null;
  }
  if (branchName === 'production') {
    console.log('🚀 Usando configuração do Railway para produção...');
  } else {
    console.log('🏠 Usando configuração local...');
  }
  try {
    console.log('🔄 Atualizando tabela de versão...');

    // 1. Obter última versão da tabela (suporta versao_sistema minúsculo ou "Versao_Sistema")
    let ultimaVersao = '1.0.0';
    try {
      const res = await pool.query(`
        SELECT versao_numero FROM versao_sistema
        ORDER BY versao_id DESC
        LIMIT 1
      `);
      if (res.rows.length > 0 && res.rows[0].versao_numero) {
        ultimaVersao = res.rows[0].versao_numero;
      }
    } catch (e) {
      try {
        const res = await pool.query(`
          SELECT "Versao_Numero" as versao_numero FROM "Versao_Sistema"
          ORDER BY "Versao_Id" DESC
          LIMIT 1
        `);
        if (res.rows.length > 0 && res.rows[0].versao_numero) {
          ultimaVersao = res.rows[0].versao_numero;
        }
      } catch (_) {}
    }

    const versionNumber = incrementarPatch(ultimaVersao);

    // 2. Informações do commit
    let commitHash = '';
    let commitMessage = '';
    let commitDate = new Date().toISOString().slice(0, 10);
    try {
      commitHash = execSync('git rev-parse --short HEAD').toString().trim();
      commitMessage = execSync('git log -1 --pretty=format:"%s"').toString().trim();
      commitDate = execSync('git log -1 --pretty=format:"%ad" --date=short').toString().trim();
    } catch (_) {}

    const versionName = 'FinFlow';
    const descricao = commitMessage || `Commit ${commitHash || 'manual'} - ${branchName}`;
    const ambiente = (branchName || process.env.NODE_ENV || 'development').toUpperCase();

    // 3. Desativar versões anteriores (uma ATIVA por ambiente)
    try {
      await pool.query(
        "UPDATE versao_sistema SET versao_status = 'INATIVA' WHERE versao_ambiente = $1",
        [ambiente]
      );
    } catch (_) {
      try {
        await pool.query(
          'UPDATE "Versao_Sistema" SET "Versao_Status" = \'INATIVA\' WHERE "Versao_Ambiente" = $1',
          [ambiente]
        );
      } catch (_) {}
    }

    // 4. Inserir nova versão (versao_numero + versao_mobile para web e app)
    try {
      await pool.query(
        `INSERT INTO versao_sistema 
         (versao_numero, versao_nome, versao_data, versao_descricao, versao_status, versao_ambiente, versao_mobile) 
         VALUES ($1, $2, $3, $4, 'ATIVA', $5, $1)`,
        [versionNumber, versionName, commitDate, descricao, ambiente]
      );
    } catch (e) {
      await pool.query(
        `INSERT INTO "Versao_Sistema" 
         ("Versao_Numero", "Versao_Nome", "Versao_Data", "Versao_Descricao", "Versao_Status", "Versao_Ambiente", "Versao_Mobile") 
         VALUES ($1, $2, $3, $4, 'ATIVA', $5, $1)`,
        [versionNumber, versionName, commitDate, descricao, ambiente]
      );
    }

    console.log('✅ Versão atualizada com sucesso!');
    console.log(`   Versão: ${ultimaVersao} → ${versionNumber}`);
    console.log(`   Branch: ${branchName}`);
    console.log(`   Commit: ${commitHash}`);
    console.log(`   Descrição: ${descricao}`);

    return { versao_numero: versionNumber, versao_mobile: versionNumber };
  } catch (error) {
    console.error('❌ Erro ao atualizar versão:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  atualizarVersao();
}

module.exports = { atualizarVersao }; 