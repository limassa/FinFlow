// Configuração da API
// IMPORTANTE: Para dispositivos físicos, use o IP da sua máquina, não localhost

const PRODUCTION_API_URL = 'https://www.claricash.com.br';

// Função para obter o IP da máquina (para desenvolvimento)
// Em produção, use a URL do seu backend
const getApiUrl = () => {
  // Se estiver em produção, use a URL de produção
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // Para builds de release (TestFlight / App Store / APK), sempre usar produção
  // __DEV__ é false em builds de release
  if (!__DEV__) {
    return PRODUCTION_API_URL;
  }

  return PRODUCTION_API_URL;
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
  USER_NOTIFICACOES: `${API_BASE_URL}/api/user/notificacoes`,
  USER_NOTIFICACOES_PREFS: `${API_BASE_URL}/api/user/notificacoes-prefs`,
  USER_NOTIFICACOES_LIDA: `${API_BASE_URL}/api/user/notificacoes/lida`,
  USER_EXCLUIR: `${API_BASE_URL}/api/user/excluir`,
  
  // Dados principais
  RECEITAS: `${API_BASE_URL}/api/receitas`,
  DESPESAS: `${API_BASE_URL}/api/despesas`,
  CONTAS: `${API_BASE_URL}/api/contas`,
  CONTAS_SALDO_TOTAL: `${API_BASE_URL}/api/contas/saldo-total`,
  METAS_DESPESA: `${API_BASE_URL}/api/metas-despesa`,
  
  // Parcelas
  PARCELA_ATUAL_RECEITA: `${API_BASE_URL}/api/parcela-atual/receita`,
  PARCELA_ATUAL_DESPESA: `${API_BASE_URL}/api/parcela-atual/despesa`,
  
  // Versão
  VERSAO: `${API_BASE_URL}/api/versao`,
  VERSAO_MOBILE: `${API_BASE_URL}/api/versao/mobile`,
  
  // Fale Conosco
  FALE_CONOSCO: `${API_BASE_URL}/api/fale-conosco`,
  
  // Eventos (Agenda/Calendário)
  EVENTOS: `${API_BASE_URL}/api/eventos`,
  EVENTOS_LEMBRETES: `${API_BASE_URL}/api/eventos/lembretes-pendentes`,
  
  // Cartões de Crédito
  CARTOES: `${API_BASE_URL}/api/cartoes`,
  COMPRAS_CARTAO: `${API_BASE_URL}/api/compras-cartao`,
  
  // Categorias Customizáveis
  CATEGORIAS: `${API_BASE_URL}/api/categorias`,
  
  // Orçamento Mensal
  ORCAMENTOS: `${API_BASE_URL}/api/orcamentos`,
  
  // Foto do Usuário
  USER_FOTO: `${API_BASE_URL}/api/user/foto`,
};

export default API_BASE_URL;

