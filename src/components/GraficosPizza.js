import React, { useState, useEffect } from 'react';
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
      // Buscar receitas e despesas do usuário
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`)
      ]);

      const receitas = receitasRes.data;
      const despesas = despesasRes.data;

      // Gerar dados dos gráficos de pizza
      const dadosReceitasPizza = gerarDadosReceitasPizza(receitas);
      const dadosDespesasPizza = gerarDadosDespesasPizza(despesas);
      
      setDadosReceitas(dadosReceitasPizza);
      setDadosDespesas(dadosDespesasPizza);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados do gráfico');
    } finally {
      setLoading(false);
    }
  };

  const gerarDadosReceitasPizza = (receitas) => {
    // Obter mês atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
   

    // Filtrar receitas do mês atual
    const receitasMes = receitas.filter(receita => {
      const dataReceita = new Date(receita.receita_data);
      return dataReceita.getMonth() === mesAtual && 
             dataReceita.getFullYear() === anoAtual &&
             receita.receita_recebido;
    });

    // Agrupar por tipo
    const receitasPorTipo = {};
    receitasMes.forEach(receita => {
      const tipo = receita.receita_tipo || 'Outros';
      if (!receitasPorTipo[tipo]) {
        receitasPorTipo[tipo] = 0;
      }
      receitasPorTipo[tipo] += parseFloat(receita.receita_valor);
    });

    // Preparar dados para o gráfico
    const labels = Object.keys(receitasPorTipo);
    const data = Object.values(receitasPorTipo);
    const cores = [
      '#22C55E', // Verde
      '#3B82F6', // Azul
      '#F59E0B', // Amarelo
      '#8B5CF6', // Roxo
      '#EF4444', // Vermelho
      '#10B981', // Verde claro
      '#F97316', // Laranja
      '#06B6D4', // Ciano
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
    // Obter mês atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Filtrar despesas do mês atual (apenas pagas)
    const despesasMes = despesas.filter(despesa => {
      const dataDespesa = new Date(despesa.despesa_data);
              return dataDespesa.getMonth() === mesAtual && 
               dataDespesa.getFullYear() === anoAtual &&
               despesa.despesa_pago;
    });

    // Agrupar por tipo
    const despesasPorTipo = {};
    despesasMes.forEach(despesa => {
      const tipo = despesa.despesa_tipo || 'Outros';
      if (!despesasPorTipo[tipo]) {
        despesasPorTipo[tipo] = 0;
      }
      despesasPorTipo[tipo] += parseFloat(despesa.despesa_valor);
    });

    // Preparar dados para o gráfico
    const labels = Object.keys(despesasPorTipo);
    const data = Object.values(despesasPorTipo);
    const cores = [
      '#EF4444', // Vermelho
      '#F97316', // Laranja
      '#F59E0B', // Amarelo
      '#8B5CF6', // Roxo
      '#EC4899', // Rosa
      '#F43F5E', // Rosa escuro
      '#DC2626', // Vermelho escuro
      '#EA580C', // Laranja escuro
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

  const optionsReceitas = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        align: 'center',
        labels: {
          usePointStyle: true,
          padding: 12,
          boxWidth: 10,
          font: {
            size: 12,
            weight: '600',
          },
        },
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
            return `${context.label}: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(valor)} (${percentual}%)`;
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
  };

  const optionsDespesas = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        align: 'center',
        labels: {
          usePointStyle: true,
          padding: 12,
          boxWidth: 10,
          font: {
            size: 12,
            weight: '600',
          },
        },
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
            return `${context.label}: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(valor)} (${percentual}%)`;
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
  };

  const nextChart = () => {
    setCurrentChart((prev) => (prev + 1) % 2);
  };

  const prevChart = () => {
    setCurrentChart((prev) => (prev - 1 + 2) % 2);
  };

  const handleChartClick = () => {
    // Determinar qual gráfico está ativo (receitas ou despesas)
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

      <div
        className="chart-container chart-container--pizza"
        style={{ height: '280px', width: '100%', position: 'relative', cursor: 'pointer' }}
        onClick={handleChartClick}
        title="Clique para ver detalhes"
      >
        {currentChart === 0 ? (
          hasReceitas ? (
            <Pie data={dadosReceitas} options={optionsReceitas} />
          ) : (
            <div className="chart-empty">
              <p>Nenhuma receita registrada este mês</p>
            </div>
          )
        ) : (
          hasDespesas ? (
            <Pie data={dadosDespesas} options={optionsDespesas} />
          ) : (
            <div className="chart-empty">
              <p>Nenhuma despesa registrada este mês</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default GraficosPizza; 