const nodemailer = require('nodemailer');

// Carregar variáveis de ambiente
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Ambiente de produção detectado');
} else {
  require('dotenv').config({ path: './config.env' });
  console.log('🔧 Ambiente de desenvolvimento detectado');
}

console.log('🧪 TESTE DE EMAIL DE CADASTRO - EMAIL ESPECÍFICO');
console.log('==================================================\n');

// Email de destino
const emailDestino = 'joaolmnmarket@gmail.com';

// Verificar variáveis de ambiente
console.log('1. Verificando configurações...');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER || 'Não configurado'}`);
console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado'}`);
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL || 'Não configurado'}`);
console.log(`📬 Email de destino: ${emailDestino}`);

// Configurar transporter
console.log('\n2. Configurando transporter...');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
    pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
  }
});

// Testar conexão
async function testarConexao() {
  try {
    console.log('\n3. Testando conexão...');
    await transporter.verify();
    console.log('✅ Conexão com servidor de email OK!');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    return false;
  }
}

// Enviar email de cadastro
async function enviarEmailCadastro() {
  try {
    console.log('\n4. Enviando email de cadastro...');
    
    const user = {
      nome: 'João Silva',
      email: emailDestino
    };
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
      to: user.email,
      subject: 'Bem-vindo ao FinFlow! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo ao FinFlow!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Sua conta foi criada com sucesso</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Olá, ${user.nome}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Estamos muito felizes em tê-lo conosco! O FinFlow é a ferramenta perfeita para 
              controlar suas finanças de forma simples e eficiente.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">✨ O que você pode fazer:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Cadastrar receitas e despesas</li>
                <li>Gerenciar múltiplas contas</li>
                <li>Visualizar relatórios detalhados</li>
                <li>Acompanhar sua evolução financeira</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://finflow.lizsoftware.com.br'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Acessar FinFlow
              </a>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin-top: 0;">📋 Detalhes do Teste:</h3>
              <p style="color: #666; margin: 0;">
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>Ambiente:</strong> ${process.env.NODE_ENV || 'development'}<br>
                <strong>Servidor:</strong> Gmail<br>
                <strong>Status:</strong> Teste de Email ✅
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Este é um email de teste do sistema FinFlow. Se você não criou esta conta, ignore este email.
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de cadastro enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Para: ${info.accepted.join(', ')}`);
    console.log(`📤 De: ${info.from}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de cadastro:', error.message);
    console.error('Código:', error.code);
    console.error('Comando:', error.command);
    console.error('Resposta:', error.response);
    return false;
  }
}

// Função principal
async function executarTeste() {
  console.log('🚀 Iniciando teste de email de cadastro...\n');
  
  // 1. Testar conexão
  const conexaoOk = await testarConexao();
  if (!conexaoOk) {
    console.log('\n❌ Teste falhou na conexão');
    return;
  }
  
  // 2. Enviar email de cadastro
  const emailOk = await enviarEmailCadastro();
  
  // Resultado final
  console.log('\n' + '='.repeat(50));
  if (emailOk) {
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ Email de cadastro enviado para:', emailDestino);
    console.log('✅ Sistema de email funcionando corretamente');
    console.log('✅ Emails de cadastro serão enviados normalmente em produção');
  } else {
    console.log('❌ TESTE FALHOU');
    console.log('🔧 Verifique as configurações de email');
  }
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Verifique se o email chegou em:', emailDestino);
  console.log('2. Verifique a pasta de spam se necessário');
  console.log('3. Configure as variáveis de ambiente em produção');
  console.log('4. Teste o cadastro real de um usuário');
}

// Executar teste
executarTeste().catch(console.error); 