import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { getUsuarioLogado } from '../functions/auth';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function GraficosPizza() {
  const [dadosReceitas, setDadosReceitas] = useState(null);
  const [dadosDespesas, setDadosDespesas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        axios.get(`http://localhost:3001/api/receitas?userId=${userId}`),
        axios.get(`http://localhost:3001/api/despesas?userId=${userId}`)
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
      const dataReceita = new Date(receita.date || receita.data);
      return dataReceita.getMonth() === mesAtual && 
             dataReceita.getFullYear() === anoAtual;
    });

    // Agrupar por tipo
    const receitasPorTipo = {};
    receitasMes.forEach(receita => {
      const tipo = receita.tipo || 'Outros';
      if (!receitasPorTipo[tipo]) {
        receitasPorTipo[tipo] = 0;
      }
      receitasPorTipo[tipo] += parseFloat(receita.valor);
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
      const dataDespesa = new Date(despesa.date || despesa.data);
              return dataDespesa.getMonth() === mesAtual && 
               dataDespesa.getFullYear() === anoAtual &&
               despesa.despesa_pago;
    });

    // Agrupar por tipo
    const despesasPorTipo = {};
    despesasMes.forEach(despesa => {
      const tipo = despesa.tipo || 'Outros';
      if (!despesasPorTipo[tipo]) {
        despesasPorTipo[tipo] = 0;
      }
      despesasPorTipo[tipo] += parseFloat(despesa.valor);
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
    layout: {
      padding: {
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 6,
          font: {
            size: 9,
            weight: 'bold'
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentual = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentual}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: 2,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: 'Receitas por Tipo - Mês Atual',
        font: {
          size: 11,
          weight: 'bold'
        },
        padding: {
          top: 3,
          bottom: 3
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const valor = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentual = ((valor / total) * 100).toFixed(1);
            return `${context.label}: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(valor)} (${percentual}%)`;
          }
        }
      }
    }
  };

  const optionsDespesas = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 6,
          font: {
            size: 9,
            weight: 'bold'
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentual = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentual}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: 2,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: 'Despesas por Tipo - Mês Atual',
        font: {
          size: 11,
          weight: 'bold'
        },
        padding: {
          top: 3,
          bottom: 3
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const valor = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentual = ((valor / total) * 100).toFixed(1);
            return `${context.label}: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(valor)} (${percentual}%)`;
          }
        }
      }
    }
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

  return (
    <div className="graficos-pizza">
      <div className="pizza-charts-container">
        <div className="pizza-chart-card">
          <div className="chart-container" style={{ height: '150px' }}>
            {dadosReceitas && dadosReceitas.labels.length > 0 ? (
              <Pie data={dadosReceitas} options={optionsReceitas} />
            ) : (
              <div className="chart-empty">
                <p>Nenhuma receita registrada este mês</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="pizza-chart-card">
          <div className="chart-container" style={{ height: '150px' }}>
            {dadosDespesas && dadosDespesas.labels.length > 0 ? (
              <Pie data={dadosDespesas} options={optionsDespesas} />
            ) : (
              <div className="chart-empty">
                <p>Nenhuma despesa registrada este mês</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraficosPizza; 