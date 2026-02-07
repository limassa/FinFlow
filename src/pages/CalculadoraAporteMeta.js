import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalculator, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import '../App.css';

/**
 * Calculadora: quanto investir por mês para atingir um total alvo.
 * Fórmula: PMT = FV * r / ((1+r)^n - 1)
 * Onde: FV = total alvo, r = taxa mensal (decimal), n = número de meses (anos * 12)
 */
function CalculadoraAporteMeta() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    taxaMensal: '0,60',
    anos: '30',
    totalAlvo: ''
  });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseFloat(String(value).replace(/\./g, '').replace(',', '.')) || 0;
  };

  const formatCurrency = (value) => {
    if (value == null || value === '') return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'totalAlvo') {
      let cleanValue = value.replace(/[^\d]/g, '');
      if (!cleanValue) cleanValue = '000';
      while (cleanValue.length < 3) cleanValue = '0' + cleanValue;
      const integerPart = cleanValue.slice(0, -2).replace(/^0+/, '') || '0';
      const decimalPart = cleanValue.slice(-2);
      const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + decimalPart;
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === 'taxaMensal') {
      let cleanValue = value.replace(/[^\d.,]/g, '');
      const num = parseFloat(cleanValue.replace(',', '.'));
      if (!isNaN(num) && num > 100) cleanValue = '100';
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const calcular = () => {
    setLoading(true);
    setResultado(null);
    try {
      const taxaMensalStr = (formData.taxaMensal || '0').replace(',', '.');
      const taxaMensalPct = parseFloat(taxaMensalStr) || 0;
      const anos = parseInt(formData.anos, 10) || 0;
      const totalAlvo = parseCurrency(formData.totalAlvo);

      if (totalAlvo <= 0) {
        alert('Informe o total alvo (valor positivo).');
        setLoading(false);
        return;
      }
      if (anos <= 0) {
        alert('Informe a quantidade de anos.');
        setLoading(false);
        return;
      }

      const r = taxaMensalPct / 100;
      const n = anos * 12;
      if (r <= 0) {
        // Sem juros: aporte = total / meses
        const pmt = totalAlvo / n;
        setResultado({
          aporteMensalNecessario: pmt,
          totalAlvo,
          anos,
          taxaMensal: taxaMensalPct,
          meses: n
        });
      } else {
        const fator = Math.pow(1 + r, n) - 1;
        const pmt = (totalAlvo * r) / fator;
        setResultado({
          aporteMensalNecessario: pmt,
          totalAlvo,
          anos,
          taxaMensal: taxaMensalPct,
          meses: n
        });
      }
    } catch (err) {
      alert('Erro ao calcular. Verifique os valores.');
    } finally {
      setLoading(false);
    }
  };

  const voltarLogin = () => navigate('/');

  return (
    <div className="calculadora-fullscreen">
      <div className="calculadora-header">
        <h1>Aporte para Meta</h1>
        <p>Quanto investir por mês para atingir um total alvo</p>
      </div>

      <form className="calculadora-form-full" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label className="form-label">
            <FaChartLine /> Taxa real mensal (%)
          </label>
          <input
            name="taxaMensal"
            placeholder="Ex: 0,60"
            value={formData.taxaMensal}
            onChange={handleInputChange}
            className="form-input"
            type="text"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaCalculator /> Anos
          </label>
          <input
            name="anos"
            placeholder="Ex: 30"
            value={formData.anos}
            onChange={handleInputChange}
            className="form-input"
            type="number"
            min="1"
            max="60"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaMoneyBillWave /> Total alvo (R$)
          </label>
          <input
            name="totalAlvo"
            placeholder="Ex: 900.000,00"
            value={formData.totalAlvo}
            onChange={handleInputChange}
            className="form-input"
            type="text"
          />
        </div>

        <button
          type="button"
          onClick={calcular}
          className="form-button primary"
          disabled={loading}
        >
          {loading ? 'Calculando...' : 'Calcular'}
        </button>

        <div className="form-divider calculadora-divider">
          <br />
          <span>ou</span>
        </div>

        <button type="button" className="form-button secondary" onClick={voltarLogin}>
          Voltar ao Login
        </button>

        <div className="calculadora-section">
          <button
            type="button"
            className="calculadora-button"
            onClick={() => navigate('/calculadora-juros')}
          >
            <FaCalculator />
            Calculadora de Juros
          </button>
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

      {resultado && (
        <div className="resultados-container" style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 16 }}>Resultado</h2>
          <div className="result-card">
            <span className="result-label">Aporte mensal necessário</span>
            <span className="card-value">{formatCurrency(resultado.aporteMensalNecessario)}</span>
          </div>
          <p className="text-muted" style={{ marginTop: 12, fontSize: 14 }}>
            Para atingir {formatCurrency(resultado.totalAlvo)} em {resultado.anos} ano(s),
            com taxa de {resultado.taxaMensal}% ao mês, invista esse valor todo mês.
          </p>
        </div>
      )}
    </div>
  );
}

export default CalculadoraAporteMeta;
