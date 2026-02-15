const axios = require('axios');

/**
 * Serviço de WhatsApp usando Evolution API
 * Evolution API é uma API open-source para integração com WhatsApp
 * Documentação: https://github.com/EvolutionAPI/evolution-api
 */
class WhatsAppService {
  constructor() {
    // URL da Evolution API (configure no config.env)
    this.baseUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    // Nome da instância (configure no config.env)
    this.instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'claricash';
    // Token de autenticação (configure no config.env)
    this.apiKey = process.env.EVOLUTION_API_KEY || '';
  }

  /**
   * Formatar número de telefone para o formato internacional
   * @param {string} telefone - Telefone no formato (00) 00000-0000
   * @returns {string} - Telefone no formato 5500000000000
   */
  formatPhoneNumber(telefone) {
    if (!telefone) return null;
    
    // Remove caracteres não numéricos
    let numbers = telefone.replace(/\D/g, '');
    
    // Se começa com 0, remove
    if (numbers.startsWith('0')) {
      numbers = numbers.substring(1);
    }
    
    // Se não começa com código do país, adiciona 55 (Brasil)
    if (!numbers.startsWith('55')) {
      numbers = '55' + numbers;
    }
    
    return numbers + '@s.whatsapp.net';
  }

  /**
   * Verificar se a instância está conectada
   * @returns {Promise<boolean>}
   */
  async checkConnection() {
    try {
      console.log(`🔍 Verificando conexão com Evolution API...`);
      console.log(`   URL: ${this.baseUrl}`);
      console.log(`   Instância: ${this.instanceName}`);
      console.log(`   API Key: ${this.apiKey ? 'Configurada' : 'Não configurada'}`);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Adicionar API Key apenas se estiver configurada
      // Tenta diferentes formatos de header dependendo da versão da Evolution API
      if (this.apiKey) {
        // Opção 1: Header apikey (padrão)
        headers['apikey'] = this.apiKey;
        // Opção 2: Header Authorization (algumas versões) - descomente se necessário
        // headers['Authorization'] = `Bearer ${this.apiKey}`;
        // Opção 3: Header x-api-key (algumas versões) - descomente se necessário
        // headers['x-api-key'] = this.apiKey;
      }
      
      console.log(`   Headers:`, Object.keys(headers));
      
      const response = await axios.get(`${this.baseUrl}/instance/fetchInstances`, {
        headers: headers,
        timeout: 10000 // 10 segundos de timeout
      });

      console.log(`   Status HTTP: ${response.status}`);
      console.log(`   Resposta recebida:`, response.data ? 'Sim' : 'Não');

      if (response.data && Array.isArray(response.data)) {
        console.log(`   Total de instâncias encontradas: ${response.data.length}`);
        
        // Estrutura da resposta: { id, name, connectionStatus, ownerJid, profileName, ... }
        const instance = response.data.find(inst => {
          const instanceName = inst.name;
          return instanceName === this.instanceName;
        });
        
        if (instance) {
          const status = instance.connectionStatus;
          console.log(`   ✅ Instância "${this.instanceName}" encontrada!`);
          console.log(`   Status: ${status}`);
          return status === 'open' || status === 'connected';
        } else {
          console.log(`   ❌ Instância "${this.instanceName}" não encontrada`);
          console.log(`   Instâncias disponíveis:`, response.data.map(inst => inst.name || 'N/A'));
        }
      } else {
        console.log(`   ⚠️ Formato de resposta inesperado:`, typeof response.data);
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar conexão com Evolution API:', error.message);
      if (error.response) {
        console.error('   Status HTTP:', error.response.status);
        console.error('   Resposta:', JSON.stringify(error.response.data));
        if (error.response.status === 401) {
          console.error('   💡 Erro de autenticação - verifique a API Key no config.env');
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.error('   💡 Evolution API não está acessível - verifique se está rodando em', this.baseUrl);
      } else if (error.code === 'ETIMEDOUT') {
        console.error('   💡 Timeout ao conectar - verifique se a Evolution API está respondendo');
      }
      return false;
    }
  }

  /**
   * Enviar mensagem de texto via WhatsApp
   * @param {string} number - Número do destinatário (formato: 5500000000000@s.whatsapp.net)
   * @param {string} message - Mensagem a ser enviada
   * @returns {Promise<boolean>}
   */
  async sendTextMessage(number, message) {
    try {
      console.log(`📤 Enviando mensagem WhatsApp...`);
      console.log(`   URL: ${this.baseUrl}/message/sendText/${this.instanceName}`);
      console.log(`   Número: ${number}`);
      console.log(`   Mensagem (primeiros 100 chars): ${message.substring(0, 100)}...`);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Adicionar API Key apenas se estiver configurada
      // Tenta diferentes formatos de header dependendo da versão da Evolution API
      if (this.apiKey) {
        // Opção 1: Header apikey (padrão)
        headers['apikey'] = this.apiKey;
        // Opção 2: Header Authorization (algumas versões) - descomente se necessário
        // headers['Authorization'] = `Bearer ${this.apiKey}`;
        // Opção 3: Header x-api-key (algumas versões) - descomente se necessário
        // headers['x-api-key'] = this.apiKey;
      }
      
      console.log(`   Headers:`, Object.keys(headers));
      
      // Formato correto da Evolution API: { number, text }
      // Baseado no schema: textMessageSchema requer ['number', 'text']
      const payload = {
        number: number,
        text: message
      };
      
      console.log(`   Payload:`, JSON.stringify(payload).substring(0, 200) + '...');
      
      const response = await axios.post(
        `${this.baseUrl}/message/sendText/${this.instanceName}`,
        payload,
        {
          headers: headers,
          timeout: 15000 // 15 segundos de timeout
        }
      );

      console.log(`   ✅ Resposta recebida! Status: ${response.status}`);
      console.log(`   Resposta:`, JSON.stringify(response.data).substring(0, 200));
      
      return response.status === 201 || response.status === 200;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error.message);
      if (error.response) {
        console.error('   Status HTTP:', error.response.status);
        console.error('   Resposta completa:', JSON.stringify(error.response.data, null, 2));
        if (error.response.status === 401) {
          console.error('   💡 Erro de autenticação - verifique a API Key no config.env');
        } else if (error.response.status === 404) {
          console.error('   💡 Instância não encontrada - verifique o nome da instância');
        } else if (error.response.status === 400) {
          console.error('   💡 Erro de validação - verifique o formato do número e da mensagem');
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.error('   💡 Evolution API não está acessível - verifique se está rodando');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('   💡 Timeout ao enviar - verifique se a Evolution API está respondendo');
      }
      // Re-lançar o erro para que o endpoint possa capturá-lo
      throw error;
    }
  }

  /**
   * Enviar lembrete de vencimento via WhatsApp
   * @param {Object} user - Dados do usuário { nome, telefone }
   * @param {Array} vencimentos - Array de despesas vencendo
   * @returns {Promise<boolean>}
   */
  async sendReminderMessage(user, vencimentos) {
    if (!vencimentos || vencimentos.length === 0) {
      return false;
    }

    // Verificar se o telefone está cadastrado
    if (!user.telefone) {
      console.log('⚠️ Usuário não possui telefone cadastrado');
      return false;
    }

    // Formatar número do telefone
    const phoneNumber = this.formatPhoneNumber(user.telefone);
    if (!phoneNumber) {
      console.log('⚠️ Número de telefone inválido');
      return false;
    }

    // Verificar conexão
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      console.log('⚠️ Instância do WhatsApp não está conectada');
      return false;
    }

    // Montar mensagem
    let mensagem = `🔔 *LEMBRETES DE VENCIMENTO - Claricash*\n\n`;
    mensagem += `Olá, *${user.nome}*!\n\n`;
    mensagem += `Você tem ${vencimentos.length} despesa(s) com vencimento próximo:\n\n`;

    vencimentos.forEach((venc, index) => {
      const valor = Number(venc.despesa_valor).toFixed(2).replace('.', ',');
      const dataVenc = new Date(venc.despesa_dtvencimento).toLocaleDateString('pt-BR');
      
      mensagem += `*${index + 1}. ${venc.despesa_descricao}*\n`;
      mensagem += `   💰 Valor: R$ ${valor}\n`;
      mensagem += `   📅 Vencimento: ${dataVenc}\n`;
      mensagem += `   ⚠️ Status: ${venc.despesa_pago ? '✅ Pago' : '⏳ Pendente'}\n\n`;
    });

    mensagem += `📱 Acesse o Claricash para mais detalhes.\n\n`;
    mensagem += `_Esta é uma mensagem automática. Não responda._`;

    // Enviar mensagem
    try {
      const enviado = await this.sendTextMessage(phoneNumber, mensagem);
      
      if (enviado) {
        console.log(`✅ Lembrete WhatsApp enviado para ${user.nome} (${phoneNumber})`);
      } else {
        console.log(`❌ Falha ao enviar lembrete WhatsApp para ${user.nome}`);
      }

      return enviado;
    } catch (error) {
      console.error(`❌ Erro ao enviar lembrete WhatsApp para ${user.nome}:`, error.message);
      throw error; // Re-lançar para que o endpoint possa capturar
    }
  }

  /**
   * Testar envio de mensagem
   * @param {string} telefone - Telefone para teste
   * @param {string} mensagem - Mensagem de teste
   * @returns {Promise<boolean>}
   */
  async testMessage(telefone, mensagem = 'Teste de mensagem do Claricash') {
    const phoneNumber = this.formatPhoneNumber(telefone);
    if (!phoneNumber) {
      console.log('⚠️ Número de telefone inválido');
      return false;
    }

    const enviado = await this.sendTextMessage(phoneNumber, mensagem);
    return enviado;
  }
}

module.exports = new WhatsAppService();

