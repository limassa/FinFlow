import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCalculator, FaChartLine, FaMoneyBillWave, FaClock, FaHome } from 'react-icons/fa';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

function CalculadoraRetiradas() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = getUsuarioLogado();
  const isInsideLayout = location.pathname.startsWith('/layout');
  const [formData, setFormData] = useState({
    valorInicial: '',
    retiradaMensal: '',
    taxaJuros: '',
    tipoTaxa: 'anual', // 'anual' ou 'mensal'
    tempoRetirada: '',
    tipoTempo: 'anos' // 'anos' ou 'meses'
  });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Função para converter valor formatado para número
  const parseCurrency = (value) => {
    if (!value) return 0;
    // Remove separador de milhares (ponto) e converte vírgula para ponto decimal
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // Função para converter número para valor formatado
  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Para campos de moeda, aplicar máscara de calculadora com separador de milhares
    if (name === 'valorInicial' || name === 'retiradaMensal') {
      // Remove caracteres não numéricos
      let cleanValue = value.replace(/[^\d]/g, '');
      
      // Se não tem dígitos, usar 0,00
      if (!cleanValue) {
        cleanValue = '000';
      }
      
      // Garantir pelo menos 3 dígitos (para centavos)
      while (cleanValue.length < 3) {
        cleanValue = '0' + cleanValue;
      }
      
      // Formatar como moeda: últimos 2 dígitos são centavos
      const integerPart = cleanValue.slice(0, -2);
      const decimalPart = cleanValue.slice(-2);
      
      // Remover zeros à esquerda da parte inteira
      const formattedInteger = integerPart.replace(/^0+/, '') || '0';
      
      // Adicionar separador de milhares
      const formattedIntegerWithThousands = formattedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      
      const formattedValue = `${formattedIntegerWithThousands},${decimalPart}`;
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else if (name === 'taxaJuros') {
      // Para campo de taxa de juros, permitir digitação normal mas limitar a 100
      let cleanValue = value.replace(/[^\d.,]/g, '');
      
      // Se tem vírgula, manter vírgula
      if (cleanValue.includes(',')) {
        const parts = cleanValue.split(',');
        if (parts.length > 2) {
          cleanValue = parts[0] + ',' + parts.slice(1).join('');
        }
        // Limitar a 2 casas decimais após vírgula
        if (parts.length === 2 && parts[1].length > 2) {
          cleanValue = parts[0] + ',' + parts[1].substring(0, 2);
        }
      } else if (cleanValue.includes('.')) {
        // Se tem ponto, manter ponto
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
          cleanValue = parts[0] + '.' + parts.slice(1).join('');
        }
        // Limitar a 2 casas decimais após ponto
        if (parts.length === 2 && parts[1].length > 2) {
          cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
      
      // Limitar valor máximo a 100
      const numericValue = parseFloat(cleanValue.replace(',', '.'));
      if (!isNaN(numericValue) && numericValue > 100) {
        cleanValue = '100';
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calcularRetiradas = () => {
    setLoading(true);
    
    try {
      const valorInicial = parseCurrency(formData.valorInicial);
      const retiradaMensal = parseCurrency(formData.retiradaMensal);
      const taxaJuros = parseFloat(formData.taxaJuros) || 0;
      const tempoRetirada = parseInt(formData.tempoRetirada) || 0;
      const tipoTaxa = formData.tipoTaxa;
      const tipoTempo = formData.tipoTempo;

      if (valorInicial <= 0) {
        alert('Por favor, informe um valor inicial válido.');
        setLoading(false);
        return;
      }

      if (retiradaMensal <= 0) {
        alert('Por favor, informe um valor de retirada mensal válido.');
        setLoading(false);
        return;
      }

      if (taxaJuros <= 0) {
        alert('Por favor, informe uma taxa de juros válida.');
        setLoading(false);
        return;
      }

      if (tempoRetirada <= 0) {
        alert('Por favor, informe um tempo de retirada válido.');
        setLoading(false);
        return;
      }

      // Converter taxa para mensal
      let taxaMensal;
      if (tipoTaxa === 'anual') {
        // Taxa mensal efetiva usando juros compostos (como o Investidor Sardinha)
        taxaMensal = Math.pow(1 + taxaJuros / 100, 1/12) - 1;
      } else {
        taxaMensal = taxaJuros / 100;
      }

      // Converter tempo para meses
      let tempoMeses;
      if (tipoTempo === 'anos') {
        tempoMeses = tempoRetirada * 12;
      } else {
        tempoMeses = tempoRetirada;
      }

      let saldoAtual = valorInicial;
      let totalRetirado = 0;
      const detalhesMensais = [];

      // Calcular mês a mês
      let jurosTotais = 0;
      
      for (let mes = 1; mes <= tempoMeses; mes++) {
        // Calcular juros sobre o saldo atual (antes da retirada)
        const saldoAntesJuros = saldoAtual;
        const jurosDoMes = saldoAtual * taxaMensal;
        
        // Aplicar juros ao saldo
        saldoAtual += jurosDoMes;
        
        // Fazer retirada mensal (depois de aplicar juros)
        let valorRetirado = 0;
        if (saldoAtual >= retiradaMensal) {
          valorRetirado = retiradaMensal;
          saldoAtual -= retiradaMensal;
          totalRetirado += retiradaMensal;
        } else {
          // Se não há saldo suficiente, retira o que tem
          valorRetirado = saldoAtual;
          totalRetirado += saldoAtual;
          saldoAtual = 0;
        }
        
        // Somar aos juros totais
        jurosTotais += jurosDoMes;

        // Armazenar detalhes do mês
        detalhesMensais.push({
          mes,
          saldo: saldoAtual,
          retirado: valorRetirado,
          juros: jurosDoMes
        });
      }

      setResultado({
        valorInicial,
        totalRetirado,
        jurosTotais,
        saldoFinal: saldoAtual,
        detalhesMensais,
        tempoRetirada,
        tipoTempo,
        tempoMeses,
        taxaJuros,
        tipoTaxa,
        retiradaMensal
      });

    } catch (error) {
      console.error('Erro no cálculo:', error);
      alert('Erro ao calcular. Verifique os valores inseridos.');
    } finally {
      setLoading(false);
    }
  };

  const voltarLogin = () => {
    if (isInsideLayout) {
      navigate('/layout/principal');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="calculadora-fullscreen">
      <div className="calculadora-header">
        <h1>Simular Retiradas Mensais</h1>
        <p><strong>O que é:</strong> Calcula quanto você pode sacar por mês de um investimento sem zerar o saldo. Ideal para planejar aposentadoria.</p>
      </div>

      <form className="calculadora-form-full">
        <div className="form-group">
          <label className="form-label">
            <FaMoneyBillWave /> Valor Inicial (R$)
          </label>
          <input
            name="valorInicial"
            placeholder="Digite o valor (ex: 1.000,00)"
            value={formData.valorInicial}
            onChange={handleInputChange}
            className="form-input"
            type="text"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaMoneyBillWave /> Valor de Retirada Mensal (R$)
          </label>
          <input
            name="retiradaMensal"
            placeholder="Digite o valor (ex: 1.000,00)"
            value={formData.retiradaMensal}
            onChange={handleInputChange}
            className="form-input"
            type="text"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaChartLine /> Taxa de Juros (%)
          </label>
          <div className="input-group">
            <input
              type="number"
              name="taxaJuros"
              placeholder="Ex: 10,5"
              value={formData.taxaJuros}
              onChange={handleInputChange}
              className="form-input"
              step="0.01"
              min="0"
            />
            <select
              name="tipoTaxa"
              value={formData.tipoTaxa}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="anual">Anual</option>
              <option value="mensal">Mensal</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaClock /> Tempo de Retirada
          </label>
          <div className="input-group">
            <input
              type="number"
              name="tempoRetirada"
              placeholder="Ex: 10"
              value={formData.tempoRetirada}
              onChange={handleInputChange}
              className="form-input"
              min="1"
            />
            <select
              name="tipoTempo"
              value={formData.tipoTempo}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="anos">Ano(s)</option>
              <option value="meses">Mês(es)</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={calcularRetiradas}
          className="form-button primary"
          disabled={loading}
        >
          {loading ? 'Calculando...' : 'Calcular'}
        </button>

        <div className="form-divider calculadora-divider">
          <br />
          <span>ou</span>
        </div>

        <button
          type="button"
          className="form-button secondary"
          onClick={voltarLogin}
        >
          {isInsideLayout ? (
            <><FaHome style={{ marginRight: 8 }} /> Voltar ao Menu</>
          ) : (
            'Voltar ao Login'
          )}
        </button>

        <div className="calculadora-section">
          <button
            type="button"
            className="calculadora-button"
            onClick={() => navigate(isInsideLayout ? '/layout/calculadora-juros' : '/calculadora-juros')}
          >
            <FaCalculator />
            Calculadora de Juros
          </button>
          <button
            type="button"
            className="calculadora-button"
            onClick={() => navigate(isInsideLayout ? '/layout/calculadora-aporte-meta' : '/calculadora-aporte-meta')}
          >
            <FaCalculator />
            Aporte para Meta
          </button>
        </div>
      </form>

      {/* Resultados */}
      {resultado && (
        <div className="resultados-container">
          <h3>Resultados da Simulação</h3>
          
          <div className="resultados-cards">
            <div className="resultado-card principal">
              <div className="card-icon">
                <FaMoneyBillWave />
              </div>
              <div className="card-content">
                <h4>Total Retirado</h4>
                <span className="card-value">{formatCurrency(resultado.totalRetirado)}</span>
              </div>
            </div>

            <div className="resultado-card secundario">
              <div className="card-icon">
                <FaChartLine />
              </div>
              <div className="card-content">
                <h4>Total Juros</h4>
                <span className="card-value">{formatCurrency(resultado.jurosTotais)}</span>
              </div>
            </div>

            <div className="resultado-card terciario">
              <div className="card-icon">
                <FaCalculator />
              </div>
              <div className="card-content">
                <h4>Saldo Final</h4>
                <span className="card-value">{formatCurrency(resultado.saldoFinal)}</span>
              </div>
            </div>
          </div>

          {/* Detalhes mensais */}
          <div className="detalhes-mensais">
            <h4>Evolução do Investimento</h4>
            <div className="tabela-detalhes">
              <div className="tabela-header">
                <span>Mês</span>
                <span>Juros</span>
                <span>Saldo</span>
                <span>Retirado</span>
              </div>
              {resultado.detalhesMensais.map((detalhe, index) => (
                <div key={index} className="tabela-row">
                  <span>{detalhe.mes}</span>
                  <span>{formatCurrency(detalhe.juros)}</span>
                  <span>{formatCurrency(detalhe.saldo)}</span>
                  <span>{formatCurrency(detalhe.retirado)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="info-adicional">
            <p><strong>Valor Inicial:</strong> {formatCurrency(resultado.valorInicial)}</p>
            <p><strong>Retirada Mensal:</strong> {formatCurrency(resultado.retiradaMensal)}</p>
            <p><strong>Tempo:</strong> {resultado.tempoRetirada} {resultado.tipoTempo === 'anos' ? 'ano(s)' : 'mês(es)'} ({resultado.tempoMeses} meses)</p>
            <p><strong>Taxa de Juros:</strong> {resultado.taxaJuros}% {resultado.tipoTaxa === 'anual' ? 'ao ano' : 'ao mês'}</p>
            <p><strong>Rentabilidade:</strong> {((resultado.jurosTotais / resultado.valorInicial) * 100).toFixed(2)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalculadoraRetiradas;
