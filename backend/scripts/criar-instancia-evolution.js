// Script para criar uma instância na Evolution API via API REST
// Execute: node backend/scripts/criar-instancia-evolution.js

require('dotenv').config({ path: './config.env' });
const axios = require('axios');

async function criarInstancia() {
  const baseUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'finflow';
  const apiKey = process.env.EVOLUTION_API_KEY || '';

  console.log('🚀 Criando instância na Evolution API...\n');
  console.log('📋 Configurações:');
  console.log(`   URL: ${baseUrl}`);
  console.log(`   Nome da Instância: ${instanceName}`);
  console.log(`   API Key: ${apiKey ? '✅ Configurada' : '❌ Não configurada (sem autenticação)'}\n`);

  try {
    // Configurar headers
    const headers = {
      'Content-Type': 'application/json'
    };

    if (apiKey && apiKey.trim() !== '') {
      headers['apikey'] = apiKey;
    }

    console.log('1️⃣ Verificando se a instância já existe...');
    
    // Tentar buscar instâncias existentes
    try {
      const response = await axios.get(`${baseUrl}/instance/fetchInstances`, {
        headers,
        timeout: 10000
      });

      if (response.data && Array.isArray(response.data)) {
        const instanceExists = response.data.find(inst => {
          const name = inst.instance?.instanceName || inst.instanceName;
          return name === instanceName;
        });

        if (instanceExists) {
          console.log(`   ⚠️ Instância "${instanceName}" já existe!`);
          const status = instanceExists.instance?.status || instanceExists.status;
          console.log(`   📊 Status: ${status}`);
          
          if (status === 'open' || status === 'connected') {
            console.log('   ✅ Instância já está conectada!');
            return;
          } else {
            console.log('   ⚠️ Instância existe mas não está conectada');
            console.log('   💡 Você precisa escanear o QR Code novamente');
            console.log('   💡 Ou delete a instância e crie uma nova');
            return;
          }
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ⚠️ Erro de autenticação ao verificar instâncias');
        console.log('   💡 Verifique a API Key no config.env');
      } else {
        console.log('   ⚠️ Não foi possível verificar instâncias existentes');
        console.log('   💡 Continuando com a criação...');
      }
    }

    console.log('\n2️⃣ Criando nova instância...');
    
    // Criar instância
    const createResponse = await axios.post(
      `${baseUrl}/instance/create`,
      {
        instanceName: instanceName,
        token: '',
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      },
      {
        headers,
        timeout: 15000
      }
    );

    console.log('   ✅ Instância criada com sucesso!');
    console.log('   📊 Resposta:', JSON.stringify(createResponse.data).substring(0, 200));

    console.log('\n3️⃣ Próximos passos:');
    console.log('   1. Acesse a interface da Evolution API: http://localhost:8080');
    console.log(`   2. Encontre a instância "${instanceName}"`);
    console.log('   3. Escaneie o QR Code com seu WhatsApp');
    console.log('   4. Aguarde a conexão ser estabelecida');
    console.log('\n   💡 Ou use a interface web para ver o QR Code');

  } catch (error) {
    console.error('\n❌ Erro ao criar instância:', error.message);
    
    if (error.response) {
      console.error('   📊 Status HTTP:', error.response.status);
      console.error('   📊 Resposta:', JSON.stringify(error.response.data));
      
      if (error.response.status === 401) {
        console.error('   💡 Erro de autenticação - verifique a API Key no config.env');
      } else if (error.response.status === 409) {
        console.error('   💡 Instância já existe - use a interface web para escanear o QR Code');
      } else if (error.response.status === 404) {
        console.error('   💡 Endpoint não encontrado - verifique a URL da Evolution API');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   💡 Evolution API não está acessível - verifique se está rodando');
    } else {
      console.error('   💡 Verifique os logs da Evolution API para mais detalhes');
    }
    
    console.log('\n💡 Alternativa: Use a interface web para criar a instância:');
    console.log('   1. Acesse: http://localhost:8080');
    console.log('   2. Clique em "Criar Instância" ou "Create Instance"');
    console.log(`   3. Use o nome: ${instanceName}`);
    console.log('   4. Escaneie o QR Code com seu WhatsApp');
  }
}

criarInstancia().catch(console.error);

