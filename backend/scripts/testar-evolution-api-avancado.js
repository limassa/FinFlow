// Script avançado para testar a conexão com a Evolution API
// Testa diferentes formatos de autenticação
// Execute: node backend/scripts/testar-evolution-api-avancado.js

require('dotenv').config({ path: './config.env' });
const axios = require('axios');

async function testarEvolutionAPI() {
  const baseUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'finflow';
  const apiKey = process.env.EVOLUTION_API_KEY || '';

  console.log('🔍 Teste Avançado - Evolution API\n');
  console.log('📋 Configurações:');
  console.log(`   URL: ${baseUrl}`);
  console.log(`   Instância: ${instanceName}`);
  console.log(`   API Key: ${apiKey ? '✅ Configurada (' + apiKey.substring(0, 20) + '...)' : '❌ Não configurada'}\n`);

  // Teste 1: Sem autenticação
  console.log('1️⃣ Testando SEM autenticação...');
  try {
    const response = await axios.get(`${baseUrl}/instance/fetchInstances`, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    console.log('   ✅ Funciona SEM autenticação!');
    console.log(`   📊 Instâncias encontradas: ${response.data?.length || 0}`);
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach(inst => {
        const name = inst.instance?.instanceName || inst.instanceName || 'unknown';
        const status = inst.instance?.status || inst.status || 'unknown';
        console.log(`      - ${name}: ${status}`);
      });
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ❌ Requer autenticação (401)');
    } else {
      console.log(`   ⚠️ Erro: ${error.message}`);
    }
  }

  // Teste 2: Com header 'apikey'
  if (apiKey) {
    console.log('\n2️⃣ Testando com header "apikey"...');
    try {
      const response = await axios.get(`${baseUrl}/instance/fetchInstances`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        timeout: 10000
      });
      console.log('   ✅ Funciona com header "apikey"!');
      console.log(`   📊 Instâncias encontradas: ${response.data?.length || 0}`);
      if (response.data && Array.isArray(response.data)) {
        const instance = response.data.find(inst => {
          const name = inst.instance?.instanceName || inst.instanceName;
          return name === instanceName;
        });
        if (instance) {
          const status = instance.instance?.status || instance.status;
          console.log(`   ✅ Instância "${instanceName}" encontrada: ${status}`);
        } else {
          console.log(`   ⚠️ Instância "${instanceName}" não encontrada`);
          console.log(`   📋 Instâncias disponíveis: ${response.data.map(i => i.instance?.instanceName || i.instanceName || 'unknown').join(', ')}`);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ❌ Não funciona com header "apikey" (401)');
      } else {
        console.log(`   ⚠️ Erro: ${error.message}`);
      }
    }
  }

  // Teste 3: Com header 'Authorization: Bearer'
  if (apiKey) {
    console.log('\n3️⃣ Testando com header "Authorization: Bearer"...');
    try {
      const response = await axios.get(`${baseUrl}/instance/fetchInstances`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 10000
      });
      console.log('   ✅ Funciona com header "Authorization: Bearer"!');
      console.log(`   📊 Instâncias encontradas: ${response.data?.length || 0}`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ❌ Não funciona com header "Authorization: Bearer" (401)');
      } else {
        console.log(`   ⚠️ Erro: ${error.message}`);
      }
    }
  }

  // Teste 4: Com header 'x-api-key'
  if (apiKey) {
    console.log('\n4️⃣ Testando com header "x-api-key"...');
    try {
      const response = await axios.get(`${baseUrl}/instance/fetchInstances`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        timeout: 10000
      });
      console.log('   ✅ Funciona com header "x-api-key"!');
      console.log(`   📊 Instâncias encontradas: ${response.data?.length || 0}`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ❌ Não funciona com header "x-api-key" (401)');
      } else {
        console.log(`   ⚠️ Erro: ${error.message}`);
      }
    }
  }

  // Teste 5: Verificar se a API Key está correta
  console.log('\n5️⃣ Verificando API Key...');
  console.log('   💡 Para verificar se a API Key está correta:');
  console.log('      1. Acesse a Evolution API: http://localhost:8080');
  console.log('      2. Verifique nas configurações qual API Key está configurada');
  console.log('      3. Compare com a API Key no arquivo config.env');
  console.log(`   📝 API Key atual (primeiros 30 caracteres): ${apiKey ? apiKey.substring(0, 30) + '...' : 'não configurada'}`);

  console.log('\n✅ Teste concluído!');
  console.log('\n💡 Próximos passos:');
  console.log('   1. Se o teste 1 funcionou (sem autenticação), deixe EVOLUTION_API_KEY vazio no config.env');
  console.log('   2. Se algum teste 2-4 funcionou, o código já está configurado corretamente');
  console.log('   3. Se nenhum funcionou, verifique a API Key na Evolution API');
  console.log('   4. Reinicie o backend após alterar config.env');
}

testarEvolutionAPI().catch(console.error);

