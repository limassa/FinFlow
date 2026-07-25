import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaChartLine, FaUserClock, FaSignOutAlt, FaHome, FaSync } from 'react-icons/fa';
import { getUsuarioLogado, logout } from '../functions/auth';
import { API_ENDPOINTS } from '../config/api';
import './Admin.css';

function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return '—';
  }
}

function formatOrigem(origem) {
  if (!origem) return '—';
  const o = String(origem).toLowerCase();
  if (o === 'mobile') return 'App';
  if (o === 'web') return 'Web';
  return origem;
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const user = getUsuarioLogado();

  const carregar = useCallback(async ({ silent = false } = {}) => {
    if (!user?.id) {
      navigate('/?redirect=/admin');
      return;
    }

    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      const res = await axios.get(`${API_ENDPOINTS.ADMIN_STATS}?userId=${user.id}`);
      if (res.data?.success) {
        setStats(res.data.stats);
        setForbidden(false);
      } else {
        setForbidden(true);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setForbidden(true);
      } else {
        setError(err.response?.data?.error || 'Erro ao carregar dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, user?.id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user?.id) {
    return null;
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Carregando painel admin...</div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="admin-page">
        <div className="admin-card admin-forbidden">
          <h1>Acesso restrito</h1>
          <p>Esta área é exclusiva para administradores.</p>
          <div className="admin-actions">
            <Link to="/layout/principal" className="admin-btn">Ir para o app</Link>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={handleLogout}>Sair</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Claricash</p>
          <h1>Painel Admin</h1>
          <p className="admin-subtitle">Olá, {user.nome || user.email}</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={() => carregar({ silent: true })}
            disabled={refreshing}
            title="Atualizar dados"
          >
            <FaSync className={refreshing ? 'admin-spin' : undefined} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <Link to="/layout/principal" className="admin-btn admin-btn-ghost">
            <FaHome /> App
          </Link>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={handleLogout}>
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-cards">
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaUsers /></div>
          <div>
            <p className="admin-stat-label">Usuários cadastrados</p>
            <p className="admin-stat-value">{stats?.totalUsuarios ?? 0}</p>
            <p className="admin-stat-hint">{stats?.usuariosAtivos ?? 0} ativos</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaChartLine /></div>
          <div>
            <p className="admin-stat-label">Acessos (90 dias)</p>
            <p className="admin-stat-value">{stats?.acessosUltimos90Dias ?? 0}</p>
            <p className="admin-stat-hint">
              {stats?.usuariosQueAcessaram90Dias ?? 0} usuários distintos
            </p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaUserClock /></div>
          <div>
            <p className="admin-stat-label">Últimos acessos listados</p>
            <p className="admin-stat-value">{stats?.ultimosAcessos?.length ?? 0}</p>
            <p className="admin-stat-hint">mais recentes primeiro</p>
          </div>
        </div>
      </section>

      <section className="admin-table-section">
        <div className="admin-section-head admin-section-head-row">
          <div>
            <h2>Últimos usuários a acessar</h2>
            <p>Ordenado pelo último login registrado (web ou app).</p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={() => carregar({ silent: true })}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? 'admin-spin' : undefined} />
            Refresh
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Último acesso</th>
                <th>Origem</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.ultimosAcessos || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Nenhum acesso registrado ainda. Faça login no web ou no app e clique em Atualizar.
                  </td>
                </tr>
              ) : (
                (stats?.ultimosAcessos || []).map((u) => (
                  <tr key={u.id}>
                    <td>{u.nome || '—'}</td>
                    <td>{u.email || '—'}</td>
                    <td>{formatDateTime(u.ultimo_acesso)}</td>
                    <td>{formatOrigem(u.origem)}</td>
                    <td>
                      <span className={`admin-badge ${u.ativo === false ? 'off' : 'on'}`}>
                        {u.ativo === false ? 'Inativo' : 'Ativo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
