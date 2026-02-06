const axios = require('axios');

console.log('🔧 Corrigindo Usuário Admin - FinFlow\n');

const API_BASE_URL = 'http://localhost:3001';

async function testarDiferentesSenhas() {
  const senhas = ['admin123', 'admin', '123456', 'password', 'senha'];
  
  console.log('🔍 Testando diferentes senhas para admin@gmail.com...\n');
  
  for (const senha of senhas) {
    try {
      console.log(`📋 Testando senha: "${senha}"`);
      
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email: 'admin@gmail.com',
        senha: senha
      });

      console.log('✅ Login bem-sucedido!');
      console.log('📊 Dados do usuário:');
      console.log('  ID:', response.data.id);
      console.log('  Nome:', response.data.nome);
      console.log('  Email:', response.data.email);
      console.log('🔑 Senha correta:', senha);
      
      return { usuario: response.data, senha: senha };
    } catch (error) {
      console.log(`❌ Senha "${senha}" incorreta`);
    }
  }
  
  return null;
}

async function criarNovoAdmin() {
  try {
    console.log('\n👤 Criando novo usuário admin...');
    
    const dadosUsuario = {
      nome: 'Admin FinFlow',
      email: 'admin@finflow.com',
      senha: 'admin123',
      telefone: '(11) 99999-9999',
      data_nascimento: '1990-01-01'
    };

    const response = await axios.post(`${API_BASE_URL}/api/cadastro`, dadosUsuario);

    console.log('✅ Novo usuário admin criado!');
    console.log('📊 Dados do usuário:');
    console.log('  ID:', response.data.id);
    console.log('  Nome:', response.data.nome);
    console.log('  Email:', response.data.email);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.response?.data || error.message);
    return null;
  }
}

async function testarAdicionarDespesa(email, senha) {
  try {
    console.log('\n💸 Testando adicionar despesa...');
    
    // Primeiro fazer login
    const loginResponse = await axios.post(`${API_BASE_URL}/api/login`, {
      email: email,
      senha: senha
    });

    console.log('✅ Login realizado para teste de despesa');
    
    const dadosDespesa = {
      despesa_descricao: 'Teste de Despesa FinFlow',
      despesa_valor: 150.00,
      despesa_data: '2025-08-01',
      despesa_categoria: 'Alimentação',
      despesa_pago: true,
      despesa_recorrente: false,
      despesa_frequencia: null,
      despesa_proximasparcelas: null,
      despesa_datavencimento: '2025-08-01',
      despesa_observacoes: 'Teste do sistema FinFlow'
    };

    const response = await axios.post(`${API_BASE_URL}/api/despesas`, dadosDespesa);

    console.log('✅ Despesa adicionada com sucesso!');
    console.log('📊 ID da despesa:', response.data.id);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao adicionar despesa:', error.response?.data || error.message);
    return null;
  }
}

async function executarCorrecao() {
  console.log('🚀 Iniciando correção do usuário admin...\n');
  
  // Testar senhas existentes
  const resultado = await testarDiferentesSenhas();
  
  if (resultado) {
    console.log('\n✅ Usuário admin encontrado!');
    console.log('🔑 Credenciais corretas:');
    console.log('  Email: admin@gmail.com');
    console.log('  Senha:', resultado.senha);
    
    // Testar adicionar despesa
    await testarAdicionarDespesa('admin@gmail.com', resultado.senha);
    
    console.log('\n🎉 Sistema FinFlow funcionando!');
    console.log('🌐 Acesse: http://localhost:3000');
    console.log('📧 Login: admin@gmail.com');
    console.log('🔑 Senha:', resultado.senha);
  } else {
    console.log('\n❌ Usuário admin não encontrado ou senha incorreta');
    console.log('💡 Criando novo usuário admin...');
    
    const novoAdmin = await criarNovoAdmin();
    
    if (novoAdmin) {
      console.log('\n✅ Novo usuário admin criado!');
      console.log('🔑 Credenciais:');
      console.log('  Email: admin@finflow.com');
      console.log('  Senha: admin123');
      
      // Testar adicionar despesa
      await testarAdicionarDespesa('admin@finflow.com', 'admin123');
      
      console.log('\n🎉 Sistema FinFlow pronto!');
      console.log('🌐 Acesse: http://localhost:3000');
      console.log('📧 Login: admin@finflow.com');
      console.log('🔑 Senha: admin123');
    } else {
      console.log('\n❌ Erro ao criar novo usuário admin');
    }
  }
}

// Executar correção
executarCorrecao().catch(console.error); 