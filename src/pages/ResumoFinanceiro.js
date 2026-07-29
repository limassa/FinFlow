import React, { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaHome } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function parseLocalDate(raw) {
  if (!raw) return null;
  const ymd = String(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [y, m, day] = ymd.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

function ResumoFinanceiro() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const userId = usuario?.id;
  const [ano, setAno] = useState(new Date().getFullYear());
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    const carregar = async () => {
      setLoading(true);
      try {
        const [receitasRes, despesasRes] = await Promise.all([
          axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
          axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
        ]);
        setReceitas(receitasRes.data || []);
        setDespesas(despesasRes.data || []);
      } catch (err) {
        console.error('Erro ao carregar resumo financeiro:', err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [userId, navigate]);

  const meses = useMemo(() => {
    return MESES.map((nome, mesIdx) => {
      const entradas = receitas
        .filter((r) => {
          const d = parseLocalDate(r.receita_data);
          return d && d.getFullYear() === ano && d.getMonth() === mesIdx && r.receita_recebido;
        })
        .reduce((s, r) => s + parseFloat(r.receita_valor || 0), 0);

      const saidas = despesas
        .filter((d) => {
          const dt = parseLocalDate(d.despesa_data);
          return dt && dt.getFullYear() === ano && dt.getMonth() === mesIdx && d.despesa_pago;
        })
        .reduce((s, d) => s + parseFloat(d.despesa_valor || 0), 0);

      return {
        nome,
        entradas,
        saidas,
        saldo: entradas - saidas,
      };
    });
  }, [receitas, despesas, ano]);

  const totais = useMemo(() => {
    return meses.reduce(
      (acc, m) => ({
        entradas: acc.entradas + m.entradas,
        saidas: acc.saidas + m.saidas,
        saldo: acc.saldo + m.saldo,
      }),
      { entradas: 0, saidas: 0, saldo: 0 }
    );
  }, [meses]);

  if (!userId) return null;

  return (
    <div className="resumo-financeiro-page">
      <div className="resumo-financeiro-header">
        <button type="button" className="btn-home" onClick={() => navigate('/layout/principal')}>
          <FaHome /> Home
        </button>
        <h1>Resumo Financeiro</h1>
        <div className="resumo-financeiro-ano-nav">
          <button
            type="button"
            className="resumo-financeiro-ano-nav__btn"
            onClick={() => setAno((a) => a - 1)}
            aria-label="Ano anterior"
          >
            <FaChevronLeft />
          </button>
          <span>{ano}</span>
          <button
            type="button"
            className="resumo-financeiro-ano-nav__btn"
            onClick={() => setAno((a) => a + 1)}
            aria-label="Próximo ano"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="resumo-financeiro-loading">Carregando...</p>
      ) : (
        <div className="resumo-financeiro-table-wrap">
          <table className="resumo-financeiro-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Entradas</th>
                <th>Saídas</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((m) => (
                <tr key={m.nome}>
                  <td>{m.nome}</td>
                  <td className="positive">{formatarValor(m.entradas)}</td>
                  <td className="negative">{formatarValor(m.saidas)}</td>
                  <td className={m.saldo >= 0 ? 'positive' : 'negative'}>
                    {formatarValor(m.saldo)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total {ano}</td>
                <td className="positive">{formatarValor(totais.entradas)}</td>
                <td className="negative">{formatarValor(totais.saidas)}</td>
                <td className={totais.saldo >= 0 ? 'positive' : 'negative'}>
                  {formatarValor(totais.saldo)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

export default ResumoFinanceiro;
