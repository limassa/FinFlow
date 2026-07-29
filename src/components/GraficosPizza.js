import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import { getIconForTipo, getColorForTipo } from '../utils/categoryIcons';

ChartJS.register(ArcElement, Tooltip, Legend);

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatarBRL(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

function parseLocalDate(raw) {
  if (!raw) return null;
  const ymd = String(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [y, m, day] = ymd.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function PizzaLegend({ labels, values, colors, tipoCategoria }) {
  if (!labels?.length) return null;

  return (
    <ul className="pizza-legend" aria-label="Legenda do gráfico">
      {labels.map((label, index) => {
        const Icon = getIconForTipo(label, tipoCategoria);
        const cor = colors[index] || getColorForTipo(label, tipoCategoria);
        return (
          <li key={`${label}-${index}`} className="pizza-legend__item">
            <span className="pizza-legend__icon" style={{ color: cor, backgroundColor: `${cor}18` }}>
              <Icon />
            </span>
            <span className="pizza-legend__label">{label}</span>
            <span className="pizza-legend__value">{formatarBRL(values[index])}</span>
          </li>
        );
      })}
    </ul>
  );
}

function montarPizza(itens, { tipoCampo, valorCampo, dataCampo, pagoCampo, mes, ano, tipoCategoria }) {
  const filtrados = itens.filter((item) => {
    const data = parseLocalDate(item[dataCampo]);
    return (
      data &&
      data.getMonth() === mes &&
      data.getFullYear() === ano &&
      item[pagoCampo]
    );
  });

  const porTipo = {};
  filtrados.forEach((item) => {
    const tipo = item[tipoCampo] || 'Outros';
    porTipo[tipo] = (porTipo[tipo] || 0) + parseFloat(item[valorCampo] || 0);
  });

  const labels = Object.keys(porTipo);
  const data = Object.values(porTipo);
  const colors = labels.map((l) => getColorForTipo(l, tipoCategoria));

  return {
    labels,
    values: data,
    colors,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };
}

function GraficosPizza() {
  const navigate = useNavigate();
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChart, setCurrentChart] = useState(1); // 0 = receitas, 1 = despesas
  const [mesRef, setMesRef] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

  useEffect(() => {
    if (userId) buscarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const buscarDados = async () => {
    setLoading(true);
    setError(null);
    try {
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
      ]);
      setReceitas(receitasRes.data || []);
      setDespesas(despesasRes.data || []);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados do gráfico');
    } finally {
      setLoading(false);
    }
  };

  const mes = mesRef.getMonth();
  const ano = mesRef.getFullYear();
  const tipoCategoria = currentChart === 0 ? 'receita' : 'despesa';

  const dadosReceitas = useMemo(
    () =>
      montarPizza(receitas, {
        tipoCampo: 'receita_tipo',
        valorCampo: 'receita_valor',
        dataCampo: 'receita_data',
        pagoCampo: 'receita_recebido',
        mes,
        ano,
        tipoCategoria: 'receita',
      }),
    [receitas, mes, ano]
  );

  const dadosDespesas = useMemo(
    () =>
      montarPizza(despesas, {
        tipoCampo: 'despesa_tipo',
        valorCampo: 'despesa_valor',
        dataCampo: 'despesa_data',
        pagoCampo: 'despesa_pago',
        mes,
        ano,
        tipoCategoria: 'despesa',
      }),
    [despesas, mes, ano]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const valor = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentual = total > 0 ? ((valor / total) * 100).toFixed(1) : '0.0';
              return `${context.label}: ${formatarBRL(valor)} (${percentual}%)`;
            },
          },
        },
      },
      layout: {
        padding: { left: 8, right: 8, top: 8, bottom: 8 },
      },
    }),
    []
  );

  const prevMes = () => {
    setMesRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const nextMes = () => {
    setMesRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
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
        <button type="button" onClick={buscarDados}>
          Tentar novamente
        </button>
      </div>
    );
  }

  const activeData = currentChart === 0 ? dadosReceitas : dadosDespesas;
  const hasActiveData = activeData.labels.length > 0;
  const mesLabel = `${MESES[mes]} ${ano}`;

  return (
    <div className="graficos-pizza-carrossel">
      <div className="graficos-pizza-tabs">
        <button
          type="button"
          className={`graficos-pizza-tab ${currentChart === 0 ? 'active' : ''}`}
          onClick={() => setCurrentChart(0)}
        >
          Receitas
        </button>
        <button
          type="button"
          className={`graficos-pizza-tab ${currentChart === 1 ? 'active' : ''}`}
          onClick={() => setCurrentChart(1)}
        >
          Despesas
        </button>
      </div>

      <div className="graficos-pizza-nav">
        <button
          type="button"
          onClick={prevMes}
          className="graficos-pizza-nav__btn"
          aria-label="Mês anterior"
        >
          <FaChevronLeft size={14} />
        </button>
        <p className="graficos-pizza-title">{mesLabel}</p>
        <button
          type="button"
          onClick={nextMes}
          className="graficos-pizza-nav__btn"
          aria-label="Próximo mês"
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
            <Doughnut data={activeData} options={chartOptions} />
          </div>
          <PizzaLegend
            labels={activeData.labels}
            values={activeData.values}
            colors={activeData.colors}
            tipoCategoria={tipoCategoria}
          />
        </div>
      ) : (
        <div className="chart-empty">
          <p>
            {currentChart === 0
              ? `Nenhuma receita registrada em ${mesLabel.toLowerCase()}`
              : `Nenhuma despesa registrada em ${mesLabel.toLowerCase()}`}
          </p>
        </div>
      )}
    </div>
  );
}

export default GraficosPizza;
