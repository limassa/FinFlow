import React, { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import AuthBanner from '../components/AuthBanner';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Email de redefinição enviado com sucesso!');
        setEmail('');
      } else {
        setError(data.error || 'Erro ao processar solicitação');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const voltarParaLogin = () => {
    navigate('/');
  };

  return (
    <AuthBanner 
      title="Esqueceu sua senha?"
      subtitle="Não se preocupe! Vamos te ajudar a redefinir sua senha"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {message && (
          <div className="alert alert-success">
            <FaEnvelope />
            <span>{message}</span>
          </div>
        )}
        
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}
        
        <div className="form-group">
          <label className='form-label'>Email</label>
          <input
            type="email"
            placeholder="Digite seu email cadastrado"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="form-input"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          className="form-button primary"
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar email de redefinição'}
        </button>
        
        <div className="form-divider">
          <br />
          <span>ou</span>
        </div>
        
        <button
          type="button"
          className="form-button secondary"
          onClick={voltarParaLogin}
          disabled={isLoading}
        >
          <FaArrowLeft />
          Voltar ao login
        </button>
      </form>
    </AuthBanner>
  );
}

export default ForgotPassword; 