import React, { useState } from 'react';
import '../App.css';
import { funcoes } from '../functions/function.js';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import AuthBanner from '../components/AuthBanner';
import { FaEnvelope } from 'react-icons/fa';

function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault();

    // Validação dos campos (opcional)
    if (!nome || !telefone || !email || !senha || !senhaConfirm) {
      alert('Preencha todos os campos!');
      return;
    }
    if (senha !== senhaConfirm) {
      alert('As senhas não coincidem!');
      return;
    }

    // Chamada da API
    try {
      const response = await fetch('http://localhost:3001/api/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          senha,
          nome,
          telefone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Cadastro realizado com sucesso!');
        navigate('/home');
        // Redirecionar para login ou home, se desejar
        // navigate('/');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao cadastrar usuário');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor');
    }
  };

  const voltarParaHome = () => {
    navigate('/home');
  };

  return (
    <AuthBanner 
      title="Crie sua conta"
      subtitle="Junte-se ao FinFlow e comece a controlar suas finanças"
    >
      <form onSubmit={handleCadastro} className="auth-form">
        <div className="form-group">
          <label className='form-label'>Nome Completo</label>
          <input
            type="text"
            placeholder="Nome e Sobrenome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className='form-label'>Telefone</label>
          <InputMask
            mask="(99) 99999-9999"
            value={telefone}
            onChange={e => setTelefone(e.target.value)}
          >
            {(inputProps) => (
              <input
                {...inputProps}
                type="text"
                placeholder="(99) 99999-9999"
                required
                className="form-input"
              />
            )}
          </InputMask>
        </div>
        
        <div className="form-group">
          <label className='form-label'>Email</label>
          <input
            type="email"
            placeholder="Informe seu email"
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
            placeholder="Crie uma senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className='form-label'>Confirmar Senha</label> 
          <input
            type="password"
            placeholder="Confirme sua senha"
            value={senhaConfirm}
            onChange={e => setSenhaConfirm(e.target.value)}
            required
            className="form-input"
          />
        </div>
        
        <button
          type="submit"
          className="form-button primary"
        >
          Criar conta
        </button>
        
        <div className="form-divider">
          <br />
          <span>ou</span>
        </div>
        
        <button
          type="button"
          className="form-button secondary"
          onClick={voltarParaHome}
        >
          Voltar ao login
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

export default Cadastro;
