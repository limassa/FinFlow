import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaBell, FaPalette, FaShieldAlt, FaTrash, FaSave, FaEye, FaEyeSlash, FaCamera, FaFileContract } from 'react-icons/fa';
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
    lembretesEmail: false,
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
    melhorarClaricash: false,
    novidadesOfertas: false,
  });
  const [showExcluirModal, setShowExcluirModal] = useState(false);
  const [excluirConfirmStep, setExcluirConfirmStep] = useState(1);
  const [excluirTexto, setExcluirTexto] = useState('');
  const [excluindoConta, setExcluindoConta] = useState(false);

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
          lembretesEmail: !!lembretes.lembretesEmail,
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
          setPrivacidadeConfig({
            melhorarClaricash: !!(parsed.melhorarClaricash ?? parsed.dadosAnonimos ?? parsed.analytics),
            novidadesOfertas: !!(parsed.novidadesOfertas ?? parsed.marketing),
          });
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
            lembretesEmail: lembretesConfig.lembretesEmail,
            lembretesWhatsApp: false,
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

  const abrirModalExcluir = () => {
    setExcluirConfirmStep(1);
    setExcluirTexto('');
    setShowExcluirModal(true);
  };

  const fecharModalExcluir = () => {
    if (excluindoConta) return;
    setShowExcluirModal(false);
    setExcluirConfirmStep(1);
    setExcluirTexto('');
  };

  const handleExcluirContaDefinitivo = async () => {
    if (excluirTexto.trim().toUpperCase() !== 'EXCLUIR') {
      alert('Digite EXCLUIR para confirmar.');
      return;
    }
    setExcluindoConta(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.USER_EXCLUIR}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, confirmacao: 'EXCLUIR' }),
      });

      if (response.ok) {
        alert('Conta excluída com sucesso');
        localStorage.removeItem('user');
        localStorage.removeItem(`claricash_privacidade_${user.id}`);
        navigate('/');
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Erro ao excluir conta');
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('Erro ao excluir conta');
    } finally {
      setExcluindoConta(false);
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

                <div className="form-group" style={{ marginTop: 20 }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>📧 Notificações por e-mail</h4>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={!!lembretesConfig.lembretesEmail}
                      disabled={!lembretesConfig.lembretesAtivos}
                      onChange={(e) =>
                        setLembretesConfig((prev) => ({ ...prev, lembretesEmail: e.target.checked }))
                      }
                      style={{ marginTop: 3 }}
                    />
                    <span>
                      Receber lembretes de vencimentos por e-mail
                      <br />
                      <span style={{ fontSize: 13, color: '#64748b' }}>
                        O e-mail é enviado na antecedência informada abaixo (dias antes do vencimento),
                        no horário configurado.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Antecedência do lembrete (dias antes do vencimento):</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={lembretesConfig.lembretesDiasAntes}
                    onChange={(e) => setLembretesConfig({...lembretesConfig, lembretesDiasAntes: parseInt(e.target.value, 10) || 0})}
                  />
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
                    0 = somente no dia do vencimento. Ex.: 5 = envia lembretes de despesas com vencimento
                    nos próximos 5 dias.
                  </p>
                </div>

                <div className="form-group">
                  <label>Horário das Notificações:</label>
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
                <div className="form-group privacy-links-group" style={{ marginBottom: 20, textAlign: 'left' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/privacy-policy')}
                    style={{
                      fontSize: 15,
                      color: 'var(--primary, #2563EB)',
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'left',
                      width: 'fit-content',
                      textDecoration: 'none',
                    }}
                  >
                    <FaShieldAlt /> Política de Privacidade
                  </button>
                  <p style={{ marginTop: 4, marginBottom: 0, fontSize: 13, color: '#64748b', textAlign: 'left' }}>
                    Leia nossa política de privacidade.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/terms-of-use')}
                    style={{
                      marginTop: 14,
                      fontSize: 15,
                      color: 'var(--primary, #2563EB)',
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'left',
                      width: 'fit-content',
                      textDecoration: 'none',
                    }}
                  >
                    <FaFileContract /> Termos de Uso
                  </button>
                  <p style={{ marginTop: 4, marginBottom: 0, fontSize: 13, color: '#64748b', textAlign: 'left' }}>
                    Leia os termos de uso do Claricash.
                  </p>
                </div>

                <h4 style={{ margin: '8px 0 10px', fontSize: 15, fontWeight: 600, color: '#334155', textAlign: 'left' }}>
                  Experiência e melhorias
                </h4>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, textAlign: 'left' }}>
                    <input
                      type="checkbox"
                      checked={!!privacidadeConfig.melhorarClaricash}
                      onChange={(e) => {
                        const next = { ...privacidadeConfig, melhorarClaricash: e.target.checked };
                        setPrivacidadeConfig(next);
                        salvarPrivacidadeLocal(next);
                      }}
                      style={{ marginTop: 3 }}
                    />
                    <span style={{ textAlign: 'left' }}>
                      <strong style={{ fontSize: 14, color: '#334155' }}>Ajudar a melhorar o Claricash</strong>
                      <br />
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>
                        Permitir o uso de informações anônimas sobre o uso do aplicativo para
                        melhorar nossos recursos.
                      </span>
                    </span>
                  </label>
                </div>

                <h4 style={{ margin: '20px 0 10px', fontSize: 15, fontWeight: 600, color: '#334155', textAlign: 'left' }}>
                  Comunicação
                </h4>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, textAlign: 'left' }}>
                    <input
                      type="checkbox"
                      checked={!!privacidadeConfig.novidadesOfertas}
                      onChange={(e) => {
                        const next = { ...privacidadeConfig, novidadesOfertas: e.target.checked };
                        setPrivacidadeConfig(next);
                        salvarPrivacidadeLocal(next);
                      }}
                      style={{ marginTop: 3 }}
                    />
                    <span style={{ textAlign: 'left' }}>
                      <strong style={{ fontSize: 14, color: '#334155' }}>Receber novidades e ofertas</strong>
                      <br />
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>
                        Receba novidades, dicas e informações sobre o Claricash.
                      </span>
                    </span>
                  </label>
                </div>

                <button onClick={handleSalvarPrivacidade} className="btn-salvar">
                  <FaSave /> Salvar preferências
                </button>

                <h4 style={{ margin: '28px 0 10px', fontSize: 15, fontWeight: 600, color: '#DC2626', textAlign: 'left' }}>
                  Seus dados
                </h4>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 400, textAlign: 'left', lineHeight: 1.5 }}>
                  Exclui sua conta e os dados associados, observadas as hipóteses legais de
                  conservação.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/account-deletion-policy')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary, #2563EB)',
                    cursor: 'pointer',
                    padding: 0,
                    marginBottom: 14,
                    fontSize: 15,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    textAlign: 'left',
                    width: 'fit-content',
                    textDecoration: 'none',
                  }}
                >
                  <FaShieldAlt /> Política de Exclusão de Conta e Dados
                </button>
                <div className="form-actions" style={{ marginTop: 4 }}>
                  <button type="button" onClick={abrirModalExcluir} className="btn-excluir">
                    <FaTrash /> Excluir Conta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showExcluirModal ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={fecharModalExcluir}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              background: '#fff',
              borderRadius: 12,
              maxWidth: 480,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {excluirConfirmStep === 1 ? (
              <>
                <h3 style={{ margin: '0 0 12px', color: '#DC2626' }}>⚠️ Excluir sua conta?</h3>
                <p style={{ marginBottom: 10, fontWeight: 600 }}>Esta ação é permanente.</p>
                <p style={{ marginBottom: 10, color: '#475569', lineHeight: 1.5 }}>
                  Sua conta e os dados financeiros associados serão excluídos conforme nossa{' '}
                  <button
                    type="button"
                    onClick={() => {
                      fecharModalExcluir();
                      navigate('/account-deletion-policy');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    Política de Exclusão de Conta e Dados
                  </button>
                  .
                </p>
                <p style={{ marginBottom: 20, color: '#475569' }}>
                  Essa ação não poderá ser desfeita.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-salvar" style={{ background: '#94a3b8' }} onClick={fecharModalExcluir}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-excluir"
                    onClick={() => setExcluirConfirmStep(2)}
                  >
                    Excluir minha conta
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 12px', color: '#DC2626' }}>🔴 Confirmação final</h3>
                <p style={{ marginBottom: 12, color: '#475569' }}>
                  Digite <strong>EXCLUIR</strong> para confirmar.
                </p>
                <input
                  type="text"
                  value={excluirTexto}
                  onChange={(e) => setExcluirTexto(e.target.value)}
                  placeholder="EXCLUIR"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    marginBottom: 16,
                    fontSize: 15,
                  }}
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-salvar"
                    style={{ background: '#94a3b8' }}
                    onClick={fecharModalExcluir}
                    disabled={excluindoConta}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-excluir"
                    onClick={handleExcluirContaDefinitivo}
                    disabled={excluindoConta || excluirTexto.trim().toUpperCase() !== 'EXCLUIR'}
                  >
                    {excluindoConta ? 'Excluindo...' : 'Excluir definitivamente'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Configuracoes; 