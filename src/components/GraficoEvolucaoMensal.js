import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatLabel(date) {
  return String(date.getDate());
}

function formatPeriodo(date) {
  return `${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

function sameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseLocalDate(raw) {
  if (!raw) return null;
  const ymd = String(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : startOfLocalDay(d);
  }
  const [y, m, day] = ymd.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function GraficoEvolucaoMensal() {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offsetMeses, setOffsetMeses] = useState(0);

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

  const janela = useMemo(() => {
    const hoje = startOfLocalDay(new Date());
    const ref = new Date(hoje.getFullYear(), hoje.getMonth() + offsetMeses, 1);
    const ano = ref.getFullYear();
    const mes = ref.getMonth();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const dias = [];
    for (let i = 1; i <= totalDias; i++) {
      dias.push(new Date(ano, mes, i));
    }
    return { ref, dias, hoje };
  }, [offsetMeses]);

  const dadosGrafico = useMemo(() => {
    const labels = [];
    const dadosReceitas = [];
    const dadosDespesas = [];

    janela.dias.forEach((dia) => {
      labels.push(formatLabel(dia));

      const totalReceitas = receitas
        .filter((r) => {
          const data = parseLocalDate(r.receita_data);
          return data && sameLocalDay(data, dia) && r.receita_recebido;
        })
        .reduce((sum, r) => sum + (parseFloat(r.receita_valor) || 0), 0);

      const totalDespesas = despesas
        .filter((d) => {
          const data = parseLocalDate(d.despesa_data);
          return data && sameLocalDay(data, dia) && d.despesa_pago;
        })
        .reduce((sum, d) => sum + (parseFloat(d.despesa_valor) || 0), 0);

      dadosReceitas.push(totalReceitas);
      dadosDespesas.push(totalDespesas);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: dadosReceitas,
          backgroundColor: 'rgba(22, 163, 74, 0.85)',
          borderColor: '#16A34A',
          borderWidth: 0,
          borderRadius: 3,
          maxBarThickness: 16,
        },
        {
          label: 'Despesas',
          data: dadosDespesas,
          backgroundColor: 'rgba(220, 38, 38, 0.85)',
          borderColor: '#DC2626',
          borderWidth: 0,
          borderRadius: 3,
          maxBarThickness: 16,
        },
      ],
    };
  }, [janela, receitas, despesas]);

  const tituloPeriodo = useMemo(() => {
    if (!janela.ref) return '';
    return formatPeriodo(janela.ref);
  }, [janela]);

  const centroEhHoje =
    janela.ref.getFullYear() === janela.hoje.getFullYear() &&
    janela.ref.getMonth() === janela.hoje.getMonth();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    datasets: {
      bar: {
        categoryPercentage: 0.82,
        barPercentage: 0.9,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 18,
          font: { size: 12, weight: '600' },
          color: '#334155',
        },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          title(items) {
            const idx = items[0]?.dataIndex;
            const dia = janela.dias[idx];
            if (!dia) return '';
            return `${String(dia.getDate()).padStart(2, '0')}/${String(dia.getMonth() + 1).padStart(2, '0')}/${dia.getFullYear()}`;
          },
          label(context) {
            const valor = context.parsed.y;
            return `${context.dataset.label}: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(valor)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 10,
        border: { display: false },
        grid: { color: 'rgba(148, 163, 184, 0.18)' },
        ticks: {
          maxTicksLimit: 6,
          color: '#64748b',
          font: { size: 11 },
          callback(value) {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          color: '#64748b',
          font: { size: 9, weight: '600' },
        },
      },
    },
    layout: {
      padding: { top: 8, right: 8, bottom: 8, left: 4 },
    },
  };

  if (!userId) return <div>Usuário não logado</div>;

  if (loading) {
    return (
      <div className="chart-loading">
        <p>Carregando dados do gráfico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-error">
        <p>{error}</p>
        <button type="button" onClick={buscarDados}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="grafico-evolucao-mensal">
      <div className="grafico-evolucao-nav">
        <button
          type="button"
          className="grafico-evolucao-nav__btn"
          onClick={() => setOffsetMeses((o) => o - 1)}
          aria-label="Mês anterior"
        >
          <FaChevronLeft size={14} color="#fff" />
        </button>
        <button
          type="button"
          className="grafico-evolucao-nav__period"
          onClick={() => setOffsetMeses(0)}
          disabled={centroEhHoje}
          title={centroEhHoje ? undefined : 'Voltar para este mês'}
        >
          {tituloPeriodo}
        </button>
        <button
          type="button"
          className="grafico-evolucao-nav__btn"
          onClick={() => setOffsetMeses((o) => o + 1)}
          aria-label="Próximo mês"
        >
          <FaChevronRight size={14} color="#fff" />
        </button>
      </div>
      <div className="chart-container" style={{ height: '280px', width: '100%', position: 'relative' }}>
        <Bar data={dadosGrafico} options={options} />
      </div>
    </div>
  );
}

export default GraficoEvolucaoMensal;
