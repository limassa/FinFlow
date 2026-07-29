import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function formatarBRL(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

function PizzaLegend({ chartData }) {
  if (!chartData?.labels?.length) return null;
  const values = chartData.datasets?.[0]?.data || [];
  const colors = chartData.datasets?.[0]?.backgroundColor || [];

  return (
    <ul className="pizza-legend" aria-label="Legenda do gráfico">
      {chartData.labels.map((label, index) => (
        <li key={`${label}-${index}`} className="pizza-legend__item">
          <span
            className="pizza-legend__dot"
            style={{ backgroundColor: colors[index] || '#94a3b8' }}
          />
          <span className="pizza-legend__label">{label}</span>
          <span className="pizza-legend__value">{formatarBRL(values[index])}</span>
        </li>
      ))}
    </ul>
  );
}

function GraficosPizza() {
  const navigate = useNavigate();
  const [dadosReceitas, setDadosReceitas] = useState(null);
  const [dadosDespesas, setDadosDespesas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChart, setCurrentChart] = useState(0); // 0 = receitas, 1 = despesas

  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

  useEffect(() => {
    if (userId) {
      buscarDadosMensais();
    }
  }, [userId]);

  const buscarDadosMensais = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`)
      ]);

      const receitas = receitasRes.data;
      const despesas = despesasRes.data;

      setDadosReceitas(gerarDadosReceitasPizza(receitas));
      setDadosDespesas(gerarDadosDespesasPizza(despesas));
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados do gráfico');
    } finally {
      setLoading(false);
    }
  };

  const gerarDadosReceitasPizza = (receitas) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const receitasMes = receitas.filter(receita => {
      const dataReceita = new Date(receita.receita_data);
      return dataReceita.getMonth() === mesAtual && 
             dataReceita.getFullYear() === anoAtual &&
             receita.receita_recebido;
    });

    const receitasPorTipo = {};
    receitasMes.forEach(receita => {
      const tipo = receita.receita_tipo || 'Outros';
      if (!receitasPorTipo[tipo]) {
        receitasPorTipo[tipo] = 0;
      }
      receitasPorTipo[tipo] += parseFloat(receita.receita_valor);
    });

    const labels = Object.keys(receitasPorTipo);
    const data = Object.values(receitasPorTipo);
    const cores = [
      '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6',
      '#EF4444', '#10B981', '#F97316', '#06B6D4',
    ];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: cores.slice(0, labels.length),
        borderColor: cores.slice(0, labels.length).map(cor => cor + 'CC'),
        borderWidth: 2,
      }],
    };
  };

  const gerarDadosDespesasPizza = (despesas) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const despesasMes = despesas.filter(despesa => {
      const dataDespesa = new Date(despesa.despesa_data);
      return dataDespesa.getMonth() === mesAtual && 
             dataDespesa.getFullYear() === anoAtual &&
             despesa.despesa_pago;
    });

    const despesasPorTipo = {};
    despesasMes.forEach(despesa => {
      const tipo = despesa.despesa_tipo || 'Outros';
      if (!despesasPorTipo[tipo]) {
        despesasPorTipo[tipo] = 0;
      }
      despesasPorTipo[tipo] += parseFloat(despesa.despesa_valor);
    });

    const labels = Object.keys(despesasPorTipo);
    const data = Object.values(despesasPorTipo);
    const cores = [
      '#EF4444', '#F97316', '#F59E0B', '#8B5CF6',
      '#EC4899', '#F43F5E', '#DC2626', '#EA580C',
    ];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: cores.slice(0, labels.length),
        borderColor: cores.slice(0, labels.length).map(cor => cor + 'CC'),
        borderWidth: 2,
      }],
    };
  };

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const valor = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentual = total > 0 ? ((valor / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${formatarBRL(valor)} (${percentual}%)`;
          }
        }
      }
    },
    layout: {
      padding: {
        left: 8,
        right: 8,
        top: 8,
        bottom: 8
      }
    }
  }), []);

  const nextChart = () => {
    setCurrentChart((prev) => (prev + 1) % 2);
  };

  const prevChart = () => {
    setCurrentChart((prev) => (prev - 1 + 2) % 2);
  };

  const handleChartClick = () => {
    const tipoAtivo = currentChart === 0 ? 'receitas' : 'despesas';
    navigate('/layout/detalhes-grafico', { state: { defaultTab: tipoAtivo } });
  };

  if (!userId) {
    return <div>Usuário não logado</div>;
  }

  if (loading) {
    return (
      <div className="chart-loading">
        <p>Carregando dados dos gráficos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-error">
        <p>{error}</p>
        <button onClick={buscarDadosMensais}>Tentar novamente</button>
      </div>
    );
  }

  const hasReceitas = dadosReceitas && dadosReceitas.labels.length > 0;
  const hasDespesas = dadosDespesas && dadosDespesas.labels.length > 0;
  const activeData = currentChart === 0 ? dadosReceitas : dadosDespesas;
  const hasActiveData = currentChart === 0 ? hasReceitas : hasDespesas;

  return (
    <div className="graficos-pizza-carrossel">
      <div className="graficos-pizza-nav">
        <button
          type="button"
          onClick={prevChart}
          className="graficos-pizza-nav__btn"
          aria-label="Gráfico anterior"
        >
          <FaChevronLeft size={14} />
        </button>
        <p className="graficos-pizza-title">
          {currentChart === 0 ? 'Receitas' : 'Despesas'} — Mês atual
        </p>
        <button
          type="button"
          onClick={nextChart}
          className="graficos-pizza-nav__btn"
          aria-label="Próximo gráfico"
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      {hasActiveData ? (
        <div className="pizza-chart-layout">
          <div
            className="chart-container chart-container--pizza"
            style={{ cursor: 'pointer' }}
            onClick={handleChartClick}
            title="Clique para ver detalhes"
          >
            <Pie data={activeData} options={chartOptions} />
          </div>
          <PizzaLegend chartData={activeData} />
        </div>
      ) : (
        <div className="chart-empty">
          <p>
            {currentChart === 0
              ? 'Nenhuma receita registrada este mês'
              : 'Nenhuma despesa registrada este mês'}
          </p>
        </div>
      )}
    </div>
  );
}

export default GraficosPizza;
