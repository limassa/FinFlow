import React, { useState, useEffect } from 'react';
import { FaHome } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import { useNavigate } from 'react-router-dom';
import './Calendario.css';

const Calendario = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'receitas' ou 'despesas'
  const [modalData, setModalData] = useState([]);

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
      
      // Carregar receitas do mês
      const receitasResponse = await axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}&mes=${mesFormatado}`);
      setReceitas(receitasResponse.data);

      // Carregar despesas do mês
      const despesasResponse = await axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}&mes=${mesFormatado}`);
      setDespesas(despesasResponse.data);
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
          
          // Verificar se há receitas ou despesas neste dia
          const receitasDoDia = receitas.filter(r => {
            const receitaData = new Date(r.receita_data).toISOString().split('T')[0];
            return receitaData === dataString;
          });
          
          const despesasDoDia = despesas.filter(d => {
            const despesaData = new Date(d.despesa_data).toISOString().split('T')[0];
            return despesaData === dataString;
          });
          
          diasSemana.push({
            dia: diaAtual,
            data: dataString,
            receitas: receitasDoDia,
            despesas: despesasDoDia,
            temReceitas: receitasDoDia.length > 0,
            temDespesas: despesasDoDia.length > 0
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
    if (dia.temDespesas && !dia.temReceitas) {
      // Só tem despesas - mostrar despesas
      setModalType('despesas');
      setModalData(dia.despesas);
    } else if (dia.temReceitas && !dia.temDespesas) {
      // Só tem receitas - mostrar receitas
      setModalType('receitas');
      setModalData(dia.receitas);
    } else if (dia.temReceitas && dia.temDespesas) {
      // Tem ambos - mostrar despesas por padrão (vermelho)
      setModalType('despesas');
      setModalData(dia.despesas);
    }
  };

  const abrirModal = (tipo) => {
    if (!selectedDate) return;
    
    setModalType(tipo);
    if (tipo === 'receitas') {
      setModalData(selectedDate.receitas);
    } else {
      setModalData(selectedDate.despesas);
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
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
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
        <button 
          onClick={navigateToHome}
          className="btn-home"
          title="Voltar para Home"
        >
          <FaHome /> Home
        </button>
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
                 className={`btn-modal ${selectedDate.temReceitas ? `ativo receitas` : 'inativo'}`}
                 disabled={!selectedDate.temReceitas}
               >
                 Receitas ({selectedDate.receitas.length})
               </button>
               <button 
                 onClick={() => abrirModal('despesas')}
                 className={`btn-modal ${selectedDate.temDespesas ? `ativo despesas` : 'inativo'}`}
                 disabled={!selectedDate.temDespesas}
               >
                 Despesas ({selectedDate.despesas.length})
               </button>
            </div>

            {modalData.length > 0 && (
              <div className="modal-lista">
                <h4>{modalType === 'receitas' ? 'Receitas' : 'Despesas'}</h4>
                <div className="lista-items">
                  {modalData.map((item, index) => (
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
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario; 