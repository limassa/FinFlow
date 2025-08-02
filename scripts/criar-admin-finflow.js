const axios = require('axios');
const bcrypt = require('bcrypt');

console.log('👤 Criando Usuário Admin - FinFlow\n');

const API_BASE_URL = 'http://localhost:3001';

async function criarUsuarioAdmin() {
  try {
    console.log('📋 Criando usuário admin...');
    
    const senhaHash = await bcrypt.hash('admin123', 10);
    
    const dadosUsuario = {
      nome: 'Administrador',
      email: 'admin@gmail.com',
      senha: senhaHash,
      telefone: '(11) 99999-9999',
      data_nascimento: '1990-01-01'
    };

    const response = await axios.post(`${API_BASE_URL}/api/cadastro`, dadosUsuario);

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📊 Dados do usuário:');
    console.log('  ID:', response.data.id);
    console.log('  Nome:', response.data.nome);
    console.log('  Email:', response.data.email);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.includes('já existe')) {
      console.log('\n💡 Usuário admin já existe. Tentando fazer login...');
      return await testarLoginAdmin();
    }
    
    return null;
  }
}

async function testarLoginAdmin() {
  try {
    console.log('\n🔐 Testando login com admin@gmail.com...');
    
    const response = await axios.post(`${API_BASE_URL}/api/login`, {
      email: 'admin@gmail.com',
      senha: 'admin123'
    });

    console.log('✅ Login bem-sucedido!');
    console.log('📊 Dados do usuário:');
    console.log('  ID:', response.data.id);
    console.log('  Nome:', response.data.nome);
    console.log('  Email:', response.data.email);

    return response.data;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    return null;
  }
}

async function testarAdicionarDespesa() {
  try {
    console.log('\n💸 Testando adicionar despesa...');
    
    const dadosDespesa = {
      despesa_descricao: 'Teste de Despesa',
      despesa_valor: 100.00,
      despesa_data: '2025-08-01',
      despesa_categoria: 'Alimentação',
      despesa_pago: true,
      despesa_recorrente: false,
      despesa_frequencia: null,
      despesa_proximasparcelas: null,
      despesa_datavencimento: '2025-08-01',
      despesa_observacoes: 'Teste do sistema'
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

async function executarCriacao() {
  console.log('🚀 Iniciando criação do usuário admin...\n');
  
  // Criar usuário admin
  const usuario = await criarUsuarioAdmin();
  
  if (usuario) {
    console.log('\n✅ Usuário admin configurado!');
    console.log('🔑 Credenciais:');
    console.log('  Email: admin@gmail.com');
    console.log('  Senha: admin123');
    
    // Testar adicionar despesa
    await testarAdicionarDespesa();
    
    console.log('\n🎉 Sistema FinFlow pronto!');
    console.log('🌐 Acesse: http://localhost:3000');
    console.log('📧 Login: admin@gmail.com');
    console.log('🔑 Senha: admin123');
  } else {
    console.log('\n❌ Erro ao configurar usuário admin');
    console.log('💡 Verifique:');
    console.log('  1. Backend rodando');
    console.log('  2. Banco de dados configurado');
    console.log('  3. Tabelas criadas');
  }
}

// Executar criação
executarCriacao().catch(console.error); 