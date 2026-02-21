import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import './LembreteEventoProvider.css';

const STORAGE_KEY = 'lembretes_mostrados';
const POLL_INTERVAL = 60 * 1000; // 60 segundos
const COOLDOWN_MIN = 5; // Não mostrar mesmo lembrete por 5 min

function getLembretesMostrados() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    const now = Date.now();
    // Limpar entradas antigas (mais de 10 min)
    const filtered = {};
    for (const [k, v] of Object.entries(obj)) {
      if (now - v < 10 * 60 * 1000) filtered[k] = v;
    }
    return filtered;
  } catch {
    return {};
  }
}

function marcarLembreteMostrado(eventoId) {
  const obj = getLembretesMostrados();
  obj['ev_' + eventoId] = Date.now();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function jaMostrado(eventoId) {
  const obj = getLembretesMostrados();
  const ts = obj['ev_' + eventoId];
  if (!ts) return false;
  return (Date.now() - ts) < COOLDOWN_MIN * 60 * 1000;
}

export default function LembreteEventoProvider({ children }) {
  const [lembretes, setLembretes] = useState([]);
  const [mostrando, setMostrando] = useState(null);

  const buscarLembretes = useCallback(async () => {
    const usuario = getUsuarioLogado();
    if (!usuario?.id) return;
    try {
      const res = await axios.get(
        `${API_ENDPOINTS.EVENTOS_LEMBRETES}?userId=${usuario.id}`
      );
      const pendentes = res.data || [];
      const naoMostrados = pendentes.filter(
        ev => !jaMostrado(ev.evento_id || ev.evento_Id)
      );
      if (naoMostrados.length > 0) {
        setLembretes(prev => [...naoMostrados, ...prev.filter(
          e => !naoMostrados.some(n => (n.evento_id || n.evento_Id) === (e.evento_id || e.evento_Id))
        )]);
        setMostrando(naoMostrados[0]);
      }
    } catch (err) {
      console.error('Erro ao buscar lembretes de eventos:', err);
    }
  }, []);

  useEffect(() => {
    buscarLembretes();
    const interval = setInterval(buscarLembretes, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [buscarLembretes]);

  const fechar = () => {
    if (!mostrando) {
      setMostrando(null);
      return;
    }
    const id = mostrando.evento_id || mostrando.evento_Id;
    marcarLembreteMostrado(id);
    const restantes = lembretes.filter(e => (e.evento_id || e.evento_Id) !== id);
    setLembretes(restantes);
    setMostrando(restantes[0] || null);
  };

  const proximo = () => {
    if (!mostrando) return;
    const id = mostrando.evento_id || mostrando.evento_Id;
    marcarLembreteMostrado(id);
    const restantes = lembretes.filter(e => (e.evento_id || e.evento_Id) !== id);
    setLembretes(restantes);
    setMostrando(restantes[0] || null);
  };

  const ev = mostrando;
  const titulo = ev?.evento_titulo || ev?.evento_Titulo || 'Evento';
  const dataStr = ev?.evento_data || ev?.evento_Data || '';
  const horaStr = (ev?.evento_hora_inicio || ev?.evento_hora_Inicio || '').toString().slice(0, 5);
  const cor = ev?.evento_cor || ev?.evento_Cor || '#4F46E5';

  return (
    <>
      {children}
      {ev && (
        <div className="lembrete-event-overlay" onClick={fechar}>
          <div
            className="lembrete-event-popup"
            onClick={e => e.stopPropagation()}
            style={{ borderTopColor: cor }}
          >
            <div className="lembrete-event-header" style={{ backgroundColor: cor }}>
              <span className="lembrete-event-icon">🔔</span>
              <h3>Lembrete de evento</h3>
            </div>
            <div className="lembrete-event-body">
              <p className="lembrete-event-titulo">{titulo}</p>
              <p className="lembrete-event-horario">
                📅 {dataStr} às {horaStr || '--:--'}
              </p>
              {ev.evento_descricao || ev.evento_Descricao ? (
                <p className="lembrete-event-desc">{ev.evento_descricao || ev.evento_Descricao}</p>
              ) : null}
            </div>
            <div className="lembrete-event-actions">
              {lembretes.length > 1 ? (
                <button type="button" className="btn-lembrete-proximo" onClick={proximo}>
                  Próximo ({lembretes.length})
                </button>
              ) : null}
              <button type="button" className="btn-lembrete-ok" onClick={fechar}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
