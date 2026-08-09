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

export default function CartaoCreditoScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const userId = getUserId();
  const [cartoes, setCartoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [bandeira, setBandeira] = useState('visa');
  const [limiteDisplay, setLimiteDisplay] = useState('');
  const [diaFechamento, setDiaFechamento] = useState('1');
  const [diaVencimento, setDiaVencimento] = useState('10');
  const [cor, setCor] = useState('#4F46E5');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Cartões de Crédito',
    });
  }, [navigation]);

  useEffect(() => {
    if (userId) {
      carregarCartoes();
      carregarCompras();
    }
  }, [userId]);

  const carregarCartoes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.CARTOES}?userId=${userId}`);
      setCartoes(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar cartões:', err);
      Alert.alert('Erro', 'Erro ao carregar cartões');
    } finally {
      setLoading(false);
    }
  };

  const carregarCompras = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.COMPRAS_CARTAO}?userId=${userId}`);
      setCompras(res.data || []);
    } catch (e) {
      console.log('Erro ao carregar compras:', e);
    }
  };

  const calcularFatura = (cartaoId) => {
    return compras
      .filter(c => (c.cartao_id || c.cartao_Id) === cartaoId)
      .reduce((s, c) => s + parseFloat(c.compra_valor_parcela || c.compra_valor_total || 0), 0);
  };

  const abrirModal = (cartao = null) => {
    if (cartao) {
      setEditando(cartao);
      setNome(cartao.cartao_nome || cartao.cartao_Nome || '');
      setBandeira(cartao.cartao_bandeira || cartao.cartao_Bandeira || 'visa');
      const lim = parseFloat(cartao.cartao_limite || cartao.cartao_Limite || 0);
      setLimiteDisplay(formatCurrency(Math.round(lim * 100).toString()));
      setDiaFechamento(String(cartao.cartao_dia_fechamento ?? cartao.cartao_DiaFechamento ?? 1));
      setDiaVencimento(String(cartao.cartao_dia_vencimento ?? cartao.cartao_DiaVencimento ?? 10));
      setCor(cartao.cartao_cor || cartao.cartao_Cor || '#4F46E5');
    } else {
      setEditando(null);
      setNome('');
      setBandeira('visa');
      setLimiteDisplay('');
      setDiaFechamento('1');
      setDiaVencimento('10');
      setCor('#4F46E5');
    }
    setShowModal(true);
  };

  const salvarCartao = async () => {
    if (!nome?.trim()) {
      Alert.alert('Erro', 'Informe o nome do cartão');
      return;
    }
    const limiteNum = parseCurrencyToNumber(limiteDisplay) || 0;
    try {
      const dados = {
        nome: nome.trim(),
        bandeira: bandeira || 'visa',
        limite: limiteNum,
        dia_fechamento: parseInt(diaFechamento, 10) || 1,
        dia_vencimento: parseInt(diaVencimento, 10) || 10,
        cor: cor || '#4F46E5'
      };
      if (editando) {
        const id = editando.cartao_id || editando.cartao_Id;
        await axios.put(`${API_ENDPOINTS.CARTOES}/${id}`, dados);
        Alert.alert('Sucesso', 'Cartão atualizado');
      } else {
        await axios.post(API_ENDPOINTS.CARTOES, {
          ...dados,
          usuario_id: userId
        });
        Alert.alert('Sucesso', 'Cartão criado');
      }
      setShowModal(false);
      carregarCartoes();
      carregarCompras();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao salvar');
    }
  };

  const excluirCartao = (cartao) => {
    const id = cartao.cartao_id || cartao.cartao_Id;
    Alert.alert(
      'Excluir cartão',
      `Excluir "${cartao.cartao_nome || cartao.cartao_Nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_ENDPOINTS.CARTOES}/${id}`);
              carregarCartoes();
            } catch (e) {
              Alert.alert('Erro', 'Erro ao excluir');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => abrirModal()}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Novo Cartão</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.list}>
          {cartoes.length === 0 ? (
            <Text style={styles.empty}>Nenhum cartão cadastrado.</Text>
          ) : (
            cartoes.map((cartao) => {
              const id = cartao.cartao_id || cartao.cartao_Id;
              const fatura = calcularFatura(id);
              const limite = parseFloat(cartao.cartao_limite || cartao.cartao_Limite || 0);
              const disponivel = limite - fatura;
              const corCard = cartao.cartao_cor || cartao.cartao_Cor || '#4F46E5';
              return (
                <View key={id} style={[styles.card, { borderLeftColor: corCard }]}>
                  <View style={[styles.cardHeader, { backgroundColor: corCard }]}>
                    <Text style={styles.cardBandeira}>{(cartao.cartao_bandeira || 'VISA').toUpperCase()}</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity onPress={() => abrirModal(cartao)}>
                        <Ionicons name="create" size={20} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => excluirCartao(cartao)}>
                        <Ionicons name="trash" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardNome}>{cartao.cartao_nome || cartao.cartao_Nome}</Text>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardLabel}>Limite</Text>
                      <Text style={styles.cardValor}>{formatarValor(limite)}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardLabel}>Fatura</Text>
                      <Text style={[styles.cardValor, { color: colors.error }]}>{formatarValor(fatura)}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardLabel}>Disponível</Text>
                      <Text style={[styles.cardValor, { color: disponivel >= 0 ? colors.success : colors.error }]}>
                        {formatarValor(disponivel)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editando ? 'Editar' : 'Novo'} Cartão</Text>
              <Text style={styles.modalLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: Nubank, Itaú"
                placeholderTextColor={colors.placeholder}
              />
              <Text style={styles.modalLabel}>Limite (R$)</Text>
              <TextInput
                style={styles.input}
                value={limiteDisplay}
                onChangeText={(t) => setLimiteDisplay(formatCurrency(t.replace(/\D/g, '')))}
                placeholder="0,00"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
              />
              <Text style={styles.modalLabel}>Dia fechamento</Text>
              <TextInput
                style={styles.input}
                value={diaFechamento}
                onChangeText={setDiaFechamento}
                placeholder="1"
                placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
              />
              <Text style={styles.modalLabel}>Dia vencimento</Text>
              <TextInput
                style={styles.input}
                value={diaVencimento}
                onChangeText={setDiaVencimento}
                placeholder="10"
                placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowModal(false)}>
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSave} onPress={salvarCartao}>
                  <Text style={styles.modalBtnSaveText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: 16,
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
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardBandeira: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 12 },
  cardBody: { padding: 16 },
  cardNome: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardLabel: { fontSize: 14, color: colors.textSecondary },
  cardValor: { fontSize: 14, fontWeight: '600', color: colors.text },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalScroll: { padding: 24, flexGrow: 1, justifyContent: 'center' },
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
    marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
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
