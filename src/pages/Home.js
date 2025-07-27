import React, { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaMoneyCheckAlt, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import { getUsuarioLogado } from '../functions/auth';

function Home() {
  const [totais, setTotais] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0
  });
  const [loading, setLoading] = useState(true);
  
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
        axios.get(`http://localhost:3001/api/receitas?userId=${userId}`),
        axios.get(`http://localhost:3001/api/despesas?userId=${userId}`)
      ]);

      const totalReceitas = receitasRes.data.reduce((sum, receita) => sum + parseFloat(receita.valor), 0);
      const totalDespesas = despesasRes.data.reduce((sum, despesa) => sum + parseFloat(despesa.valor), 0);
      const saldo = totalReceitas - totalDespesas;

      setTotais({
        totalReceitas,
        totalDespesas,
        saldo
      });
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
      <div className="home-header">
        <h1>Dashboard Financeiro Teste</h1>
        <p>Bem-vindo, {usuario?.nome}!</p>
      </div>

      <div className="dashboard-cards">
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

        <div className="dashboard-card positive">
          <div className="card-icon">
            <FaMoneyBillWave />
          </div>
          <div className="card-content">
            <h3>Total Receitas</h3>
            <span className="card-value">{formatarValor(totais.totalReceitas)}</span>
            <span className="card-description">Entradas do período</span>
          </div>
        </div>

        <div className="dashboard-card negative">
          <div className="card-icon">
            <FaMoneyCheckAlt />
          </div>
          <div className="card-content">
            <h3>Total Despesas</h3>
            <span className="card-value">{formatarValor(totais.totalDespesas)}</span>
            <span className="card-description">Saídas do período</span>
          </div>
        </div>
      </div>

      <div className="home-stats">
        <div className="stat-summary">
          <h3>Resumo do Período Teste</h3>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-label">Receitas: </span>
              <span className="stat-value positive">{formatarValor(totais.totalReceitas)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Despesas:</span>
              <span className="stat-value negative">{formatarValor(totais.totalDespesas)}</span>
            </div>
            <div className="stat-item total">
              <span className="stat-label">Saldo:</span>
              <span className={`stat-value ${totais.saldo >= 0 ? 'positive' : 'negative'}`}>
                {formatarValor(totais.saldo)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
