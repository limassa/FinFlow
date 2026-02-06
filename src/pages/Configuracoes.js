import React, { useState, useEffect } from 'react';
import { FaUser, FaBell, FaPalette, FaShieldAlt, FaDownload, FaTrash, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getUsuarioLogado } from '../functions/auth';
import { API_ENDPOINTS } from '../config/api';

import '../App.css';
import InputMask from 'react-input-mask';

function Configuracoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('perfil');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  // Configurações de lembretes
  const [lembretesConfig, setLembretesConfig] = useState({
    lembretesAtivos: true,
    lembretesEmail: true,
    lembretesDiasAntes: 5,
    lembretesHorario: '18:15'
  });



  // Configurações de privacidade
  const [privacidadeConfig, setPrivacidadeConfig] = useState({
    dadosAnonimos: false,
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    const userData = getUsuarioLogado();
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(userData);
    carregarConfiguracoes(userData.id);
  }, [navigate]);

  const carregarConfiguracoes = async (userId) => {
    try {
      setLoading(true);
      
      // Buscar configurações do usuário
      const [lembretesRes, perfilRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.USER_LEMBRETES}?userId=${userId}`),
        fetch(`${API_ENDPOINTS.USER_PROFILE}?userId=${userId}`)
      ]);

      if (lembretesRes.ok) {
        const lembretes = await lembretesRes.json();
        setLembretesConfig(prev => ({
          ...prev,
          lembretesAtivos: lembretes.lembretesAtivos,
          lembretesEmail: lembretes.lembretesEmail,
          lembretesDiasAntes: lembretes.lembretesDiasAntes
        }));
      }

      if (perfilRes.ok) {
        const perfil = await perfilRes.json();
        setFormData(prev => ({
          ...prev,
          nome: perfil.nome || '',
          email: perfil.email || '',
          telefone: perfil.telefone || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    
    if (formData.novaSenha && formData.novaSenha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.USER_PROFILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        }),
      });

      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
        // Atualizar dados do usuário no localStorage
        const userData = { ...user, nome: formData.nome, email: formData.email };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        alert('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil');
    }
  };

  const handleSalvarLembretes = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USER_LEMBRETES}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...lembretesConfig
        }),
      });

      if (response.ok) {
        alert('Configurações de lembretes salvas!');
      } else {
        alert('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar lembretes:', error);
      alert('Erro ao salvar configurações');
    }
  };



  const handleExportarDados = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USER_EXPORTAR}?userId=${user.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finflow-dados-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados');
    }
  };

  const handleExcluirConta = async () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`${API_ENDPOINTS.USER_EXCLUIR}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (response.ok) {
          alert('Conta excluída com sucesso');
          localStorage.removeItem('user');
          navigate('/');
        } else {
          alert('Erro ao excluir conta');
        }
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        alert('Erro ao excluir conta');
      }
    }
  };

  if (loading) {
    return (
      <div className="configuracoes-container">
        <div className="loading">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="configuracoes-container">
      <div className="configuracoes-header">
        <h1><FaUser /> Configurações</h1>
        <button 
          className="btn-voltar"
                      onClick={() => navigate('/layout/principal')}
        >
          Voltar ao Menu
        </button>
      </div>

      <div className="configuracoes-content">
        {/* Tabs de Navegação */}
        <div className="configuracoes-tabs">
          <button 
            className={`tab ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <FaUser /> Perfil
          </button>
          <button 
            className={`tab ${activeTab === 'lembretes' ? 'active' : ''}`}
            onClick={() => setActiveTab('lembretes')}
          >
            <FaBell /> Lembretes
          </button>
          {/*
          <button 
            className={`tab ${activeTab === 'tema' ? 'active' : ''}`}
            onClick={() => setActiveTab('tema')}
          >
            <FaPalette /> Cores
          </button>
          */}
          <button 
            className={`tab ${activeTab === 'privacidade' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacidade')}
          >
            <FaShieldAlt /> Privacidade
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="tab-content">
          {/* Tab Perfil */}
          {activeTab === 'perfil' && (
            <div className="config-section">
              <h3>Informações do Perfil</h3>
              <form onSubmit={handleSalvarPerfil} className="config-form">
                <div className="form-group">
                  <label>Nome Completo:</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefone:</label>
                  <InputMask
                    mask="(00) 00000-0000"
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  >
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="text"
                        placeholder="(00) 00000-0000"
                        required
                        className="form-input"
                      />
                    )}
                  </InputMask>
                </div>

                <div className="form-group">
                  <label>Senha Atual:</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.senhaAtual}
                      onChange={(e) => setFormData({...formData, senhaAtual: e.target.value})}
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Nova Senha:</label>
                  <input
                    type="password"
                    value={formData.novaSenha}
                    onChange={(e) => setFormData({...formData, novaSenha: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar Nova Senha:</label>
                  <input
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                  />
                </div>

                <button type="submit" className="btn-salvar">
                  <FaSave /> Salvar Alterações
                </button>
              </form>
            </div>
          )}

          {/* Tab Lembretes */}
          {activeTab === 'lembretes' && (
            <div className="config-section">
              <h3>Configurações de Lembretes</h3>
              <div className="config-form">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={lembretesConfig.lembretesAtivos}
                      onChange={(e) => setLembretesConfig({...lembretesConfig, lembretesAtivos: e.target.checked})}
                    />
                    Ativar lembretes
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={lembretesConfig.lembretesEmail}
                      onChange={(e) => setLembretesConfig({...lembretesConfig, lembretesEmail: e.target.checked})}
                    />
                    Receber lembretes por email
                  </label>
                </div>

                <div className="form-group">
                  <label>Dias antes do vencimento:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={lembretesConfig.lembretesDiasAntes}
                    onChange={(e) => setLembretesConfig({...lembretesConfig, lembretesDiasAntes: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label>Horário dos lembretes:</label>
                  <input
                    type="time"
                    value={lembretesConfig.lembretesHorario}
                    onChange={(e) => setLembretesConfig({...lembretesConfig, lembretesHorario: e.target.value})}
                  />
                </div>

                <button onClick={handleSalvarLembretes} className="btn-salvar">
                  <FaSave /> Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* Tab Tema */}
          {/*
          {activeTab === 'tema' && (
            <div className="config-section">
              <h3>Cores Personalizadas</h3>
              <div className="config-form">
                <div className="form-group">
                  <label>Cor Primária:</label>
                  <input
                    type="color"
                    value={temaConfig.corPrimaria}
                    onChange={(e) => setTemaConfig({...temaConfig, corPrimaria: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Cor Secundária:</label>
                  <input
                    type="color"
                    value={temaConfig.corSecundaria}
                    onChange={(e) => setTemaConfig({...temaConfig, corSecundaria: e.target.value})}
                  />
                </div>

                <button onClick={handleAplicarTema} className="btn-salvar">
                  <FaSave /> Aplicar Cores
                </button>
              </div>
            </div>
          )}

          {/* Tab Privacidade */}
          {activeTab === 'privacidade' && (
            <div className="config-section">
              <h3>Privacidade e Dados</h3>
              <div className="config-form">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacidadeConfig.dadosAnonimos}
                      onChange={(e) => setPrivacidadeConfig({...privacidadeConfig, dadosAnonimos: e.target.checked})}
                    />
                    Compartilhar dados anônimos para melhorias
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacidadeConfig.analytics}
                      onChange={(e) => setPrivacidadeConfig({...privacidadeConfig, analytics: e.target.checked})}
                    />
                    Permitir analytics
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacidadeConfig.marketing}
                      onChange={(e) => setPrivacidadeConfig({...privacidadeConfig, marketing: e.target.checked})}
                    />
                    Receber emails de marketing
                  </label>
                </div>

                <div className="form-actions">
                  <button onClick={handleExportarDados} className="btn-exportar">
                    <FaDownload /> Exportar Meus Dados
                  </button>
                  
                  <button onClick={handleExcluirConta} className="btn-excluir">
                    <FaTrash /> Excluir Conta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Configuracoes; 