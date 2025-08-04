import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './Calendario.css';

const Calendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'receitas' ou 'despesas'
  const [modalData, setModalData] = useState([]);
  const [debug, setDebug] = useState(true); // Debug mode

  const userId = localStorage.getItem('userId');

  // Nomes dos meses
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Dias da semana
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    console.log('🚀 Componente Calendario montado');
    console.log('👤 User ID:', userId);
    
    if (userId) {
      carregarDados();
    } else {
      console.error('❌ User ID não encontrado!');
    }
  }, [userId, currentDate]);

  const carregarDados = async () => {
    console.log('🔄 Carregando dados do calendário...');
    console.log('📅 Data atual:', currentDate);
    console.log('👤 User ID:', userId);
    
    setLoading(true);
    try {
      const ano = currentDate.getFullYear();
      const mes = String(currentDate.getMonth() + 1).padStart(2, '0');
      const mesFormatado = `${ano}-${mes}`;
      
      console.log('📊 Buscando dados para:', mesFormatado);
      
      // Carregar receitas do mês
      console.log('💰 Buscando receitas...');
      const receitasResponse = await axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}&mes=${mesFormatado}`);
      console.log('✅ Receitas carregadas:', receitasResponse.data.length);
      setReceitas(receitasResponse.data);

      // Carregar despesas do mês
      console.log('💸 Buscando despesas...');
      const despesasResponse = await axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}&mes=${mesFormatado}`);
      console.log('✅ Despesas carregadas:', despesasResponse.data.length);
      setDespesas(despesasResponse.data);
      
      console.log('🎉 Dados carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      console.error('📋 Detalhes do erro:', error.response?.data || error.message);
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
    console.log('📅 Gerando calendário...');
    console.log('📊 Total de receitas:', receitas.length);
    console.log('📊 Total de despesas:', despesas.length);
    
    const ano = currentDate.getFullYear();
    const mes = currentDate.getMonth();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const primeiroDiaSemana = primeiroDia.getDay();
    const totalDias = ultimoDia.getDate();

    console.log(`📅 Mês: ${ano}-${mes + 1}, Dias: ${totalDias}`);

    const calendario = [];
    let diaAtual = 1;
    let diasComDados = 0;

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
          
          if (receitasDoDia.length > 0 || despesasDoDia.length > 0) {
            diasComDados++;
            console.log(`📅 Dia ${diaAtual}: ${receitasDoDia.length} receitas, ${despesasDoDia.length} despesas`);
          }
          
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

    console.log(`✅ Calendário gerado com ${diasComDados} dias com dados`);
    return calendario;
  };

  const handleDiaClick = (dia) => {
    if (!dia) return;
    
    setSelectedDate(dia);
    setShowModal(true);
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

  // Debug: Versão simplificada para testar
  if (debug) {
    return (
      <div className="calendario-container">
        <h2>🔧 Debug - Calendário</h2>
        <div style={{ padding: '20px', background: '#f0f0f0', margin: '10px 0' }}>
          <h3>📊 Estado do Componente:</h3>
          <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
          <p><strong>User ID:</strong> {userId || 'Não encontrado'}</p>
          <p><strong>Receitas:</strong> {receitas.length}</p>
          <p><strong>Despesas:</strong> {despesas.length}</p>
          <p><strong>Data Atual:</strong> {currentDate.toLocaleDateString()}</p>
        </div>
        
        <div style={{ padding: '20px', background: '#e8f5e8', margin: '10px 0' }}>
          <h3>📅 Teste de Navegação:</h3>
          <button onClick={() => navegarMes('anterior')} style={{ margin: '5px', padding: '10px' }}>
            Mês Anterior
          </button>
          <button onClick={() => navegarMes('proximo')} style={{ margin: '5px', padding: '10px' }}>
            Próximo Mês
          </button>
        </div>
        
        <div style={{ padding: '20px', background: '#fff3cd', margin: '10px 0' }}>
          <h3>🎯 Teste de Dados:</h3>
          <button onClick={carregarDados} style={{ margin: '5px', padding: '10px' }}>
            Recarregar Dados
          </button>
          <button onClick={() => setDebug(false)} style={{ margin: '5px', padding: '10px', background: '#28a745', color: 'white' }}>
            Mostrar Calendário Real
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="calendario-container">
        <div className="loading">Carregando calendário...</div>
      </div>
    );
  }

  console.log('🎨 Renderizando calendário...');
  console.log('📊 Estado atual:', { receitas: receitas.length, despesas: despesas.length });

  return (
    <div className="calendario-container">
      <div className="calendario-header">
        <button onClick={() => navegarMes('anterior')} className="btn-navegar">
          ‹
        </button>
        <h2>{meses[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={() => navegarMes('proximo')} className="btn-navegar">
          ›
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
            <div className="modal-header">
              <h3>{formatarData(selectedDate.data)}</h3>
              <button onClick={fecharModal} className="btn-fechar">×</button>
            </div>
            
            <div className="modal-buttons">
              <button 
                onClick={() => abrirModal('receitas')}
                className={`btn-modal ${selectedDate.temReceitas ? 'ativo' : 'inativo'}`}
                disabled={!selectedDate.temReceitas}
              >
                Receitas ({selectedDate.receitas.length})
              </button>
              <button 
                onClick={() => abrirModal('despesas')}
                className={`btn-modal ${selectedDate.temDespesas ? 'ativo' : 'inativo'}`}
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