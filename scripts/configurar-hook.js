const fs = require('fs');
const path = require('path');

function configurarHook() {
  try {
    console.log('🔧 Configurando hooks do Git...');
    
    // 1. Verificar se existe o diretório .git/hooks
    const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
    if (!fs.existsSync(hooksDir)) {
      console.error('❌ Diretório .git/hooks não encontrado');
      return;
    }
    
    // 2. Criar o arquivo post-commit
    const postCommitPath = path.join(hooksDir, 'post-commit');
    const postCommitScript = `#!/bin/sh
node "${path.join(__dirname, 'post-commit-hook.js')}"
`;
    
    fs.writeFileSync(postCommitPath, postCommitScript);
    fs.chmodSync(postCommitPath, '755');
    
    console.log('✅ Hook pós-commit configurado com sucesso!');
    console.log('   Arquivo:', postCommitPath);
    
    // 3. Criar o arquivo post-checkout
    const postCheckoutPath = path.join(hooksDir, 'post-checkout');
    const postCheckoutScript = `#!/bin/sh
node "${path.join(__dirname, 'post-checkout-hook.js')}" "$1" "$2" "$3"
`;
    
    fs.writeFileSync(postCheckoutPath, postCheckoutScript);
    fs.chmodSync(postCheckoutPath, '755');
    
    console.log('✅ Hook pós-checkout configurado com sucesso!');
    console.log('   Arquivo:', postCheckoutPath);
    
    console.log('\n📋 Agora a tabela de versão será atualizada automaticamente:');
    console.log('   - A cada commit (post-commit)');
    console.log('   - A cada checkout de branch (post-checkout)');
    console.log('   Branches rastreadas: teste, production, homologacao');
    
  } catch (error) {
    console.error('❌ Erro ao configurar hook:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  configurarHook();
}

module.exports = { configurarHook }; 