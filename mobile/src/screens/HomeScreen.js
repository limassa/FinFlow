import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';
import { colors } from '../theme/theme';
import { HeaderGreetingTitle } from '../navigation/menuHeaderOptions';

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
  'Use o método dos envelopes ou categorias no app para limitar cada tipo de gasto.',
  'Troque “quero ter” por “preciso agora?” — a pergunta muda muitas decisões.',
  'Planeje o mês no início: quem decide antes gasta com mais consciência.',
];

function extrairPrimeiroNome(user) {
  const nomeCompleto =
    user?.usuario_nome ||
    user?.Usuario_Nome ||
    user?.nome ||
    '';
  const primeiro = String(nomeCompleto).trim().split(/\s+/)[0] || '';
  if (!primeiro) return '';
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase();
}

function saudacaoPorHorario() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

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
  const diaSemana = hoje.getDay(); // 0 = domingo
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - diaSemana);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return { inicio, fim, hoje };
}

function dicaDoDia() {
  const agora = new Date();
  const inicioAno = new Date(agora.getFullYear(), 0, 0);
  const diaDoAno = Math.floor((agora - inicioAno) / (1000 * 60 * 60 * 24));
  return DICAS_ECONOMIA[diaDoAno % DICAS_ECONOMIA.length];
}

