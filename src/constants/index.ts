// Constantes principais do FinFlow Mobile

// Configurações da API
export const API_CONFIG = {
  BASE_URL: 'https://finflow-production.up.railway.app',
  TIMEOUT: 10000,
  ENDPOINTS: {
    LOGIN: '/api/login',
    CADASTRO: '/api/cadastro',
    FORGOT_PASSWORD: '/api/forgot-password',
    RESET_PASSWORD: '/api/reset-password',
    USER_PROFILE: '/api/user/perfil',
    RECEITAS: '/api/receitas',
    DESPESAS: '/api/despesas',
    CONTAS: '/api/contas',
    DASHBOARD: '/api/dashboard',
    VERSION: '/api/versao',
  },
};

// Cores do tema
export const COLORS = {
  // Cores principais
  PRIMARY: '#667eea',
  PRIMARY_DARK: '#5a6fd8',
  SECONDARY: '#764ba2',
  SECONDARY_DARK: '#6a4190',
  
  // Gradientes
  GRADIENT_PRIMARY: ['#667eea', '#764ba2'],
  GRADIENT_SECONDARY: ['#ff6b6b', '#ee5a24'],
  GRADIENT_SUCCESS: ['#4CAF50', '#45a049'],
  GRADIENT_WARNING: ['#FF9800', '#F57C00'],
  
  // Cores de status
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#f44336',
  INFO: '#2196F3',
  
  // Cores neutras
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#f8f9fa',
  GRAY: '#6c757d',
  GRAY_DARK: '#495057',
  
  // Cores de fundo
  BACKGROUND_LIGHT: '#FFFFFF',
  BACKGROUND_DARK: '#121212',
  CARD_LIGHT: '#FFFFFF',
  CARD_DARK: '#1E1E1E',
  
  // Cores de texto
  TEXT_PRIMARY_LIGHT: '#212121',
  TEXT_SECONDARY_LIGHT: '#757575',
  TEXT_PRIMARY_DARK: '#FFFFFF',
  TEXT_SECONDARY_DARK: '#B0B0B0',
};

// Categorias padrão
export const CATEGORIES = {
  RECEITAS: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Vendas',
    'Presentes',
    'Outros',
  ],
  DESPESAS: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Contas',
    'Outros',
  ],
};

// Tipos de conta
export const ACCOUNT_TYPES = [
  'Conta Corrente',
  'Conta Poupança',
  'Cartão de Crédito',
  'Carteira',
  'Investimentos',
  'Outros',
];

// Configurações de notificação
export const NOTIFICATION_CONFIG = {
  REMINDER_DAYS: [1, 3, 7], // Dias antes do vencimento
  CHANNEL_ID: 'finflow_channel',
  CHANNEL_NAME: 'FinFlow Notifications',
  CHANNEL_DESCRIPTION: 'Notificações do FinFlow',
};

// Configurações de armazenamento
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'finflow_auth_token',
  USER_DATA: 'finflow_user_data',
  APP_SETTINGS: 'finflow_app_settings',
  THEME: 'finflow_theme',
  BIOMETRICS_ENABLED: 'finflow_biometrics_enabled',
  NOTIFICATIONS_ENABLED: 'finflow_notifications_enabled',
  OFFLINE_DATA: 'finflow_offline_data',
};

// Configurações de validação
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 200,
  VALUE_MAX: 999999999.99,
};

// Mensagens de erro
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  AUTH_ERROR: 'Email ou senha incorretos.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.',
  BIOMETRICS_ERROR: 'Erro na autenticação biométrica.',
  OFFLINE_ERROR: 'Modo offline ativo. Sincronize quando conectar.',
};

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  REGISTER_SUCCESS: 'Cadastro realizado com sucesso!',
  SAVE_SUCCESS: 'Dados salvos com sucesso!',
  DELETE_SUCCESS: 'Item excluído com sucesso!',
  SYNC_SUCCESS: 'Sincronização concluída!',
  BIOMETRICS_SUCCESS: 'Autenticação biométrica ativada!',
};

// Configurações de animação
export const ANIMATION_CONFIG = {
  DURATION: 300,
  EASING: 'ease-in-out',
  SPRING_CONFIG: {
    tension: 100,
    friction: 8,
  },
};

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Configurações de segurança
export const SECURITY_CONFIG = {
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
};

// Configurações de relatórios
export const REPORT_CONFIG = {
  DEFAULT_PERIOD: 'month',
  MAX_PERIOD: 'year',
  CHART_COLORS: [
    '#667eea',
    '#764ba2',
    '#ff6b6b',
    '#4CAF50',
    '#FF9800',
    '#2196F3',
    '#9C27B0',
    '#795548',
  ],
};

// Configurações de exportação
export const EXPORT_CONFIG = {
  FORMATS: ['PDF', 'CSV', 'Excel'],
  DATE_FORMATS: {
    'pt-BR': 'DD/MM/YYYY',
    'en-US': 'MM/DD/YYYY',
  },
  CURRENCY_FORMATS: {
    'BRL': 'R$',
    'USD': '$',
    'EUR': '€',
  },
}; 