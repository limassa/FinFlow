import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DIAS_JANELA = 7;
const OFFSET_CENTRO = Math.floor(DIAS_JANELA / 2);

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatLabel(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
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
  const [offsetDias, setOffsetDias] = useState(0);

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
    const centro = addDays(hoje, offsetDias);
    const inicio = addDays(centro, -OFFSET_CENTRO);
    const dias = [];
    for (let i = 0; i < DIAS_JANELA; i++) {
      dias.push(addDays(inicio, i));
    }
    return { centro, dias, hoje };
  }, [offsetDias]);

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
          borderColor: '#16A34A',
          backgroundColor: 'rgba(34, 197, 94, 0.18)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#16A34A',
          pointBorderWidth: 2,
          borderWidth: 3,
        },
        {
          label: 'Despesas',
          data: dadosDespesas,
          borderColor: '#DC2626',
          backgroundColor: 'rgba(239, 68, 68, 0.14)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#DC2626',
          pointBorderWidth: 2,
          borderWidth: 3,
        },
      ],
    };
  }, [janela, receitas, despesas]);

  const tituloPeriodo = useMemo(() => {
    const ini = janela.dias[0];
    const fim = janela.dias[janela.dias.length - 1];
    if (!ini || !fim) return '';
    return `${formatLabel(ini)} a ${formatLabel(fim)}`;
  }, [janela]);

  const centroEhHoje = sameLocalDay(janela.centro, janela.hoje);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
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
          maxRotation: 0,
          minRotation: 0,
          color: '#64748b',
          font: { size: 11, weight: '600' },
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
          onClick={() => setOffsetDias((o) => o - DIAS_JANELA + 1)}
          aria-label="Período anterior"
        >
          <FaChevronLeft size={14} color="#fff" />
        </button>
        <button
          type="button"
          className="grafico-evolucao-nav__period"
          onClick={() => setOffsetDias(0)}
          disabled={centroEhHoje}
          title={centroEhHoje ? undefined : 'Voltar para hoje'}
        >
          {tituloPeriodo}
        </button>
        <button
          type="button"
          className="grafico-evolucao-nav__btn"
          onClick={() => setOffsetDias((o) => o + DIAS_JANELA - 1)}
          aria-label="Próximo período"
        >
          <FaChevronRight size={14} color="#fff" />
        </button>
      </div>
      <div className="chart-container" style={{ height: '240px', width: '100%', position: 'relative' }}>
        <Line data={dadosGrafico} options={options} />
      </div>
    </div>
  );
}

export default GraficoEvolucaoMensal;
