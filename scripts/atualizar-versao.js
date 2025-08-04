const { Pool } = require('pg');
const { execSync } = require('child_process');
require('dotenv').config({ path: './backend/config.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function atualizarVersao() {
  try {
    console.log('🔄 Atualizando tabela de versão...');
    
    // 1. Obter informações do commit atual
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const commitMessage = execSync('git log -1 --pretty=format:"%s"').toString().trim();
    const branchName = execSync('git branch --show-current').toString().trim();
    const commitDate = execSync('git log -1 --pretty=format:"%ad" --date=short').toString().trim();
    
    // 2. Gerar número de versão baseado na data e commit
    const today = new Date();
    const versionNumber = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}.${commitHash}`;
    
    // 3. Gerar nome da versão
    const versionName = `Commit ${commitHash} - ${branchName}`;
    
    // 4. Desativar versões anteriores
    await pool.query(
      'UPDATE versao_sistema SET versao_status = \'INATIVA\' WHERE versao_ambiente = $1',
      [branchName.toUpperCase()]
    );
    
    // 5. Inserir nova versão
    const result = await pool.query(
      `INSERT INTO versao_sistema 
       (versao_numero, versao_nome, versao_data, versao_descricao, versao_status, versao_ambiente) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        versionNumber,
        versionName,
        commitDate,
        commitMessage,
        'ATIVA',
        branchName.toUpperCase()
      ]
    );
    
    console.log('✅ Versão atualizada com sucesso!');
    console.log(`   Número: ${versionNumber}`);
    console.log(`   Nome: ${versionName}`);
    console.log(`   Branch: ${branchName}`);
    console.log(`   Commit: ${commitHash}`);
    console.log(`   Data: ${commitDate}`);
    console.log(`   Descrição: ${commitMessage}`);
    
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Erro ao atualizar versão:', error);
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