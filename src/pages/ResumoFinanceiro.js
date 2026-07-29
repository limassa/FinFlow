import React, { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaHome, FaArrowDown, FaArrowUp, FaBalanceScale, FaPiggyBank } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MESES_CURTO = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

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

function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

function ResumoFinanceiro() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const userId = usuario?.id;
  const [ano, setAno] = useState(new Date().getFullYear());
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    const carregar = async () => {
      setLoading(true);
      try {
        const [receitasRes, despesasRes] = await Promise.all([
          axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
          axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
        ]);
        setReceitas(receitasRes.data || []);
        setDespesas(despesasRes.data || []);
      } catch (err) {
        console.error('Erro ao carregar panorama financeiro:', err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [userId, navigate]);

  const meses = useMemo(() => {
    return MESES.map((nome, mesIdx) => {
      const entradas = receitas
        .filter((r) => {
          const d = parseLocalDate(r.receita_data);
          return d && d.getFullYear() === ano && d.getMonth() === mesIdx && r.receita_recebido;
        })
        .reduce((s, r) => s + parseFloat(r.receita_valor || 0), 0);

      const saidas = despesas
        .filter((d) => {
          const dt = parseLocalDate(d.despesa_data);
          return dt && dt.getFullYear() === ano && dt.getMonth() === mesIdx && d.despesa_pago;
        })
        .reduce((s, d) => s + parseFloat(d.despesa_valor || 0), 0);

      return {
        nome,
        entradas,
        saidas,
        saldo: entradas - saidas,
      };
    });
  }, [receitas, despesas, ano]);

  const totais = useMemo(() => {
    return meses.reduce(
      (acc, m) => ({
        entradas: acc.entradas + m.entradas,
        saidas: acc.saidas + m.saidas,
        saldo: acc.saldo + m.saldo,
      }),
      { entradas: 0, saidas: 0, saldo: 0 }
    );
  }, [meses]);

  const maiorGastoMes = useMemo(() => {
    return meses.reduce(
      (best, m) => (m.saidas > best.saidas ? m : best),
      { nome: null, saidas: 0 }
    );
  }, [meses]);

  const taxaEconomia = useMemo(() => {
    if (totais.entradas <= 0) return null;
    return Math.round(((totais.entradas - totais.saidas) / totais.entradas) * 100);
  }, [totais]);

  const chartData = useMemo(
    () => ({
      labels: MESES_CURTO,
      datasets: [
        {
          label: 'Entradas',
          data: meses.map((m) => m.entradas),
          backgroundColor: 'rgba(34, 197, 94, 0.75)',
          borderColor: '#16A34A',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Saídas',
          data: meses.map((m) => m.saidas),
          backgroundColor: 'rgba(239, 68, 68, 0.75)',
          borderColor: '#DC2626',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    }),
    [meses]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { size: 12, weight: '600' },
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${formatarValor(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, weight: '600' }, color: '#64748b' },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.2)' },
          ticks: {
            maxTicksLimit: 6,
            color: '#64748b',
            callback(value) {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(value);
            },
          },
        },
      },
    }),
    []
  );

  if (!userId) return null;

  return (
    <div className="resumo-financeiro-page">
      <div className="resumo-financeiro-header">
        <button type="button" className="btn-home" onClick={() => navigate('/layout/principal')}>
          <FaHome /> Home
        </button>
        <h1>Panorama Financeiro</h1>
        <div className="resumo-financeiro-ano-nav">
          <button
            type="button"
            className="resumo-financeiro-ano-nav__btn"
            onClick={() => setAno((a) => a - 1)}
            aria-label="Ano anterior"
          >
            <FaChevronLeft />
          </button>
          <span>{ano}</span>
          <button
            type="button"
            className="resumo-financeiro-ano-nav__btn"
            onClick={() => setAno((a) => a + 1)}
            aria-label="Próximo ano"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="resumo-financeiro-loading">Carregando...</p>
      ) : (
        <>
          <section className="panorama-cards">
            <article className="panorama-card panorama-card--entrada">
              <div className="panorama-card__icon">
                <FaArrowDown />
              </div>
              <div>
                <span className="panorama-card__label">Entradas no Ano</span>
                <strong className="panorama-card__value positive">{formatarValor(totais.entradas)}</strong>
              </div>
            </article>
            <article className="panorama-card panorama-card--saida">
              <div className="panorama-card__icon">
                <FaArrowUp />
              </div>
              <div>
                <span className="panorama-card__label">Saídas no Ano</span>
                <strong className="panorama-card__value negative">{formatarValor(totais.saidas)}</strong>
              </div>
            </article>
            <article className="panorama-card panorama-card--saldo">
              <div className="panorama-card__icon">
                <FaBalanceScale />
              </div>
              <div>
                <span className="panorama-card__label">Saldo do Ano</span>
                <strong className={`panorama-card__value ${totais.saldo >= 0 ? 'positive' : 'negative'}`}>
                  {formatarValor(totais.saldo)}
                </strong>
              </div>
            </article>
          </section>

          <section className="panorama-chart-card">
            <h2>Entradas x Saídas — {ano}</h2>
            <div className="panorama-chart-card__body">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </section>

          <div className="resumo-financeiro-table-wrap">
            <table className="resumo-financeiro-table">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Entradas</th>
                  <th>Saídas</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {meses.map((m) => (
                  <tr key={m.nome}>
                    <td>{m.nome}</td>
                    <td className="positive">{formatarValor(m.entradas)}</td>
                    <td className="negative">{formatarValor(m.saidas)}</td>
                    <td className={m.saldo >= 0 ? 'positive' : 'negative'}>
                      {formatarValor(m.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total {ano}</td>
                  <td className="positive">{formatarValor(totais.entradas)}</td>
                  <td className="negative">{formatarValor(totais.saidas)}</td>
                  <td className={totais.saldo >= 0 ? 'positive' : 'negative'}>
                    {formatarValor(totais.saldo)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <section className="panorama-bottom">
            <article className="panorama-insights">
              <h2>Resumo de {ano}</h2>
              <ul>
                <li>Você registrou {formatarValor(totais.entradas)} em receitas.</li>
                <li>Gastou {formatarValor(totais.saidas)}.</li>
                {maiorGastoMes.saidas > 0 ? (
                  <li>
                    Seu maior gasto ocorreu em {maiorGastoMes.nome.toLowerCase()} (
                    {formatarValor(maiorGastoMes.saidas)}).
                  </li>
                ) : (
                  <li>Ainda não há despesas registradas neste ano.</li>
                )}
                <li>
                  Seu saldo acumulado é de{' '}
                  <strong className={totais.saldo >= 0 ? 'positive' : 'negative'}>
                    {formatarValor(totais.saldo)}
                  </strong>
                  .
                </li>
              </ul>
            </article>

            <article className="panorama-taxa">
              <div className="panorama-taxa__header">
                <FaPiggyBank />
                <h2>Taxa de economia</h2>
              </div>
              {taxaEconomia === null ? (
                <p className="panorama-taxa__empty">
                  Registre receitas neste ano para calcular sua taxa de economia.
                </p>
              ) : (
                <>
                  <div className="panorama-taxa__row">
                    <span>Entradas</span>
                    <strong className="positive">{formatarValor(totais.entradas)}</strong>
                  </div>
                  <div className="panorama-taxa__row">
                    <span>Saídas</span>
                    <strong className="negative">{formatarValor(totais.saidas)}</strong>
                  </div>
                  <div className="panorama-taxa__pct">
                    <span className={taxaEconomia >= 0 ? 'positive' : 'negative'}>
                      {taxaEconomia}%
                    </span>
                  </div>
                  <p className="panorama-taxa__msg">
                    {taxaEconomia >= 0
                      ? `Você conseguiu guardar ${taxaEconomia}% da sua renda este ano.`
                      : `Você gastou ${Math.abs(taxaEconomia)}% a mais do que recebeu este ano.`}
                  </p>
                </>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}

export default ResumoFinanceiro;
