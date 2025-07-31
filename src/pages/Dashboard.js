import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaChartPie, FaCalendarAlt, FaBell, FaCog } from 'react-icons/fa';
import GraficoEvolucaoMensal from '../components/GraficoEvolucaoMensal';
import GraficosPizza from '../components/GraficosPizza';
import { API_ENDPOINTS } from '../config/api';
import '../App.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    receitasMes: 0,
    despesasMes: 0,
    contasAtivas: 0
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

  // Verificar se está carregando
  if (!user && !loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Redirecionando...</div>
      </div>
    );
  }

  const carregarEstatisticas = async (userId) => {
    try {
      setLoading(true);
      
      // Buscar estatísticas gerais
      const [receitasRes, despesasRes, contasRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        fetch(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
        fetch(`${API_ENDPOINTS.CONTAS}?userId=${userId}`)
      ]);

      const receitas = await receitasRes.json();
      const despesas = await despesasRes.json();
      const contas = await contasRes.json();

      // Calcular totais
      const totalReceitas = receitas.reduce((sum, r) => sum + parseFloat(r.receita_valor), 0);
      const totalDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.despesa_valor), 0);
      
      // Calcular valores do mês atual
      const mesAtual = new Date().toISOString().slice(0, 7);
      const receitasMes = receitas
        .filter(r => r.receita_data.startsWith(mesAtual))
        .reduce((sum, r) => sum + parseFloat(r.receita_valor), 0);
      const despesasMes = despesas
        .filter(d => d.despesa_data.startsWith(mesAtual))
        .reduce((sum, d) => sum + parseFloat(d.despesa_valor), 0);

      setStats({
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        receitasMes,
        despesasMes,
        contasAtivas: contas.length
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header do Dashboard */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <FaChartLine />
          <h1>Dashboard Financeiro</h1>
        </div>
        <div className="dashboard-actions">
          <button 
            className="btn-secondary"
            onClick={() => navigate('/principal')}
          >
            Voltar ao Menu
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card positive">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Receitas do Mês</h3>
            <div className="stat-value">{formatarMoeda(stats.receitasMes)}</div>
            <div className="stat-description">Total de receitas em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        <div className="stat-card negative">
          <div className="stat-icon">
            <FaChartPie />
          </div>
          <div className="stat-content">
            <h3>Despesas do Mês</h3>
            <div className="stat-value">{formatarMoeda(stats.despesasMes)}</div>
            <div className="stat-description">Total de despesas em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        <div className={`stat-card ${stats.saldo >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>Saldo do Mês</h3>
            <div className="stat-value">{formatarMoeda(stats.saldo)}</div>
            <div className="stat-description">
              {stats.saldo >= 0 ? 'Superávit' : 'Déficit'} em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="stat-card neutral">
          <div className="stat-icon">
            <FaBell />
          </div>
          <div className="stat-content">
            <h3>Contas Ativas</h3>
            <div className="stat-value">{stats.contasAtivas}</div>
            <div className="stat-description">Contas bancárias cadastradas</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Evolução Mensal</h3>
          <GraficoEvolucaoMensal />
        </div>
        
        <div className="chart-container">
          <h3>Distribuição por Categoria</h3>
          <GraficosPizza />
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="actions-grid">
          <button 
            className="action-btn"
            onClick={() => navigate('/receita')}
          >
            <FaChartLine />
            <span>Nova Receita</span>
          </button>
          
          <button 
            className="action-btn"
            onClick={() => navigate('/despesa')}
          >
            <FaChartPie />
            <span>Nova Despesa</span>
          </button>
          
          <button 
            className="action-btn"
            onClick={() => navigate('/contas')}
          >
            <FaCog />
            <span>Gerenciar Contas</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 