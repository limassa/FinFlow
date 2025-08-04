const fs = require('fs');
const path = require('path');

function configurarHook() {
  try {
    console.log('🔧 Configurando hook do Git...');
    
    // 1. Verificar se existe o diretório .git/hooks
    const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
    if (!fs.existsSync(hooksDir)) {
      console.error('❌ Diretório .git/hooks não encontrado');
      return;
    }
    
    // 2. Criar o arquivo post-commit
    const postCommitPath = path.join(hooksDir, 'post-commit');
    const hookScript = `#!/bin/sh
node "${path.join(__dirname, 'post-commit-hook.js')}"
`;
    
    fs.writeFileSync(postCommitPath, hookScript);
    
    // 3. Tornar o arquivo executável
    fs.chmodSync(postCommitPath, '755');
    
    console.log('✅ Hook pós-commit configurado com sucesso!');
    console.log('   Arquivo:', postCommitPath);
    console.log('\n📋 Agora a tabela de versão será atualizada automaticamente a cada commit');
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