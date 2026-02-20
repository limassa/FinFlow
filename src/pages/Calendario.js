import React, { useState, useEffect } from 'react';
import { FaHome, FaPlus, FaCalendarPlus, FaEdit, FaTrash, FaClock, FaBell } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import { useNavigate } from 'react-router-dom';
import './Calendario.css';

// Tipos de evento
const tiposEvento = [
  { value: 'geral', label: 'Geral', cor: '#4F46E5' },
  { value: 'lembrete', label: 'Lembrete', cor: '#F59E0B' },
  { value: 'compromisso', label: 'Compromisso', cor: '#10B981' },
  { value: 'vencimento', label: 'Vencimento', cor: '#EF4444' }
];

const coresEvento = ['#4F46E5', '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

const Calendario = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalEvento, setShowModalEvento] = useState(false);
  const [modalType, setModalType] = useState(''); // 'receitas', 'despesas' ou 'eventos'
  const [modalData, setModalData] = useState([]);
  const [editandoEvento, setEditandoEvento] = useState(null);

  // Form Evento
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

  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

  // Função para navegar para home e rolar para o topo
  const navigateToHome = () => {
    navigate('/layout/principal');
    // Scroll para o topo após a navegação
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  // Nomes dos meses
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Dias da semana
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    if (userId) {
      carregarDados();
    }
  }, [userId, currentDate]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const ano = currentDate.getFullYear();
      const mes = String(currentDate.getMonth() + 1).padStart(2, '0');
      const mesFormatado = `${ano}-${mes}`;
      
      // Carregar receitas, despesas e eventos do mês
      const [receitasRes, despesasRes, eventosRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}&mes=${mesFormatado}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}&mes=${mesFormatado}`),
        axios.get(`${API_ENDPOINTS.EVENTOS}?userId=${userId}&mes=${mesFormatado}`)
      ]);
      
      setReceitas(receitasRes.data);
      setDespesas(despesasRes.data);
      setEventos(eventosRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const navegarMes = (direcao) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direcao === 'anterior') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const gerarCalendario = () => {
    const ano = currentDate.getFullYear();
    const mes = currentDate.getMonth();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const primeiroDiaSemana = primeiroDia.getDay();
    const totalDias = ultimoDia.getDate();

    const calendario = [];
    let diaAtual = 1;

    // Gerar semanas
    for (let semana = 0; semana < 6; semana++) {
      const diasSemana = [];
      
      for (let dia = 0; dia < 7; dia++) {
        if ((semana === 0 && dia < primeiroDiaSemana) || diaAtual > totalDias) {
          diasSemana.push(null);
        } else {
          const data = new Date(ano, mes, diaAtual);
          const dataString = data.toISOString().split('T')[0];
          
          // Verificar se há receitas, despesas ou eventos neste dia
          const receitasDoDia = receitas.filter(r => {
            const receitaData = new Date(r.receita_data).toISOString().split('T')[0];
            return receitaData === dataString;
          });
          
          const despesasDoDia = despesas.filter(d => {
            const despesaData = new Date(d.despesa_data).toISOString().split('T')[0];
            return despesaData === dataString;
          });
          
          const eventosDoDia = eventos.filter(e => {
            const eventoData = new Date(e.evento_data).toISOString().split('T')[0];
            return eventoData === dataString;
          });
          
          diasSemana.push({
            dia: diaAtual,
            data: dataString,
            receitas: receitasDoDia,
            despesas: despesasDoDia,
            eventos: eventosDoDia,
            temReceitas: receitasDoDia.length > 0,
            temDespesas: despesasDoDia.length > 0,
            temEventos: eventosDoDia.length > 0
          });
          
          diaAtual++;
        }
      }
      
      calendario.push(diasSemana);
    }

    return calendario;
  };

  const handleDiaClick = (dia) => {
    if (!dia) return;
    
    setSelectedDate(dia);
    setShowModal(true);
    
    // Determinar automaticamente qual tipo mostrar
    if (dia.temEventos && !dia.temReceitas && !dia.temDespesas) {
      setModalType('eventos');
      setModalData(dia.eventos);
    } else if (dia.temDespesas && !dia.temReceitas) {
      setModalType('despesas');
      setModalData(dia.despesas);
    } else if (dia.temReceitas && !dia.temDespesas) {
      setModalType('receitas');
      setModalData(dia.receitas);
    } else if (dia.temReceitas && dia.temDespesas) {
      setModalType('despesas');
      setModalData(dia.despesas);
    } else if (dia.temEventos) {
      setModalType('eventos');
      setModalData(dia.eventos);
    }
  };

  const abrirModal = (tipo) => {
    if (!selectedDate) return;
    
    setModalType(tipo);
    if (tipo === 'receitas') {
      setModalData(selectedDate.receitas);
    } else if (tipo === 'despesas') {
      setModalData(selectedDate.despesas);
    } else if (tipo === 'eventos') {
      setModalData(selectedDate.eventos);
    }
  };

  // Funções para eventos
  const abrirModalEvento = (evento = null, dataPreSelecionada = null) => {
    if (evento) {
      setEditandoEvento(evento);
      setFormEvento({
        titulo: evento.evento_titulo,
        descricao: evento.evento_descricao || '',
        data: evento.evento_data.split('T')[0],
        hora_inicio: evento.evento_hora_inicio || '',
        hora_fim: evento.evento_hora_fim || '',
        tipo: evento.evento_tipo || 'geral',
        cor: evento.evento_cor || '#4F46E5',
        lembrete: evento.evento_lembrete !== false,
        lembrete_minutos: evento.evento_lembrete_minutos || 30
      });
    } else {
      setEditandoEvento(null);
      setFormEvento({
        titulo: '',
        descricao: '',
        data: dataPreSelecionada || selectedDate?.data || new Date().toISOString().split('T')[0],
        hora_inicio: '',
        hora_fim: '',
        tipo: 'geral',
        cor: '#4F46E5',
        lembrete: true,
        lembrete_minutos: 30
      });
    }
    setShowModalEvento(true);
  };

  const salvarEvento = async (e) => {
    e.preventDefault();
    
    try {
      const dados = {
        usuario_id: userId,
        titulo: formEvento.titulo,
        descricao: formEvento.descricao,
        data: formEvento.data,
        hora_inicio: formEvento.hora_inicio || null,
        hora_fim: formEvento.hora_fim || null,
        tipo: formEvento.tipo,
        cor: formEvento.cor,
        lembrete: formEvento.lembrete,
        lembrete_minutos: parseInt(formEvento.lembrete_minutos)
      };

      if (editandoEvento) {
        await axios.put(`${API_ENDPOINTS.EVENTOS}/${editandoEvento.evento_id}`, dados);
      } else {
        await axios.post(API_ENDPOINTS.EVENTOS, dados);
      }

      setShowModalEvento(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento');
    }
  };

  const excluirEvento = async (id) => {
    if (!window.confirm('Deseja excluir este evento?')) return;
    
    try {
      await axios.delete(`${API_ENDPOINTS.EVENTOS}/${id}`);
      carregarDados();
      // Atualizar modal se estiver aberto
      if (selectedDate) {
        setModalData(prev => prev.filter(e => e.evento_id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento');
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setModalData([]);
    setModalType('');
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (dataString) => {
    if (!dataString) return '00/00/0000';
    try {
      // Usar split para evitar problemas de fuso horário
      const dataFormatada = dataString.split('T')[0]; // YYYY-MM-DD
      const [ano, mes, dia] = dataFormatada.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      return '00/00/0000';
    }
  };



  if (loading) {
    return (
      <div className="calendario-container">
        <div className="loading">Carregando calendário...</div>
      </div>
    );
  }



  return (
    <div className="calendario-container">
      <div className="calendario-header">
        <div className="header-content">
          <button onClick={() => navegarMes('anterior')} className="btn-navegar">
            ‹
          </button>
          <h2>{meses[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={() => navegarMes('proximo')} className="btn-navegar">
            ›
          </button>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => abrirModalEvento()}
            className="btn-add-evento"
            title="Novo Evento"
          >
            <FaCalendarPlus /> Novo Evento
          </button>
          <button 
            onClick={navigateToHome}
            className="btn-home"
            title="Voltar para Home"
          >
            <FaHome /> Home
          </button>
        </div>
      </div>

      <div className="calendario">
        <div className="dias-semana">
          {diasSemana.map(dia => (
            <div key={dia} className="dia-semana">{dia}</div>
          ))}
        </div>

        <div className="dias-mes">
          {gerarCalendario().map((semana, semanaIndex) => (
            <div key={semanaIndex} className="semana">
              {semana.map((dia, diaIndex) => (
                                                   <div
                    key={diaIndex}
                    className={`dia ${!dia ? 'vazio' : ''} ${selectedDate?.data === dia?.data ? 'selecionado' : ''}`}
                    onClick={() => handleDiaClick(dia)}
                  >
                  {dia && (
                    <>
                      <span className="numero-dia">{dia.dia}</span>
                      <div className="indicadores">
                        {dia.temReceitas && <div className="indicador receita">●</div>}
                        {dia.temDespesas && <div className="indicador despesa">●</div>}
                        {dia.temEventos && <div className="indicador evento">●</div>}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal para mostrar detalhes */}
      {showModal && selectedDate && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                         <div className={`modal-header ${modalType}`}>
               <h3>{formatarData(selectedDate.data)}</h3>
               <button onClick={fecharModal} className="btn-fechar">×</button>
             </div>
            
            <div className="modal-buttons">
               <button 
                 onClick={() => abrirModal('receitas')}
                 className={`btn-modal ${modalType === 'receitas' ? 'ativo' : ''} ${selectedDate.temReceitas ? 'receitas' : 'inativo'}`}
                 disabled={!selectedDate.temReceitas}
               >
                 Receitas ({selectedDate.receitas.length})
               </button>
               <button 
                 onClick={() => abrirModal('despesas')}
                 className={`btn-modal ${modalType === 'despesas' ? 'ativo' : ''} ${selectedDate.temDespesas ? 'despesas' : 'inativo'}`}
                 disabled={!selectedDate.temDespesas}
               >
                 Despesas ({selectedDate.despesas.length})
               </button>
               <button 
                 onClick={() => abrirModal('eventos')}
                 className={`btn-modal ${modalType === 'eventos' ? 'ativo' : ''} ${selectedDate.temEventos ? 'eventos' : 'inativo'}`}
                 disabled={!selectedDate.temEventos}
               >
                 Eventos ({selectedDate.eventos?.length || 0})
               </button>
            </div>

            {modalData.length > 0 && (
              <div className="modal-lista">
                <h4>
                  {modalType === 'receitas' ? 'Receitas' : modalType === 'despesas' ? 'Despesas' : 'Eventos'}
                </h4>
                <div className="lista-items">
                  {modalType === 'eventos' ? (
                    // Renderizar eventos
                    modalData.map((item, index) => (
                      <div key={index} className="item-card evento-card" style={{ borderLeftColor: item.evento_cor }}>
                        <div className="item-header">
                          <span className="item-descricao">{item.evento_titulo}</span>
                          <div className="item-acoes">
                            <button onClick={() => { setShowModal(false); abrirModalEvento(item); }} title="Editar">
                              <FaEdit />
                            </button>
                            <button onClick={() => excluirEvento(item.evento_id)} title="Excluir">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        {item.evento_descricao && (
                          <p className="evento-descricao">{item.evento_descricao}</p>
                        )}
                        <div className="item-detalhes">
                          <span className="item-tipo" style={{ backgroundColor: item.evento_cor, color: 'white' }}>
                            {tiposEvento.find(t => t.value === item.evento_tipo)?.label || item.evento_tipo}
                          </span>
                          {item.evento_hora_inicio && (
                            <span className="item-hora">
                              <FaClock /> {item.evento_hora_inicio.slice(0, 5)}
                              {item.evento_hora_fim && ` - ${item.evento_hora_fim.slice(0, 5)}`}
                            </span>
                          )}
                          {item.evento_lembrete && (
                            <span className="item-lembrete">
                              <FaBell /> {item.evento_lembrete_minutos}min antes
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Renderizar receitas/despesas
                    modalData.map((item, index) => (
                      <div key={index} className="item-card">
                        <div className="item-header">
                          <span className="item-descricao">
                            {modalType === 'receitas' ? item.receita_descricao : item.despesa_descricao}
                          </span>
                          <span className={`item-valor ${modalType === 'receitas' ? 'receita' : 'despesa'}`}>
                            {formatarValor(modalType === 'receitas' ? item.receita_valor : item.despesa_valor)}
                          </span>
                        </div>
                        <div className="item-detalhes">
                          <span className="item-tipo">
                            {modalType === 'receitas' ? item.receita_tipo : item.despesa_tipo}
                          </span>
                          {modalType === 'receitas' ? (
                            <span className={`item-status ${item.receita_recebido ? 'recebido' : 'pendente'}`}>
                              {item.receita_recebido ? 'Recebido' : 'Pendente'}
                            </span>
                          ) : (
                            <span className={`item-status ${item.despesa_pago ? 'pago' : 'pendente'}`}>
                              {item.despesa_pago ? 'Pago' : 'Pendente'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {modalType === 'eventos' && (
                  <button 
                    className="btn-add-evento-modal"
                    onClick={() => { setShowModal(false); abrirModalEvento(null, selectedDate.data); }}
                  >
                    <FaPlus /> Adicionar Evento
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Novo/Editar Evento */}
      {showModalEvento && (
        <div className="modal-overlay" onClick={() => setShowModalEvento(false)}>
          <div className="modal-content modal-evento" onClick={e => e.stopPropagation()}>
            <div className="modal-header eventos" style={{ backgroundColor: formEvento.cor }}>
              <h3>{editandoEvento ? 'Editar Evento' : 'Novo Evento'}</h3>
              <button className="btn-fechar" onClick={() => setShowModalEvento(false)}>×</button>
            </div>
            <form onSubmit={salvarEvento} className="modal-form">
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={formEvento.titulo}
                  onChange={e => setFormEvento({ ...formEvento, titulo: e.target.value })}
                  placeholder="Ex: Reunião, Consulta médica, etc."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Descrição (opcional)</label>
                <textarea
                  value={formEvento.descricao}
                  onChange={e => setFormEvento({ ...formEvento, descricao: e.target.value })}
                  placeholder="Detalhes do evento..."
                  rows={3}
                />
              </div>
              
              <div className="form-row">
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
              
              <div className="form-row">
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
                <div className="cores-selector">
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
              
              <div className="form-row">
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
                      <option value="5">5 minutos</option>
                      <option value="10">10 minutos</option>
                      <option value="15">15 minutos</option>
                      <option value="30">30 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="1440">1 dia</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModalEvento(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" style={{ backgroundColor: formEvento.cor }}>
                  {editandoEvento ? 'Salvar' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario; 