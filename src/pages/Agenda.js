import React, { useState, useEffect } from 'react';
import { FaHome, FaCalendarAlt } from 'react-icons/fa';
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
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const TURNOS = [
  { id: 'madrugada', label: 'Madrugada', startHour: 0, endHour: 6 },
  { id: 'manha', label: 'Manhã', startHour: 6, endHour: 12 },
  { id: 'tarde', label: 'Tarde', startHour: 12, endHour: 18 },
  { id: 'noite', label: 'Noite', startHour: 18, endHour: 24 },
];

const gerarHorarios = () => {
  const horarios = [];
  for (let h = 0; h < 24; h++) {
    horarios.push(`${String(h).padStart(2, '0')}:00`);
    horarios.push(`${String(h).padStart(2, '0')}:30`);
  }
  return horarios;
};

const HORARIOS = gerarHorarios();

function toYmd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function ymdToDate(ymd) {
  const [y, m, d] = String(ymd).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatarYmd(ymd) {
  if (!ymd) return '';
  const [y, m, d] = String(ymd).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

function horaEvento(ev) {
  return String(ev.evento_hora_inicio || ev.evento_Hora_Inicio || '').slice(0, 5);
}

function dataEvento(ev) {
  return String(ev.evento_data || ev.evento_Data || '').slice(0, 10);
}

function semanaInicioDe(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function Agenda() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const userId = usuario?.id;

  const [semanaRef, setSemanaRef] = useState(() => semanaInicioDe(new Date()));
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [agruparPorTurno, setAgruparPorTurno] = useState(false);
  const [showCalendario, setShowCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(() => new Date());
  const [eventosMes, setEventosMes] = useState([]);
  const [diaCalendario, setDiaCalendario] = useState(null);
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
    const hojeYmd = toYmd(new Date());
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const data = toYmd(d);
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

  useEffect(() => {
    if (userId && showCalendario) {
      carregarEventosMes();
    }
  }, [userId, showCalendario, mesCalendario]);

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

  const carregarEventosMes = async () => {
    try {
      const mesFormatado = `${mesCalendario.getFullYear()}-${String(mesCalendario.getMonth() + 1).padStart(2, '0')}`;
      const res = await axios.get(`${API_ENDPOINTS.EVENTOS}?userId=${userId}&mes=${mesFormatado}`);
      setEventosMes(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar eventos do mês:', err);
    }
  };

  const navegarSemana = (delta) => {
    setSemanaRef(prev => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() + (delta * 7));
      return nova;
    });
  };

  const irParaData = (ymd) => {
    setSemanaRef(semanaInicioDe(ymdToDate(ymd)));
  };

  const formatarSemana = () => {
    const i = dias[0];
    const f = dias[6];
    if (!i || !f) return '';
    return `${i.dia}/${i.mes + 1} - ${f.dia}/${f.mes + 1} ${semanaRef.getFullYear()}`;
  };

  const abrirModalSlot = (dia, horario, horaFimPadrao) => {
    const horaFim = horaFimPadrao || (() => {
      const [h, m] = horario.split(':').map(Number);
      let fimH = m === 30 ? h + 1 : h;
      let fimM = m === 30 ? 0 : 30;
      if (h === 23 && m === 30) {
        fimH = 23;
        fimM = 59;
      }
      return `${String(fimH).padStart(2, '0')}:${String(fimM).padStart(2, '0')}`;
    })();
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

  const abrirModalTurno = (dia, turno) => {
    const horaInicio = `${String(turno.startHour).padStart(2, '0')}:00`;
    const horaFim = turno.endHour === 24 ? '23:59' : `${String(turno.endHour).padStart(2, '0')}:00`;
    abrirModalSlot(dia, horaInicio, horaFim);
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
      if (showCalendario) carregarEventosMes();
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      alert('Erro ao criar evento.');
    }
  };

  const getEventosNoSlot = (data, hora) => {
    return eventos.filter(e => {
      const ed = dataEvento(e);
      if (ed !== data) return false;
      const hinicio = horaEvento(e);
      if (!hinicio) return false;
      return hinicio === hora;
    });
  };

  const getEventosNoTurno = (data, turno) => {
    return eventos.filter(e => {
      const ed = dataEvento(e);
      if (ed !== data) return false;
      const hinicio = horaEvento(e);
      if (!hinicio) return turno.id === 'manha';
      const h = parseInt(hinicio.slice(0, 2), 10);
      return h >= turno.startHour && h < turno.endHour;
    });
  };

  const gerarDiasCalendario = () => {
    const ano = mesCalendario.getFullYear();
    const mes = mesCalendario.getMonth();
    const primeiro = new Date(ano, mes, 1);
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const offset = primeiro.getDay();
    const hojeYmd = toYmd(new Date());
    const diasCal = [];
    for (let i = 0; i < offset; i++) diasCal.push(null);
    for (let dia = 1; dia <= totalDias; dia++) {
      const data = toYmd(new Date(ano, mes, dia));
      const evs = eventosMes.filter(e => dataEvento(e) === data);
      diasCal.push({
        dia,
        data,
        eventos: evs,
        temEventos: evs.length > 0,
        isToday: data === hojeYmd,
      });
    }
    return diasCal;
  };

  const eventosDoDiaCalendario = diaCalendario
    ? eventosMes.filter(e => dataEvento(e) === diaCalendario)
    : [];

  const navegarMesCal = (delta) => {
    setMesCalendario(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    setDiaCalendario(null);
  };

  const abrirCalendario = () => {
    setMesCalendario(new Date(semanaRef.getFullYear(), semanaRef.getMonth(), 1));
    setDiaCalendario(null);
    setShowCalendario(true);
  };

  const selecionarDiaCal = (dia) => {
    if (!dia) return;
    setDiaCalendario(dia.data);
    irParaData(dia.data);
  };

  if (!userId) {
    navigate('/');
    return null;
  }

  const linhasAgenda = agruparPorTurno ? TURNOS : HORARIOS;

  return (
    <div className="agenda-container">
      <div className="agenda-header">
        <div className="agenda-header-nav">
          <button onClick={() => navegarSemana(-1)} className="btn-navegar">‹</button>
          <h2>Agenda Pessoal - Semana {formatarSemana()}</h2>
          <button onClick={() => navegarSemana(1)} className="btn-navegar">›</button>
          <button
            type="button"
            className="btn-agenda-cal"
            onClick={abrirCalendario}
            title="Ver calendário"
          >
            <FaCalendarAlt />
          </button>
        </div>
        <div className="agenda-header-actions">
          <label className="agenda-group-check">
            <input
              type="checkbox"
              checked={agruparPorTurno}
              onChange={e => setAgruparPorTurno(e.target.checked)}
            />
            Agrupar por turno
          </label>
          <button onClick={() => navigate('/layout/principal')} className="btn-home">
            <FaHome /> Home
          </button>
        </div>
      </div>

      <div className={`agenda-grid ${agruparPorTurno ? 'agrupado' : ''}`}>
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
            {linhasAgenda.map(linha => {
              const isTurno = typeof linha === 'object';
              const keyLinha = isTurno ? linha.id : linha;
              const labelLinha = isTurno ? linha.label : linha;
              return (
                <div key={keyLinha} className={`agenda-slot-row ${isTurno ? 'agenda-slot-row-turno' : ''}`}>
                  <div className={`agenda-hora-cell ${isTurno ? 'agenda-hora-cell-turno' : ''}`}>{labelLinha}</div>
                  {dias.map(dia => {
                    const evs = isTurno
                      ? getEventosNoTurno(dia.data, linha)
                      : getEventosNoSlot(dia.data, linha);
                    return (
                      <div
                        key={`${dia.data}-${keyLinha}`}
                        className={`agenda-slot-cell ${dia.isToday ? 'is-today' : ''} ${evs.length > 0 ? 'has-eventos' : ''}`}
                        onClick={() => (isTurno ? abrirModalTurno(dia, linha) : abrirModalSlot(dia, linha))}
                      >
                        {evs.length > 0 ? (
                          evs.map(ev => (
                            <div
                              key={ev.evento_id}
                              className="agenda-event-pill"
                              style={{ backgroundColor: ev.evento_cor || '#4F46E5' }}
                              onClick={e => e.stopPropagation()}
                            >
                              {horaEvento(ev) ? `${horaEvento(ev)} ` : ''}{ev.evento_titulo}
                            </div>
                          ))
                        ) : (
                          <span className="agenda-slot-add">+</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {loading && <div className="agenda-loading">Carregando...</div>}

      {showCalendario && (
        <div className="modal-overlay" onClick={() => setShowCalendario(false)}>
          <div className="agenda-cal-modal" onClick={e => e.stopPropagation()}>
            <div className="agenda-cal-header">
              <button type="button" className="btn-navegar" onClick={() => navegarMesCal(-1)}>‹</button>
              <h3>{MESES[mesCalendario.getMonth()]} {mesCalendario.getFullYear()}</h3>
              <button type="button" className="btn-navegar" onClick={() => navegarMesCal(1)}>›</button>
              <button type="button" className="btn-fechar agenda-cal-close" onClick={() => setShowCalendario(false)}>×</button>
            </div>
            <div className="agenda-cal-weekdays">
              {diasSemana.map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="agenda-cal-grid">
              {gerarDiasCalendario().map((dia, idx) => (
                <button
                  key={dia ? dia.data : `empty-${idx}`}
                  type="button"
                  className={`agenda-cal-day ${!dia ? 'vazio' : ''} ${dia?.isToday ? 'hoje' : ''} ${dia?.data === diaCalendario ? 'selecionado' : ''}`}
                  disabled={!dia}
                  onClick={() => selecionarDiaCal(dia)}
                >
                  {dia && (
                    <>
                      <span>{dia.dia}</span>
                      {dia.temEventos ? <span className="agenda-cal-dot" /> : null}
                    </>
                  )}
                </button>
              ))}
            </div>
            <div className="agenda-cal-events">
              {diaCalendario ? (
                <>
                  <h4>Eventos de {formatarYmd(diaCalendario)}</h4>
                  {eventosDoDiaCalendario.length === 0 ? (
                    <p className="agenda-cal-empty">Nenhum evento neste dia.</p>
                  ) : (
                    eventosDoDiaCalendario.map(ev => (
                      <div
                        key={ev.evento_id}
                        className="agenda-cal-event-item"
                        style={{ borderLeftColor: ev.evento_cor || '#4F46E5' }}
                      >
                        <strong>{ev.evento_titulo}</strong>
                        <span>
                          {horaEvento(ev) || 'Sem horário'}
                          {ev.evento_hora_fim ? ` - ${String(ev.evento_hora_fim).slice(0, 5)}` : ''}
                        </span>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <p className="agenda-cal-empty">Selecione um dia para ver os eventos.</p>
              )}
            </div>
          </div>
        </div>
      )}

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
