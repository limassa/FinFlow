const axios = require('axios');

// Configuração da API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function testarLembretesEmail() {
  console.log('🔔 Testando envio de lembretes por email...');
  console.log('📡 API URL:', API_URL);
  
  try {
    // 1. Primeiro, vamos buscar um usuário para testar
    console.log('\n1️⃣ Buscando usuários disponíveis...');
    const usersResponse = await axios.get(`${API_URL}/api/users`);
    const users = usersResponse.data;
    
    if (!users || users.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Crie um usuário primeiro.');
      return;
    }
    
    console.log(`✅ Encontrados ${users.length} usuários:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.usuario_nome} (${user.usuario_email}) - ID: ${user.usuario_id}`);
    });
    
    // 2. Escolher o primeiro usuário para teste
    const testUser = users[0];
    console.log(`\n2️⃣ Usando usuário: ${testUser.usuario_nome} (ID: ${testUser.usuario_id})`);
    
    // 3. Verificar configuração de lembretes do usuário
    console.log('\n3️⃣ Verificando configuração de lembretes...');
    const lembretesResponse = await axios.get(`${API_URL}/api/user/lembretes?userId=${testUser.usuario_id}`);
    const lembretes = lembretesResponse.data;
    
    console.log('📋 Configuração atual:');
    console.log(`   - Lembretes ativos: ${lembretes.lembretesAtivos}`);
    console.log(`   - Lembretes por email: ${lembretes.lembretesEmail}`);
    console.log(`   - Dias antes: ${lembretes.lembretesDiasAntes}`);
    
    // 4. Buscar vencimentos próximos
    console.log('\n4️⃣ Buscando vencimentos próximos...');
    const vencimentosResponse = await axios.get(`${API_URL}/api/lembretes/vencimentos?userId=${testUser.usuario_id}`);
    const vencimentos = vencimentosResponse.data;
    
    console.log(`📅 Encontrados ${vencimentos.length} vencimentos próximos:`);
    vencimentos.forEach((venc, index) => {
      console.log(`   ${index + 1}. ${venc.despesa_descricao} - R$ ${venc.despesa_valor} - Venc: ${venc.despesa_dtvencimento}`);
    });
    
    // 5. Testar envio de email de lembretes
    console.log('\n5️⃣ Testando envio de email de lembretes...');
    const emailResponse = await axios.post(`${API_URL}/api/lembretes/teste-email`, {
      userId: testUser.usuario_id
    });
    
    console.log('✅ Resultado do teste de email:');
    console.log('   - Status:', emailResponse.status);
    console.log('   - Mensagem:', emailResponse.data.message);
    console.log('   - Vencimentos:', emailResponse.data.vencimentos);
    console.log('   - Destinatário:', emailResponse.data.destinatario);
    
    console.log('\n🎉 Teste de lembretes concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.response) {
      console.error('📋 Detalhes do erro:');
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Executar o teste
testarLembretesEmail(); 