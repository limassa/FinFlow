import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';
import { getColorForTipo, getIconNameForTipo } from '../utils/categoryIcons';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 40;
const pieDiameter = 180;
const paddingLeft = Math.max(0, Math.round(chartWidth / 2 - pieDiameter / 2));

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

function shiftMonth(base, delta) {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

export default function GraficosPizza() {
  const { getUserId } = useAuth();
  const { colors, isDark } = useTheme();
  const userId = getUserId();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [receitasRaw, setReceitasRaw] = useState([]);
  const [despesasRaw, setDespesasRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChart, setCurrentChart] = useState(0); // 0 = receitas, 1 = despesas
  const [mesRef, setMesRef] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
      ]);

      const receitas = (receitasRes.data || []).map((receita) => ({
        ...receita,
        receita_valor: receita.receita_valor || receita.Receita_Valor || receita.valor,
        receita_data: receita.receita_data || receita.Receita_Data || receita.data,
        receita_tipo: receita.receita_tipo || receita.Receita_Tipo || receita.tipo,
        receita_recebido:
          receita.receita_recebido !== undefined
            ? receita.receita_recebido
            : receita.Receita_Recebido !== undefined
              ? receita.Receita_Recebido
              : receita.recebido,
      }));

      const despesas = (despesasRes.data || []).map((despesa) => ({
        ...despesa,
        despesa_valor: despesa.despesa_valor || despesa.Despesa_Valor || despesa.valor,
        despesa_data: despesa.despesa_data || despesa.Despesa_Data || despesa.data,
        despesa_tipo: despesa.despesa_tipo || despesa.Despesa_Tipo || despesa.tipo,
        despesa_pago:
          despesa.despesa_pago !== undefined
            ? despesa.despesa_pago
            : despesa.Despesa_Pago !== undefined
              ? despesa.Despesa_Pago
              : despesa.pago,
      }));

      setReceitasRaw(receitas);
      setDespesasRaw(despesas);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  useFocusEffect(
    useCallback(() => {
      if (userId) fetchData();
    }, [userId, fetchData])
  );

  const { dadosReceitas, dadosDespesas } = useMemo(() => {
    const mes = mesRef.getMonth();
    const ano = mesRef.getFullYear();

    const receitasMes = receitasRaw.filter((r) => {
      const data = parseLocalDate(r.receita_data);
      return data && data.getMonth() === mes && data.getFullYear() === ano && r.receita_recebido;
    });

    const receitasPorTipo = {};
    receitasMes.forEach((r) => {
      const tipo = r.receita_tipo || 'Outros';
      const valor = parseFloat(r.receita_valor || 0);
      if (isNaN(valor)) return;
      receitasPorTipo[tipo] = (receitasPorTipo[tipo] || 0) + valor;
    });

    const receitasChart = Object.keys(receitasPorTipo).map((tipo) => ({
      name: tipo,
      value: receitasPorTipo[tipo],
      color: getColorForTipo(tipo, 'receita'),
      icon: getIconNameForTipo(tipo, 'receita'),
    }));

    const despesasMes = despesasRaw.filter((d) => {
      const data = parseLocalDate(d.despesa_data);
      return data && data.getMonth() === mes && data.getFullYear() === ano && d.despesa_pago;
    });

    const despesasPorTipo = {};
    despesasMes.forEach((d) => {
      const tipo = d.despesa_tipo || 'Outros';
      const valor = parseFloat(d.despesa_valor || 0);
      if (isNaN(valor)) return;
      despesasPorTipo[tipo] = (despesasPorTipo[tipo] || 0) + valor;
    });

    const despesasChart = Object.keys(despesasPorTipo).map((tipo) => ({
      name: tipo,
      value: despesasPorTipo[tipo],
      color: getColorForTipo(tipo, 'despesa'),
      icon: getIconNameForTipo(tipo, 'despesa'),
    }));

    return {
      dadosReceitas: receitasChart.length > 0 ? receitasChart : null,
      dadosDespesas: despesasChart.length > 0 ? despesasChart : null,
    };
  }, [receitasRaw, despesasRaw, mesRef]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando gráficos...</Text>
      </View>
    );
  }

  const chartData = currentChart === 0 ? dadosReceitas : dadosDespesas;
  const hasData = chartData && chartData.length > 0;
  const mesLabel = `${MESES[mesRef.getMonth()]} ${mesRef.getFullYear()}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentChart((prev) => (prev - 1 + 2) % 2)}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>
          {currentChart === 0 ? 'Receitas' : 'Despesas'}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentChart((prev) => (prev + 1) % 2)}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.monthNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setMesRef((m) => shiftMonth(m, -1))}
        >
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{mesLabel}</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setMesRef((m) => shiftMonth(m, 1))}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {hasData ? (
        <>
          <View style={styles.chartWrap}>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={220}
              chartConfig={{
                color: (opacity = 1) =>
                  isDark ? `rgba(241, 245, 249, ${opacity})` : `rgba(34, 34, 34, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft={`${paddingLeft}`}
              absolute
              hasLegend={false}
            />
          </View>
          <View style={styles.legend}>
            {chartData.map((item) => (
              <View key={`${item.name}-${item.color}`} style={styles.legendItem}>
                <View style={[styles.legendIconWrap, { backgroundColor: `${item.color}22` }]}>
                  <Ionicons name={item.icon} size={14} color={item.color} />
                </View>
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.legendValue}>{formatarValor(item.value)}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhuma {currentChart === 0 ? 'receita' : 'despesa'} registrada em {mesLabel}
          </Text>
        </View>
      )}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 8,
    },
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 12,
    },
    monthLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    navButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(96, 165, 250, 0.12)' : '#EFF6FF',
    },
    chartWrap: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    legend: {
      width: '100%',
      marginTop: 12,
      gap: 10,
      paddingHorizontal: 4,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 2,
    },
    legendIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    legendLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    legendValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    emptyContainer: {
      height: 220,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    loadingText: {
      marginTop: 8,
      color: colors.textSecondary,
    },
  });
}
