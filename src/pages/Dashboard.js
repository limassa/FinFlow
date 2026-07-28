import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaChartPie, FaHome } from 'react-icons/fa';
import GraficoEvolucaoMensal from '../components/GraficoEvolucaoMensal';
import GraficosPizza from '../components/GraficosPizza';
import { API_ENDPOINTS } from '../config/api';
import '../App.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    receitasMes: 0,
    despesasMes: 0,
    saldoMes: 0,
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(userData);
    carregarEstatisticas(userData.id);
  }, [navigate]);

  const carregarEstatisticas = async (userId) => {
    try {
      setLoading(true);
      const [receitasRes, despesasRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        fetch(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
      ]);

      const receitas = await receitasRes.json();
      const despesas = await despesasRes.json();
      const mesAtual = new Date().toISOString().slice(0, 7);

      const receitasMes = (receitas || [])
        .filter((r) => r.receita_recebido && String(r.receita_data || '').startsWith(mesAtual))
        .reduce((sum, r) => sum + parseFloat(r.receita_valor || 0), 0);

      const despesasMes = (despesas || [])
        .filter((d) => d.despesa_pago && String(d.despesa_data || '').startsWith(mesAtual))
        .reduce((sum, d) => sum + parseFloat(d.despesa_valor || 0), 0);

      setStats({
        receitasMes,
        despesasMes,
        saldoMes: receitasMes - despesasMes,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);

  if (!user && !loading) {
    return (
      <div className="dashboard-page">
        <div className="principal-loading">Redirecionando...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="principal-loading">
          <div className="principal-loading-spinner" />
          <span>Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  const mesLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <h1>Dashboard</h1>
          <p>Análise financeira de {mesLabel}</p>
        </div>
        <button
          type="button"
          className="dashboard-page__home"
          onClick={() => navigate('/layout/principal')}
        >
          <FaHome /> Home
        </button>
      </header>

      <section className="dashboard-page__stats">
        <article className="dashboard-page__stat positive">
          <span>Receitas do mês</span>
          <strong>{formatarMoeda(stats.receitasMes)}</strong>
        </article>
        <article className="dashboard-page__stat negative">
          <span>Despesas do mês</span>
          <strong>{formatarMoeda(stats.despesasMes)}</strong>
        </article>
        <article className={`dashboard-page__stat ${stats.saldoMes >= 0 ? 'positive' : 'negative'}`}>
          <span>Saldo do mês</span>
          <strong>{formatarMoeda(stats.saldoMes)}</strong>
        </article>
      </section>

      <section className="dashboard-page__charts">
        <div className="dashboard-page__chart-card">
          <div className="dashboard-page__chart-title">
            <FaChartLine />
            <h2>Evolução financeira</h2>
          </div>
          <div className="dashboard-page__chart-body">
            <GraficoEvolucaoMensal />
          </div>
        </div>

        <div className="dashboard-page__chart-card">
          <div className="dashboard-page__chart-title">
            <FaChartPie />
            <h2>Distribuição por categoria</h2>
          </div>
          <div className="dashboard-page__chart-body">
            <GraficosPizza />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
