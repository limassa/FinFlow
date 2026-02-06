const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Carregar config.env manualmente (já que dotenv pode não funcionar com caminho relativo)
function loadConfigEnv() {
  const configPath = path.join(__dirname, '..', 'config.env');
  const config = {};
  
  console.log(`📄 Carregando config.env de: ${configPath}`);
  
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        // Remove aspas se houver
        const cleanValue = value.replace(/^["']|["']$/g, '');
        config[key.trim()] = cleanValue;
      }
    });
    console.log(`   ✅ Arquivo encontrado e carregado`);
    console.log(`   📋 Variáveis carregadas: ${Object.keys(config).length}\n`);
  } else {
    console.log(`   ⚠️ Arquivo não encontrado!\n`);
  }
  
  return config;
}

// Carregar variáveis de ambiente
const config = loadConfigEnv();
const EVOLUTION_API_URL = config.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_INSTANCE_NAME = config.EVOLUTION_INSTANCE_NAME || 'finflow';
const EVOLUTION_API_KEY = config.EVOLUTION_API_KEY || '';

// Debug: mostrar o que foi carregado
console.log('🔍 DEBUG - Variáveis carregadas:');
console.log(`   EVOLUTION_API_URL: ${EVOLUTION_API_URL}`);
console.log(`   EVOLUTION_INSTANCE_NAME: ${EVOLUTION_INSTANCE_NAME}`);
console.log(`   EVOLUTION_API_KEY: ${EVOLUTION_API_KEY ? '✅ ' + EVOLUTION_API_KEY.substring(0, 10) + '...' + EVOLUTION_API_KEY.substring(EVOLUTION_API_KEY.length - 4) + ' (' + EVOLUTION_API_KEY.length + ' chars)' : '❌ NÃO CONFIGURADA'}\n`);

