// Configuração da API
// IMPORTANTE: Para dispositivos físicos, use o IP da sua máquina, não localhost

// Função para obter o IP da máquina (para desenvolvimento)
// Em produção, use a URL do seu backend
const getApiUrl = () => {
  // Se estiver em produção, use a URL de produção
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Para builds de release (APK), sempre usar produção
  // __DEV__ é false em builds de release
  if (!__DEV__) {
    return 'https://finflow-production-e4b3.up.railway.app';
  }

  // TEMPORÁRIO: Para testar no emulador apontando para produção
  // Descomente a linha abaixo para testar com produção no emulador
  return 'https://finflow-production-e4b3.up.railway.app';
  
  // Para desenvolvimento local, detecta o ambiente
  // Para emulador Android, use 10.0.2.2
  // Para emulador iOS, use localhost
  // Para dispositivo físico, você precisa configurar manualmente
  
  // Opção 1: Use o IP da sua máquina na rede local
  // return 'http://192.168.100.11:3001';
  
  // Opção 2: Para emulador Android, use 10.0.2.2
  // return 'http://10.0.2.2:3001';
  
  // Opção 3: Para emulador iOS, use localhost
  // return 'http://localhost:3001';
};

const API_BASE_URL = getApiUrl();

// Log para debug
console.log('🔗 API_BASE_URL configurada:', API_BASE_URL);
console.log('🔗 Ambiente:', __DEV__ ? 'development' : 'production');
console.log('🔗 EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL || 'não configurado');
console.log('📱 Para dispositivo físico, configure o IP da sua máquina!');

export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: `${API_BASE_URL}/api/login`,
  CADASTRO: `${API_BASE_URL}/api/cadastro`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/reset-password`,
  
  // Usuário
  USER_PROFILE: `${API_BASE_URL}/api/user/perfil`,
  USER_LEMBRETES: `${API_BASE_URL}/api/user/lembretes`,
  
  // Dados principais
  RECEITAS: `${API_BASE_URL}/api/receitas`,
  DESPESAS: `${API_BASE_URL}/api/despesas`,
  CONTAS: `${API_BASE_URL}/api/contas`,
  CONTAS_SALDO_TOTAL: `${API_BASE_URL}/api/contas/saldo-total`,
  
  // Parcelas
  PARCELA_ATUAL_RECEITA: `${API_BASE_URL}/api/parcela-atual/receita`,
  PARCELA_ATUAL_DESPESA: `${API_BASE_URL}/api/parcela-atual/despesa`,
  
  // Versão
  VERSAO: `${API_BASE_URL}/api/versao`,
  VERSAO_MOBILE: `${API_BASE_URL}/api/versao/mobile`,
  
  // Fale Conosco
  FALE_CONOSCO: `${API_BASE_URL}/api/fale-conosco`,
};

export default API_BASE_URL;

