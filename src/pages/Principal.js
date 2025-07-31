import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaMoneyCheckAlt, FaChartLine, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import GraficoEvolucaoMensal from '../components/GraficoEvolucaoMensal';
import GraficosPizza from '../components/GraficosPizza';
import ModalRelatorio from '../components/ModalRelatorio';

function Principal() {
  const navigate = useNavigate();
  const [totais, setTotais] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModalRelatorio, setShowModalRelatorio] = useState(false);
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  
  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

  useEffect(() => {
    if (userId) {
      fetchTotais();
    }
  }, [userId]);

  const fetchTotais = async () => {
    setLoading(true);
    try {
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`)
      ]);

      // Obter mês atual
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      // Filtrar receitas do mês atual para o banner
      const receitasMes = receitasRes.data.filter(receita => {
        const dataReceita = new Date(receita.receita_data);
        return dataReceita.getMonth() === mesAtual && 
               dataReceita.getFullYear() === anoAtual;
      });

      // Filtrar despesas do mês atual para o banner
      const despesasMes = despesasRes.data.filter(despesa => {
        const dataDespesa = new Date(despesa.despesa_data);
        return dataDespesa.getMonth() === mesAtual && 
               dataDespesa.getFullYear() === anoAtual;
      });

      // Totais do período (para os cards)
      const totalReceitasPeriodo = receitasRes.data
      .filter(receita => receita.receita_recebido)
      .reduce((sum, receita) => sum + parseFloat(receita.receita_valor), 0);
      const totalDespesasPeriodo = despesasRes.data
        .filter(despesa => despesa.despesa_pago)
        .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor), 0);
      const saldoPeriodo = totalReceitasPeriodo - totalDespesasPeriodo;

      // Totais do mês (para o banner)
      const totalReceitasMes = receitasMes
      .filter(receita => receita.receita_recebido)
      .reduce((sum, receita) => sum + parseFloat(receita.receita_valor), 0);
      const totalDespesasMes = despesasMes
        .filter(despesa => despesa.despesa_pago)
        .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor), 0);
      const saldoMes = totalReceitasMes - totalDespesasMes;

      setTotais({
        totalReceitas: totalReceitasPeriodo, // Cards mostram período total
        totalDespesas: totalDespesasPeriodo, // Cards mostram período total
        saldo: saldoPeriodo, // Cards mostram período total
        // Dados do mês para o banner
        totalReceitasMes,
        totalDespesasMes,
        saldoMes
      });

      // Armazenar dados completos para relatórios
      setReceitas(receitasRes.data);
      setDespesas(despesasRes.data);
    } catch (err) {
      console.log('Erro ao buscar totais:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (!userId) {
    return <div>Usuário não logado</div>;
  }

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Botões de Ação */}
      <div className="relatorios-header">
        <div className="header-actions">
          {/*<button 
            onClick={() => navigate('/dashboard')}
            className="btn-dashboard"
          >
            <FaChartLine /> Dashboard Completo
          </button>*/}
          <button 
            onClick={() => setShowModalRelatorio(true)}
            className="btn-relatorio"
          >
            <FaFilePdf /> Gerar Relatórios
          </button>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card positive"
        onClick={() => navigate('/receita')}
        style={{ cursor: 'pointer' }}
        title="Receita"
        >
          <div className="card-icon">
            <FaMoneyBillWave />
          </div>
          <div className="card-content">
            <h3>Total Receitas</h3>
            <span className="card-value">{formatarValor(totais.totalReceitas)}</span>
            <span className="card-description">Total Entradas</span>
          </div>
        </div>

        <div className="dashboard-card negative"
        onClick={() => navigate('/despesa')}
        style={{ cursor: 'pointer' }}
        title="Despesa"
        >
          <div className="card-icon">
            <FaMoneyCheckAlt />
          </div>
          <div className="card-content">
            <h3>Total Despesas</h3>
            <span className="card-value">{formatarValor(totais.totalDespesas)}</span>
            <span className="card-description">Total Saídas</span>
          </div>
        </div>

        <div className={`dashboard-card ${totais.saldo >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>Saldo Total</h3>
            <span className="card-value">{formatarValor(totais.saldo)}</span>
            <span className="card-description">
              {totais.saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </span>
          </div>
        </div>
      </div>

      <div className="home-stats">
        <div className="stat-summary">
          <h3>Resumo do Mês</h3>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-label">Receitas:</span>
              <span className="stat-value positive">{formatarValor(totais.totalReceitasMes)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Despesas:</span>
              <span className="stat-value negative">{formatarValor(totais.totalDespesasMes)}</span>
            </div>
            {/*<div className="stat-item total">*/}
            <div className="stat-item">
              <span className="stat-label">Saldo:</span>
              <span className={`stat-value ${totais.saldoMes >= 0 ? 'positive' : 'negative'}`}>
                {formatarValor(totais.saldoMes)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard de Gráficos */}
      <div className="dashboard-charts">
        <div className="charts-header">
          <h3>Análise Gráfica</h3>
          <p>Visualize seus dados financeiros de forma interativa</p>
        </div>
        <div className="charts-container">
          <div className="chart-card">
            <h4>Evolução Mensal - Últimos 12 Meses</h4>
            <div className="chart-content">
              <GraficoEvolucaoMensal />
            </div>
          </div>
          
          <div className="chart-card">
            <h4>Distribuição por Tipo - Mês Atual</h4>
            <div className="chart-content">
              <GraficosPizza />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Relatórios */}
      <ModalRelatorio 
        isOpen={showModalRelatorio}
        onClose={() => setShowModalRelatorio(false)}
        receitas={receitas}
        despesas={despesas}
      />
    </div>
  );
}

export default Principal;