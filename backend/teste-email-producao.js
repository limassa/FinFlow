const nodemailer = require('nodemailer');

// Carregar variáveis de ambiente
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Ambiente de produção detectado');
} else {
  require('dotenv').config({ path: './config.env' });
  console.log('🔧 Ambiente de desenvolvimento detectado');
}

console.log('🔍 TESTE DE EMAIL - PRODUÇÃO');
console.log('=============================\n');

// Verificar variáveis de ambiente
console.log('1. Verificando variáveis de ambiente...');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER || 'Não configurado'}`);
console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado'}`);
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL || 'Não configurado'}`);
console.log(`🏭 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

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

// Enviar email de teste
async function enviarEmailTeste() {
  try {
    console.log('\n4. Enviando email de teste...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
      to: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
      subject: '🧪 Teste de Email - FinFlow Produção',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🧪 Teste de Email - Produção</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Sistema de Email</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">✅ Email Funcionando em Produção!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Este é um email de teste para verificar se a configuração de email do FinFlow 
              está funcionando corretamente em produção.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📋 Detalhes do Teste:</h3>
              <p style="color: #666; margin: 0;">
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>Ambiente:</strong> ${process.env.NODE_ENV || 'development'}<br>
                <strong>Servidor:</strong> Gmail<br>
                <strong>Status:</strong> Funcionando ✅
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Se você recebeu este email, significa que a configuração está correta e o sistema 
              pode enviar emails automaticamente (boas-vindas, redefinição de senha, lembretes, etc.).
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://finflow.lizsoftware.com.br'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Acessar FinFlow
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Este é um email de teste automático do sistema FinFlow em produção.
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de teste enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Para: ${info.accepted.join(', ')}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    console.error('Código:', error.code);
    console.error('Comando:', error.command);
    console.error('Resposta:', error.response);
    return false;
  }
}

// Simular email de boas-vindas
async function simularEmailBoasVindas() {
  try {
    console.log('\n5. Simulando email de boas-vindas...');
    
    const user = {
      nome: 'Usuário Teste',
      email: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com'
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
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Se você não criou esta conta, ignore este email.
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de boas-vindas simulado enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error.message);
    return false;
  }
}

// Função principal
async function executarTeste() {
  const conexaoOk = await testarConexao();
  
  if (!conexaoOk) {
    console.log('\n❌ Teste falhou na conexão');
    return;
  }
  
  const emailTesteOk = await enviarEmailTeste();
  
  if (emailTesteOk) {
    await simularEmailBoasVindas();
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ O sistema de email está funcionando corretamente');
    console.log('✅ Emails de cadastro devem ser enviados normalmente');
    console.log('\n📋 Próximos passos:');
    console.log('1. Teste o cadastro de um novo usuário');
    console.log('2. Verifique se o email de boas-vindas chega');
    console.log('3. Monitore os logs do servidor para erros');
  } else {
    console.log('\n❌ Teste falhou no envio de email');
    console.log('🔧 Verifique as configurações de email');
  }
}

// Executar teste
executarTeste().catch(console.error); 