function fotoUriFromApi(foto) {
  if (!foto) return null;
  return foto.startsWith('data:') ? foto : `data:image/jpeg;base64,${foto}`;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, getUserId } = useAuth();
  const userId = getUserId();
  const primeiroNome = useMemo(() => extrairPrimeiroNome(user), [user]);
  const saudacao = useMemo(() => {
    const base = saudacaoPorHorario();
    return primeiroNome ? `${base}, ${primeiroNome}` : base;
  }, [primeiroNome]);

  const [totais, setTotais] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    saldoContas: 0,
    receitasMes: 0,
    despesasMes: 0,
  });
  const [vencimentos, setVencimentos] = useState({ hoje: 0, semana: 0 });
  const [orcamento, setOrcamento] = useState(null); // { totalOrcado, totalRealizado } | null
  const [userFoto, setUserFoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [versao, setVersao] = useState(null);

  const diaSemanaLabel = DIAS_SEMANA[new Date().getDay()];
  const dica = useMemo(() => dicaDoDia(), []);

  useLayoutEffect(() => {
    const fotoUri = fotoUriFromApi(userFoto);
    navigation.setOptions({
      title: saudacao,
      headerTitle: () => <HeaderGreetingTitle fotoUri={fotoUri} title={saudacao} />,
    });
  }, [navigation, saudacao, userFoto]);

  const fetchVersao = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.VERSAO_MOBILE);
      if (response.data.success && response.data.versao) {
        setVersao(response.data.versao);
      }
    } catch (error) {
      console.error('Erro ao buscar versão mobile:', error);
      setVersao({
        versao_mobile: 'M.1.1.01',
        versao_nome: 'Claricash Mobile',
      });
    }
  };

  const fetchFoto = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.USER_FOTO}?userId=${userId}`);
      if (res.data?.foto) setUserFoto(res.data.foto);
      else setUserFoto(null);
    } catch {
      // silencioso
    }
  };

  const fetchTotais = async () => {
    try {
      const mesAtualStr = new Date().toISOString().slice(0, 7);
      const [receitasRes, despesasRes, saldoContasRes, orcamentosRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.CONTAS_SALDO_TOTAL}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.ORCAMENTOS}?userId=${userId}&mes=${mesAtualStr}`).catch(() => ({ data: [] })),
      ]);

      const receitasData = (receitasRes.data || []).map((receita) => ({
        ...receita,
        receita_valor: receita.receita_valor || receita.Receita_Valor || receita.valor,
        receita_data: receita.receita_data || receita.Receita_Data || receita.data,
        receita_recebido:
          receita.receita_recebido !== undefined
            ? receita.receita_recebido
            : receita.Receita_Recebido !== undefined
              ? receita.Receita_Recebido
              : receita.recebido,
      }));

      const despesasData = (despesasRes.data || []).map((despesa) => ({
        ...despesa,
        despesa_valor: despesa.despesa_valor || despesa.Despesa_Valor || despesa.valor,
        despesa_data: despesa.despesa_data || despesa.Despesa_Data || despesa.data,
        despesa_dtvencimento:
          despesa.despesa_dtvencimento || despesa.Despesa_DtVencimento || despesa.dataVencimento,
        despesa_pago:
          despesa.despesa_pago !== undefined
            ? despesa.despesa_pago
            : despesa.Despesa_Pago !== undefined
              ? despesa.Despesa_Pago
              : despesa.pago,
      }));

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
      const naoPagas = despesasData.filter((d) => !d.despesa_pago);
      let vencendoHoje = 0;
      let vencendoSemana = 0;
      naoPagas.forEach((d) => {
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
      console.error('❌ Erro ao buscar totais:', err);
      try {
        const contasRes = await axios.get(`${API_ENDPOINTS.CONTAS}?userId=${userId}`);
        const contasNormalizadas = contasRes.data.map((conta) => ({
          ...conta,
          conta_saldo: conta.conta_saldo || conta.Conta_Saldo || conta.saldo,
        }));
        const saldoContas = contasNormalizadas.reduce(
          (sum, conta) => sum + parseFloat(conta.conta_saldo || 0),
          0
        );
        setTotais((prev) => ({
          ...prev,
          saldoContas: saldoContas + (prev.totalReceitas - prev.totalDespesas),
        }));
      } catch (fallbackErr) {
        console.error('❌ Erro no fallback:', fallbackErr);
        setTotais({
          totalReceitas: 0,
          totalDespesas: 0,
          saldo: 0,
          saldoContas: 0,
          receitasMes: 0,
          despesasMes: 0,
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTotais();
      fetchVersao();
      fetchFoto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchFoto();
        fetchTotais();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTotais();
    fetchFoto();
  };

  const saldoMes = totais.receitasMes - totais.despesasMes;
  const saldoOrcamento = orcamento
    ? orcamento.totalOrcado - orcamento.totalRealizado
    : null;
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeDay}>Hoje é {diaSemanaLabel}</Text>
          <Text style={styles.welcomeLine}>{textoVencimentoHoje}</Text>
          <Text style={styles.welcomeLineMuted}>{textoVencimentoSemana}</Text>
        </View>

        {orcamento ? (
          <View style={styles.budgetCard}>
            <Text style={styles.budgetLabel}>Saldo do mês</Text>
            <Text
              style={[
                styles.budgetValue,
                saldoOrcamento >= 0 ? styles.summaryPositive : styles.summaryNegative,
              ]}
            >
              {formatarValor(saldoOrcamento)}
            </Text>
            <View style={styles.budgetBarTrack}>
              <View
                style={[
                  styles.budgetBarFill,
                  {
                    width: `${pctDisponivel}%`,
                    backgroundColor:
                      pctDisponivel > 30
                        ? colors.success
                        : pctDisponivel > 10
                          ? '#F59E0B'
                          : colors.error,
                  },
                ]}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            <Text style={styles.tipTitle}>Dica do dia</Text>
          </View>
          <Text style={styles.tipText}>{dica}</Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[styles.card, styles.cardReceita]}
            onPress={() => navigation.navigate('Receita')}
          >
            <View style={[styles.cardIcon, styles.cardIconReceita]}>
              <Ionicons name="wallet-outline" size={28} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Total Receitas</Text>
              <Text style={[styles.cardValue, styles.cardValueReceita]}>
                {formatarValor(totais.totalReceitas)}
              </Text>
              <Text style={styles.cardDescription}>Receitas Recebidas</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardDespesa]}
            onPress={() => navigation.navigate('Despesa')}
          >
            <View style={[styles.cardIcon, styles.cardIconDespesa]}>
              <Ionicons name="receipt-outline" size={28} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Total Despesas</Text>
              <Text style={[styles.cardValue, styles.cardValueDespesa]}>
                {formatarValor(totais.totalDespesas)}
              </Text>
              <Text style={styles.cardDescription}>Despesas Pagas</Text>
            </View>
          </TouchableOpacity>

          <View
            style={[
              styles.card,
              totais.saldoContas >= 0 ? styles.cardSaldoPositive : styles.cardSaldoNegative,
            ]}
          >
            <View
              style={[
                styles.cardIcon,
                totais.saldoContas >= 0 ? styles.cardIconSaldo : styles.cardIconSaldoNeg,
              ]}
            >
              <Ionicons name="trending-up" size={28} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Saldo Total</Text>
              <Text
                style={[
                  styles.cardValue,
                  totais.saldoContas >= 0 ? styles.cardValueSaldo : styles.cardValueDespesa,
                ]}
              >
                {formatarValor(totais.saldoContas)}
              </Text>
              <Text style={styles.cardDescription}>Saldo Disponível</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumo do Mês</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Receitas do Mês:</Text>
            <Text style={[styles.summaryValue, styles.summaryPositive]}>
              {formatarValor(totais.receitasMes)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Despesas do Mês:</Text>
            <Text style={[styles.summaryValue, styles.summaryNegative]}>
              {formatarValor(totais.despesasMes)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Saldo do Mês:</Text>
            <Text
              style={[
                styles.summaryValue,
                saldoMes >= 0 ? styles.summaryPositive : styles.summaryNegative,
              ]}
            >
              {formatarValor(saldoMes)}
            </Text>
          </View>
          <Text
            style={[
              styles.summaryMessage,
              saldoMes >= 0 ? styles.summaryPositive : styles.summaryNegative,
            ]}
          >
            {saldoMes >= 0
              ? `Você economizou ${formatarValor(saldoMes)} este mês. Continue assim!`
              : `Você gastou ${formatarValor(Math.abs(saldoMes))} acima do orçamento.`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.dashboardCard}
          onPress={() => navigation.navigate('Dashboard')}
          activeOpacity={0.85}
        >
          <View style={styles.dashboardIcon}>
            <Ionicons name="bar-chart-outline" size={26} color="#fff" />
          </View>
          <View style={styles.dashboardText}>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Receita')}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>Nova Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Despesa')}
          >
            <Ionicons name="remove-circle-outline" size={24} color={colors.error} />
            <Text style={styles.actionButtonText}>Nova Despesa</Text>
          </TouchableOpacity>
        </View>

        {versao && versao.versao_mobile ? (
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Versão {versao.versao_mobile}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.companyFooter}
          onPress={() => Linking.openURL('https://lizsoftware.com.br')}
          activeOpacity={0.7}
        >
          <Text style={styles.companyFooterLabel}>Desenvolvido por</Text>
          <Image
            source={require('../../assets/logo_nova.png')}
            style={styles.companyLogo}
            resizeMode="contain"
          />
          <Text style={styles.companyFooterLink}>Liz Software</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeDay: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  welcomeLine: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  welcomeLineMuted: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  budgetCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  budgetLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  budgetBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  tipCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.12)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  cardsContainer: {
    padding: 16,
    paddingTop: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
  },
  cardReceita: {},
  cardDespesa: {},
  cardSaldoPositive: {},
  cardSaldoNegative: {},
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconReceita: {
    backgroundColor: '#059669',
  },
  cardIconDespesa: {
    backgroundColor: '#DC2626',
  },
  cardIconSaldo: {
    backgroundColor: '#2563EB',
  },
  cardIconSaldoNeg: {
    backgroundColor: '#DC2626',
  },
  cardValueReceita: {
    color: '#059669',
  },
  cardValueDespesa: {
    color: '#DC2626',
  },
  cardValueSaldo: {
    color: '#2563EB',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryPositive: {
    color: colors.success,
  },
  summaryNegative: {
    color: colors.error,
  },
  summaryMessage: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  dashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  dashboardIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardText: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  companyFooter: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 24,
  },
  companyFooterLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  companyLogo: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  companyFooterLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
