const nodemailer = require('nodemailer');

console.log('🧪 TESTE FINAL DE EMAIL - PRODUÇÃO');
console.log('===================================\n');

// Verificar se está em produção
const isProducao = process.env.NODE_ENV === 'production';
console.log(`🏭 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚀 Produção: ${isProducao ? 'Sim' : 'Não'}\n`);

// Verificar variáveis críticas
console.log('📋 Verificando variáveis de ambiente...');
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const frontendUrl = process.env.FRONTEND_URL;

console.log(`📧 EMAIL_USER: ${emailUser || '❌ Não configurado'}`);
console.log(`🔑 EMAIL_PASS: ${emailPass ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`🌐 FRONTEND_URL: ${frontendUrl || '❌ Não configurado'}`);

if (!emailUser || !emailPass) {
  console.log('\n❌ ERRO: Variáveis de email não configuradas!');
  console.log('🔧 Configure EMAIL_USER e EMAIL_PASS no Railway');
  console.log('📝 Verifique o guia: documentacao/SOLUCAO_EMAIL_PRODUCAO.md');
  process.exit(1);
}

// Configurar transporter
console.log('\n🔌 Configurando transporter...');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Testar conexão
async function testarConexao() {
  try {
    console.log('🔍 Testando conexão...');
    await transporter.verify();
    console.log('✅ Conexão OK!');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('\n🔧 Possíveis causas:');
    console.error('1. Senha de app inválida');
    console.error('2. Autenticação 2FA não configurada');
    console.error('3. Credenciais incorretas');
    return false;
  }
}

// Enviar email de teste
async function enviarEmailTeste() {
  try {
    console.log('\n📤 Enviando email de teste...');
    
    const mailOptions = {
      from: emailUser,
      to: emailUser,
      subject: '✅ FinFlow - Email Funcionando em Produção',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">✅ Email Funcionando!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">FinFlow - Sistema de Email em Produção</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">🎉 Sucesso!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              O sistema de email do FinFlow está funcionando corretamente em produção!
              Agora os emails de cadastro serão enviados normalmente.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin-top: 0;">📋 Detalhes:</h3>
              <p style="color: #666; margin: 0;">
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>Ambiente:</strong> ${process.env.NODE_ENV || 'development'}<br>
                <strong>Servidor:</strong> Gmail<br>
                <strong>Status:</strong> Funcionando ✅
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl || 'https://finflow.lizsoftware.com.br'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Acessar FinFlow
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Este email confirma que o sistema está funcionando corretamente.
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
    return false;
  }
}

// Simular email de cadastro
async function simularCadastro() {
  try {
    console.log('\n👤 Simulando email de cadastro...');
    
    const user = {
      nome: 'João Silva',
      email: emailUser
    };
    
    const mailOptions = {
      from: emailUser,
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
              <a href="${frontendUrl || 'https://finflow.lizsoftware.com.br'}" 
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
    console.log('✅ Email de cadastro simulado enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de cadastro:', error.message);
    return false;
  }
}

// Função principal
async function executarTesteFinal() {
  console.log('🚀 Iniciando teste final...\n');
  
  // 1. Testar conexão
  const conexaoOk = await testarConexao();
  if (!conexaoOk) {
    console.log('\n❌ Teste falhou na conexão');
    return;
  }
  
  // 2. Enviar email de teste
  const emailTesteOk = await enviarEmailTeste();
  if (!emailTesteOk) {
    console.log('\n❌ Teste falhou no envio de email');
    return;
  }
  
  // 3. Simular email de cadastro
  const cadastroOk = await simularCadastro();
  
  // Resultado final
  console.log('\n' + '='.repeat(50));
  if (cadastroOk) {
    console.log('🎉 TESTE FINAL CONCLUÍDO COM SUCESSO!');
    console.log('✅ Sistema de email funcionando perfeitamente');
    console.log('✅ Emails de cadastro serão enviados normalmente');
    console.log('✅ Problema resolvido!');
  } else {
    console.log('⚠️  Teste parcialmente bem-sucedido');
    console.log('✅ Conexão e email de teste OK');
    console.log('❌ Email de cadastro falhou');
  }
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Teste o cadastro de um novo usuário no FinFlow');
  console.log('2. Verifique se o email de boas-vindas chega');
  console.log('3. Monitore os logs do Railway');
  console.log('4. Verifique a pasta de spam se necessário');
}

// Executar teste
executarTesteFinal().catch(console.error); 