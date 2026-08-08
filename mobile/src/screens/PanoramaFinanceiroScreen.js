import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MESES_CURTO = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
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

export default function PanoramaFinanceiroScreen() {
  const { getUserId } = useAuth();
  const { colors, isDark } = useTheme();
  const userId = getUserId();
  const [ano, setAno] = useState(new Date().getFullYear());
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const carregar = useCallback(async () => {
    if (!userId) return;
    try {
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
      ]);
      setReceitas(receitasRes.data || []);
      setDespesas(despesasRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar panorama financeiro:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    carregar();
  }, [carregar]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const meses = useMemo(() => {
    return MESES.map((nome, mesIdx) => {
      const entradas = receitas
        .filter((r) => {
          const d = parseLocalDate(r.receita_data || r.Receita_Data || r.data);
          const recebido =
            r.receita_recebido !== undefined
              ? r.receita_recebido
              : r.Receita_Recebido !== undefined
                ? r.Receita_Recebido
                : r.recebido;
          return d && d.getFullYear() === ano && d.getMonth() === mesIdx && recebido;
        })
        .reduce(
          (s, r) => s + parseFloat(r.receita_valor || r.Receita_Valor || r.valor || 0),
          0
        );

      const saidas = despesas
        .filter((d) => {
          const dt = parseLocalDate(d.despesa_data || d.Despesa_Data || d.data);
          const pago =
            d.despesa_pago !== undefined
              ? d.despesa_pago
              : d.Despesa_Pago !== undefined
                ? d.Despesa_Pago
                : d.pago;
          return dt && dt.getFullYear() === ano && dt.getMonth() === mesIdx && pago;
        })
        .reduce(
          (s, d) => s + parseFloat(d.despesa_valor || d.Despesa_Valor || d.valor || 0),
          0
        );

      return { nome, entradas, saidas, saldo: entradas - saidas };
    });
  }, [receitas, despesas, ano]);

  const totais = useMemo(
    () =>
      meses.reduce(
        (acc, m) => ({
          entradas: acc.entradas + m.entradas,
          saidas: acc.saidas + m.saidas,
          saldo: acc.saldo + m.saldo,
        }),
        { entradas: 0, saidas: 0, saldo: 0 }
      ),
    [meses]
  );

  const maiorGastoMes = useMemo(
    () =>
      meses.reduce((best, m) => (m.saidas > best.saidas ? m : best), {
        nome: null,
        saidas: 0,
      }),
    [meses]
  );

  const taxaEconomia = useMemo(() => {
    if (totais.entradas <= 0) return null;
    return Math.round(((totais.entradas - totais.saidas) / totais.entradas) * 100);
  }, [totais]);

  const situacao = useMemo(() => {
    const deficit = totais.saidas > totais.entradas;
    const diferenca = Math.abs(totais.saldo);
    const vezes =
      totais.entradas > 0 && deficit
        ? Math.round((totais.saidas / totais.entradas) * 10) / 10
        : null;

    if (totais.entradas <= 0 && totais.saidas <= 0) {
      return { tipo: 'vazio' };
    }

    if (deficit) {
      const sugestoes = [
        'Revise suas despesas fixas e defina um orçamento mensal para evitar que esse déficit continue nos próximos meses.',
        'Identifique a categoria com maior gasto e estabeleça um teto semanal para ela.',
        'Negocie ou cancele assinaturas e recorrências que você quase não usa.',
        'Priorize quitar contas atrasadas e evite novos parcelamentos neste momento.',
        'Separe gastos essenciais dos opcionais por 30 dias e corte o que for possível.',
      ];
      return {
        tipo: 'deficit',
        diferenca,
        vezes,
        sugestao: sugestoes[ano % sugestoes.length],
      };
    }

    const sugestoesPositivas = [
      'Que tal transformar parte dessa economia em uma reserva de emergência?',
      'Defina uma meta mensal de poupança para manter esse ritmo o ano todo.',
      'Considere investir o valor guardado com segurança, de acordo com seus objetivos.',
    ];
    return {
      tipo: 'economia',
      taxa: taxaEconomia ?? 0,
      diferenca,
      sugestao: sugestoesPositivas[ano % sugestoesPositivas.length],
    };
  }, [totais, taxaEconomia, ano]);

  const maxBar = useMemo(() => {
    const max = Math.max(...meses.flatMap((m) => [m.entradas, m.saidas]), 1);
    return max;
  }, [meses]);

  const chartWidth = Dimensions.get('window').width - 64;
  const barMaxH = 120;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando panorama...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            carregar();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.anoNav}>
        <TouchableOpacity
          style={styles.anoBtn}
          onPress={() => setAno((a) => a - 1)}
          accessibilityLabel="Ano anterior"
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.anoLabel}>{ano}</Text>
        <TouchableOpacity
          style={styles.anoBtn}
          onPress={() => setAno((a) => a + 1)}
          accessibilityLabel="Próximo ano"
        >
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.statCard, styles.statEntrada]}>
          <Ionicons name="arrow-down-circle" size={22} color="#16A34A" />
          <Text style={styles.statLabel}>Entradas no Ano</Text>
          <Text style={[styles.statValue, styles.positive]}>{formatarValor(totais.entradas)}</Text>
        </View>
        <View style={[styles.statCard, styles.statSaida]}>
          <Ionicons name="arrow-up-circle" size={22} color="#DC2626" />
          <Text style={styles.statLabel}>Saídas no Ano</Text>
          <Text style={[styles.statValue, styles.negative]}>{formatarValor(totais.saidas)}</Text>
        </View>
      </View>
      <View style={[styles.statCard, styles.statSaldo]}>
        <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />
        <Text style={styles.statLabel}>Saldo do Ano</Text>
        <Text
          style={[
            styles.statValue,
            totais.saldo >= 0 ? styles.positive : styles.negative,
          ]}
        >
          {formatarValor(totais.saldo)}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Entradas x Saídas — {ano}</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Entradas</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Saídas</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.chartArea, { width: Math.max(chartWidth, MESES_CURTO.length * 44) }]}>
            {meses.map((m, idx) => {
              const hIn = Math.round((m.entradas / maxBar) * barMaxH);
              const hOut = Math.round((m.saidas / maxBar) * barMaxH);
              return (
                <View key={m.nome} style={styles.barGroup}>
                  <View style={styles.bars}>
                    <View
                      style={[
                        styles.bar,
                        { height: Math.max(hIn, m.entradas > 0 ? 4 : 0), backgroundColor: '#22C55E' },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        { height: Math.max(hOut, m.saidas > 0 ? 4 : 0), backgroundColor: '#EF4444' },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{MESES_CURTO[idx]}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Por mês</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colMes]}>Mês</Text>
          <Text style={[styles.th, styles.colVal]}>Entradas</Text>
          <Text style={[styles.th, styles.colVal]}>Saídas</Text>
          <Text style={[styles.th, styles.colVal]}>Saldo</Text>
        </View>
        {meses.map((m) => (
          <View key={m.nome} style={styles.tableRow}>
            <Text style={[styles.td, styles.colMes]} numberOfLines={1}>
              {m.nome.slice(0, 3)}
            </Text>
            <Text style={[styles.td, styles.colVal, styles.positive]} numberOfLines={1}>
              {formatarValor(m.entradas)}
            </Text>
            <Text style={[styles.td, styles.colVal, styles.negative]} numberOfLines={1}>
              {formatarValor(m.saidas)}
            </Text>
            <Text
              style={[
                styles.td,
                styles.colVal,
                m.saldo >= 0 ? styles.positive : styles.negative,
              ]}
              numberOfLines={1}
            >
              {formatarValor(m.saldo)}
            </Text>
          </View>
        ))}
        <View style={[styles.tableRow, styles.tableFooter]}>
          <Text style={[styles.td, styles.colMes, styles.bold]}>Total</Text>
          <Text style={[styles.td, styles.colVal, styles.positive, styles.bold]} numberOfLines={1}>
            {formatarValor(totais.entradas)}
          </Text>
          <Text style={[styles.td, styles.colVal, styles.negative, styles.bold]} numberOfLines={1}>
            {formatarValor(totais.saidas)}
          </Text>
          <Text
            style={[
              styles.td,
              styles.colVal,
              styles.bold,
              totais.saldo >= 0 ? styles.positive : styles.negative,
            ]}
            numberOfLines={1}
          >
            {formatarValor(totais.saldo)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Resumo de {ano}</Text>
        <Text style={styles.insight}>
          Você registrou {formatarValor(totais.entradas)} em receitas.
        </Text>
        <Text style={styles.insight}>Gastou {formatarValor(totais.saidas)}.</Text>
        {maiorGastoMes.saidas > 0 ? (
          <Text style={styles.insight}>
            Seu maior gasto ocorreu em {maiorGastoMes.nome.toLowerCase()} (
            {formatarValor(maiorGastoMes.saidas)}).
          </Text>
        ) : (
          <Text style={styles.insight}>Ainda não há despesas registradas neste ano.</Text>
        )}
        <Text style={styles.insight}>
          Seu saldo acumulado é de{' '}
          <Text style={totais.saldo >= 0 ? styles.positive : styles.negative}>
            {formatarValor(totais.saldo)}
          </Text>
          .
        </Text>

        {situacao.tipo === 'deficit' && situacao.sugestao ? (
          <View style={[styles.sugestao, styles.sugestaoAlerta]}>
            <Text style={styles.sugestaoTitle}>💡 Sugestão do Claricash</Text>
            <Text style={styles.sugestaoText}>{situacao.sugestao}</Text>
          </View>
        ) : null}
        {situacao.tipo === 'economia' && situacao.sugestao ? (
          <View style={[styles.sugestao, styles.sugestaoOk]}>
            <Text style={styles.sugestaoTitle}>💡 Sugestão do Claricash</Text>
            <Text style={styles.sugestaoText}>{situacao.sugestao}</Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.sectionCard,
          situacao.tipo === 'deficit' ? styles.taxaDeficit : null,
        ]}
      >
        {situacao.tipo === 'vazio' || taxaEconomia === null ? (
          <>
            <View style={styles.taxaHeader}>
              <Ionicons name="wallet-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Situação financeira</Text>
            </View>
            <Text style={styles.insight}>
              Registre receitas e despesas neste ano para ver sua situação financeira.
            </Text>
          </>
        ) : situacao.tipo === 'deficit' ? (
          <>
            <View style={styles.taxaHeader}>
              <Ionicons name="warning-outline" size={20} color="#DC2626" />
              <Text style={styles.sectionTitle}>Situação financeira</Text>
            </View>
            <Text style={styles.deficitStatus}>⚠️ Déficit</Text>
            <View style={styles.taxaRow}>
              <Text style={styles.insight}>Entradas</Text>
              <Text style={[styles.bold, styles.positive]}>{formatarValor(totais.entradas)}</Text>
            </View>
            <View style={styles.taxaRow}>
              <Text style={styles.insight}>Saídas</Text>
              <Text style={[styles.bold, styles.negative]}>{formatarValor(totais.saidas)}</Text>
            </View>
            <Text style={styles.insight}>
              Você gastou {formatarValor(situacao.diferenca)} a mais do que recebeu neste ano.
            </Text>
            {situacao.vezes != null && situacao.vezes > 1 ? (
              <Text style={styles.insight}>
                Isso equivale a gastar cerca de {String(situacao.vezes).replace('.', ',')} vezes
                mais do que recebeu.
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.taxaHeader}>
              <Ionicons name="leaf-outline" size={20} color="#16A34A" />
              <Text style={styles.sectionTitle}>Taxa de economia</Text>
            </View>
            <View style={styles.taxaRow}>
              <Text style={styles.insight}>Entradas</Text>
              <Text style={[styles.bold, styles.positive]}>{formatarValor(totais.entradas)}</Text>
            </View>
            <View style={styles.taxaRow}>
              <Text style={styles.insight}>Saídas</Text>
              <Text style={[styles.bold, styles.negative]}>{formatarValor(totais.saidas)}</Text>
            </View>
            <Text style={styles.taxaPct}>{situacao.taxa}%</Text>
            <Text style={[styles.bold, styles.positive, { marginBottom: 6 }]}>Parabéns!</Text>
            <Text style={styles.insight}>
              Você conseguiu guardar {situacao.taxa}% da sua renda este ano.
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(colors, isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: colors.textSecondary,
    },
    anoNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      gap: 16,
    },
    anoBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    anoLabel: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      minWidth: 72,
      textAlign: 'center',
    },
    cardsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    statEntrada: {},
    statSaida: {},
    statSaldo: {
      marginBottom: 12,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    positive: { color: isDark ? '#34D399' : '#059669' },
    negative: { color: isDark ? '#F87171' : '#DC2626' },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    legendRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    chartArea: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 150,
      paddingTop: 8,
      gap: 6,
    },
    barGroup: {
      width: 36,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    bars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 3,
      height: 120,
    },
    bar: {
      width: 12,
      borderRadius: 4,
      minHeight: 0,
    },
    barLabel: {
      marginTop: 6,
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 8,
      marginBottom: 4,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    tableFooter: {
      borderBottomWidth: 0,
      marginTop: 4,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    th: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    td: {
      fontSize: 11,
      color: colors.text,
    },
    colMes: { width: '18%' },
    colVal: { width: '27.3%', textAlign: 'right' },
    bold: { fontWeight: '700' },
    insight: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 21,
      marginBottom: 6,
    },
    sugestao: {
      marginTop: 12,
      padding: 12,
      borderRadius: 10,
    },
    sugestaoAlerta: {
      backgroundColor: isDark ? 'rgba(251, 191, 36, 0.12)' : '#FFFBEB',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(251, 191, 36, 0.35)' : '#FDE68A',
    },
    sugestaoOk: {
      backgroundColor: isDark ? 'rgba(52, 211, 153, 0.12)' : '#ECFDF5',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(52, 211, 153, 0.35)' : '#A7F3D0',
    },
    sugestaoTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    sugestaoText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 19,
    },
    taxaHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    taxaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    taxaPct: {
      fontSize: 36,
      fontWeight: '800',
      color: isDark ? '#34D399' : '#059669',
      marginVertical: 8,
    },
    deficitStatus: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#F87171' : '#DC2626',
      marginBottom: 10,
    },
    taxaDeficit: {
      borderColor: isDark ? 'rgba(248, 113, 113, 0.4)' : '#FECACA',
    },
  });
}