async function testarEvolutionAPI() {
  console.log('🔍 TESTE DE CONEXÃO COM EVOLUTION API\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 Configuração:');
  console.log(`   URL: ${EVOLUTION_API_URL}`);
  console.log(`   Instância: ${EVOLUTION_INSTANCE_NAME}`);
  if (EVOLUTION_API_KEY) {
    console.log(`   API Key: ✅ Configurada (${EVOLUTION_API_KEY.substring(0, 10)}...${EVOLUTION_API_KEY.substring(EVOLUTION_API_KEY.length - 4)})`);
    console.log(`   Tamanho: ${EVOLUTION_API_KEY.length} caracteres\n`);
  } else {
    console.log(`   API Key: ❌ NÃO CONFIGURADA`);
    console.log(`   ⚠️ Verifique se EVOLUTION_API_KEY está no config.env\n`);
  }
  
  try {
    // Teste 1: Verificar se a API está acessível
    console.log('🔄 Teste 1: Verificando se a API está acessível...');
    
    // Tentar diferentes formatos de header
    const headerFormats = [];
    if (EVOLUTION_API_KEY) {
      headerFormats.push(
        { name: 'apikey', value: EVOLUTION_API_KEY },
        { name: 'Authorization', value: `Bearer ${EVOLUTION_API_KEY}` },
        { name: 'x-api-key', value: EVOLUTION_API_KEY },
        { name: 'apiKey', value: EVOLUTION_API_KEY }
      );
    }
    
    let response = null;
    let lastError = null;
    
    // Tentar sem autenticação primeiro (se não tiver API Key)
    if (!EVOLUTION_API_KEY) {
      console.log('   ⚠️ Sem API Key configurada, tentando sem autenticação...');
      try {
        response = await axios.get(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        console.log(`   ✅ API acessível sem autenticação! (Status: ${response.status})\n`);
      } catch (err) {
        lastError = err;
        console.log(`   ❌ Falhou sem autenticação (Status: ${err.response?.status || 'N/A'})\n`);
      }
    }
    
    // Tentar com diferentes formatos de header
    if (!response && headerFormats.length > 0) {
      for (const format of headerFormats) {
        try {
          console.log(`   🔄 Tentando com header "${format.name}"...`);
          const headers = {
            'Content-Type': 'application/json',
            [format.name]: format.value
          };
          
          response = await axios.get(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
            headers: headers,
            timeout: 10000
          });
          
          console.log(`   ✅ Sucesso com header "${format.name}"! (Status: ${response.status})\n`);
          break;
        } catch (err) {
          lastError = err;
          if (err.response?.status === 401) {
            console.log(`   ❌ Falhou com "${format.name}" (401 Unauthorized)`);
          } else {
            console.log(`   ❌ Falhou com "${format.name}" (${err.response?.status || err.message})`);
          }
        }
      }
    }
    
    // Se nenhum formato funcionou, lançar o último erro
    if (!response) {
      throw lastError || new Error('Não foi possível conectar à API');
    }
    
    console.log(`   ✅ API está acessível! (Status: ${response.status})\n`);
    
    // Teste 2: Verificar instâncias
    console.log('🔄 Teste 2: Verificando instâncias...');
    if (response.data && Array.isArray(response.data)) {
      console.log(`   ✅ Total de instâncias: ${response.data.length}\n`);
      
      if (response.data.length === 0) {
        console.log('   ⚠️ Nenhuma instância encontrada!\n');
        console.log('💡 SOLUÇÃO:');
        console.log('   1. Acesse a interface da Evolution API');
        console.log(`   2. Crie uma instância chamada "${EVOLUTION_INSTANCE_NAME}"`);
        console.log('   3. Escaneie o QR Code com seu WhatsApp\n');
        return;
      }
      
      // Listar todas as instâncias
      console.log('📋 Instâncias encontradas:');
      response.data.forEach((inst, index) => {
        // Estrutura da resposta: { id, name, connectionStatus, ownerJid, profileName, ... }
        const instanceName = inst.name || 'N/A';
        const status = inst.connectionStatus || 'N/A';
        console.log(`   ${index + 1}. ${instanceName} - Status: ${status}`);
      });
      console.log('');
      
      // Teste 3: Verificar instância específica
      console.log(`🔄 Teste 3: Verificando instância "${EVOLUTION_INSTANCE_NAME}"...`);
      const instance = response.data.find(inst => {
        const instanceName = inst.name;
        return instanceName === EVOLUTION_INSTANCE_NAME;
      });
      
      if (instance) {
        const status = instance.connectionStatus;
        console.log(`   ✅ Instância encontrada!`);
        console.log(`   Status: ${status}\n`);
        
        if (status === 'open' || status === 'connected') {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log('✅ TUDO OK! A instância está conectada e pronta para uso.\n');
        } else if (status === 'qrCode' || status === 'close') {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log('⚠️ ATENÇÃO: A instância precisa ser conectada!\n');
          console.log('💡 SOLUÇÃO:');
          console.log('   1. Acesse a interface da Evolution API');
          console.log(`   2. Gere um novo QR Code para a instância "${EVOLUTION_INSTANCE_NAME}"`);
          console.log('   3. Escaneie o QR Code com seu WhatsApp\n');
        } else {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log(`⚠️ Status da instância: ${status}\n`);
          console.log('💡 Verifique a interface da Evolution API para mais detalhes.\n');
        }
      } else {
        console.log(`   ❌ Instância "${EVOLUTION_INSTANCE_NAME}" não encontrada!\n`);
        console.log('💡 SOLUÇÃO:');
        console.log('   1. Verifique o nome da instância no config.env');
        console.log('   2. Ou crie uma instância com o nome correto na Evolution API\n');
      }
    } else {
      console.log('   ⚠️ Formato de resposta inesperado\n');
    }
    
  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('❌ ERRO!\n');
    
    if (error.response) {
      console.log(`📊 Status HTTP: ${error.response.status}`);
      console.log(`📋 Resposta:`, JSON.stringify(error.response.data, null, 2));
      console.log('');
      
      if (error.response.status === 401) {
        console.log('💡 SOLUÇÃO:');
        console.log('   Erro de autenticação - a API Key pode estar incorreta');
        console.log(`   API Key no config.env: ${EVOLUTION_API_KEY ? EVOLUTION_API_KEY.substring(0, 10) + '...' + EVOLUTION_API_KEY.substring(EVOLUTION_API_KEY.length - 4) : 'Não configurada'}`);
        console.log('');
        console.log('   Verifique:');
        console.log('   1. A API Key no config.env está correta?');
        console.log('   2. A API Key deve ser a mesma do arquivo .env da Evolution API');
        console.log('   3. O formato do header pode estar errado');
        console.log('   4. Tente verificar na interface da Evolution API qual API Key está configurada\n');
      } else if (error.response.status === 404) {
        console.log('💡 SOLUÇÃO:');
        console.log('   Endpoint não encontrado - verifique a URL da Evolution API\n');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Não foi possível conectar à Evolution API!\n');
      console.log('💡 SOLUÇÃO:');
      console.log('   1. Verifique se a Evolution API está rodando');
      console.log(`   2. Verifique se a URL está correta: ${EVOLUTION_API_URL}`);
      console.log('   3. Tente acessar a URL no navegador\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Timeout ao conectar!\n');
      console.log('💡 SOLUÇÃO:');
      console.log('   1. Verifique se a Evolution API está respondendo');
      console.log('   2. Verifique sua conexão de rede\n');
    } else {
      console.log('❌ Erro:', error.message);
      console.log('\n💡 Verifique os logs acima para mais detalhes.\n');
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testarEvolutionAPI();
