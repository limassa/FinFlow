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
  Modal,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor, formatarData, formatarDataInput, gerarOpcoesMeses } from '../utils/formatters';
import { formatCurrency, parseCurrencyToNumber } from '../utils/currencyMask';
import { colors } from '../theme/theme';
import DatePicker from '../components/DatePicker';
import Select from '../components/Select';

const tiposDespesa = ['Alimentaâ”œÂºâ”œÃºo', 'Transporte', 'Saâ”œâ•‘de', 'Moradia', 'Aluguel', 'Outros', 'Veâ”œÂ¡culos'];

export default function DespesaScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [despesas, setDespesas] = useState([]);
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mesFiltro, setMesFiltro] = useState('');
  
  // Form fields
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(''); // Armazena apenas nâ”œâ•‘meros
  const [valorDisplay, setValorDisplay] = useState(''); // Valor formatado para exibiâ”œÂºâ”œÃºo
  const [data, setData] = useState(null); // Date object
  const [dataVencimento, setDataVencimento] = useState(null); // Date object
  const [tipo, setTipo] = useState('');
  const [contaId, setContaId] = useState('');
  const [pago, setPago] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState('mensal');
  const [proximasParcelas, setProximasParcelas] = useState('12');

  useEffect(() => {
    if (userId) {
      fetchDespesas();
      fetchContas();
    }
  }, [userId, mesFiltro]);

  const fetchDespesas = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.DESPESAS}?userId=${userId}`;
      if (mesFiltro) {
        url += `&mes=${mesFiltro}`;
      }
      const res = await axios.get(url);
      // Normalizar os dados para garantir que os campos estejam em minâ”œâ•‘scula
      const despesasNormalizadas = res.data.map(despesa => ({
        ...despesa,
        despesa_id: despesa.despesa_id || despesa.Despesa_Id || despesa.id,
        despesa_descricao: despesa.despesa_descricao || despesa.Despesa_Descricao || despesa.descricao,
        despesa_valor: despesa.despesa_valor || despesa.Despesa_Valor || despesa.valor || 0,
        despesa_data: despesa.despesa_data || despesa.Despesa_Data || despesa.data,
        despesa_dtvencimento: despesa.despesa_dtvencimento || despesa.Despesa_DtVencimento || despesa.dataVencimento,
        despesa_tipo: despesa.despesa_tipo || despesa.Despesa_Tipo || despesa.tipo,
        despesa_pago: despesa.despesa_pago !== undefined ? despesa.despesa_pago : (despesa.Despesa_Pago !== undefined ? despesa.Despesa_Pago : false),
        conta_id: despesa.conta_id || despesa.Conta_id || despesa.Conta_Id || despesa.contaId || null
      }));
      setDespesas(despesasNormalizadas);
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
      Alert.alert('Erro', 'Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  };

  const fetchContas = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.CONTAS}?userId=${userId}`);
      // Normalizar os dados para garantir que os IDs estejam em minâ”œâ•‘scula
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
    }
  };

  const handleSubmit = async () => {
    if (!descricao || !valor || !data || !tipo) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatâ”œâ”‚rios');
      return;
    }

    // Validar se o valor â”œÂ® maior que zero
    const valorNumerico = parseCurrencyToNumber(valorDisplay || formatCurrency(valor));
    if (valorNumerico <= 0) {
      Alert.alert('Erro', 'O valor deve ser maior que zero');
      return;
    }

    try {
      // Converter valor formatado para nâ”œâ•‘mero (jâ”œÃ­ validado acima)
      const valorNumerico = parseCurrencyToNumber(valorDisplay || formatCurrency(valor));
      // Converter datas para formato YYYY-MM-DD
      const dataFormatada = data ? data.toISOString().split('T')[0] : '';
      const dataVencimentoFormatada = dataVencimento ? dataVencimento.toISOString().split('T')[0] : '';

      const despesaData = {
        descricao,
        valor: valorNumerico.toString(),
        data: dataFormatada,
        dataVencimento: dataVencimentoFormatada,
        tipo,
        pago,
        conta_id: contaId || null,
        usuario_id: userId,
        recorrente,
        frequencia,
        proximasParcelas: parseInt(proximasParcelas) || 12
      };

      if (editId) {
        await axios.put(`${API_ENDPOINTS.DESPESAS}/${editId}`, despesaData);
        Alert.alert('Sucesso', 'Despesa atualizada com sucesso');
      } else {
        await axios.post(API_ENDPOINTS.DESPESAS, despesaData);
        Alert.alert('Sucesso', recorrente ? 'Despesas recorrentes criadas com sucesso!' : 'Despesa adicionada com sucesso');
      }

      resetForm();
      fetchDespesas();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao salvar despesa');
    }
  };

  const handleEdit = (despesa) => {
    // Normalizar campos antes de editar
    const despesaId = despesa.despesa_id || despesa.Despesa_Id || despesa.id;
    const despesaDescricao = despesa.despesa_descricao || despesa.Despesa_Descricao || despesa.descricao || '';
    const despesaValor = despesa.despesa_valor || despesa.Despesa_Valor || despesa.valor || 0;
    const despesaData = despesa.despesa_data || despesa.Despesa_Data || despesa.data;
    const despesaDtVencimento = despesa.despesa_dtvencimento || despesa.Despesa_DtVencimento || despesa.dataVencimento;
    const despesaTipo = despesa.despesa_tipo || despesa.Despesa_Tipo || despesa.tipo || '';
    const despesaPago = despesa.despesa_pago !== undefined ? despesa.despesa_pago : (despesa.Despesa_Pago !== undefined ? despesa.Despesa_Pago : false);
    const despesaContaId = despesa.conta_id || despesa.Conta_id || despesa.Conta_Id || despesa.contaId || null;
    
    setDescricao(despesaDescricao);
    // Converter valor para formato de mâ”œÃ­scara
    const valorNum = despesaValor ? despesaValor.toString().replace(/\D/g, '') : '';
    setValor(valorNum);
    setValorDisplay(formatCurrency(valorNum));
    // Converter datas string para Date object
    setData(despesaData ? new Date(despesaData) : null);
    setDataVencimento(despesaDtVencimento ? new Date(despesaDtVencimento) : null);
    setTipo(despesaTipo);
    setPago(despesaPago);
    setContaId(despesaContaId ? despesaContaId.toString() : '');
    setEditId(despesaId);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente excluir esta despesa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_ENDPOINTS.DESPESAS}/${id}`);
              fetchDespesas();
              Alert.alert('Sucesso', 'Despesa excluâ”œÂ¡da com sucesso');
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir despesa');
            }
          }
        }
      ]
    );
  };

  const handleTogglePago = async (despesa) => {
    try {
      await axios.put(`${API_ENDPOINTS.PARCELA_ATUAL_DESPESA}/${despesa.despesa_id}`, {
        status: !despesa.despesa_pago
      });
      fetchDespesas();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setDescricao('');
    setValor('');
    setValorDisplay('');
    setData(null);
    setDataVencimento(null);
    setTipo('');
    setContaId('');
    setPago(false);
    setRecorrente(false);
    setFrequencia('mensal');
    setProximasParcelas('12');
    setEditId(null);
    setShowForm(false);
  };

  // Configurar header do Drawer com botâ”œÃºo de adicionar
  useLayoutEffect(() => {
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
  }, [navigation]);

  const totalDespesas = despesas
    .filter(d => d.despesa_pago)
    .reduce((sum, d) => sum + parseFloat(d.despesa_valor || 0), 0);

  const opcoesMeses = gerarOpcoesMeses();

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{formatarValor(totalDespesas)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Quantidade</Text>
          <Text style={styles.statValue}>{despesas.length}</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por mâ”œÂ¬s:</Text>
        <Select
          value={mesFiltro}
          options={[
            { label: 'Todos os meses', value: '' },
            ...opcoesMeses.map(m => ({ label: m.label, value: m.value }))
          ]}
          onChange={setMesFiltro}
          placeholder="Selecione o mâ”œÂ¬s"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {despesas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma despesa encontrada</Text>
            </View>
          ) : (
            despesas.map(despesa => {
              const conta = contas.find(c => c.conta_id === despesa.conta_id);
              return (
                <View key={despesa.despesa_id} style={styles.despesaCard}>
                  <View style={styles.despesaHeader}>
                    <View style={styles.despesaInfo}>
                      <Text style={styles.despesaDescricao}>{despesa.despesa_descricao}</Text>
                      <Text style={styles.despesaValor}>{formatarValor(despesa.despesa_valor)}</Text>
                    </View>
                    <Switch
                      value={despesa.despesa_pago || false}
                      onValueChange={() => handleTogglePago(despesa)}
                    />
                  </View>
                  <View style={styles.despesaDetails}>
                    <Text style={styles.despesaDetail}>
                      <Ionicons name="calendar" size={14} /> {formatarData(despesa.despesa_data)}
                    </Text>
                    {despesa.despesa_dtvencimento && (
                      <Text style={styles.despesaDetail}>
                        <Ionicons name="time" size={14} /> Venc: {formatarData(despesa.despesa_dtvencimento)}
                      </Text>
                    )}
                    <Text style={styles.despesaDetail}>
                      <Ionicons name="pricetag" size={14} /> {despesa.despesa_tipo}
                    </Text>
                    {conta && (
                      <Text style={styles.despesaDetail}>
                        <Ionicons name="wallet" size={14} /> {conta.conta_nome}
                      </Text>
                    )}
                  </View>
                  <View style={styles.despesaActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEdit(despesa)}
                    >
                      <Ionicons name="create" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(despesa.despesa_id)}
                    >
                      <Ionicons name="trash" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
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
                {editId ? 'Editar Despesa' : 'Nova Despesa'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Descriâ”œÂºâ”œÃºo *</Text>
              <TextInput
                style={styles.input}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descriâ”œÂºâ”œÃºo da despesa"
              />

              <Text style={styles.label}>Valor *</Text>
              <TextInput
                style={styles.input}
                value={valorDisplay || formatCurrency(valor)}
                onChangeText={(text) => {
                  // Remove tudo que nâ”œÃºo â”œÂ® nâ”œâ•‘mero
                  const numbers = text.replace(/\D/g, '');
                  setValor(numbers);
                  // Formata para exibiâ”œÂºâ”œÃºo
                  setValorDisplay(formatCurrency(numbers));
                }}
                placeholder="0,00"
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Data *</Text>
              <DatePicker
                value={data}
                onChange={(selectedDate) => setData(selectedDate)}
                placeholder="Selecione a data"
              />

              <Text style={styles.label}>Data de Vencimento</Text>
              <DatePicker
                value={dataVencimento}
                onChange={(selectedDate) => setDataVencimento(selectedDate)}
                placeholder="Selecione a data de vencimento"
              />

              <Text style={styles.label}>Tipo *</Text>
              <Select
                value={tipo}
                options={tiposDespesa.map(t => ({ label: t, value: t }))}
                onChange={setTipo}
                placeholder="Selecione o tipo"
              />

              <Text style={styles.label}>Conta</Text>
              <Select
                value={contaId}
                options={[
                  { label: 'Nenhuma', value: '' },
                  ...contas.map(c => {
                    const cId = c.conta_id || c.Conta_Id || c.id;
                    const cNome = c.conta_nome || c.Conta_Nome || c.nome || 'Sem nome';
                    return { 
                      label: cNome, 
                      value: cId ? cId.toString() : '' 
                    };
                  }).filter(c => c.value !== '')
                ]}
                onChange={setContaId}
                placeholder="Selecione uma conta"
              />

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Pago</Text>
                <Switch value={pago} onValueChange={setPago} />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Recorrente</Text>
                <Switch value={recorrente} onValueChange={setRecorrente} />
              </View>

              {recorrente && (
                <>
                  <Text style={styles.label}>Frequâ”œÂ¬ncia</Text>
                  <Select
                    value={frequencia}
                    options={[
                      { label: 'Mensal', value: 'mensal' },
                      { label: 'Semanal', value: 'semanal' },
                      { label: 'Quinzenal', value: 'quinzenal' }
                    ]}
                    onChange={setFrequencia}
                    placeholder="Selecione a frequâ”œÂ¬ncia"
                  />

                  <Text style={styles.label}>Nâ”œâ•‘mero de Parcelas</Text>
                  <TextInput
                    style={styles.input}
                    value={proximasParcelas}
                    onChangeText={setProximasParcelas}
                    placeholder="12"
                    keyboardType="number-pad"
                  />
                </>
              )}

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
  homeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
  despesaCard: {
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
  despesaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  despesaInfo: {
    flex: 1,
  },
  despesaDescricao: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  despesaValor: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f44336',
  },
  despesaDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  despesaDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  despesaActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    padding: 8,
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
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectText: {
    fontSize: 14,
    color: colors.text,
  },
  selectTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
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

