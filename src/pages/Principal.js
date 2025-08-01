import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaMoneyCheckAlt, FaChartLine, FaFilePdf, FaShoppingCart, FaBox, FaUsers, FaCog } from 'react-icons/fa';
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
    totalVendas: 0,
    totalProdutos: 0,
    totalClientes: 0,
    vendasHoje: 0
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
      // Dados de exemplo para demonstração
      const dadosExemplo = {
        totalVendas: 15425.50,
        totalProdutos: 150,
        totalClientes: 85,
        vendasHoje: 1250.00
      };
      
      setTotais(dadosExemplo);
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
        onClick={() => navigate('/vendas')}
        style={{ cursor: 'pointer' }}
        title="Vendas"
        >
          <div className="card-icon">
            <FaShoppingCart />
          </div>
          <div className="card-content">
            <h3>Total Vendas</h3>
            <span className="card-value">{formatarValor(totais.totalVendas)}</span>
            <span className="card-description">Vendas Realizadas</span>
          </div>
        </div>

        <div className="dashboard-card neutral"
        onClick={() => navigate('/produtos')}
        style={{ cursor: 'pointer' }}
        title="Produtos"
        >
          <div className="card-icon">
            <FaBox />
          </div>
          <div className="card-content">
            <h3>Produtos</h3>
            <span className="card-value">{totais.totalProdutos}</span>
            <span className="card-description">Produtos Cadastrados</span>
          </div>
        </div>

        <div className="dashboard-card positive"
        onClick={() => navigate('/clientes')}
        style={{ cursor: 'pointer' }}
        title="Clientes"
        >
          <div className="card-icon">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>Clientes</h3>
            <span className="card-value">{totais.totalClientes}</span>
            <span className="card-description">Clientes Cadastrados</span>
          </div>
        </div>

        <div className="dashboard-card neutral"
        onClick={() => navigate('/configuracoes')}
        style={{ cursor: 'pointer' }}
        title="Configurações"
        >
          <div className="card-icon">
            <FaCog />
          </div>
          <div className="card-content">
            <h3>Configurações</h3>
            <span className="card-value">Sistema</span>
            <span className="card-description">Configurações Gerais</span>
          </div>
        </div>
      </div>

      <div className="home-stats">
        <div className="stat-summary">
          <h3>Resumo do Dia</h3>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-label">Vendas Hoje:</span>
              <span className="stat-value positive">{formatarValor(totais.vendasHoje)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Produtos em Estoque:</span>
              <span className="stat-value neutral">{totais.totalProdutos}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Clientes Ativos:</span>
              <span className="stat-value positive">{totais.totalClientes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard de Gráficos */}
      <div className="dashboard-charts">
        <div className="charts-header">
          <h3>Análise de Vendas</h3>
          <p>Visualize seus dados de vendas de forma interativa</p>
        </div>
        <div className="charts-container">
          <div className="chart-card">
            <h4>Evolução de Vendas - Últimos 12 Meses</h4>
            <div className="chart-content">
              <GraficoEvolucaoMensal />
            </div>
          </div>
          
          <div className="chart-card">
            <h4>Distribuição por Categoria - Mês Atual</h4>
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