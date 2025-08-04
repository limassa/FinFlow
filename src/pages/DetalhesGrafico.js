import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaReceipt, FaMoneyBillWave, FaMoneyCheckAlt } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

const DetalhesGrafico = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  // Usar o defaultTab do state da navegação, ou 'receitas' como padrão
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'receitas');
  const [mesAtual, setMesAtual] = useState(new Date());

  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

  // Nomes dos meses
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    if (userId) {
      carregarDados();
    }
  }, [userId, mesAtual]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const ano = mesAtual.getFullYear();
      const mes = String(mesAtual.getMonth() + 1).padStart(2, '0');
      const mesFormatado = `${ano}-${mes}`;
      
      // Carregar receitas e despesas do mês
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}&mes=${mesFormatado}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}&mes=${mesFormatado}`)
      ]);

      // Filtrar apenas receitas recebidas e despesas pagas
      const receitasFiltradas = receitasRes.data.filter(receita => receita.receita_recebido);
      const despesasFiltradas = despesasRes.data.filter(despesa => despesa.despesa_pago);

      setReceitas(receitasFiltradas);
      setDespesas(despesasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const navegarMes = (direcao) => {
    setMesAtual(prev => {
      const newDate = new Date(prev);
      if (direcao === 'anterior') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
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

  const agruparPorTipo = (items, tipo) => {
    const grupos = {};
    items.forEach(item => {
      const chave = tipo === 'receitas' ? item.receita_tipo : item.despesa_tipo;
      const tipoNome = chave || 'Outros';
      if (!grupos[tipoNome]) {
        grupos[tipoNome] = [];
      }
      grupos[tipoNome].push(item);
    });
    return grupos;
  };

  const calcularTotalPorTipo = (items, tipo) => {
    return items.reduce((total, item) => {
      const valor = tipo === 'receitas' ? item.receita_valor : item.despesa_valor;
      return total + parseFloat(valor || 0);
    }, 0);
  };

  const receitasPorTipo = agruparPorTipo(receitas, 'receitas');
  const despesasPorTipo = agruparPorTipo(despesas, 'despesas');

  const totalReceitas = calcularTotalPorTipo(receitas, 'receitas');
  const totalDespesas = calcularTotalPorTipo(despesas, 'despesas');

  if (!userId) {
    return <div>Usuário não logado</div>;
  }

  if (loading) {
    return (
      <div className="detalhes-container">
        <div className="loading">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="detalhes-container">
      {/* Header */}
      <div className="detalhes-header">
        <button onClick={() => navigate('/layout/principal')} className="btn-voltar">
          <FaArrowLeft /> Voltar
        </button>
        <h2>Detalhes do Gráfico - {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}</h2>
        <div className="navegacao-mes">
          <button onClick={() => navegarMes('anterior')} className="btn-navegar">
            ‹
          </button>
          <span className="mes-atual">
            {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </span>
          <button onClick={() => navegarMes('proximo')} className="btn-navegar">
            ›
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="resumo-container">
        <div className="resumo-card receitas">
          <div className="resumo-icon">
            <FaMoneyBillWave />
          </div>
          <div className="resumo-content">
            <h3>Total Receitas</h3>
            <span className="resumo-valor">{formatarValor(totalReceitas)}</span>
            <span className="resumo-count">{receitas.length} receitas</span>
          </div>
        </div>

        <div className="resumo-card despesas">
          <div className="resumo-icon">
            <FaMoneyCheckAlt />
          </div>
          <div className="resumo-content">
            <h3>Total Despesas</h3>
            <span className="resumo-valor">{formatarValor(totalDespesas)}</span>
            <span className="resumo-count">{despesas.length} despesas</span>
          </div>
        </div>

        <div className={`resumo-card ${(totalReceitas - totalDespesas) >= 0 ? 'saldo-positivo' : 'saldo-negativo'}`}>
          <div className="resumo-icon">
            <FaReceipt />
          </div>
          <div className="resumo-content">
            <h3>Saldo do Mês</h3>
            <span className="resumo-valor">{formatarValor(totalReceitas - totalDespesas)}</span>
            <span className="resumo-count">Saldo disponível</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          onClick={() => setActiveTab('receitas')}
          className={`tab ${activeTab === 'receitas' ? 'ativo' : ''}`}
        >
          <FaMoneyBillWave /> Receitas ({receitas.length})
        </button>
        <button 
          onClick={() => setActiveTab('despesas')}
          className={`tab ${activeTab === 'despesas' ? 'ativo' : ''}`}
        >
          <FaMoneyCheckAlt /> Despesas ({despesas.length})
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="tab-content">
        {activeTab === 'receitas' ? (
          <div className="receitas-content">
            {Object.keys(receitasPorTipo).length > 0 ? (
              Object.entries(receitasPorTipo).map(([tipo, items]) => {
                const totalTipo = calcularTotalPorTipo(items, 'receitas');
                const percentual = totalReceitas > 0 ? ((totalTipo / totalReceitas) * 100).toFixed(1) : 0;
                
                return (
                  <div key={tipo} className="tipo-grupo">
                    <div className="tipo-header">
                      <h3>{tipo}</h3>
                      <div className="tipo-totais">
                        <span className="tipo-valor">{formatarValor(totalTipo)}</span>
                        <span className="tipo-percentual">({percentual}%)</span>
                      </div>
                    </div>
                    <div className="items-lista">
                      {items.map((receita, index) => (
                        <div key={index} className="item-card receita">
                          <div className="item-header">
                            <span className="item-descricao">{receita.receita_descricao}</span>
                            <span className="item-valor">{formatarValor(receita.receita_valor)}</span>
                          </div>
                          <div className="item-detalhes">
                            <span className="item-data">{formatarData(receita.receita_data)}</span>
                            <span className="item-status recebido">Recebido</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>Nenhuma receita registrada neste mês</p>
              </div>
            )}
          </div>
        ) : (
          <div className="despesas-content">
            {Object.keys(despesasPorTipo).length > 0 ? (
              Object.entries(despesasPorTipo).map(([tipo, items]) => {
                const totalTipo = calcularTotalPorTipo(items, 'despesas');
                const percentual = totalDespesas > 0 ? ((totalTipo / totalDespesas) * 100).toFixed(1) : 0;
                
                return (
                  <div key={tipo} className="tipo-grupo">
                    <div className="tipo-header">
                      <h3>{tipo}</h3>
                      <div className="tipo-totais">
                        <span className="tipo-valor">{formatarValor(totalTipo)}</span>
                        <span className="tipo-percentual">({percentual}%)</span>
                      </div>
                    </div>
                    <div className="items-lista">
                      {items.map((despesa, index) => (
                        <div key={index} className="item-card despesa">
                          <div className="item-header">
                            <span className="item-descricao">{despesa.despesa_descricao}</span>
                            <span className="item-valor">{formatarValor(despesa.despesa_valor)}</span>
                          </div>
                          <div className="item-detalhes">
                            <span className="item-data">{formatarData(despesa.despesa_data)}</span>
                            <span className="item-status pago">Pago</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>Nenhuma despesa registrada neste mês</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalhesGrafico; 