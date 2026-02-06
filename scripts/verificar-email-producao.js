console.log('🔍 VERIFICANDO CONFIGURAÇÃO DE EMAIL EM PRODUÇÃO');
console.log('==================================================\n');

// Verificar variáveis de ambiente críticas
const variaveisCriticas = [
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_SERVICE',
  'FRONTEND_URL',
  'NODE_ENV'
];

console.log('1. Verificando variáveis de ambiente críticas...');
let todasConfiguradas = true;

variaveisCriticas.forEach(variavel => {
  const valor = process.env[variavel];
  if (valor) {
    if (variavel === 'EMAIL_PASS') {
      console.log(`✅ ${variavel}: ${valor.substring(0, 4)}...${valor.substring(valor.length - 4)}`);
    } else {
      console.log(`✅ ${variavel}: ${valor}`);
    }
  } else {
    console.log(`❌ ${variavel}: Não configurada`);
    todasConfiguradas = false;
  }
});

console.log('');

// Verificar se está em produção
const isProducao = process.env.NODE_ENV === 'production';
console.log('2. Verificando ambiente...');
console.log(`🏭 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚀 Produção: ${isProducao ? 'Sim' : 'Não'}`);

// Verificar configurações específicas de produção
console.log('\n3. Configurações específicas de produção...');

if (isProducao) {
  console.log('✅ Executando em produção');
  
  // Verificar se as variáveis de email estão configuradas
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ EMAIL_USER ou EMAIL_PASS não configurados em produção');
    console.log('🔧 Configure essas variáveis no Railway ou plataforma de deploy');
  } else {
    console.log('✅ Credenciais de email configuradas');
  }
  
  // Verificar URL do frontend
  if (!process.env.FRONTEND_URL) {
    console.log('❌ FRONTEND_URL não configurado em produção');
    console.log('🔧 Configure a URL do frontend no Railway ou plataforma de deploy');
  } else {
    console.log('✅ FRONTEND_URL configurado:', process.env.FRONTEND_URL);
  }
  
} else {
  console.log('🔧 Executando em desenvolvimento');
  console.log('📝 As variáveis de ambiente são carregadas do arquivo config.env');
}

// Verificar possíveis problemas
console.log('\n4. Possíveis problemas identificados...');

const problemas = [];

if (!process.env.EMAIL_USER) {
  problemas.push('EMAIL_USER não configurado');
}

if (!process.env.EMAIL_PASS) {
  problemas.push('EMAIL_PASS não configurado');
}

if (!process.env.FRONTEND_URL) {
  problemas.push('FRONTEND_URL não configurado');
}

if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.length < 10) {
  problemas.push('EMAIL_PASS parece ser muito curto (pode ser senha de app inválida)');
}

if (problemas.length === 0) {
  console.log('✅ Nenhum problema identificado nas configurações');
} else {
  console.log('❌ Problemas encontrados:');
  problemas.forEach(problema => {
    console.log(`   - ${problema}`);
  });
}

// Sugestões de solução
console.log('\n5. Sugestões de solução...');

if (!isProducao) {
  console.log('📋 Para testar em desenvolvimento:');
  console.log('   1. Verifique se o arquivo config.env existe');
  console.log('   2. Configure EMAIL_USER e EMAIL_PASS no config.env');
  console.log('   3. Execute: node backend/teste-email-producao.js');
} else {
  console.log('📋 Para corrigir em produção:');
  console.log('   1. Configure EMAIL_USER no Railway/plataforma de deploy');
  console.log('   2. Configure EMAIL_PASS (senha de app do Gmail) no Railway');
  console.log('   3. Configure FRONTEND_URL no Railway');
  console.log('   4. Faça redeploy da aplicação');
  console.log('   5. Monitore os logs para erros de email');
}

// Verificar se o problema pode ser de spam
console.log('\n6. Verificações adicionais...');
console.log('📧 Se os emails não chegam, verifique:');
console.log('   - Pasta de spam/lixo eletrônico');
console.log('   - Configurações de filtro do provedor de email');
console.log('   - Limites de envio do Gmail (500 emails/dia)');
console.log('   - Configuração de autenticação de 2 fatores');
console.log('   - Senha de app válida para o Gmail');

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Configure as variáveis de ambiente em produção');
console.log('2. Faça redeploy da aplicação');
console.log('3. Teste o cadastro de um novo usuário');
console.log('4. Verifique os logs do servidor para erros');
console.log('5. Monitore se os emails chegam na caixa de entrada'); 