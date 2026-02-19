import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';
import { formatCurrency, parseCurrencyToNumber } from '../utils/currencyMask';
import { colors } from '../theme/theme';
import Select from '../components/Select';
import BankSelector from '../components/BankSelector';
import { getBancoById } from '../utils/banks';

const tiposConta = ['Conta Corrente', 'Conta Poupança', 'Carteira', 'Cartão de Crédito', 'Investimentos', 'Outros'];

export default function ContasScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const userId = getUserId();
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Contas',
    });
  }, [navigation]);
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Form fields
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [banco, setBanco] = useState('');
  const [saldo, setSaldo] = useState('');

  useEffect(() => {
    if (userId) {
      fetchContas();
    }
  }, [userId]);

  const fetchContas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.CONTAS}?userId=${userId}`);
      // Normalizar os dados para garantir que os IDs estejam em minúscula
      const contasNormalizadas = res.data.map(conta => ({
        ...conta,
        conta_id: conta.conta_id || conta.Conta_Id || conta.id,
        conta_nome: conta.conta_nome || conta.Conta_Nome || conta.nome,
        conta_tipo: conta.conta_tipo || conta.Conta_Tipo || conta.tipo,
        conta_saldo: conta.conta_saldo || conta.Conta_Saldo || conta.saldo
      }));
      setContas(contasNormalizadas);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
      Alert.alert('Erro', 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!nome || !tipo) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const saldoNum = parseCurrencyToNumber(saldo) || 0;
      const contaData = {
        nome,
        tipo,
        banco: (banco && String(banco).trim()) ? String(banco).trim() : null,
        saldo: saldoNum,
        incrementarSaldoTotal: true,
        usuario_id: userId
      };

      if (editId) {
        await axios.put(`${API_ENDPOINTS.CONTAS}/${editId}`, { nome, tipo, banco: contaData.banco, saldo: saldoNum });
        Alert.alert('Sucesso', 'Conta atualizada com sucesso');
      } else {
        await axios.post(API_ENDPOINTS.CONTAS, contaData);
        Alert.alert('Sucesso', 'Conta adicionada com sucesso');
      }

      resetForm();
      fetchContas();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao salvar conta');
    }
  };

  const handleEdit = (conta) => {
    const contaId = conta.conta_id || conta.Conta_Id || conta.id;
    setNome(conta.conta_nome || conta.Conta_Nome || conta.nome || '');
    setTipo(conta.conta_tipo || conta.Conta_Tipo || conta.tipo || '');
    const saldoNum = parseFloat(conta.conta_saldo || conta.Conta_Saldo || conta.saldo || 0);
    setSaldo(formatCurrency(Math.round(saldoNum * 100).toString()));
    setEditId(contaId);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    // Validar ID antes de deletar
    if (!id || id === 'undefined' || id === 'null') {
      Alert.alert('Erro', 'ID da conta inválido');
      console.error('ID inválido para deletar conta:', id);
      return;
    }
    
    Alert.alert(
      'Confirmar',
      'Deseja realmente excluir esta conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deletando conta com ID:', id);
              await axios.delete(`${API_ENDPOINTS.CONTAS}/${id}`);
              fetchContas();
              Alert.alert('Sucesso', 'Conta excluída com sucesso');
            } catch (err) {
              console.error('Erro ao excluir conta:', err);
              Alert.alert('Erro', err.response?.data?.error || 'Erro ao excluir conta');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setNome('');
    setTipo('');
    setBanco('');
    setSaldo('');
    setEditId(null);
    setShowForm(false);
  };

  // Configurar header do Drawer com botão de adicionar
  useLayoutEffect(() => {
    if (navigation) {
      navigation.setOptions({
        headerRight: () => (
          <Ionicons
            name="add"
            size={28}
            color="#fff"
            style={{ marginRight: 15 }}
            onPress={() => {
              resetForm();
              setShowForm(true);
            }}
          />
        ),
      });
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Quantidade</Text>
          <Text style={styles.statValue}>{contas.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {contas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma conta encontrada</Text>
            </View>
          ) : (
            contas.map(conta => {
              // Garantir que temos o ID correto
              const contaId = conta.conta_id || conta.Conta_Id || conta.id;
              if (!contaId) {
                console.warn('Conta sem ID:', conta);
                return null;
              }
              
              return (
                <View key={contaId} style={styles.contaCard}>
                  <View style={styles.contaHeader}>
                    <View style={styles.contaInfo}>
                      <View style={styles.contaNomeRow}>
                        {(() => {
                          const b = getBancoById(conta.conta_banco || conta.Conta_Banco);
                          return b ? (
                            <View style={[styles.bankBadge, { backgroundColor: b.cor }]}>
                              <Text style={styles.bankBadgeText}>{b.abbr}</Text>
                            </View>
                          ) : null;
                        })()}
                        <Text style={styles.contaNome}>{conta.conta_nome || conta.Conta_Nome || conta.nome}</Text>
                      </View>
                      <Text style={styles.contaTipo}>{conta.conta_tipo || conta.Conta_Tipo || conta.tipo}</Text>
                    </View>
                    <Text style={styles.contaSaldo}>{formatarValor(conta.conta_saldo || conta.Conta_Saldo || conta.saldo || 0)}</Text>
                  </View>
                  <View style={styles.contaActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEdit(conta)}
                    >
                      <Ionicons name="create" size={20} color={colors.primary} />
                      <Text style={styles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(contaId)}
                    >
                      <Ionicons name="trash" size={20} color={colors.error} />
                      <Text style={styles.actionButtonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }).filter(Boolean)
          )}
        </ScrollView>
      )}

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editId ? 'Editar Conta' : 'Nova Conta'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Nome da Conta *</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: Banco do Brasil"
              />

              <Text style={styles.label}>Tipo *</Text>
              <Select
                value={tipo}
                options={tiposConta.map(t => ({ label: t, value: t }))}
                onChange={setTipo}
                placeholder="Selecione o tipo de conta"
              />

              <BankSelector
                value={banco}
                onChange={setBanco}
                placeholder="Selecione o banco"
                label="Banco"
              />

              <Text style={styles.label}>Saldo Inicial</Text>
              <TextInput
                style={styles.input}
                value={saldo}
                onChangeText={(text) => {
                  const numbers = text.replace(/\D/g, '');
                  setSaldo(formatCurrency(numbers));
                }}
                placeholder="0,00"
                keyboardType="number-pad"
              />

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonCancel]}
                  onPress={resetForm}
                >
                  <Text style={styles.formButtonTextCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonSave]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.formButtonTextSave}>
                    {editId ? 'Atualizar' : 'Salvar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  contaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contaInfo: {
    flex: 1,
  },
  contaNomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bankBadge: {
    width: 28,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  contaNome: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  contaTipo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contaSaldo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  contaActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  formContainer: {
    maxHeight: 500,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonCancel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formButtonSave: {
    backgroundColor: colors.primary,
  },
  formButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  formButtonTextSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

