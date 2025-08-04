// Script para testar autenticação no navegador
// Execute este código no console do navegador (F12)

console.log('🔍 Testando autenticação...');

// Verificar localStorage
console.log('📋 localStorage.getItem("user"):', localStorage.getItem('user'));
console.log('📋 localStorage.getItem("userId"):', localStorage.getItem('userId'));

// Tentar fazer login
async function testarLogin() {
  try {
    console.log('🔄 Testando login...');
    
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@admin.com',
        senha: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('📋 Resposta do login:', data);
    
    if (data.id) {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 User ID:', data.id);
      console.log('👤 Nome:', data.nome);
      console.log('👤 Email:', data.email);
    } else {
      console.log('❌ Login falhou:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de login:', error);
  }
}

// Executar teste
testarLogin(); 