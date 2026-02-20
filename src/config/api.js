// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://finflow-production-e4b3.up.railway.app';

// Debug: Log da URL da API
console.log('🔗 API_BASE_URL configurada:', API_BASE_URL);
console.log('🔗 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Debug: Log da URL da API
console.log('🔗 API_BASE_URL configurada:', API_BASE_URL);
console.log('🔗 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🔗 Ambiente:', process.env.NODE_ENV);

export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: `${API_BASE_URL}/api/login`,
  CADASTRO: `${API_BASE_URL}/api/cadastro`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/reset-password`,
  
  // Usuário
  USER_PROFILE: `${API_BASE_URL}/api/user/perfil`,
  USER_LEMBRETES: `${API_BASE_URL}/api/user/lembretes`,
  USER_EXPORTAR: `${API_BASE_URL}/api/user/exportar`,
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
  
  // Utilitários
  PASSWORD_REQUIREMENTS: `${API_BASE_URL}/api/password-requirements`,
  VERSAO: `${API_BASE_URL}/api/versao`,
  
  // Fale Conosco
  FALE_CONOSCO: `${API_BASE_URL}/api/fale-conosco`,
  
  // Eventos (Agenda/Calendário)
  EVENTOS: `${API_BASE_URL}/api/eventos`,
  
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