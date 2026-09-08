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
import {
  ICONES_DISPONIVEIS,
  CORES_DISPONIVEIS,
  ICONS_CATEGORIA_CUSTOM,
} from '../utils/categoryIcons';

export default function CategoriasScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const userId = getUserId();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoAtivo, setTipoAtivo] = useState('despesa');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formCategoria, setFormCategoria] = useState({
    nome: '',
    icone: 'ellipsis',
    cor: '#6B7280',
    tipoDespesa: true,
    tipoReceita: false,
  });

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
      setFormCategoria({
        nome: cat.categoria_nome || cat.categoria_Nome || '',
        icone: cat.categoria_icone || 'ellipsis',
        cor: cat.categoria_cor || '#6B7280',
        tipoDespesa: cat.categoria_tipo === 'despesa',
        tipoReceita: cat.categoria_tipo === 'receita',
      });
    } else {
      setEditando(null);
      setFormCategoria({
        nome: '',
        icone: 'ellipsis',
        cor: '#6B7280',
        tipoDespesa: tipoAtivo === 'despesa',
        tipoReceita: tipoAtivo === 'receita',
      });
    }
    setShowModal(true);
  };

  const salvarCategoria = async () => {
    if (!formCategoria.nome?.trim()) {
      Alert.alert('Erro', 'Informe o nome da categoria');
      return;
    }
    if (!editando && !formCategoria.tipoDespesa && !formCategoria.tipoReceita) {
      Alert.alert('Erro', 'Selecione pelo menos um tipo (Despesa ou Receita)');
      return;
    }
    try {
      if (editando) {
        const id = editando.categoria_id || editando.categoria_Id;
        await axios.put(`${API_ENDPOINTS.CATEGORIAS}/${id}`, {
          nome: formCategoria.nome.trim(),
          icone: formCategoria.icone,
          cor: formCategoria.cor,
          ordem: editando.categoria_ordem ?? 0,
        });
        Alert.alert('Sucesso', 'Categoria atualizada');
      } else {
        const promises = [];
        if (formCategoria.tipoDespesa) {
          promises.push(axios.post(API_ENDPOINTS.CATEGORIAS, {
            usuario_id: userId,
            nome: formCategoria.nome.trim(),
            tipo: 'despesa',
            icone: formCategoria.icone,
            cor: formCategoria.cor,
            ordem: categorias.length,
          }));
        }
        if (formCategoria.tipoReceita) {
          promises.push(axios.post(API_ENDPOINTS.CATEGORIAS, {
            usuario_id: userId,
            nome: formCategoria.nome.trim(),
            tipo: 'receita',
            icone: formCategoria.icone,
            cor: formCategoria.cor,
            ordem: categorias.length,
          }));
        }
        await Promise.all(promises);
        Alert.alert('Sucesso', 'Categoria(s) criada(s)');
      }
      setShowModal(false);
      carregarCategorias();
    } catch (err) {
      if (err.response?.status === 409) {
        Alert.alert('Erro', 'Já existe uma categoria com este nome');
      } else {
        Alert.alert('Erro', err.response?.data?.error || 'Erro ao salvar');
      }
    }
  };

  const excluirCategoria = (cat) => {
    const id = cat.categoria_id || cat.categoria_Id;
    const nome = cat.categoria_nome || cat.categoria_Nome || '';
    Alert.alert(
      'Excluir categoria',
      `Excluir "${nome}"?`,
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
          },
        },
      ]
    );
  };

  const renderIcone = (icone, cor) => {
    const ionName = ICONS_CATEGORIA_CUSTOM[icone] || 'ellipsis-horizontal';
    return (
      <View style={[styles.iconePreview, { backgroundColor: cor }]}>
        <Ionicons name={ionName} size={18} color="#fff" />
      </View>
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
              const icone = cat.categoria_icone || 'ellipsis';
              const cor = cat.categoria_cor || '#6B7280';
              return (
                <View key={id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: cor }]}>
                  <View style={styles.cardInfo}>
                    {renderIcone(icone, cor)}
                    <Text style={styles.cardNome}>{nome}</Text>
                  </View>
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
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editando ? 'Editar' : 'Nova'} Categoria</Text>

              <Text style={styles.modalLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                value={formCategoria.nome}
                onChangeText={(v) => setFormCategoria({ ...formCategoria, nome: v })}
                placeholder="Nome da categoria"
                placeholderTextColor={colors.placeholder}
              />

              {!editando && (
                <>
                  <Text style={styles.modalLabel}>Tipo (selecione um ou ambos)</Text>
                  <View style={styles.checkboxRow}>
                    <TouchableOpacity
                      style={styles.checkboxItem}
                      onPress={() => setFormCategoria({ ...formCategoria, tipoDespesa: !formCategoria.tipoDespesa })}
                    >
                      <View style={[styles.checkbox, formCategoria.tipoDespesa && styles.checkboxChecked]}>
                        {formCategoria.tipoDespesa && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </View>
                      <Text style={styles.checkboxLabel}>Despesa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.checkboxItem}
                      onPress={() => setFormCategoria({ ...formCategoria, tipoReceita: !formCategoria.tipoReceita })}
                    >
                      <View style={[styles.checkbox, formCategoria.tipoReceita && styles.checkboxChecked]}>
                        {formCategoria.tipoReceita && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </View>
                      <Text style={styles.checkboxLabel}>Receita</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <Text style={styles.modalLabel}>Ícone</Text>
              <View style={styles.iconesGrid}>
                {ICONES_DISPONIVEIS.map((ic) => {
                  const ionName = ICONS_CATEGORIA_CUSTOM[ic] || 'ellipsis-horizontal';
                  const isSelected = formCategoria.icone === ic;
                  return (
                    <TouchableOpacity
                      key={ic}
                      style={[styles.iconeBtn, isSelected && styles.iconeBtnSelected]}
                      onPress={() => setFormCategoria({ ...formCategoria, icone: ic })}
                    >
                      <Ionicons
                        name={ionName}
                        size={22}
                        color={isSelected ? colors.primary : colors.text}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Cor</Text>
              <View style={styles.coresGrid}>
                {CORES_DISPONIVEIS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.corBtn,
                      { backgroundColor: c },
                      formCategoria.cor === c && styles.corBtnSelected,
                    ]}
                    onPress={() => setFormCategoria({ ...formCategoria, cor: c })}
                  />
                ))}
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Preview:</Text>
                <View style={[styles.previewItem, { borderLeftColor: formCategoria.cor }]}>
                  {renderIcone(formCategoria.icone, formCategoria.cor)}
                  <Text style={styles.previewNome}>{formCategoria.nome || 'Nome da categoria'}</Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowModal(false)}>
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSave} onPress={salvarCategoria}>
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
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconePreview: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNome: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardActions: { flexDirection: 'row', gap: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: 24, paddingBottom: 40 },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: colors.text },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
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
  checkboxRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  checkboxItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxLabel: { fontSize: 16, color: colors.text },
  iconesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  iconeBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconeBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '22',
  },
  coresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  corBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corBtnSelected: {
    borderColor: colors.text,
    borderWidth: 3,
  },
  previewRow: { marginBottom: 20 },
  previewLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  previewNome: { fontSize: 16, color: colors.text },
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
}
