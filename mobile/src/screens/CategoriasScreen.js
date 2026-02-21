import React, { useState, useEffect, useLayoutEffect } from 'react';
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
import { API_ENDPOINTS } from '../config/api';
import { colors } from '../theme/theme';

export default function CategoriasScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoAtivo, setTipoAtivo] = useState('despesa');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nomeCategoria, setNomeCategoria] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Categorias',
    });
  }, [navigation]);

  useEffect(() => {
    if (userId) carregarCategorias();
  }, [userId, tipoAtivo]);

  const carregarCategorias = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.CATEGORIAS}?userId=${userId}&tipo=${tipoAtivo}`);
      setCategorias(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      Alert.alert('Erro', 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (cat = null) => {
    if (cat) {
      setEditando(cat);
      setNomeCategoria(cat.categoria_nome || cat.categoria_Nome || '');
    } else {
      setEditando(null);
      setNomeCategoria('');
    }
    setShowModal(true);
  };

  const salvarCategoria = async () => {
    if (!nomeCategoria?.trim()) {
      Alert.alert('Erro', 'Informe o nome da categoria');
      return;
    }
    try {
      if (editando) {
        const id = editando.categoria_id || editando.categoria_Id;
        await axios.put(`${API_ENDPOINTS.CATEGORIAS}/${id}`, {
          nome: nomeCategoria.trim(),
          tipo: tipoAtivo
        });
        Alert.alert('Sucesso', 'Categoria atualizada');
      } else {
        await axios.post(API_ENDPOINTS.CATEGORIAS, {
          nome: nomeCategoria.trim(),
          tipo: tipoAtivo,
          usuario_id: userId
        });
        Alert.alert('Sucesso', 'Categoria criada');
      }
      setShowModal(false);
      carregarCategorias();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao salvar');
    }
  };

  const excluirCategoria = (cat) => {
    const id = cat.categoria_id || cat.categoria_Id;
    Alert.alert(
      'Excluir categoria',
      `Excluir "${cat.categoria_nome || cat.categoria_Nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_ENDPOINTS.CATEGORIAS}/${id}`);
              carregarCategorias();
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
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, tipoAtivo === 'despesa' && styles.toggleBtnActive]}
          onPress={() => setTipoAtivo('despesa')}
        >
          <Text style={[styles.toggleText, tipoAtivo === 'despesa' && styles.toggleTextActive]}>Despesas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, tipoAtivo === 'receita' && styles.toggleBtnActive]}
          onPress={() => setTipoAtivo('receita')}
        >
          <Text style={[styles.toggleText, tipoAtivo === 'receita' && styles.toggleTextActive]}>Receitas</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => abrirModal()}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Nova Categoria</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.list}>
          {categorias.length === 0 ? (
            <Text style={styles.empty}>Nenhuma categoria customizada. Use o botão acima para criar.</Text>
          ) : (
            categorias.map((cat) => {
              const nome = cat.categoria_nome || cat.categoria_Nome || 'Sem nome';
              const id = cat.categoria_id || cat.categoria_Id;
              return (
                <View key={id} style={styles.card}>
                  <Text style={styles.cardNome}>{nome}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => abrirModal(cat)}>
                      <Ionicons name="create" size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => excluirCategoria(cat)}>
                      <Ionicons name="trash" size={22} color={colors.error} />
                    </TouchableOpacity>
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
            <Text style={styles.modalTitle}>{editando ? 'Editar' : 'Nova'} Categoria</Text>
            <TextInput
              style={styles.input}
              value={nomeCategoria}
              onChangeText={setNomeCategoria}
              placeholder="Nome da categoria"
              placeholderTextColor={colors.placeholder}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={salvarCategoria}>
                <Text style={styles.modalBtnSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toggleRow: { flexDirection: 'row', padding: 16, gap: 12 },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: 16, fontWeight: '600', color: colors.text },
  toggleTextActive: { color: '#fff' },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardNome: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardActions: { flexDirection: 'row', gap: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
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
