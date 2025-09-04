import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadToken();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Erro ao carregar token:', error);
    }
  }

  public async setToken(token: string) {
    this.token = token;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  }

  public async logout() {
    this.token = null;
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
    }
  }

  // Métodos de autenticação
  public async login(email: string, senha: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.LOGIN, {
        email,
        senha,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async register(data: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.CADASTRO, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async forgotPassword(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, {
        email,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async resetPassword(token: string, senha: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
        token,
        senha,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos de usuário
  public async getUserProfile(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.USER_PROFILE);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos de receitas
  public async getReceitas(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.RECEITAS);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async createReceita(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.RECEITAS, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updateReceita(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put(`${API_CONFIG.ENDPOINTS.RECEITAS}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async deleteReceita(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.delete(`${API_CONFIG.ENDPOINTS.RECEITAS}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos de despesas
  public async getDespesas(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.DESPESAS);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async createDespesa(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.DESPESAS, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updateDespesa(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put(`${API_CONFIG.ENDPOINTS.DESPESAS}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async deleteDespesa(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.delete(`${API_CONFIG.ENDPOINTS.DESPESAS}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos de contas
  public async getContas(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.CONTAS);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async createConta(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.CONTAS, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updateConta(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put(`${API_CONFIG.ENDPOINTS.CONTAS}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async deleteConta(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.delete(`${API_CONFIG.ENDPOINTS.CONTAS}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos de dashboard
  public async getDashboardData(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.DASHBOARD);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos de versão
  public async getVersion(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.VERSION);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Tratamento de erros
  private handleError(error: any): Error {
    if (error.response) {
      // Erro do servidor
      const message = error.response.data?.message || 'Erro no servidor';
      return new Error(message);
    } else if (error.request) {
      // Erro de rede
      return new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Erro desconhecido
      return new Error('Erro desconhecido. Tente novamente.');
    }
  }

  // Verificar conectividade
  public async checkConnection(): Promise<boolean> {
    try {
      await this.api.get(API_CONFIG.ENDPOINTS.VERSION);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new ApiService(); 