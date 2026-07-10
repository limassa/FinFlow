import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS } from '../config/api';
import httpClient from '../config/httpClient';

const AuthContext = createContext({});

async function requestLogin(email, senha) {
  const payload = { email, senha };

  try {
    return await httpClient.post(API_ENDPOINTS.LOGIN, payload);
  } catch (axiosError) {
    const isNetworkError =
      axiosError.code === 'ERR_NETWORK' ||
      axiosError.message === 'Network Error' ||
      !axiosError.response;

    if (!isNetworkError) {
      throw axiosError;
    }

    // Fallback no iOS: fetch nativo costuma ser mais estável que axios em release
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = new Error(data?.error || 'Erro ao fazer login');
      error.response = { status: response.status, data };
      throw error;
    }

    return { data, status: response.status };
  }
}

async function saveUserSession(userData) {
  try {
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
  } catch (storeError) {
    console.warn('Não foi possível salvar sessão no SecureStore:', storeError);
  }
}

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
        try {
          setUser(JSON.parse(userData));
        } catch {
          await SecureStore.deleteItemAsync('user');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, senha) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedSenha = String(senha || '');

    if (!normalizedEmail || !normalizedSenha) {
      return { success: false, error: 'Preencha e-mail e senha' };
    }

    try {
      const response = await requestLogin(normalizedEmail, normalizedSenha);

      if (response.data?.success && response.data?.user) {
        const userData = response.data.user;
        await saveUserSession(userData);
        setUser(userData);
        return { success: true };
      }

      return { success: false, error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login:', error);

      if (error.response?.status === 401) {
        return {
          success: false,
          error: error.response?.data?.error || 'E-mail ou senha inválidos',
        };
      }

      if (
        error.code === 'ERR_NETWORK' ||
        error.message === 'Network Error' ||
        error.name === 'TypeError'
      ) {
        return {
          success: false,
          error:
            'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
        };
      }

      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Erro ao fazer login',
      };
    }
  }

  async function cadastro(nome, email, telefone, senha) {
    try {
      const payload = {
        nome,
        email: String(email || '').trim().toLowerCase(),
        telefone: telefone != null && String(telefone).trim() !== '' ? String(telefone).trim() : null,
        senha
      };
      const response = await httpClient.post(API_ENDPOINTS.CADASTRO, payload);
      
      if (response.data.usuario_id) {
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
    return user?.id ?? user?.usuario_id ?? null;
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

