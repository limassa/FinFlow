#!/usr/bin/env node

const { atualizarVersao } = require('./atualizar-versao');

async function postCheckoutHook() {
  try {
    // O Git passa 3 argumentos para post-checkout:
    // process.argv[2]: ref da HEAD anterior
    // process.argv[3]: ref da HEAD nova
    // process.argv[4]: flag (1 = checkout de branch, 0 = checkout de arquivo)
    const isBranchCheckout = process.argv[4] === '1';
    
    if (!isBranchCheckout) {
      // Não fazer nada se for apenas checkout de arquivo
      return;
    }
    
    console.log('🔀 Hook pós-checkout executado');
    console.log('================================');
    
    // Verificar se estamos em uma branch que queremos rastrear
    const { execSync } = require('child_process');
    const branchName = execSync('git branch --show-current').toString().trim();
    const previousRef = process.argv[2] || 'desconhecida';
    const newRef = process.argv[3] || 'desconhecida';
    
    console.log(`📌 Mudança de branch detectada:`);
    console.log(`   Ref anterior: ${previousRef}`);
    console.log(`   Ref nova: ${newRef}`);
    console.log(`   Branch atual: ${branchName}`);
    
    const branchesToTrack = ['teste', 'production', 'homologacao'];
    
    if (branchesToTrack.includes(branchName)) {
      console.log(`📋 Atualizando versão para branch: ${branchName}`);
      await atualizarVersao();
    } else {
      console.log(`⏭️ Branch ${branchName} não está na lista de rastreamento`);
      console.log('   Branches rastreadas:', branchesToTrack.join(', '));
    }
    
  } catch (error) {
    console.error('❌ Erro no hook pós-checkout:', error);
    // Não falhar o checkout por causa do erro na atualização de versão
    process.exit(0);
  }
}

postCheckoutHook();

