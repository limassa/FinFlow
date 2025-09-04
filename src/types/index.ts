// Tipos principais do FinFlow Mobile

export interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  created_at: string;
  updated_at: string;
}

export interface Receita {
  id: number;
  user_id: number;
  receita_descricao: string;
  receita_valor: number;
  receita_data: string;
  receita_categoria: string;
  receita_conta: string;
  receita_parcelado: boolean;
  receita_num_parcelas?: number;
  receita_parcela_atual?: number;
  created_at: string;
  updated_at: string;
}

export interface Despesa {
  id: number;
  user_id: number;
  despesa_descricao: string;
  despesa_valor: number;
  despesa_data: string;
  despesa_categoria: string;
  despesa_conta: string;
  despesa_parcelado: boolean;
  despesa_num_parcelas?: number;
  despesa_parcela_atual?: number;
  despesa_pago: boolean;
  despesa_dtvencimento?: string;
  created_at: string;
  updated_at: string;
}

export interface Conta {
  id: number;
  user_id: number;
  conta_nome: string;
  conta_saldo: number;
  conta_tipo: string;
  conta_cor: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  saldo_total: number;
  receitas_mes: number;
  despesas_mes: number;
  saldo_mes: number;
  receitas_anterior: number;
  despesas_anterior: number;
  saldo_anterior: number;
  variacao_saldo: number;
  variacao_percentual: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: string;
    strokeWidth?: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  theme: 'light' | 'dark';
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  offlineMode: boolean;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface FormField {
  value: string;
  error?: string;
  isValid: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

// Tipos para notificações
export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

// Tipos para configurações
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US';
  currency: 'BRL' | 'USD' | 'EUR';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  reminderDays: number;
}

// Tipos para relatórios
export interface ReportFilters {
  startDate: string;
  endDate: string;
  categories?: string[];
  accounts?: string[];
  type?: 'receitas' | 'despesas' | 'ambos';
}

export interface ReportData {
  total: number;
  count: number;
  average: number;
  categories: {
    [category: string]: number;
  };
  accounts: {
    [account: string]: number;
  };
  daily: {
    [date: string]: number;
  };
} 