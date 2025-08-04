import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthBanner from '../components/AuthBanner';
import { getUsuarioLogado } from '../functions/auth';
import { FaArrowLeft } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import '../App.css';
import InputMask from 'react-input-mask';

function FaleConosco() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: '',
    mensagem: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Verifica se o usuário está logado
  const usuario = getUsuarioLogado();
  const isLoggedIn = !!usuario;
  
  console.log('Usuário logado:', usuario);
  console.log('isLoggedIn:', isLoggedIn);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.email || !formData.mensagem) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    
    try {
      // Enviar mensagem para a API
      const response = await axios.post(API_ENDPOINTS.FALE_CONOSCO, formData);
      
      if (response.data.status === 'success') {
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          tipo: '',
          mensagem: ''
        });
      } else {
        alert('Erro ao enviar mensagem. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    if (isLoggedIn) {
      navigate('/principal');
    } else {
      navigate('/home');
    }
  };

  // Se o usuário NÃO está logado, usa o layout do banner
  if (!isLoggedIn) {
    return (
      <AuthBanner 
        title="Fale Conosco"
        subtitle="Sua opinião é muito importante para nós"
      >
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className='form-label'>Nome Completo *</label>
            <input
              type="text"
              name="nome"
              placeholder="Digite seu nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className='form-label'>E-mail *</label>
            <input
              type="email"
              name="email"
              placeholder="Digite seu e-mail"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className='form-label'>Telefone</label>
            <InputMask
              mask="(99) 99999-9999"
              value={formData.telefone}
              onChange={handleChange}
              className="form-input"
              type="text"
              name="telefone"
              placeholder="(99) 99999-9999 teste"
            />
          </div>
          
          <div className="form-group">
            <label className='form-label'>Tipo de Contato</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Selecione uma opção</option>
              <option value="sugestao">Sugestão</option>
              <option value="duvida">Dúvida</option>
              <option value="problema">Reportar Problema</option>
              <option value="elogio">Elogio</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className='form-label'>Mensagem *</label>
            <textarea
              name="mensagem"
              placeholder="Digite sua mensagem, sugestão ou dúvida..."
              value={formData.mensagem}
              onChange={handleChange}
              required
              className="form-input"
              rows="5"
              style={{ resize: 'vertical', minHeight: '120px' }}
            />
          </div>
          
          <button
            type="submit"
            className="form-button primary"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </button>
          
          <div className="form-divider">
            <span>ou</span>
          </div>
          
          <button
            type="button"
            className="form-button secondary"
            onClick={handleVoltar}
          >
            Voltar ao login
          </button>
        </form>
      </AuthBanner>
    );
  }

  // Se o usuário ESTÁ logado, usa o layout do sistema
  return (
    <div className="receita-container">
      <div className="receita-header">
        <h2>Fale Conosco</h2>
        <div className="receita-stats">
          <div className="stat-card">
            <span className="stat-label">Suporte</span>
            <span className="stat-value">24/7</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Resposta</span>
            <span className="stat-value">24h</span>
          </div>
        </div>
      </div>

      <div className="form-container">
        <h3>Envie sua mensagem</h3>
        <form onSubmit={handleSubmit} className="receita-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input
                type="text"
                name="nome"
                placeholder="Digite seu nome completo"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>E-mail *</label>
              <input
                type="email"
                name="email"
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Telefone</label>
              <InputMask
                mask="(99) 99999-9999"
                value={formData.telefone}
                onChange={handleChange}
                className="form-input"
                type="text"
                name="telefone"
                placeholder="(99) 99999-9999"
              />
            </div>
            <div className="form-group">
              <label>Tipo de Contato</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="">Selecione uma opção</option>
                <option value="sugestao">Sugestão</option>
                <option value="duvida">Dúvida</option>
                <option value="problema">Reportar Problema</option>
                <option value="elogio">Elogio</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Mensagem *</label>
            <textarea
              name="mensagem"
              placeholder="Digite sua mensagem, sugestão ou dúvida..."
              value={formData.mensagem}
              onChange={handleChange}
              required
              rows="5"
              style={{ resize: 'vertical', minHeight: '120px' }}
            />
          </div>
          
          <button type="submit" className="btn-adicionar">
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </button>
        </form>
        
        {/* Botão Voltar ao Dashboard */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button" 
            className="dashboard-back-button"
            onClick={() => navigate('/principal')}
          >
            <FaArrowLeft />
            Voltar para Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default FaleConosco; 