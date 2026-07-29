import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';
import { colors } from '../theme/theme';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 40;
/** Com hasLegend=false o pizza fica à esquerda; paddingLeft centraliza o disco */
const pieDiameter = 180;
const paddingLeft = Math.max(0, Math.round(chartWidth / 2 - pieDiameter / 2));

export default function GraficosPizza() {
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [dadosReceitas, setDadosReceitas] = useState(null);
  const [dadosDespesas, setDadosDespesas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentChart, setCurrentChart] = useState(0); // 0 = receitas, 1 = despesas

  const fetchData = async () => {
    setLoading(true);
    try {
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`)
      ]);

      const receitas = receitasRes.data.map(receita => ({
        ...receita,
        receita_id: receita.receita_id || receita.Receita_Id || receita.id,
        receita_descricao: receita.receita_descricao || receita.Receita_Descricao || receita.descricao,
        receita_valor: receita.receita_valor || receita.Receita_Valor || receita.valor,
        receita_data: receita.receita_data || receita.Receita_Data || receita.data,
        receita_tipo: receita.receita_tipo || receita.Receita_Tipo || receita.tipo,
        receita_recebido: receita.receita_recebido !== undefined ? receita.receita_recebido : (receita.Receita_Recebido !== undefined ? receita.Receita_Recebido : receita.recebido),
        conta_id: receita.conta_id || receita.Conta_id || receita.Conta_Id
      }));

      const despesas = despesasRes.data.map(despesa => ({
        ...despesa,
        despesa_id: despesa.despesa_id || despesa.Despesa_Id || despesa.id,
        despesa_descricao: despesa.despesa_descricao || despesa.Despesa_Descricao || despesa.descricao,
        despesa_valor: despesa.despesa_valor || despesa.Despesa_Valor || despesa.valor,
        despesa_data: despesa.despesa_data || despesa.Despesa_Data || despesa.data,
        despesa_dtvencimento: despesa.despesa_dtvencimento || despesa.Despesa_DtVencimento || despesa.dataVencimento,
        despesa_tipo: despesa.despesa_tipo || despesa.Despesa_Tipo || despesa.tipo,
        despesa_pago: despesa.despesa_pago !== undefined ? despesa.despesa_pago : (despesa.Despesa_Pago !== undefined ? despesa.Despesa_Pago : despesa.pago),
        conta_id: despesa.conta_id || despesa.Conta_id || despesa.Conta_Id
      }));

      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      const receitasMes = receitas.filter(r => {
        const data = new Date(r.receita_data);
        return data.getMonth() === mesAtual &&
               data.getFullYear() === anoAtual &&
               r.receita_recebido;
      });

      const receitasPorTipo = {};
      receitasMes.forEach(r => {
        const tipo = r.receita_tipo || 'Outros';
        const valor = parseFloat(r.receita_valor || 0);
        if (isNaN(valor)) return;
        receitasPorTipo[tipo] = (receitasPorTipo[tipo] || 0) + valor;
      });

      const receitasChart = Object.keys(receitasPorTipo).map((tipo, index) => ({
        name: tipo,
        value: receitasPorTipo[tipo],
        color: ['#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#06B6D4'][index % 7],
      }));

      const despesasMes = despesas.filter(d => {
        const data = new Date(d.despesa_data);
        return data.getMonth() === mesAtual &&
               data.getFullYear() === anoAtual &&
               d.despesa_pago;
      });

      const despesasPorTipo = {};
      despesasMes.forEach(d => {
        const tipo = d.despesa_tipo || 'Outros';
        const valor = parseFloat(d.despesa_valor || 0);
        if (isNaN(valor)) return;
        despesasPorTipo[tipo] = (despesasPorTipo[tipo] || 0) + valor;
      });

      const despesasChart = Object.keys(despesasPorTipo).map((tipo, index) => ({
        name: tipo,
        value: despesasPorTipo[tipo],
        color: ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981'][index % 7],
      }));

      setDadosReceitas(receitasChart.length > 0 ? receitasChart : null);
      setDadosDespesas(despesasChart.length > 0 ? despesasChart : null);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])
  );

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
          {currentChart === 0 ? 'Receitas' : 'Despesas'} - Mês Atual
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentChart((prev) => (prev + 1) % 2)}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
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
                color: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
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
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
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
            Nenhuma {currentChart === 0 ? 'receita' : 'despesa'} registrada este mês
          </Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
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
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
  },
});
