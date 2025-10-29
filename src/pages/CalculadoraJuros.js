import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalculator, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import AuthBanner from '../components/AuthBanner';
import InputMask from 'react-input-mask';
import '../App.css';

function CalculadoraJuros() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    valorInicial: '',
    taxaJuros: '',
    tipoTaxa: 'anual', // 'anual' ou 'mensal'
    periodo: '',
    tipoPeriodo: 'meses', // 'meses' ou 'anos'
    aporteMensal: ''
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
    if (name === 'valorInicial' || name === 'aporteMensal') {
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

  const handleCurrencyBlur = (e) => {
    // Não precisa mais do onBlur, a formatação é feita no onChange
  };

  const calcularJurosCompostos = () => {
    setLoading(true);
    
    try {
      const valorInicial = parseCurrency(formData.valorInicial);
      const taxaJuros = parseFloat(formData.taxaJuros) || 0;
      const periodo = parseInt(formData.periodo) || 0;
      const aporteMensal = parseCurrency(formData.aporteMensal);
      const tipoTaxa = formData.tipoTaxa;
      const tipoPeriodo = formData.tipoPeriodo;

      if (valorInicial <= 0 && aporteMensal <= 0) {
        alert('Por favor, informe pelo menos um valor inicial ou aporte mensal.');
        setLoading(false);
        return;
      }

      if (taxaJuros <= 0) {
        alert('Por favor, informe uma taxa de juros válida.');
        setLoading(false);
        return;
      }

      if (periodo <= 0) {
        alert('Por favor, informe um período válido.');
        setLoading(false);
        return;
      }

      // Converter taxa para mensal
      let taxaMensal;
      if (tipoTaxa === 'anual') {
        // Taxa mensal efetiva usando base de dias (como o Investidor Sardinha)
        taxaMensal = Math.pow(1 + taxaJuros / 100, 1/12) - 1;
      } else {
        taxaMensal = taxaJuros / 100;
      }

      // Converter período para meses
      let periodoMeses;
      if (tipoPeriodo === 'anos') {
        periodoMeses = periodo * 12;
      } else {
        periodoMeses = periodo;
      }
      
      let montanteFinal = valorInicial;
      let totalAportes = valorInicial;
      const detalhesMensais = [];

      // Calcular mês a mês (começando do mês 1)
      for (let mes = 1; mes <= periodoMeses; mes++) {
        // Armazenar montante antes de aplicar juros
        const montanteAntesJuros = montanteFinal;
        
        // Aplicar juros ao montante atual
        montanteFinal = montanteFinal * (1 + taxaMensal);
        
        // Calcular juros mensal (diferença entre montante com juros e sem juros)
        const jurosDoMes = montanteFinal - montanteAntesJuros;
        
        // Adicionar aporte mensal DEPOIS de aplicar juros
        if (aporteMensal > 0) {
          montanteFinal += aporteMensal;
          totalAportes += aporteMensal;
        }

        // Armazenar detalhes de todos os meses
        detalhesMensais.push({
          mes,
          montante: montanteFinal,
          totalInvestido: totalAportes,
          jurosMensal: jurosDoMes,
          jurosAcumulado: montanteFinal - totalAportes
        });
      }

      const jurosTotais = montanteFinal - totalAportes;

      setResultado({
        montanteFinal,
        totalAportes,
        jurosTotais,
        detalhesMensais,
        periodo,
        tipoPeriodo,
        periodoMeses,
        taxaJuros,
        tipoTaxa
      });

    } catch (error) {
      console.error('Erro no cálculo:', error);
      alert('Erro ao calcular. Verifique os valores inseridos.');
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

  const voltarLogin = () => {
    navigate('/');
  };

  return (
    <div className="calculadora-fullscreen">
      <div className="calculadora-header">
        <h1>Calculadora de Juros Compostos</h1>
        <p>Calcule o crescimento do seu investimento ao longo do tempo</p>
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
              <FaChartLine /> Taxa de Juros (%)
            </label>
            <div className="input-group">
              <input
                type="number"
                name="taxaJuros"
                placeholder="Ex: 12,5"
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
              <FaCalculator /> Período
            </label>
            <div className="input-group">
              <input
                type="number"
                name="periodo"
                placeholder="Ex: 60"
                value={formData.periodo}
                onChange={handleInputChange}
                className="form-input"
                min="1"
              />
              <select
                name="tipoPeriodo"
                value={formData.tipoPeriodo}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="meses">Mês(es)</option>
                <option value="anos">Ano(s)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FaMoneyBillWave /> Aporte Mensal (R$)
            </label>
            <input
              name="aporteMensal"
              placeholder="Digite o valor (ex: 500,00)"
              value={formData.aporteMensal}
              onChange={handleInputChange}
              className="form-input"
              type="text"
            />
          </div>

          <button
            type="button"
            onClick={calcularJurosCompostos}
            className="form-button primary"
            disabled={loading}
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>

          <div className="form-divider">
            <br />
            <span>ou</span>
          </div>

          <button
            type="button"
            className="form-button secondary"
            onClick={voltarLogin}
          >
            Voltar ao Login
          </button>

          <div className="calculadora-section">
            <button
              type="button"
              className="calculadora-button"
              onClick={() => navigate('/calculadora-retiradas')}
            >
              <FaCalculator />
              Simular Retiradas Mensais
            </button>
          </div>
        </form>

        {/* Resultados */}
        {resultado && (
          <div className="resultados-container">
            <h3>Resultados do Cálculo</h3>
            
            <div className="resultados-cards">
              <div className="resultado-card principal">
                <div className="card-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="card-content">
                  <h4>Montante Final</h4>
                  <span className="card-value">{formatarValor(resultado.montanteFinal)}</span>
                </div>
              </div>

              <div className="resultado-card secundario">
                <div className="card-icon">
                  <FaChartLine />
                </div>
                <div className="card-content">
                  <h4>Total de Juros</h4>
                  <span className="card-value">{formatarValor(resultado.jurosTotais)}</span>
                </div>
              </div>

              <div className="resultado-card terciario">
                <div className="card-icon">
                  <FaCalculator />
                </div>
                <div className="card-content">
                  <h4>Total Aportado</h4>
                  <span className="card-value">{formatarValor(resultado.totalAportes)}</span>
                </div>
              </div>
            </div>

            {/* Detalhes mensais */}
            <div className="detalhes-mensais">
              <h4>Evolução do Investimento</h4>
              <div className="tabela-detalhes">
                <div className="tabela-header">
                  <span>Mês</span>
                  <span>Total Investido</span>
                  <span>Juros Mensal</span>
                  <span>Montante</span>
                  <span>Juros Acumulados</span>
                </div>
                {resultado.detalhesMensais.map((detalhe, index) => (
                  <div key={index} className="tabela-row">
                    <span>{detalhe.mes}</span>
                    <span>{formatarValor(detalhe.totalInvestido)}</span>
                    <span>{formatarValor(detalhe.jurosMensal)}</span>
                    <span>{formatarValor(detalhe.montante)}</span>
                    <span>{formatarValor(detalhe.jurosAcumulado)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informações adicionais */}
            <div className="info-adicional">
              <p><strong>Período:</strong> {resultado.periodo} {resultado.tipoPeriodo === 'anos' ? 'ano(s)' : 'mês(es)'} ({resultado.periodoMeses} meses)</p>
              <p><strong>Taxa de Juros:</strong> {resultado.taxaJuros}% {resultado.tipoTaxa === 'anual' ? 'ao ano' : 'ao mês'}</p>
              <p><strong>Rentabilidade:</strong> {((resultado.jurosTotais / resultado.totalAportes) * 100).toFixed(2)}%</p>
            </div>
          </div>
        )}
    </div>
  );
}

export default CalculadoraJuros;
