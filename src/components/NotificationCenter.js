import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaBell, FaCheckDouble, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getUsuarioLogado } from '../functions/auth';
import { API_ENDPOINTS } from '../config/api';
import './NotificationCenter.css';

const TIPO_LABEL = {
  contas_a_vencer: 'A vencer',
  contas_vencidas: 'Vencidas',
  metas_financeiras: 'Metas',
  resumo_mensal: 'Mensal',
  resumo_semanal: 'Semanal',
  dicas_economia: 'Dica',
};

function NotificationCenter() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);

  const user = getUsuarioLogado();
  const userId = user?.id;

  const carregar = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.USER_NOTIFICACOES}?userId=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items || []);
      setNaoLidas(data.naoLidas || 0);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 60000);
    return () => clearInterval(id);
  }, [carregar]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await carregar();
  };

  const marcarLida = async (key) => {
    if (!userId || !key) return;
    try {
      await fetch(API_ENDPOINTS.USER_NOTIFICACOES_LIDA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, key }),
      });
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, lida: true } : i)));
      setNaoLidas((n) => Math.max(0, n - 1));
    } catch (err) {
      console.error('Erro ao marcar notificação:', err);
    }
  };

  const marcarTodas = async () => {
    if (!userId) return;
    try {
      await fetch(API_ENDPOINTS.USER_NOTIFICACOES_LIDA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, all: true }),
      });
      setItems((prev) => prev.map((i) => ({ ...i, lida: true })));
      setNaoLidas(0);
    } catch (err) {
      console.error('Erro ao marcar todas:', err);
    }
  };

  const abrirItem = async (item) => {
    if (!item.lida) await marcarLida(item.key);
    setOpen(false);
    if (item.href) navigate(item.href);
  };

  if (!userId) return null;

  return (
    <div className="notif-center" ref={ref}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={toggle}
        aria-label="Central de notificações"
        title="Notificações"
      >
        <FaBell />
        {naoLidas > 0 && (
          <span className="notif-badge">{naoLidas > 99 ? '99+' : naoLidas}</span>
        )}
      </button>

      {open && (
        <div className="notif-balloon" role="dialog" aria-label="Notificações">
          <div className="notif-balloon-header">
            <strong>Notificações</strong>
            <button
              type="button"
              className="notif-mark-all"
              onClick={marcarTodas}
              disabled={!naoLidas}
              title="Marcar todas como lidas"
            >
              <FaCheckDouble /> Marcar lidas
            </button>
          </div>

          <div className="notif-balloon-list">
            {loading && (
              <div className="notif-empty">
                <FaSpinner className="spin" /> Carregando...
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="notif-empty">Nenhuma notificação no momento.</div>
            )}
            {!loading &&
              items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`notif-item ${item.lida ? 'lida' : 'nao-lida'}`}
                  onClick={() => abrirItem(item)}
                >
                  <span className="notif-tipo">{TIPO_LABEL[item.tipo] || item.tipo}</span>
                  <span className="notif-titulo">{item.titulo}</span>
                  <span className="notif-msg">{item.mensagem}</span>
                </button>
              ))}
          </div>

          <div className="notif-balloon-footer">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/layout/configuracoes');
              }}
            >
              Preferências de notificação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
