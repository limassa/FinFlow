import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, senha) {
    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, { email, senha });
      if (response.data.success) {
        const userData = response.data.user;
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Tratamento específico para erros de rede
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return { 
          success: false, 
          error: 'Erro de conexão. Verifique:\n1. Se o backend está rodando\n2. Se o IP está correto na configuração\n3. Se estão na mesma rede Wi-Fi\n\nVeja CONFIGURAR_API.md para mais detalhes.'
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Erro ao fazer login' 
      };
    }
  }

  async function cadastro(nome, email, telefone, senha) {
    try {
      // Enviar telefone explicitamente (string ou null) para o backend sempre gravar o campo
      const payload = {
        nome,
        email,
        telefone: telefone != null && String(telefone).trim() !== '' ? String(telefone).trim() : null,
        senha
      };
      const response = await axios.post(API_ENDPOINTS.CADASTRO, payload);
      
      if (response.data.usuario_id) {
        // Não faz login automático: usuário deve ir para a tela de login
        return { success: true };
      }
      return { success: false, error: 'Erro ao cadastrar' };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao cadastrar' 
      };
    }
  }

  async function logout() {
    try {
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  function getUserId() {
    return user?.id || null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, cadastro, logout, getUserId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

