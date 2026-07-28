import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { colors } from '../theme/theme';

const screenWidth = Dimensions.get('window').width;
/** Janela visível: 3 dias antes + dia central + 3 dias depois = 7 dias */
const DIAS_JANELA = 7;
const OFFSET_CENTRO = Math.floor(DIAS_JANELA / 2); // 3

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatLabel(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function sameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

export default function GraficoEvolucaoMensal() {
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  /** Deslocamento da janela em relação a hoje (0 = hoje no centro) */
  const [offsetDias, setOffsetDias] = useState(0);

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

  const janela = useMemo(() => {
    const hoje = startOfLocalDay(new Date());
    const centro = addDays(hoje, offsetDias);
    const inicio = addDays(centro, -OFFSET_CENTRO);
    const dias = [];
    for (let i = 0; i < DIAS_JANELA; i++) {
      dias.push(addDays(inicio, i));
    }
    return { centro, dias, hoje };
  }, [offsetDias]);

  const chartSeries = useMemo(() => {
    const labels = [];
    const receitasData = [];
    const despesasData = [];

    janela.dias.forEach((dia) => {
      labels.push(formatLabel(dia));

      const totalReceitas = receitas
        .filter((r) => {
          const data = parseLocalDate(r.receita_data);
          return data && sameLocalDay(data, dia) && r.receita_recebido;
        })
        .reduce((sum, r) => sum + (parseFloat(r.receita_valor) || 0), 0);

      const totalDespesas = despesas
        .filter((d) => {
          const data = parseLocalDate(d.despesa_data);
          return data && sameLocalDay(data, dia) && d.despesa_pago;
        })
        .reduce((sum, d) => sum + (parseFloat(d.despesa_valor) || 0), 0);

      receitasData.push(totalReceitas);
      despesasData.push(totalDespesas);
    });

    // LineChart exige pelo menos 1 valor; evita crash com arrays vazios
    if (labels.length === 0) {
      return null;
    }

    return {
      labels,
      datasets: [
        {
          data: receitasData,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: despesasData,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Receitas', 'Despesas'],
    };
  }, [janela, receitas, despesas]);

  const tituloPeriodo = useMemo(() => {
    const ini = janela.dias[0];
    const fim = janela.dias[janela.dias.length - 1];
    if (!ini || !fim) return '';
    return `${formatLabel(ini)} a ${formatLabel(fim)}`;
  }, [janela]);

  const centroEhHoje = sameLocalDay(janela.centro, janela.hoje);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando gráfico...</Text>
      </View>
    );
  }

  if (!chartSeries) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Nenhum dado disponível</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolução financeira</Text>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setOffsetDias((o) => o - DIAS_JANELA + 1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.periodBtn}
          onPress={() => setOffsetDias(0)}
          disabled={centroEhHoje}
        >
          <Text style={styles.periodText}>{tituloPeriodo}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setOffsetDias((o) => o + DIAS_JANELA - 1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <LineChart
        data={chartSeries}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines
        withVerticalLabels
        withHorizontalLabels
        withDots
        withShadow={false}
        fromZero
        segments={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
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
    backgroundColor: '#EFF6FF',
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
  chart: {
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
