import React, { useState, useEffect, useMemo } from 'react';
import { FaMoneyBillWave, FaMoneyCheckAlt, FaChartLine, FaFilePdf, FaLightbulb, FaChevronRight, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import ModalRelatorio from '../components/ModalRelatorio';

const logoNova = (process.env.PUBLIC_URL || '') + '/logo_nova.png';

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const DICAS_ECONOMIA = [
  'Antes de comprar, espere 24 horas. Muitas compras por impulso perdem a graça no dia seguinte.',
  'Anote todo gasto pequeno por uma semana. Você se surpreende com o que “some” no café e no delivery.',
  'Defina um teto semanal para lazer e respeite como se fosse uma conta fixa.',
  'Compare preços em pelo menos dois lugares antes de compras maiores.',
  'Cancele assinaturas que você não usou no último mês.',
  'Guarde automaticamente uma pequena parte de cada receita assim que ela cair na conta.',
  'Cozinhar em casa alguns dias da semana costuma render mais economia do que qualquer cupom.',
  'Revise as faturas do cartão: taxas e recorrências esquecidas são comuns.',
  'Prefira pagar à vista quando o desconto for real — juros corroem o “parcelado fácil”.',
  'Monte uma reserva de emergência, mesmo que comece com valores baixos.',
  'Evite entrar em lojas ou apps de compra sem uma lista do que realmente precisa.',
  'Negocie contas fixas (internet, plano de celular, seguros) pelo menos uma vez por ano.',
  'Use categorias no app para limitar cada tipo de gasto.',
  'Troque “quero ter” por “preciso agora?” — a pergunta muda muitas decisões.',
  'Planeje o mês no início: quem decide antes gasta com mais consciência.',
];

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseLocalDate(raw) {
  if (!raw) return null;
  const ymd = String(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : startOfLocalDay(d);
  }
  const [y, m, day] = ymd.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function getSemanaRange(ref = new Date()) {
  const hoje = startOfLocalDay(ref);
  const diaSemana = hoje.getDay();
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - diaSemana);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return { inicio, fim, hoje };
}

function formatarValorBr(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function somarPorCategoria(despesas, mes, ano) {
  const mapa = {};
  despesas.forEach((d) => {
    if (!d.despesa_pago) return;
    const data = parseLocalDate(d.despesa_data);
    if (!data || data.getMonth() !== mes || data.getFullYear() !== ano) return;
    const tipo = d.despesa_tipo || 'Outros';
    mapa[tipo] = (mapa[tipo] || 0) + (parseFloat(d.despesa_valor) || 0);
  });
  return mapa;
}

function gerarInsight(despesas, receitasMes, despesasMes) {
  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();
  const mesAnteriorDate = new Date(anoAtual, mesAtual - 1, 1);
  const mesAnt = mesAnteriorDate.getMonth();
  const anoAnt = mesAnteriorDate.getFullYear();

  const mapaAtual = somarPorCategoria(despesas, mesAtual, anoAtual);
  const mapaAnt = somarPorCategoria(despesas, mesAnt, anoAnt);
  const saldoMes = receitasMes - despesasMes;
  const insights = [];

  if (saldoMes > 0) {
    insights.push(`Você está economizando ${formatarValorBr(saldoMes)} este mês.`);
    insights.push(
      `Se continuar economizando nesse ritmo, em 12 meses terá guardado aproximadamente ${formatarValorBr(saldoMes * 12)}.`
    );
  } else if (saldoMes < 0 && despesasMes > 0) {
    insights.push(
      `Neste mês as despesas estão ${formatarValorBr(Math.abs(saldoMes))} acima das receitas. Vale revisar os gastos.`
    );
  }

  const categoriasAtuais = Object.entries(mapaAtual).sort((a, b) => b[1] - a[1]);
  if (categoriasAtuais.length > 0) {
    const [maiorCat, maiorValor] = categoriasAtuais[0];
    insights.push(
      `Sua maior despesa continua sendo ${maiorCat.toLowerCase()} (${formatarValorBr(maiorValor)}).`
    );
  }

  Object.keys(mapaAtual).forEach((cat) => {
    const atual = mapaAtual[cat] || 0;
    const anterior = mapaAnt[cat] || 0;
    if (anterior > 0 && atual < anterior) {
      const pct = Math.round(((anterior - atual) / anterior) * 100);
      if (pct >= 5) {
        insights.push(`Você gastou ${pct}% menos em ${cat.toLowerCase()}.`);
      }
    } else if (anterior > 0 && atual > anterior) {
      const pct = Math.round(((atual - anterior) / anterior) * 100);
      if (pct >= 10) {
        insights.push(`Atenção: você gastou ${pct}% a mais em ${cat.toLowerCase()} neste mês.`);
      }
    }
  });

  if (insights.length === 0) {
    return 'Continue registrando suas movimentações para receber insights personalizados.';
  }

  const diaDoAno = Math.floor(
    (agora - new Date(agora.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return insights[diaDoAno % insights.length];
}

function Principal() {
  const navigate = useNavigate();
  const [totais, setTotais] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    saldoContas: 0,
    receitasMes: 0,
    despesasMes: 0,
  });
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [vencimentos, setVencimentos] = useState({ hoje: 0, semana: 0 });
  const [orcamento, setOrcamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModalRelatorio, setShowModalRelatorio] = useState(false);

  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;
  const diaSemanaLabel = DIAS_SEMANA[new Date().getDay()];
  const [dicaIdx, setDicaIdx] = useState(() => new Date().getDate() % DICAS_ECONOMIA.length);
  const dica = DICAS_ECONOMIA[dicaIdx % DICAS_ECONOMIA.length];
  const insight = useMemo(
    () => gerarInsight(despesas, totais.receitasMes, totais.despesasMes),
    [despesas, totais.receitasMes, totais.despesasMes]
  );

  useEffect(() => {
    if (userId) {
      fetchTotais();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchTotais = async () => {
    setLoading(true);
    try {
      const mesAtualStr = new Date().toISOString().slice(0, 7);
      const [receitasRes, despesasRes, saldoContasRes, orcamentosRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.CONTAS_SALDO_TOTAL}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.ORCAMENTOS}?userId=${userId}&mes=${mesAtualStr}`).catch(() => ({ data: [] })),
      ]);

      const receitasData = receitasRes.data || [];
      const despesasData = despesasRes.data || [];

      setReceitas(receitasData);
      setDespesas(despesasData);

      const totalReceitas = receitasData
        .filter((receita) => receita.receita_recebido)
        .reduce((sum, receita) => sum + parseFloat(receita.receita_valor || 0), 0);

      const totalDespesas = despesasData
        .filter((despesa) => despesa.despesa_pago)
        .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0);

      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();

      const receitasMes = receitasData
        .filter((receita) => {
          const dataReceita = parseLocalDate(receita.receita_data);
          return (
            dataReceita &&
            dataReceita.getMonth() === mesAtual &&
            dataReceita.getFullYear() === anoAtual &&
            receita.receita_recebido
          );
        })
        .reduce((sum, receita) => sum + parseFloat(receita.receita_valor || 0), 0);

      const despesasMes = despesasData
        .filter((despesa) => {
          const dataDespesa = parseLocalDate(despesa.despesa_data);
          return (
            dataDespesa &&
            dataDespesa.getMonth() === mesAtual &&
            dataDespesa.getFullYear() === anoAtual &&
            despesa.despesa_pago
          );
        })
        .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0);

      const { inicio, fim, hoje } = getSemanaRange();
      let vencendoHoje = 0;
      let vencendoSemana = 0;
      despesasData
        .filter((d) => !d.despesa_pago)
        .forEach((d) => {
          const venc = parseLocalDate(d.despesa_dtvencimento);
          if (!venc) return;
          if (venc.getTime() === hoje.getTime()) vencendoHoje += 1;
          if (venc >= inicio && venc <= fim) vencendoSemana += 1;
        });
      setVencimentos({ hoje: vencendoHoje, semana: vencendoSemana });

      const listaOrc = orcamentosRes.data || [];
      if (listaOrc.length > 0) {
        const totalOrcado = listaOrc.reduce(
          (s, o) => s + parseFloat(o.orcamento_valor || o.Orcamento_Valor || 0),
          0
        );
        const totalRealizado = listaOrc.reduce(
          (s, o) => s + parseFloat(o.valor_realizado || 0),
          0
        );
        setOrcamento({ totalOrcado, totalRealizado });
      } else {
        setOrcamento(null);
      }

      const saldoContas = saldoContasRes.data.saldoTotal || 0;
      const saldoTotal = saldoContas + (totalReceitas - totalDespesas);

      setTotais({
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        saldoContas: saldoTotal,
        receitasMes,
        despesasMes,
      });
    } catch (err) {
      console.log('Erro ao buscar totais:', err);
      try {
        const contasRes = await axios.get(`${API_ENDPOINTS.CONTAS}?userId=${userId}`);
        const saldoContas = contasRes.data.reduce(
          (sum, conta) => sum + parseFloat(conta.conta_saldo || 0),
          0
        );
        setTotais((prev) => ({ ...prev, saldoContas }));
      } catch (fallbackErr) {
        console.log('Erro no fallback:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = formatarValorBr;

  const saldoMes = totais.receitasMes - totais.despesasMes;
  const semMovimentacaoMes = totais.receitasMes === 0 && totais.despesasMes === 0;
  const saldoOrcamento = orcamento ? orcamento.totalOrcado - orcamento.totalRealizado : null;
  const pctDisponivel =
    orcamento && orcamento.totalOrcado > 0
      ? Math.max(0, Math.min(100, (saldoOrcamento / orcamento.totalOrcado) * 100))
      : 0;

  const textoVencimentoHoje =
    vencimentos.hoje === 0
      ? 'Você não tem nenhuma conta vencendo hoje.'
      : vencimentos.hoje === 1
        ? 'Você tem 1 conta vencendo hoje.'
        : `Você tem ${vencimentos.hoje} contas vencendo hoje.`;

  const textoVencimentoSemana =
    vencimentos.semana === 0
      ? 'Nenhuma conta vencendo esta semana.'
      : vencimentos.semana === 1
        ? 'Você possui 1 conta vencendo esta semana.'
        : `Você possui ${vencimentos.semana} contas vencendo esta semana.`;

  if (!userId) {
    return <div>Usuário não logado</div>;
  }

  if (loading) {
    return (
      <div className="home-container principal-page">
        <div className="principal-loading">
          <div className="principal-loading-spinner" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container principal-page">
      <header className="principal-header">
        <div className="principal-header-intro">
          <p className="principal-greeting__sub">Visão geral das suas finanças</p>
        </div>
        <div className="principal-header-actions">
          <button
            type="button"
            onClick={() => navigate('/layout/receita')}
            className="principal-btn-secondary"
          >
            <FaMoneyBillWave /> + Receita
          </button>
          <button
            type="button"
            onClick={() => navigate('/layout/despesa')}
            className="principal-btn-secondary principal-btn-secondary--despesa"
          >
            <FaMoneyCheckAlt /> + Despesa
          </button>
          <button
            type="button"
            onClick={() => setShowModalRelatorio(true)}
            className="principal-btn-relatorio"
          >
            <FaFilePdf /> Gerar Relatórios
          </button>
        </div>
      </header>

      <section className="principal-human-grid">
        <article className="principal-welcome-card">
          <p className="principal-welcome-card__day">Hoje é {diaSemanaLabel}</p>
          <p className="principal-welcome-card__line">{textoVencimentoHoje}</p>
          <p className="principal-welcome-card__muted">{textoVencimentoSemana}</p>
        </article>

        {orcamento ? (
          <article className="principal-budget-card">
            <p className="principal-budget-card__label">Saldo do mês</p>
            <p
              className={`principal-budget-card__value ${
                saldoOrcamento >= 0 ? 'positive' : 'negative'
              }`}
            >
              {formatarValor(saldoOrcamento)}
            </p>
            <div className="principal-budget-card__bar">
              <div
                className="principal-budget-card__fill"
                style={{
                  width: `${pctDisponivel}%`,
                  background:
                    pctDisponivel > 30
                      ? '#059669'
                      : pctDisponivel > 10
                        ? '#F59E0B'
                        : '#DC2626',
                }}
              />
            </div>
          </article>
        ) : null}

        <article className="principal-tip-card">
          <div className="principal-tip-card__header">
            <FaLightbulb />
            <span>Dica do dia</span>
          </div>
          <p>{dica}</p>
          <button
            type="button"
            className="principal-tip-card__next"
            onClick={() => setDicaIdx((i) => (i + 1) % DICAS_ECONOMIA.length)}
          >
            Ver outra Dica
          </button>
        </article>

        <article className="principal-insight-card">
          <div className="principal-insight-card__header">
            <FaChartBar />
            <span>Insight</span>
          </div>
          <p>{insight}</p>
        </article>
      </section>

      <section className="principal-cards">
        <article
          className="principal-card principal-card--receita"
          onClick={() => navigate('/layout/receita')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/layout/receita')}
        >
          <div className="principal-card__icon">
            <FaMoneyBillWave />
          </div>
          <div className="principal-card__content">
            <h3>Receita</h3>
            <span className="principal-card__value">{formatarValor(totais.totalReceitas)}</span>
            <span className="principal-card__desc">Receitas Recebidas</span>
          </div>
        </article>

        <article
          className="principal-card principal-card--despesa"
          onClick={() => navigate('/layout/despesa')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/layout/despesa')}
        >
          <div className="principal-card__icon">
            <FaMoneyCheckAlt />
          </div>
          <div className="principal-card__content">
            <h3>Despesa</h3>
            <span className="principal-card__value">{formatarValor(totais.totalDespesas)}</span>
            <span className="principal-card__desc">Despesas Pagas</span>
          </div>
        </article>

        <article
          className={`principal-card principal-card--saldo ${
            totais.saldoContas >= 0 ? 'positive' : 'negative'
          }`}
          title="Saldo Total (Contas + Receitas - Despesas)"
          onClick={() => navigate('/layout/resumo-financeiro')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/layout/resumo-financeiro')}
        >
          <div className="principal-card__icon">
            <FaChartLine />
          </div>
          <div className="principal-card__content">
            <h3>Saldo Total</h3>
            <span className="principal-card__value">{formatarValor(totais.saldoContas)}</span>
            <span className="principal-card__desc">Saldo Disponível</span>
          </div>
        </article>
      </section>

      <section className="principal-resumo">
        <h3>Resumo do Mês</h3>
        {semMovimentacaoMes ? (
          <div className="principal-resumo__empty">
            <p>
              Você ainda não registrou movimentações neste mês. Que tal começar adicionando sua
              primeira receita ou despesa?
            </p>
            <div className="principal-resumo__empty-actions">
              <button type="button" onClick={() => navigate('/layout/receita')}>
                Nova receita
              </button>
              <button type="button" onClick={() => navigate('/layout/despesa')}>
                Nova despesa
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="principal-resumo__grid">
              <div className="principal-resumo__item">
                <span>Receitas do Mês</span>
                <span className="principal-resumo__valor positive">
                  {formatarValor(totais.receitasMes)}
                </span>
              </div>
              <div className="principal-resumo__item">
                <span>Despesas do Mês</span>
                <span className="principal-resumo__valor negative">
                  {formatarValor(totais.despesasMes)}
                </span>
              </div>
              <div className="principal-resumo__item principal-resumo__item--destaque">
                <span>Saldo do Mês</span>
                <span
                  className={`principal-resumo__valor ${
                    saldoMes >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {formatarValor(saldoMes)}
                </span>
              </div>
            </div>
            <p className={`principal-resumo__msg ${saldoMes >= 0 ? 'positive' : 'negative'}`}>
              {saldoMes >= 0
                ? `Você economizou ${formatarValor(saldoMes)} este mês. Continue assim!`
                : `Você gastou ${formatarValor(Math.abs(saldoMes))} acima do orçamento.`}
            </p>
          </>
        )}
      </section>

      <button
        type="button"
        className="principal-dashboard-link"
        onClick={() => navigate('/layout/dashboard')}
      >
        <span className="principal-dashboard-link__icon">
          <FaChartLine />
        </span>
        <span className="principal-dashboard-link__text">
          <strong>Dashboard</strong>
          <small>Ver gráficos e análise financeira</small>
        </span>
        <FaChevronRight className="principal-dashboard-link__chevron" />
      </button>

      <ModalRelatorio
        isOpen={showModalRelatorio}
        onClose={() => setShowModalRelatorio(false)}
        receitas={receitas}
        despesas={despesas}
      />

      <footer className="principal-footer">
        <a
          href="https://lizsoftware.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="principal-footer__link"
          title="Liz Software"
        >
          <span>Desenvolvido por</span>
          <div className="principal-footer__logo">
            <img src={logoNova} alt="Liz Software" />
          </div>
        </a>
      </footer>
    </div>
  );
}

export default Principal;
