import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';
import { colors } from '../theme/theme';
import GraficoEvolucaoMensal from '../components/GraficoEvolucaoMensal';
import GraficosPizza from '../components/GraficosPizza';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [totais, setTotais] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    saldoContas: 0,
    receitasMes: 0,
    despesasMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [versao, setVersao] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchTotais();
      fetchVersao();
    }
  }, [userId]);

  const fetchVersao = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.VERSAO_MOBILE);
      if (response.data.success && response.data.versao) {
        setVersao(response.data.versao);
      }
    } catch (error) {
      console.error('Erro ao buscar versão mobile:', error);
      // Em caso de erro, usar versão padrão
      setVersao({
        versao_mobile: 'M.1.1.01',
        versao_nome: 'Claricash Mobile'
      });
    }
  };

  const fetchTotais = async () => {
    try {
      const [receitasRes, despesasRes, saldoContasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.CONTAS_SALDO_TOTAL}?userId=${userId}`)
      ]);

      // Normalizar dados de receitas
      const receitasData = receitasRes.data.map(receita => ({
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
      const despesasData = despesasRes.data.map(despesa => ({
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

      const totalReceitas = receitasData
        .filter(receita => receita.receita_recebido)
        .reduce((sum, receita) => sum + parseFloat(receita.receita_valor || 0), 0);

      const totalDespesas = despesasData
        .filter(despesa => despesa.despesa_pago)
        .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0);

      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();

      const receitasMes = receitasData.filter(receita => {
        const dataReceita = new Date(receita.receita_data);
        return dataReceita.getMonth() === mesAtual &&
               dataReceita.getFullYear() === anoAtual &&
               receita.receita_recebido;
      }).reduce((sum, receita) => sum + parseFloat(receita.receita_valor || 0), 0);

      const despesasMes = despesasData.filter(despesa => {
        const dataDespesa = new Date(despesa.despesa_data);
        return dataDespesa.getMonth() === mesAtual &&
               dataDespesa.getFullYear() === anoAtual &&
               despesa.despesa_pago;
      }).reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0);

      console.log('📊 Dados normalizados (Mobile):');
      console.log('  - Total de receitas normalizadas:', receitasData.length);
      console.log('  - Total de despesas normalizadas:', despesasData.length);
      console.log('  - Receitas recebidas:', receitasData.filter(r => r.receita_recebido).length);
      console.log('  - Despesas pagas:', despesasData.filter(d => d.despesa_pago).length);

      const saldoContas = saldoContasRes.data.saldoTotal || 0;
      const saldoTotal = saldoContas + (totalReceitas - totalDespesas);

      setTotais({
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        saldoContas: saldoTotal,
        receitasMes,
        despesasMes
      });
    } catch (err) {
      console.error('❌ Erro ao buscar totais:', err);
      // Fallback: buscar contas manualmente se a rota falhar
      try {
        const contasRes = await axios.get(`${API_ENDPOINTS.CONTAS}?userId=${userId}`);
        // Normalizar dados de contas
        const contasNormalizadas = contasRes.data.map(conta => ({
          ...conta,
          conta_id: conta.conta_id || conta.Conta_Id || conta.id,
          conta_nome: conta.conta_nome || conta.Conta_Nome || conta.nome,
          conta_tipo: conta.conta_tipo || conta.Conta_Tipo || conta.tipo,
          conta_saldo: conta.conta_saldo || conta.Conta_Saldo || conta.saldo
        }));
        const saldoContas = contasNormalizadas.reduce((sum, conta) => sum + parseFloat(conta.conta_saldo || 0), 0);
        setTotais(prev => ({ ...prev, saldoContas: saldoContas + (prev.totalReceitas - prev.totalDespesas) }));
        console.log('⚠️ Usando fallback - Saldo calculado manualmente:', saldoContas);
      } catch (fallbackErr) {
        console.error('❌ Erro no fallback:', fallbackErr);
        // Manter valores zerados em caso de erro
        setTotais({
          totalReceitas: 0,
          totalDespesas: 0,
          saldo: 0,
          saldoContas: 0,
          receitasMes: 0,
          despesasMes: 0
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTotais();
  };

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Claricash</Text>
          <Text style={styles.headerSubtitle}>Controle Financeiro</Text>
        </View>
        <View style={styles.menuButton} />
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
            <Text style={[styles.cardValue, styles.cardValueReceita]}>{formatarValor(totais.totalReceitas)}</Text>
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
            <Text style={[styles.cardValue, styles.cardValueDespesa]}>{formatarValor(totais.totalDespesas)}</Text>
            <Text style={styles.cardDescription}>Despesas Pagas</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.card, totais.saldoContas >= 0 ? styles.cardSaldoPositive : styles.cardSaldoNegative]}>
          <View style={[styles.cardIcon, totais.saldoContas >= 0 ? styles.cardIconSaldo : styles.cardIconSaldoNeg]}>
            <Ionicons name="trending-up" size={28} color="#fff" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Saldo Total</Text>
            <Text style={[styles.cardValue, totais.saldoContas >= 0 ? styles.cardValueSaldo : styles.cardValueDespesa]}>{formatarValor(totais.saldoContas)}</Text>
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
          <Text style={[
            styles.summaryValue,
            (totais.receitasMes - totais.despesasMes) >= 0 ? styles.summaryPositive : styles.summaryNegative
          ]}>
            {formatarValor(totais.receitasMes - totais.despesasMes)}
          </Text>
        </View>
      </View>

      {/* Gráficos */}
      <View style={styles.chartsContainer}>
        <GraficoEvolucaoMensal />
        <GraficosPizza />
      </View>

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

      {/* Versão do App */}
      {versao && versao.versao_mobile && (
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versão {versao.versao_mobile}</Text>
        </View>
      )}
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
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  cardsContainer: {
    padding: 16,
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
    shadowColor: 'rgba(16, 185, 129, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  cardIconDespesa: {
    backgroundColor: '#DC2626',
    shadowColor: 'rgba(239, 68, 68, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  cardIconSaldo: {
    backgroundColor: '#2563EB',
    shadowColor: 'rgba(37, 99, 235, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  cardIconSaldoNeg: {
    backgroundColor: '#DC2626',
    shadowColor: 'rgba(220, 38, 38, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
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
  chartsContainer: {
    padding: 16,
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
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});

