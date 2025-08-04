import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setUsuarioLogado } from '../functions/auth';
import { funcoes } from '../functions/function.js';
import AuthBanner from '../components/AuthBanner';
import { FaEnvelope } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/api';
import '../App.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [versao, setVersao] = useState(null);
  const [versaoLoading, setVersaoLoading] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log('Iniciando login...', { email, senha: senha ? '***' : 'undefined' });
    
    // Validação dos campos
    if (!funcoes.validarCampoBrancoLogin(email, senha)) {
      console.log('Validação falhou');
      return;
    }

    console.log('Validação passou, fazendo requisição...');
    setLoading(true);
    
    try {
      console.log('Enviando requisição para:', API_ENDPOINTS.LOGIN);
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        email,
        senha
      });

      console.log('Resposta recebida:', response.data);
      
      if (response.data.success) {
        // Salvar dados do usuário
        const userData = {
          id: response.data.user.id,
          nome: response.data.user.usuario_nome,
          email: response.data.user.usuario_email,
          token: response.data.token
        };
        
        console.log('Salvando dados do usuário:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Redirecionando para /layout/principal');
        navigate('/layout/principal');
        // Scroll para o topo após a navegação
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      } else {
        alert('Email ou senha incorretos');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar versão do sistema
  useEffect(() => {
    const buscarVersao = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.VERSAO);
        if (response.data.success) {
          setVersao(response.data.versao);
        }
      } catch (error) {
        console.error('Erro ao buscar versão:', error);
      } finally {
        setVersaoLoading(false);
      }
    };

    buscarVersao();
  }, []);

  const handleCadastro = (e) => {
    e.preventDefault();
    navigate('/cadastro');
  };

  return (
    <AuthBanner 
      title="Bem-vindo de volta!"
      subtitle="Faça login para acessar sua conta"
    >
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label className='form-label'>E-mail</label>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className='form-label'>Senha</label> 
          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            className="form-input"
          />
          <div className="forgot-password-link">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="link-button"
            >
              Esqueci minha senha
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          className="form-button primary"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        
        <div className="form-divider">
          <br />
          <span>ou</span>
        </div>
        
        <button
          type="button"
          className="form-button secondary"
          onClick={handleCadastro}
        >
          Criar nova conta
        </button>

        {/* Botão de Ajuda */}
        <div className="help-section">
          <button
            type="button"
            className="help-button"
            onClick={() => navigate('/fale-conosco')}
          >
            <FaEnvelope />
            Precisa de ajuda?
          </button>
        </div>

        {/* Informações da Versão */}
        <div className="version-info">
          {versaoLoading ? (
            <p className="version-loading">Carregando informações...</p>
          ) : versao ? (
            <div className="version-details">
              <p className="version-number">v{versao.versao_numero}</p>
              <p className="version-name">{versao.versao_nome}</p>
              <p className="version-date">
                {new Date(versao.versao_data).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ) : (
            <p className="version-error">Versão não disponível</p>
          )}
        </div>
      </form>
    </AuthBanner>
  );
}

export default Login; 