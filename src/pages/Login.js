import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setUsuarioLogado } from '../functions/auth';
import { funcoes } from '../functions/function.js';
import AuthBanner from '../components/AuthBanner';
import { FaEnvelope } from 'react-icons/fa';
import '../App.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

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
      console.log('Enviando requisição para:', 'http://localhost:3001/api/login');
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        senha
      });

      console.log('Resposta recebida:', response.data);

      if (response.data) {
        // Salvar dados do usuário no localStorage
        const userData = {
          id: response.data.id,
          nome: response.data.nome,
          email: response.data.email,
          telefone: response.data.telefone
        };
        
        console.log('Salvando dados do usuário:', userData);
        setUsuarioLogado(userData);
        
        console.log('Redirecionando para /principal');
        // Redirecionar para a página principal
        navigate('/principal');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response) {
        console.error('Resposta de erro:', error.response.data);
        alert(error.response.data.error || 'Erro no login');
      } else {
        alert('Erro de conexão com o servidor');
      }
    } finally {
      setLoading(false);
    }
  };

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
      </form>
    </AuthBanner>
  );
}

export default Login; 