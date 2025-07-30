import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import { getUsuarioLogado } from '../functions/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function GraficoEvolucaoMensal() {
  const [dadosGrafico, setDadosGrafico] = useState(null);
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

      // Gerar dados dos últimos 12 meses
      const dadosMensais = gerarDadosMensais(receitas, despesas);
      
      setDadosGrafico(dadosMensais);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados do gráfico');
    } finally {
      setLoading(false);
    }
  };

  const gerarDadosMensais = (receitas, despesas) => {
    const meses = [];
    const dadosReceitas = [];
    const dadosDespesas = [];

    // Gerar array dos últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      
      const mesAno = data.toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      meses.push(mesAno);

      // Calcular total de receitas do mês
      const receitasMes = receitas.filter(receita => {
        const dataReceita = new Date(receita.receita_data);
        const mesReceita = dataReceita.getMonth();
        const anoReceita = dataReceita.getFullYear();
        const mesAtual = data.getMonth();
        const anoAtual = data.getFullYear();
        const receitaPago = receita.receita_recebido;
        
        return mesReceita === mesAtual && anoReceita === anoAtual && receitaPago;
      });
      
      const totalReceitasMes = receitasMes.reduce((sum, receita) => 
        sum + parseFloat(receita.receita_valor), 0
      );
      dadosReceitas.push(totalReceitasMes);

      // Calcular total de despesas do mês (apenas pagas)
      const despesasMes = despesas.filter(despesa => {
        const dataDespesa = new Date(despesa.despesa_data);
        const mesDespesa = dataDespesa.getMonth();
        const anoDespesa = dataDespesa.getFullYear();
        const mesAtual = data.getMonth();
        const anoAtual = data.getFullYear();
        const despesaPago = despesa.despesa_pago;
        
        return mesDespesa === mesAtual && anoDespesa === anoAtual && despesaPago;
      });
      
      const totalDespesasMes = despesasMes.reduce((sum, despesa) => 
        sum + parseFloat(despesa.despesa_valor), 0
      );
      dadosDespesas.push(totalDespesasMes);
    }

    return {
      labels: meses,
      datasets: [
        {
          label: 'Receitas',
          data: dadosReceitas,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'Despesas',
          data: dadosDespesas,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 20,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Evolução Mensal - Últimos 12 Meses',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 5,
          bottom: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const valor = context.parsed.y;
            return `${context.dataset.label}: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(valor)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  };

  if (!userId) {
    return <div>Usuário não logado</div>;
  }

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
        <button onClick={buscarDadosMensais}>Tentar novamente</button>
      </div>
    );
  }

  if (!dadosGrafico) {
    return (
      <div className="chart-empty">
        <p>Nenhum dado disponível para exibir</p>
      </div>
    );
  }

  return (
    <div className="grafico-evolucao-mensal">
      <div className="chart-container" style={{ height: '400px',width: '100%', overflow: 'hidden' }}>
        <Bar data={dadosGrafico} options={options} />
      </div>
    </div>
  );
}

export default GraficoEvolucaoMensal; 