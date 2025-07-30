import React, { useState, useEffect } from 'react';
import '../App.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthBanner from '../components/AuthBanner';
import PasswordStrength from '../components/PasswordStrength';
import { FaLock, FaArrowLeft, FaCheck } from 'react-icons/fa';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token de redefinição não encontrado');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Token de redefinição não encontrado');
      return;
    }

    if (!newPassword) {
      setError('Por favor, insira uma nova senha');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Senha redefinida com sucesso!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        if (data.passwordErrors) {
          const errorMessage = `Senha não atende aos requisitos de segurança:\n${data.passwordErrors.join('\n')}`;
          setError(errorMessage);
        } else {
          setError(data.error || 'Erro ao redefinir senha');
        }
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

  if (!token) {
    return (
      <AuthBanner 
        title="Token Inválido"
        subtitle="O link de redefinição não é válido"
      >
        <div className="auth-form">
          <div className="alert alert-error">
            <span>Token de redefinição não encontrado ou inválido.</span>
          </div>
          
          <button
            type="button"
            className="form-button primary"
            onClick={voltarParaLogin}
          >
            Voltar ao login
          </button>
        </div>
      </AuthBanner>
    );
  }

  return (
    <AuthBanner 
      title="Redefinir Senha"
      subtitle="Crie uma nova senha segura para sua conta"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {message && (
          <div className="alert alert-success">
            <FaCheck />
            <span>{message}</span>
          </div>
        )}
        
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}
        
        <div className="form-group">
          <label className='form-label'>Nova Senha</label>
          <PasswordStrength
            password={newPassword}
            onPasswordChange={setNewPassword}
            showRequirements={true}
          />
        </div>
        
        <div className="form-group">
          <label className='form-label'>Confirmar Nova Senha</label>
          <input
            type="password"
            placeholder="Confirme sua nova senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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
          {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
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

export default ResetPassword; 