#!/usr/bin/env node

const { atualizarVersao } = require('./atualizar-versao');

async function postCommitHook() {
  try {
    console.log('🎯 Hook pós-commit executado');
    console.log('================================');
    
    // Verificar se estamos em uma branch que queremos rastrear
    const { execSync } = require('child_process');
    const branchName = execSync('git branch --show-current').toString().trim();
    
    const branchesToTrack = ['teste', 'production', 'homologacao'];
    
    if (branchesToTrack.includes(branchName)) {
      console.log(`📋 Atualizando versão para branch: ${branchName}`);
      await atualizarVersao();
    } else {
      console.log(`⏭️ Branch ${branchName} não está na lista de rastreamento`);
      console.log('   Branches rastreadas:', branchesToTrack.join(', '));
    }
    
  } catch (error) {
    console.error('❌ Erro no hook pós-commit:', error);
    // Não falhar o commit por causa do erro na atualização de versão
    process.exit(0);
  }
}

postCommitHook(); 