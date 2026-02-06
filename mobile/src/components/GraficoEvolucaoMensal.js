import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';
import { colors } from '../theme/theme';

const screenWidth = Dimensions.get('window').width;

export default function GraficoEvolucaoMensal() {
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`)
      ]);

      // Normalizar dados de receitas
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

      // Normalizar dados de despesas
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

      // Gerar dados do mês atual (dias do mês)
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
      const diaAtual = hoje.getDate();

      const labels = [];
      const receitasData = [];
      const despesasData = [];

      // Mostrar apenas os dias até o dia atual
      for (let dia = 1; dia <= diaAtual; dia++) {
        labels.push(dia.toString());

        const receitasDia = receitas.filter(r => {
          const data = new Date(r.receita_data);
          return data.getDate() === dia &&
                 data.getMonth() === mesAtual && 
                 data.getFullYear() === anoAtual &&
                 r.receita_recebido;
        }).reduce((sum, r) => {
          const valor = parseFloat(r.receita_valor || 0);
          if (isNaN(valor)) {
            console.warn('⚠️ Valor inválido de receita:', r);
            return sum;
          }
          return sum + valor;
        }, 0);

        const despesasDia = despesas.filter(d => {
          const data = new Date(d.despesa_data);
          return data.getDate() === dia &&
                 data.getMonth() === mesAtual &&
                 data.getFullYear() === anoAtual &&
                 d.despesa_pago;
        }).reduce((sum, d) => {
          const valor = parseFloat(d.despesa_valor || 0);
          if (isNaN(valor)) {
            console.warn('⚠️ Valor inválido de despesa:', d);
            return sum;
          }
          return sum + valor;
        }, 0);

        receitasData.push(receitasDia);
        despesasData.push(despesasDia);
      }

      console.log('📊 Dados recebidos no gráfico (Mobile):');
      console.log('  - Total de receitas:', receitas.length);
      console.log('  - Total de despesas:', despesas.length);
      console.log('  - Receitas recebidas:', receitas.filter(r => r.receita_recebido).length);
      console.log('  - Despesas pagas:', despesas.filter(d => d.despesa_pago).length);
      console.log('  - Labels gerados:', labels.length);
      console.log('  - Dados de receitas:', receitasData.filter(v => v > 0).length);
      console.log('  - Dados de despesas:', despesasData.filter(v => v > 0).length);
      
      setDados({ labels, receitasData, despesasData });
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

  // Recarregar dados quando a tela recebe foco
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
        <Text style={styles.loadingText}>Carregando gráfico...</Text>
      </View>
    );
  }

  if (!dados || dados.labels.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Nenhum dado disponível</Text>
      </View>
    );
  }

  const chartData = {
    labels: dados.labels,
    datasets: [
      {
        data: dados.receitasData,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Verde
        strokeWidth: 2
      },
      {
        data: dados.despesasData,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Vermelho
        strokeWidth: 2
      }
    ],
    legend: ['Receitas', 'Despesas']
  };

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolução Financeira - Mês Atual</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withDots={true}
        withShadow={false}
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
    marginBottom: 16,
    textAlign: 'center',
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

