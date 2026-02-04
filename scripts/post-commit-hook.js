#!/usr/bin/env node

const { atualizarVersao } = require('./atualizar-versao');

async function postCommitHook() {
  try {
    console.log('🎯 Hook pós-commit executado');
    console.log('================================');

    // Toda vez que houver commit: insert na tabela versao_sistema (incrementa versão)
    console.log('📋 Incrementando versão na tabela versao_sistema...');
    await atualizarVersao();
  } catch (error) {
    console.error('❌ Erro no hook pós-commit:', error.message);
    // Não falhar o commit por causa do erro na atualização de versão
    process.exit(0);
  }
}

postCommitHook(); 