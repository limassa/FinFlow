import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaMoneyCheckAlt, FaChartLine, FaFilePdf, FaPlus, FaMinus, FaChartPie, FaCog } from 'react-icons/fa';
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
    saldo: 0,
    receitasMes: 0,
    despesasMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModalRelatorio, setShowModalRelatorio] = useState(false);
  
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
      // Buscar receitas e despesas do usuário
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`)
      ]);

      const receitas = receitasRes.data;
      const despesas = despesasRes.data;

      // Calcular totais (apenas receitas recebidas e despesas pagas)
      const totalReceitas = receitas
        .filter(receita => receita.receita_recebido) // Apenas receitas recebidas
        .reduce((sum, receita) => 
          sum + parseFloat(receita.receita_valor || 0), 0
        );
      
      const totalDespesas = despesas
        .filter(despesa => despesa.despesa_pago) // Apenas despesas pagas
        .reduce((sum, despesa) => 
          sum + parseFloat(despesa.despesa_valor || 0), 0
        );

      // Calcular totais do mês atual (apenas recebidas/pagas)
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      
      const receitasMes = receitas.filter(receita => {
        const dataReceita = new Date(receita.receita_data);
        return dataReceita.getMonth() === mesAtual && 
               dataReceita.getFullYear() === anoAtual &&
               receita.receita_recebido; // Apenas receitas recebidas
      }).reduce((sum, receita) => sum + parseFloat(receita.receita_valor || 0), 0);

      const despesasMes = despesas.filter(despesa => {
        const dataDespesa = new Date(despesa.despesa_data);
        return dataDespesa.getMonth() === mesAtual && 
               dataDespesa.getFullYear() === anoAtual &&
               despesa.despesa_pago; // Apenas despesas pagas
      }).reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0);

      setTotais({
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        receitasMes,
        despesasMes
      });
    } catch (err) {
      console.log('Erro ao buscar totais:', err);
      // Dados de exemplo para demonstração
      setTotais({
        totalReceitas: 15425.50,
        totalDespesas: 8750.30,
        saldo: 6675.20,
        receitasMes: 3250.00,
        despesasMes: 1850.00
      });
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
                    onClick={() => navigate('/layout/receita')}
        style={{ cursor: 'pointer' }}
        title="Receitas"
        >
          <div className="card-icon">
            <FaMoneyBillWave />
          </div>
          <div className="card-content">
            <h3>Total Receitas</h3>
            <span className="card-value">{formatarValor(totais.totalReceitas)}</span>
            <span className="card-description">Receitas Recebidas</span>
          </div>
        </div>

        <div className="dashboard-card negative"
                    onClick={() => navigate('/layout/despesa')}
        style={{ cursor: 'pointer' }}
        title="Despesas"
        >
          <div className="card-icon">
            <FaMoneyCheckAlt />
          </div>
          <div className="card-content">
            <h3>Total Despesas</h3>
            <span className="card-value">{formatarValor(totais.totalDespesas)}</span>
            <span className="card-description">Despesas Pagas</span>
          </div>
        </div>

        <div className={`dashboard-card ${totais.saldo >= 0 ? 'positive' : 'negative'}`}
        style={{ cursor: 'default' }}
        title="Saldo"
        >
          <div className="card-icon">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>Saldo Atual</h3>
            <span className="card-value">{formatarValor(totais.saldo)}</span>
            <span className="card-description">Saldo Disponível</span>
          </div>
        </div>
      </div>

      <div className="home-stats">
        <div className="stat-summary">
          <h3>Resumo do Mês</h3>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-label">Receitas do Mês:</span>
              <span className="stat-value positive">{formatarValor(totais.receitasMes)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Despesas do Mês:</span>
              <span className="stat-value negative">{formatarValor(totais.despesasMes)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Saldo do Mês:</span>
              <span className={`stat-value ${(totais.receitasMes - totais.despesasMes) >= 0 ? 'positive' : 'negative'}`}>
                {formatarValor(totais.receitasMes - totais.despesasMes)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard de Gráficos */}
      <div className="dashboard-charts">
        <div className="charts-header">
          <h3>Análise Financeira</h3>
          <p>Visualize seus dados financeiros de forma interativa</p>
        </div>
        <div className="charts-container">
          <div className="chart-card">
            <h4 style={{ textAlign: 'center' }}>Evolução Financeira - Últimos 12 Meses</h4>
            <div className="chart-content">
              <GraficoEvolucaoMensal />
            </div>
          </div>
          
          <div className="chart-card">
            <h4 style={{ textAlign: 'center' }}>Distribuição por Categoria - Mês Atual</h4>
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
        receitas={[]}
        despesas={[]}
      />
    </div>
  );
}

export default Principal;