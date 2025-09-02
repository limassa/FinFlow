const emailService = require('./src/services/emailService');

console.log('🧪 TESTE DO SISTEMA DE FALLBACK DE EMAIL');
console.log('==========================================\n');

async function testarSistemaFallback() {
  console.log('1. VERIFICANDO STATUS INICIAL');
  console.log('==============================');
  
  const statusInicial = await emailService.getStatus();
  console.log(`   Configurado: ${statusInicial.configurado}`);
  console.log(`   Configuração: ${statusInicial.configuracaoAtual || 'Nenhuma'}`);
  console.log(`   Timestamp: ${statusInicial.timestamp}`);
  
  console.log('\n2. TESTANDO ENVIO DE EMAIL DE BOAS-VINDAS');
  console.log('===========================================');
  
  const usuarioTeste = {
    nome: 'Usuário Teste Fallback',
    email: 'teste@exemplo.com'
  };
  
  try {
    console.log('   📧 Tentando enviar email...');
    const resultado = await emailService.sendWelcomeEmail(usuarioTeste);
    
    if (resultado) {
      console.log('   ✅ Email processado com sucesso!');
    } else {
      console.log('   ❌ Falha no processamento do email');
    }
    
  } catch (error) {
    console.log(`   💥 Erro durante o teste: ${error.message}`);
  }
  
  console.log('\n3. VERIFICANDO STATUS APÓS TESTE');
  console.log('==================================');
  
  const statusFinal = await emailService.getStatus();
  console.log(`   Configurado: ${statusFinal.configurado}`);
  console.log(`   Configuração: ${statusFinal.configuracaoAtual || 'Nenhuma'}`);
  console.log(`   Timestamp: ${statusFinal.timestamp}`);
  
  console.log('\n4. TESTANDO ENVIO DE EMAIL DE REDEFINIÇÃO');
  console.log('===========================================');
  
  const usuarioReset = {
    nome: 'Usuário Reset Teste',
    email: 'reset@exemplo.com'
  };
  
  const resetToken = 'token-teste-123456';
  
  try {
    console.log('   🔐 Tentando enviar email de redefinição...');
    const resultadoReset = await emailService.sendPasswordResetEmail(usuarioReset, resetToken);
    
    if (resultadoReset) {
      console.log('   ✅ Email de redefinição processado com sucesso!');
    } else {
      console.log('   ❌ Falha no processamento do email de redefinição');
    }
    
  } catch (error) {
    console.log(`   💥 Erro durante o teste de redefinição: ${error.message}`);
  }
  
  console.log('\n5. RESUMO DO TESTE');
  console.log('===================');
  
  if (statusFinal.configurado) {
    console.log('   🎯 Sistema de email funcionando!');
    console.log(`   🔧 Configuração ativa: ${statusFinal.configuracaoAtual}`);
    console.log('   ✅ Emails sendo enviados normalmente');
  } else {
    console.log('   📧 Sistema de email usando fallback');
    console.log('   🔄 Emails sendo simulados no console');
    console.log('   ⚠️  Sistema funcionando, mas emails não enviados');
  }
  
  console.log('\n6. PRÓXIMOS PASSOS');
  console.log('====================');
  
  if (statusFinal.configurado) {
    console.log('   ✅ Sistema funcionando perfeitamente!');
    console.log('   🚀 Pode fazer deploy para produção');
  } else {
    console.log('   🔧 Sistema funcionando com fallback');
    console.log('   📧 Emails não enviados, mas cadastro funciona');
    console.log('   🚨 Verificar configurações de rede no Railway');
    console.log('   💡 Considerar usar serviço de email alternativo');
  }
}

// Executar teste
testarSistemaFallback().catch(console.error);
