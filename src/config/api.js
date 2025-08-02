// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://finflow-production-e4b3.up.railway.app';

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
  
  // Parcelas
  PARCELA_ATUAL_RECEITA: `${API_BASE_URL}/api/parcela-atual/receita`,
  PARCELA_ATUAL_DESPESA: `${API_BASE_URL}/api/parcela-atual/despesa`,
  
  // Utilitários
  PASSWORD_REQUIREMENTS: `${API_BASE_URL}/api/password-requirements`,
  VERSAO: `${API_BASE_URL}/api/versao`,
};

export default API_BASE_URL; 