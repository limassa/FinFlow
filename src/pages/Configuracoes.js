import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaBell, FaPalette, FaShieldAlt, FaTrash, FaSave, FaEye, FaEyeSlash, FaCamera } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getUsuarioLogado } from '../functions/auth';
import { API_ENDPOINTS } from '../config/api';

import '../App.css';
import InputMask from 'react-input-mask';

function Configuracoes() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('perfil');
  const [showPassword, setShowPassword] = useState(false);
  const [userFoto, setUserFoto] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  // Configurações de lembretes / notificações
  const [lembretesConfig, setLembretesConfig] = useState({
    lembretesAtivos: true,
    lembretesDiasAntes: 5,
    lembretesHorario: '18:15'
  });

  const [notifPrefs, setNotifPrefs] = useState({
    contas_a_vencer: true,
    contas_vencidas: true,
    metas_financeiras: true,
    resumo_mensal: true,
    resumo_semanal: true,
    dicas_economia: true,
  });

  const NOTIF_PREF_OPTIONS = [
    { key: 'contas_a_vencer', label: 'Contas a vencer' },
    { key: 'contas_vencidas', label: 'Contas vencidas' },
    { key: 'metas_financeiras', label: 'Metas Financeiras' },
    { key: 'resumo_mensal', label: 'Resumo Mensal' },
    { key: 'resumo_semanal', label: 'Resumo Semanal' },
    { key: 'dicas_economia', label: 'Dicas de Economia' },
  ];

  const allNotifSelected = NOTIF_PREF_OPTIONS.every((opt) => !!notifPrefs[opt.key]);

  const setAllNotifPrefs = (value) => {
    const next = {};
    NOTIF_PREF_OPTIONS.forEach((opt) => {
      next[opt.key] = value;
    });
    setNotifPrefs(next);
  };

  const handleToggleLembretesAtivos = (checked) => {
    setLembretesConfig((prev) => ({ ...prev, lembretesAtivos: checked }));
    if (!checked) setAllNotifPrefs(false);
  };



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
      
      // Buscar configurações do usuário e foto
      const [lembretesRes, perfilRes, fotoRes, notifPrefsRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.USER_LEMBRETES}?userId=${userId}`),
        fetch(`${API_ENDPOINTS.USER_PROFILE}?userId=${userId}`),
        fetch(`${API_ENDPOINTS.USER_FOTO}?userId=${userId}`),
        fetch(`${API_ENDPOINTS.USER_NOTIFICACOES_PREFS}?userId=${userId}`)
      ]);

      if (lembretesRes.ok) {
        const lembretes = await lembretesRes.json();
        setLembretesConfig(prev => ({
          ...prev,
          lembretesAtivos: lembretes.lembretesAtivos,
          lembretesDiasAntes: lembretes.lembretesDiasAntes,
          lembretesHorario: lembretes.lembretesHorario || prev.lembretesHorario
        }));
      }

      if (notifPrefsRes.ok) {
        const data = await notifPrefsRes.json();
        if (data.prefs) setNotifPrefs(prev => ({ ...prev, ...data.prefs }));
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

      if (fotoRes.ok) {
        const data = await fotoRes.json();
        if (data.foto) setUserFoto(data.foto);
      }

      // Carregar preferências de privacidade do localStorage
      try {
        const saved = localStorage.getItem(`claricash_privacidade_${userId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setPrivacidadeConfig(prev => ({ ...prev, ...parsed }));
        }
      } catch (_) { /* ignorar falha ao ler localStorage */ }
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

  const salvarPrivacidadeLocal = (novoConfig) => {
    if (user?.id) {
      try {
        localStorage.setItem(`claricash_privacidade_${user.id}`, JSON.stringify(novoConfig));
      } catch (_) { /* ignorar falha ao salvar no localStorage */ }
    }
  };

  const handleSalvarPrivacidade = () => {
    salvarPrivacidadeLocal(privacidadeConfig);
    alert('Preferências de privacidade salvas!');
  };

  const handleSalvarLembretes = async () => {
    try {
      const [lembretesResponse, prefsResponse] = await Promise.all([
        fetch(`${API_ENDPOINTS.USER_LEMBRETES}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            lembretesAtivos: lembretesConfig.lembretesAtivos,
            lembretesDiasAntes: lembretesConfig.lembretesDiasAntes,
            lembretesHorario: lembretesConfig.lembretesHorario,
          }),
        }),
        fetch(`${API_ENDPOINTS.USER_NOTIFICACOES_PREFS}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            prefs: notifPrefs,
          }),
        }),
      ]);

      if (lembretesResponse.ok && prefsResponse.ok) {
        alert('Configurações de notificações salvas!');
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
        a.download = `claricash-dados-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados');
    }
  };

  const handleFotoClick = () => fileInputRef.current?.click();

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecione uma imagem (JPG, PNG, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setUploadingFoto(true);
      try {
        const res = await fetch(API_ENDPOINTS.USER_FOTO, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, foto: base64 })
        });
        if (res.ok) {
          setUserFoto(base64);
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem('user', JSON.stringify({ ...parsed, foto: base64 }));
          }
          window.dispatchEvent(new CustomEvent('userFotoUpdated', { detail: { foto: base64 } }));
        } else alert('Erro ao salvar foto.');
      } catch (err) {
        alert('Erro ao salvar foto.');
      } finally {
        setUploadingFoto(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
            <FaBell /> Notificações
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
              <div className="config-perfil-layout">
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
                <div className="config-foto-box">
                  <label className="config-foto-label">Foto do perfil:</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    style={{ display: 'none' }}
                  />
                  <div 
                    className="config-foto-container" 
                    onClick={handleFotoClick}
                    title="Clique para alterar a foto"
                  >
                    {uploadingFoto ? (
                      <div className="config-foto-loading">Salvando...</div>
                    ) : userFoto ? (
                      <img src={userFoto} alt="Foto" className="config-foto-img" />
                    ) : (
                      <div className="config-foto-placeholder">
                        <FaCamera />
                        <span>Adicionar foto</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Lembretes */}
          {activeTab === 'lembretes' && (
            <div className="config-section">
              <h3>Configurações de Notificações</h3>
              <div className="config-form">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={lembretesConfig.lembretesAtivos}
                      onChange={(e) => handleToggleLembretesAtivos(e.target.checked)}
                    />
                    Ativar lembretes
                  </label>
                </div>

                <div className="form-group">
                  <label>Tipos de notificação</label>
                  <p style={{ margin: '4px 0 10px', fontSize: 13, color: '#64748b' }}>
                    Selecione as notificações que deseja receber
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={allNotifSelected}
                      disabled={!lembretesConfig.lembretesAtivos}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAllNotifPrefs(checked);
                        if (checked) {
                          setLembretesConfig((prev) => ({ ...prev, lembretesAtivos: true }));
                        }
                      }}
                    />
                    Marcar Todos
                  </label>
                  {NOTIF_PREF_OPTIONS.map((opt) => (
                    <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!notifPrefs[opt.key]}
                        disabled={!lembretesConfig.lembretesAtivos}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({ ...prev, [opt.key]: e.target.checked }))
                        }
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

                <div className="form-group">
                  <label>Dias antes do vencimento:</label>
                  <input
                    type="number"
                    min="0"
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
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <button type="button" className="link-button" onClick={() => navigate('/privacy-policy')} style={{ fontSize: 16, color: 'var(--primary, #4a67af)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaShieldAlt /> Política de Privacidade
                  </button>
                  <p style={{ marginTop: 4, fontSize: 14, color: '#666' }}>Leia nossa política de privacidade (sempre disponível no sistema).</p>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacidadeConfig.dadosAnonimos}
                      onChange={(e) => {
                        const next = { ...privacidadeConfig, dadosAnonimos: e.target.checked };
                        setPrivacidadeConfig(next);
                        salvarPrivacidadeLocal(next);
                      }}
                    />
                    Compartilhar dados anônimos para melhorias
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacidadeConfig.analytics}
                      onChange={(e) => {
                        const next = { ...privacidadeConfig, analytics: e.target.checked };
                        setPrivacidadeConfig(next);
                        salvarPrivacidadeLocal(next);
                      }}
                    />
                    Permitir analytics
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacidadeConfig.marketing}
                      onChange={(e) => {
                        const next = { ...privacidadeConfig, marketing: e.target.checked };
                        setPrivacidadeConfig(next);
                        salvarPrivacidadeLocal(next);
                      }}
                    />
                    Receber emails de marketing
                  </label>
                </div>

                <button onClick={handleSalvarPrivacidade} className="btn-salvar">
                  <FaSave /> Salvar preferências
                </button>

                <div className="form-actions" style={{ marginTop: 24 }}>
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