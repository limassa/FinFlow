import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';
import { formatCurrency, parseCurrencyToNumber } from '../utils/currencyMask';
import Select from '../components/Select';

const categoriasPadrao = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação',
  'Lazer', 'Vestuário', 'Assinaturas', 'Compras', 'Cartão de Crédito',
  'Investimentos', 'Impostos', 'Seguros', 'Doações', 'Outros'
];

export default function OrcamentoScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [orcamentos, setOrcamentos] = useState([]);
  const [categoriasCustomizadas, setCategoriasCustomizadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Orçamento Mensal',
    });
  }, [navigation]);

  useEffect(() => {
    if (userId) {
      carregarOrcamentos();
      carregarCategorias();
    }
  }, [userId, mesSelecionado]);

  const carregarCategorias = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.CATEGORIAS}?userId=${userId}&tipo=despesa`);
      setCategoriasCustomizadas((res.data || []).map(c => c.categoria_nome || c.categoria_Nome));
    } catch (e) {
      console.log('Erro ao carregar categorias:', e);
    }
  };

  const todasCategorias = [...categoriasPadrao, ...categoriasCustomizadas];

  const carregarOrcamentos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.ORCAMENTOS}?userId=${userId}&mes=${mesSelecionado}`);
      setOrcamentos(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar orçamentos:', err);
      Alert.alert('Erro', 'Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  };

  const gerarOpcoesMeses = () => {
    const opcoes = [];
    const anoMin = new Date().getFullYear() - 1;
    const anoMax = new Date().getFullYear() + 1;
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    for (let ano = anoMin; ano <= anoMax; ano++) {
      for (let m = 1; m <= 12; m++) {
        opcoes.push({
          value: `${ano}-${String(m).padStart(2,'0')}`,
          label: `${meses[m-1]} ${ano}`
        });
      }
    }
    return opcoes;
  };

  const abrirModal = (orc = null) => {
    if (orc) {
      setEditando(orc);
      setCategoria(orc.orcamento_categoria || orc.Orcamento_Categoria || '');
      const v = parseFloat(orc.orcamento_valor || orc.Orcamento_Valor || 0);
      setValorDisplay(formatCurrency(Math.round(v * 100).toString()));
    } else {
      setEditando(null);
      setCategoria('');
      setValorDisplay('');
    }
    setShowModal(true);
  };

  const salvarOrcamento = async () => {
    if (!categoria?.trim()) {
      Alert.alert('Erro', 'Selecione a categoria');
      return;
    }
    const valorNum = parseCurrencyToNumber(valorDisplay) || 0;
    try {
      if (editando) {
        const id = editando.orcamento_id || editando.Orcamento_Id;
        await axios.put(`${API_ENDPOINTS.ORCAMENTOS}/${id}`, {
          categoria: categoria.trim(),
          valor: valorNum
        });
        Alert.alert('Sucesso', 'Orçamento atualizado');
      } else {
        await axios.post(API_ENDPOINTS.ORCAMENTOS, {
          usuario_id: userId,
          categoria: categoria.trim(),
          valor: valorNum,
          mes: mesSelecionado
        });
        Alert.alert('Sucesso', 'Orçamento definido');
      }
      setShowModal(false);
      carregarOrcamentos();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao salvar');
    }
  };

  const excluirOrcamento = (orc) => {
    const id = orc.orcamento_id || orc.Orcamento_Id;
    Alert.alert(
      'Excluir orçamento',
      `Excluir orçamento de "${orc.orcamento_categoria || orc.Orcamento_Categoria}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_ENDPOINTS.ORCAMENTOS}/${id}`);
              carregarOrcamentos();
            } catch (e) {
              Alert.alert('Erro', 'Erro ao excluir');
            }
          }
        }
      ]
    );
  };

  const totalOrcado = orcamentos.reduce((s, o) => s + parseFloat(o.orcamento_valor || o.Orcamento_Valor || 0), 0);
  const totalRealizado = orcamentos.reduce((s, o) => s + parseFloat(o.valor_realizado || 0), 0);

  const opcoesMeses = gerarOpcoesMeses();
  const categoriasDisponiveis = todasCategorias.filter(cat =>
    !orcamentos.some(o => (o.orcamento_categoria || o.Orcamento_Categoria) === cat) ||
    (editando && (editando.orcamento_categoria || editando.Orcamento_Categoria) === cat)
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Mês:</Text>
        <Select
          value={mesSelecionado}
          options={opcoesMeses}
          onChange={setMesSelecionado}
          placeholder="Selecione"
        />
      </View>

      <View style={styles.resumo}>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoLabel}>Total orçado</Text>
          <Text style={styles.resumoValor}>{formatarValor(totalOrcado)}</Text>
        </View>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoLabel}>Realizado</Text>
          <Text style={[styles.resumoValor, { color: totalRealizado > totalOrcado ? colors.error : colors.success }]}>
            {formatarValor(totalRealizado)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => abrirModal()}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Definir Orçamento</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.list}>
          {orcamentos.length === 0 ? (
            <Text style={styles.empty}>Nenhum orçamento definido para este mês.</Text>
          ) : (
            orcamentos.map((orc) => {
              const cat = orc.orcamento_categoria || orc.Orcamento_Categoria || '';
              const orcado = parseFloat(orc.orcamento_valor || orc.Orcamento_Valor || 0);
              const realizado = parseFloat(orc.valor_realizado || 0);
              const pct = orcado > 0 ? (realizado / orcado) * 100 : 0;
              const status = pct <= 80 ? 'ok' : pct <= 100 ? 'atencao' : 'excedido';
              return (
                <View key={orc.orcamento_id || orc.Orcamento_Id} style={[styles.card, styles[`card${status.charAt(0).toUpperCase() + status.slice(1)}`]]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardCategoria}>{cat}</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity onPress={() => abrirModal(orc)}>
                        <Ionicons name="create" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => excluirOrcamento(orc)}>
                        <Ionicons name="trash" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.cardValores}>
                    <Text style={styles.cardOrcado}>{formatarValor(orcado)}</Text>
                    <Text style={styles.cardRealizado}>{formatarValor(realizado)} ({pct.toFixed(0)}%)</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editando ? 'Editar' : 'Definir'} Orçamento</Text>
            <Text style={styles.modalLabel}>Categoria</Text>
            <Select
              value={categoria}
              options={editando ? [{ label: categoria, value: categoria }] : categoriasDisponiveis.map(c => ({ label: c, value: c }))}
              onChange={setCategoria}
              placeholder="Selecione"
            />
            <Text style={[styles.modalLabel, { marginTop: 16 }]}>Valor (R$)</Text>
            <TextInput
              style={styles.input}
              value={valorDisplay}
              onChangeText={(t) => setValorDisplay(formatCurrency(t.replace(/\D/g, '')))}
              placeholder="0,00"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={salvarOrcamento}>
                <Text style={styles.modalBtnSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { padding: 16 },
  filterLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.text },
  resumo: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  resumoItem: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  resumoLabel: { fontSize: 12, color: colors.textSecondary },
  resumoValor: { fontSize: 18, fontWeight: '700', color: colors.text },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loader: { marginTop: 40 },
  list: { flex: 1, paddingHorizontal: 16 },
  empty: { color: colors.textSecondary, textAlign: 'center', padding: 24 },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardOk: { borderLeftColor: colors.success },
  cardAtencao: { borderLeftColor: colors.warning },
  cardExcedido: { borderLeftColor: colors.error },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardCategoria: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardActions: { flexDirection: 'row', gap: 12 },
  cardValores: { flexDirection: 'row', justifyContent: 'space-between' },
  cardOrcado: { fontSize: 14, color: colors.textSecondary },
  cardRealizado: { fontSize: 14, fontWeight: '600', color: colors.text },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: { backgroundColor: colors.card, borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: colors.text },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtnCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.border,
    alignItems: 'center',
  },
  modalBtnCancelText: { color: colors.text, fontWeight: '600' },
  modalBtnSave: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalBtnSaveText: { color: '#fff', fontWeight: '600' },
});
}
