import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
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

function formatMoedaCurta(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatMesTitulo(year, monthIndex) {
  const label = new Date(year, monthIndex, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function GraficoEvolucaoMensal() {
  const { getUserId } = useAuth();
  const { colors, isDark } = useTheme();
  const userId = getUserId();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);

  const hoje = startOfLocalDay(new Date());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth()); // 0-11

  const fetchData = async () => {
    setLoading(true);
    try {
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
      ]);

      setReceitas(
        (receitasRes.data || []).map((receita) => ({
          ...receita,
          receita_valor: receita.receita_valor || receita.Receita_Valor || receita.valor,
          receita_data: receita.receita_data || receita.Receita_Data || receita.data,
          receita_recebido:
            receita.receita_recebido !== undefined
              ? receita.receita_recebido
              : receita.Receita_Recebido !== undefined
                ? receita.Receita_Recebido
                : receita.recebido,
        }))
      );

      setDespesas(
        (despesasRes.data || []).map((despesa) => ({
          ...despesa,
          despesa_valor: despesa.despesa_valor || despesa.Despesa_Valor || despesa.valor,
          despesa_data: despesa.despesa_data || despesa.Despesa_Data || despesa.data,
          despesa_pago:
            despesa.despesa_pago !== undefined
              ? despesa.despesa_pago
              : despesa.Despesa_Pago !== undefined
                ? despesa.Despesa_Pago
                : despesa.pago,
        }))
      );
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])
  );

  const chartSeries = useMemo(() => {
    const totalDias = daysInMonth(ano, mes);
    const receitasData = [];
    const despesasData = [];

    for (let day = 1; day <= totalDias; day++) {
      const diaRef = new Date(ano, mes, day);

      const totalReceitas = receitas
        .filter((r) => {
          if (!r.receita_recebido) return false;
          const data = parseLocalDate(r.receita_data);
          return (
            data &&
            data.getFullYear() === diaRef.getFullYear() &&
            data.getMonth() === diaRef.getMonth() &&
            data.getDate() === day
          );
        })
        .reduce((sum, r) => sum + (parseFloat(r.receita_valor) || 0), 0);

      const totalDespesas = despesas
        .filter((d) => {
          if (!d.despesa_pago) return false;
          const data = parseLocalDate(d.despesa_data);
          return (
            data &&
            data.getFullYear() === diaRef.getFullYear() &&
            data.getMonth() === diaRef.getMonth() &&
            data.getDate() === day
          );
        })
        .reduce((sum, d) => sum + (parseFloat(d.despesa_valor) || 0), 0);

      receitasData.push(totalReceitas);
      despesasData.push(totalDespesas);
    }

    const maxVal = Math.max(1, ...receitasData, ...despesasData);
    // Eixo X: 0 (início), 15, último dia do mês
    const xTicks = [0, 15, totalDias].filter((v, i, arr) => arr.indexOf(v) === i);

    return { totalDias, receitasData, despesasData, maxVal, xTicks };
  }, [ano, mes, receitas, despesas]);

  const navegarMes = (delta) => {
    const d = new Date(ano, mes + delta, 1);
    setAno(d.getFullYear());
    setMes(d.getMonth());
  };

  const irMesAtual = () => {
    const n = new Date();
    setAno(n.getFullYear());
    setMes(n.getMonth());
  };

  const mesEhAtual = ano === hoje.getFullYear() && mes === hoje.getMonth();

  const chartWidth = Math.min(Dimensions.get('window').width - 120, 320);
  const chartHeight = 160;
  const padX = 8;
  const padY = 8;
  const plotW = chartWidth - padX * 2;
  const plotH = chartHeight - padY * 2;

  const toPoint = (dayIndex, value) => {
    // dayIndex 0 = dia 1; mapear também tick 0 no início do eixo
    const x =
      chartSeries.totalDias <= 1
        ? padX + plotW / 2
        : padX + (dayIndex / (chartSeries.totalDias - 1)) * plotW;
    const y = padY + plotH - (value / chartSeries.maxVal) * plotH;
    return { x, y };
  };

  const toPolyline = (data) =>
    data
      .map((v, i) => {
        const p = toPoint(i, v);
        return `${p.x},${p.y}`;
      })
      .join(' ');

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando gráfico...</Text>
      </View>
    );
  }

  const gridColor = isDark ? 'rgba(148,163,184,0.25)' : 'rgba(148,163,184,0.35)';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolução financeira</Text>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: '#16A34A' }]} />
          <Text style={styles.legendText}>Receitas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: '#DC2626' }]} />
          <Text style={styles.legendText}>Despesas</Text>
        </View>
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navegarMes(-1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.periodBtn} onPress={irMesAtual} disabled={mesEhAtual}>
          <Text style={styles.periodText}>{formatMesTitulo(ano, mes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navegarMes(1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.chartArea}>
        <View style={styles.yAxis}>
          {[chartSeries.maxVal, chartSeries.maxVal / 2, 0].map((tick, idx) => (
            <Text key={idx} style={styles.yTick} numberOfLines={1}>
              {formatMoedaCurta(tick)}
            </Text>
          ))}
        </View>

        <View style={styles.plotCol}>
          <Svg width={chartWidth} height={chartHeight}>
            {[0, 0.5, 1].map((t) => {
              const y = padY + plotH * (1 - t);
              return (
                <Line
                  key={`g-${t}`}
                  x1={padX}
                  y1={y}
                  x2={padX + plotW}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth={1}
                />
              );
            })}
            <Polyline
              points={toPolyline(chartSeries.receitasData)}
              fill="none"
              stroke="#16A34A"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Polyline
              points={toPolyline(chartSeries.despesasData)}
              fill="none"
              stroke="#DC2626"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {chartSeries.receitasData.map((v, i) => {
              if (v <= 0) return null;
              const p = toPoint(i, v);
              return <Circle key={`r-${i}`} cx={p.x} cy={p.y} r={2.5} fill="#16A34A" />;
            })}
            {chartSeries.despesasData.map((v, i) => {
              if (v <= 0) return null;
              const p = toPoint(i, v);
              return <Circle key={`d-${i}`} cx={p.x} cy={p.y} r={2.5} fill="#DC2626" />;
            })}
          </Svg>

          <View style={[styles.xAxis, { width: chartWidth }]}>
            {chartSeries.xTicks.map((tick) => {
              // 0 = início do eixo; 15 e último dia usam índice do dia-1
              const idx = tick === 0 ? 0 : Math.min(tick, chartSeries.totalDias) - 1;
              const left =
                chartSeries.totalDias <= 1
                  ? plotW / 2
                  : padX + (idx / (chartSeries.totalDias - 1)) * plotW;
              return (
                <Text
                  key={`x-${tick}`}
                  style={[styles.xTick, { left: Math.max(0, left - 10) }]}
                >
                  {tick}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors, isDark) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 12,
      gap: 4,
    },
    navBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(96, 165, 250, 0.12)' : '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    periodBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 4,
    },
    periodText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      width: '100%',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 10,
    },
    legendSwatch: {
      width: 14,
      height: 14,
      borderRadius: 3,
      marginRight: 6,
    },
    legendText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    chartArea: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
    },
    yAxis: {
      width: 58,
      height: 160,
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingRight: 6,
      paddingTop: 4,
      paddingBottom: 4,
    },
    yTick: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'right',
    },
    plotCol: {
      flex: 1,
      alignItems: 'flex-start',
    },
    xAxis: {
      height: 22,
      marginTop: 4,
      position: 'relative',
    },
    xTick: {
      position: 'absolute',
      width: 20,
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    loadingText: {
      marginTop: 8,
      color: colors.textSecondary,
    },
  });
}
