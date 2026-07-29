import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaMoneyCheckAlt, FaChartLine, FaFilePdf, FaLightbulb, FaChevronRight, FaBullseye, FaGooglePlay } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import ModalRelatorio from '../components/ModalRelatorio';

const logoNova = (process.env.PUBLIC_URL || '') + '/logo_nova.png';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.lizsoftwares.finflow';
// App Store: oculto por enquanto — reativar quando o app estiver publicado
// const APP_STORE_URL = 'https://apps.apple.com/br/app/idSEU_APP_ID';

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
        .filter((d) => {
          const pago = d.despesa_pago ?? d.Despesa_Pago;
          return pago !== true && pago !== 1 && pago !== '1' && pago !== 'true';
        })
        .forEach((d) => {
          const venc = parseLocalDate(d.despesa_dtvencimento || d.Despesa_DtVencimento);
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
  const pctOrcamento =
    orcamento && orcamento.totalOrcado > 0
      ? Math.max(0, Math.min(100, Math.round((orcamento.totalRealizado / orcamento.totalOrcado) * 100)))
      : 0;
  const pctRestante =
    orcamento && orcamento.totalOrcado > 0
      ? Math.max(0, Math.min(100, Math.round((Math.max(0, saldoOrcamento) / orcamento.totalOrcado) * 100)))
      : 0;

  const textoVencimentoHoje =
    vencimentos.hoje === 0
      ? 'Você não tem nenhuma conta vencendo hoje.'
      : vencimentos.hoje === 1
        ? 'Você tem 1 conta vencendo hoje.'
        : `Você tem ${vencimentos.hoje} contas vencendo hoje.`;

  const textoVencimentoSemana =
    vencimentos.semana === 1
      ? 'Você possui 1 conta vencendo esta semana.'
      : vencimentos.semana > 1
        ? `Você possui ${vencimentos.semana} contas vencendo esta semana.`
        : null;

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
          {textoVencimentoSemana ? (
            <p className="principal-welcome-card__muted">{textoVencimentoSemana}</p>
          ) : null}
        </article>

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

        <article
          className="principal-meta-card"
          onClick={() => navigate('/layout/orcamento')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/layout/orcamento')}
        >
          <div className="principal-meta-card__header">
            <FaBullseye />
            <span>Objetivo do Mês</span>
          </div>
          {orcamento ? (
            <>
              <p className="principal-meta-card__objetivo">
                Controlar gastos em até {formatarValor(orcamento.totalOrcado)}
              </p>
              <div className="principal-meta-card__bar">
                <div
                  className="principal-meta-card__fill"
                  style={{
                    width: `${pctOrcamento}%`,
                    background:
                      pctOrcamento <= 70
                        ? '#059669'
                        : pctOrcamento <= 90
                          ? '#F59E0B'
                          : '#DC2626',
                  }}
                />
              </div>
              <p className="principal-meta-card__pct">{pctOrcamento}% utilizado</p>
              <div className="principal-meta-card__meta">
                <span className="principal-meta-card__meta-label">Meta</span>
                <p>Orçado: {formatarValor(orcamento.totalOrcado)}</p>
                <p>Já gasto: {formatarValor(orcamento.totalRealizado)}</p>
                <p className={saldoOrcamento >= 0 ? 'positive' : 'negative'}>
                  {saldoOrcamento >= 0
                    ? `Restam ${formatarValor(saldoOrcamento)} (${pctRestante}%)`
                    : `Excedeu ${formatarValor(Math.abs(saldoOrcamento))}`}
                </p>
              </div>
            </>
          ) : (
            <div className="principal-meta-card__empty">
              <p>
                Você ainda não definiu um objetivo para este mês. Que tal criar um orçamento e
                acompanhar suas metas de perto?
              </p>
              <span className="principal-meta-card__cta">Definir orçamento →</span>
            </div>
          )}
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
            <span className="principal-card__link">Ver detalhes</span>
          </div>
          <FaChevronRight className="principal-card__chevron" aria-hidden />
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
            <span className="principal-card__link">Ver detalhes</span>
          </div>
          <FaChevronRight className="principal-card__chevron" aria-hidden />
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
            <span className="principal-card__link">Ver resumo</span>
          </div>
          <FaChevronRight className="principal-card__chevron" aria-hidden />
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

      <section className="principal-stores">
        <h3>Leve o Claricash no celular</h3>
        <p className="principal-stores__sub">
          Baixe o app e acompanhe suas finanças onde estiver.
        </p>
        <div className="principal-stores__grid">
          <a
            className="principal-store-card principal-store-card--google"
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="principal-store-card__icon">
              <FaGooglePlay />
            </span>
            <span className="principal-store-card__text">
              <small>Disponível no</small>
              <strong>Google Play</strong>
            </span>
          </a>
        </div>
      </section>

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
