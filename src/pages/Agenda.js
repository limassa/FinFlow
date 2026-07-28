import React, { useState, useEffect } from 'react';
import { FaHome, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './Agenda.css';

const tiposEvento = [
  { value: 'geral', label: 'Geral', cor: '#4F46E5' },
  { value: 'lembrete', label: 'Lembrete', cor: '#F59E0B' },
  { value: 'compromisso', label: 'Compromisso', cor: '#10B981' },
  { value: 'vencimento', label: 'Vencimento', cor: '#EF4444' }
];

const coresEvento = ['#4F46E5', '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Horários de 00:00 a 23:30, intervalo de 30 min
const gerarHorarios = () => {
  const horarios = [];
  for (let h = 0; h < 24; h++) {
    horarios.push(`${String(h).padStart(2, '0')}:00`);
    horarios.push(`${String(h).padStart(2, '0')}:30`);
  }
  return horarios;
};

const HORARIOS = gerarHorarios();

function getSemanaAtual(data) {
  const d = new Date(data);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const inicio = new Date(d);
  inicio.setDate(diff);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return { inicio, fim, dias: [] };
}

function Agenda() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const userId = usuario?.id;

  const [semanaRef, setSemanaRef] = useState(() => {
    const hoje = new Date();
    const day = hoje.getDay();
    const diff = hoje.getDate() - day;
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), diff);
    return inicio;
  });
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [formEvento, setFormEvento] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    tipo: 'geral',
    cor: '#4F46E5',
    lembrete: true,
    lembrete_minutos: 30
  });

  const getDiasDaSemana = () => {
    const dias = [];
    const inicio = new Date(semanaRef);
    const hoje = new Date();
    const hojeYmd = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const data = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dias.push({
        data,
        label: diasSemana[i],
        dia: d.getDate(),
        mes: d.getMonth(),
        isToday: data === hojeYmd,
      });
    }
    return dias;
  };

  const dias = getDiasDaSemana();
  const dataInicio = dias[0]?.data;
  const dataFim = dias[6]?.data;

  useEffect(() => {
    if (userId && dataInicio && dataFim) {
      carregarEventos();
    }
  }, [userId, dataInicio, dataFim]);

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_ENDPOINTS.EVENTOS}?userId=${userId}&dataInicio=${dataInicio}&dataFim=${dataFim}`
      );
      setEventos(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  const navegarSemana = (delta) => {
    setSemanaRef(prev => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() + (delta * 7));
      return nova;
    });
  };

  const formatarSemana = () => {
    const i = dias[0];
    const f = dias[6];
    if (!i || !f) return '';
    return `${i.dia}/${i.mes + 1} - ${f.dia}/${f.mes + 1} ${semanaRef.getFullYear()}`;
  };

  const abrirModalSlot = (dia, horario) => {
    const [h, m] = horario.split(':').map(Number);
    let fimH = m === 30 ? h + 1 : h;
    let fimM = m === 30 ? 0 : 30;
    if (h === 23 && m === 30) {
      fimH = 23;
      fimM = 59;
    }
    const horaFim = `${String(fimH).padStart(2, '0')}:${String(fimM).padStart(2, '0')}`;
    setSlotSelecionado({ dia, horario });
    setFormEvento({
      titulo: '',
      descricao: '',
      data: dia.data,
      hora_inicio: horario,
      hora_fim: horaFim,
      tipo: 'geral',
      cor: '#4F46E5',
      lembrete: true,
      lembrete_minutos: 30
    });
    setShowModal(true);
  };

  const salvarEvento = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_ENDPOINTS.EVENTOS, {
        usuario_id: userId,
        titulo: formEvento.titulo,
        descricao: formEvento.descricao,
        data: formEvento.data,
        hora_inicio: formEvento.hora_inicio || null,
        hora_fim: formEvento.hora_fim || null,
        tipo: formEvento.tipo,
        cor: formEvento.cor,
        lembrete: formEvento.lembrete,
        lembrete_minutos: formEvento.lembrete_minutos
      });
      setShowModal(false);
      setSlotSelecionado(null);
      carregarEventos();
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      alert('Erro ao criar evento.');
    }
  };

  const getEventosNoSlot = (data, hora) => {
    return eventos.filter(e => {
      const ed = String(e.evento_data || '').slice(0, 10);
      if (ed !== data) return false;
      const hinicio = String(e.evento_hora_inicio || '').slice(0, 5);
      if (!hinicio) return false;
      return hinicio === hora;
    });
  };

  if (!userId) {
    navigate('/');
    return null;
  }

  return (
    <div className="agenda-container">
      <div className="agenda-header">
        <div className="agenda-header-nav">
          <button onClick={() => navegarSemana(-1)} className="btn-navegar">‹</button>
          <h2>Agenda - Semana {formatarSemana()}</h2>
          <button onClick={() => navegarSemana(1)} className="btn-navegar">›</button>
        </div>
        <div className="agenda-header-actions">
          <button onClick={() => navigate('/layout/principal')} className="btn-home">
            <FaHome /> Home
          </button>
        </div>
      </div>

      <div className="agenda-grid">
        <div className="agenda-dias-header">
          <div className="agenda-corner" />
          {dias.map(d => (
            <div key={d.data} className={`agenda-dia-header ${d.isToday ? 'is-today' : ''}`}>
              <span className="dia-nome">{d.label}</span>
              <span className="dia-numero">{d.dia}/{d.mes + 1}</span>
              {d.isToday ? <span className="dia-hoje">Hoje</span> : null}
            </div>
          ))}
        </div>
        <div className="agenda-scroll-wrapper">
          <div className="agenda-slots">
            {HORARIOS.map(horario => (
              <div key={horario} className="agenda-slot-row">
                <div className="agenda-hora-cell">{horario}</div>
                {dias.map(dia => {
                  const evs = getEventosNoSlot(dia.data, horario);
                  return (
                    <div
                      key={`${dia.data}-${horario}`}
                      className={`agenda-slot-cell ${dia.isToday ? 'is-today' : ''} ${evs.length > 0 ? 'has-eventos' : ''}`}
                      onClick={() => abrirModalSlot(dia, horario)}
                    >
                      {evs.length > 0 ? (
                        evs.map(ev => (
                          <div
                            key={ev.evento_id}
                            className="agenda-event-pill"
                            style={{ backgroundColor: ev.evento_cor || '#4F46E5' }}
                            onClick={e => e.stopPropagation()}
                          >
                            {ev.evento_titulo}
                          </div>
                        ))
                      ) : (
                        <span className="agenda-slot-add">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="agenda-loading">Carregando...</div>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-evento modal-evento-agenda" onClick={e => e.stopPropagation()}>
            <div className="modal-header eventos" style={{ backgroundColor: formEvento.cor }}>
              <h3>Novo Evento</h3>
              <button className="btn-fechar" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form id="agenda-evento-form" onSubmit={salvarEvento} className="modal-form modal-form-agenda">
              <div className="modal-form-scroll">
                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    value={formEvento.titulo}
                    onChange={e => setFormEvento({ ...formEvento, titulo: e.target.value })}
                    placeholder="Ex: Reunião, Consulta, etc."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descrição (opcional)</label>
                  <textarea
                    value={formEvento.descricao}
                    onChange={e => setFormEvento({ ...formEvento, descricao: e.target.value })}
                    placeholder="Detalhes do evento..."
                    rows={2}
                  />
                </div>
                <div className="form-row form-row-agenda">
                  <div className="form-group">
                    <label>Data</label>
                    <input
                      type="date"
                      value={formEvento.data}
                      onChange={e => setFormEvento({ ...formEvento, data: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select
                      value={formEvento.tipo}
                      onChange={e => setFormEvento({ ...formEvento, tipo: e.target.value })}
                    >
                      {tiposEvento.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row form-row-agenda">
                  <div className="form-group">
                    <label>Hora Início</label>
                    <input
                      type="time"
                      value={formEvento.hora_inicio}
                      onChange={e => setFormEvento({ ...formEvento, hora_inicio: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora Fim</label>
                    <input
                      type="time"
                      value={formEvento.hora_fim}
                      onChange={e => setFormEvento({ ...formEvento, hora_fim: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Cor</label>
                  <div className="cores-selector cores-selector-agenda">
                    {coresEvento.map(cor => (
                      <button
                        key={cor}
                        type="button"
                        className={`cor-btn ${formEvento.cor === cor ? 'selected' : ''}`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setFormEvento({ ...formEvento, cor })}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-row form-row-agenda">
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formEvento.lembrete}
                        onChange={e => setFormEvento({ ...formEvento, lembrete: e.target.checked })}
                      />
                      Lembrete
                    </label>
                  </div>
                  {formEvento.lembrete && (
                    <div className="form-group">
                      <label>Minutos antes</label>
                      <select
                        value={formEvento.lembrete_minutos}
                        onChange={e => setFormEvento({ ...formEvento, lembrete_minutos: e.target.value })}
                      >
                        <option value="5">5 min</option>
                        <option value="10">10 min</option>
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="60">1 hora</option>
                        <option value="1440">1 dia</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions modal-actions-agenda">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" style={{ backgroundColor: formEvento.cor }}>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agenda;
