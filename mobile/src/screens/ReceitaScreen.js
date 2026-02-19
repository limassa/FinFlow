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
import AccountSelector from '../components/AccountSelector';
import { getBancoById } from '../utils/banks';

const tiposReceita = ['Salário', 'Venda', 'Presente', 'Investimento', 'Aluguel', 'Outros'];

export default function ReceitaScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [receitas, setReceitas] = useState([]);
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mesFiltro, setMesFiltro] = useState('');
  const [filtroRecebido, setFiltroRecebido] = useState('todos');
  
  // Form fields
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(''); // Armazena apenas números
  const [valorDisplay, setValorDisplay] = useState(''); // Valor formatado para exibição
  const [data, setData] = useState(null); // Date object
  const [tipo, setTipo] = useState('');
  const [contaId, setContaId] = useState('');
  const [recebido, setRecebido] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState('mensal');
  const [proximasParcelas, setProximasParcelas] = useState('12');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchReceitas();
      fetchContas();
    }
  }, [userId, mesFiltro]);

  const fetchReceitas = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.RECEITAS}?userId=${userId}`;
      if (mesFiltro) {
        url += `&mes=${mesFiltro}`;
      }
      const res = await axios.get(url);
      // Normalizar os dados para garantir que os campos estejam em minúscula
      const receitasNormalizadas = res.data.map(receita => ({
        ...receita,
        receita_id: receita.receita_id || receita.Receita_Id || receita.id,
        receita_descricao: receita.receita_descricao || receita.Receita_Descricao || receita.descricao,
        receita_valor: receita.receita_valor || receita.Receita_Valor || receita.valor || 0,
        receita_data: receita.receita_data || receita.Receita_Data || receita.data,
        receita_tipo: receita.receita_tipo || receita.Receita_Tipo || receita.tipo,
        receita_recebido: receita.receita_recebido !== undefined ? receita.receita_recebido : (receita.Receita_Recebido !== undefined ? receita.Receita_Recebido : false),
        conta_id: receita.conta_id || receita.Conta_id || receita.Conta_Id || receita.contaId || null
      }));
      setReceitas(receitasNormalizadas);
    } catch (err) {
      console.error('Erro ao buscar receitas:', err);
      Alert.alert('Erro', 'Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  };

  const fetchContas = async () => {
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
    }
  };

  const handleSubmit = async () => {
    if (!descricao || !valor || !data || !tipo) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Validar se o valor é maior que zero
    const valorNumerico = parseCurrencyToNumber(valorDisplay || formatCurrency(valor));
    if (valorNumerico <= 0) {
      Alert.alert('Erro', 'O valor deve ser maior que zero');
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      // Converter valor formatado para número (já validado acima)
      const valorNumerico = parseCurrencyToNumber(valorDisplay || formatCurrency(valor));
      // Converter data para formato YYYY-MM-DD
      const dataFormatada = data ? data.toISOString().split('T')[0] : '';

      const receitaData = {
        descricao,
        valor: valorNumerico.toString(),
        data: dataFormatada,
        tipo,
        recebido,
        conta_id: contaId || null,
        usuario_id: userId,
        recorrente,
        frequencia,
        proximasParcelas: parseInt(proximasParcelas) || 12
      };

      if (editId) {
        await axios.put(`${API_ENDPOINTS.RECEITAS}/${editId}`, receitaData);
        Alert.alert('Sucesso', 'Receita atualizada com sucesso');
      } else {
        await axios.post(API_ENDPOINTS.RECEITAS, receitaData);
        Alert.alert('Sucesso', recorrente ? 'Receitas recorrentes criadas com sucesso!' : 'Receita adicionada com sucesso');
      }

      resetForm();
      fetchReceitas();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao salvar receita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (receita) => {
    // Normalizar campos antes de editar
    const receitaId = receita.receita_id || receita.Receita_Id || receita.id;
    const receitaDescricao = receita.receita_descricao || receita.Receita_Descricao || receita.descricao || '';
    const receitaValor = receita.receita_valor || receita.Receita_Valor || receita.valor || 0;
    const receitaData = receita.receita_data || receita.Receita_Data || receita.data;
    const receitaTipo = receita.receita_tipo || receita.Receita_Tipo || receita.tipo || '';
    const receitaRecebido = receita.receita_recebido !== undefined ? receita.receita_recebido : (receita.Receita_Recebido !== undefined ? receita.Receita_Recebido : false);
    const receitaContaId = receita.conta_id || receita.Conta_id || receita.Conta_Id || receita.contaId || null;
    
    setDescricao(receitaDescricao);
    // Converter valor para formato de máscara
    const valorNum = receitaValor ? receitaValor.toString().replace(/\D/g, '') : '';
    setValor(valorNum);
    setValorDisplay(formatCurrency(valorNum));
    // Converter data string para Date object
    setData(receitaData ? new Date(receitaData) : null);
    setTipo(receitaTipo);
    setRecebido(receitaRecebido);
    setContaId(receitaContaId ? receitaContaId.toString() : '');
    setEditId(receitaId);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente excluir esta receita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_ENDPOINTS.RECEITAS}/${id}`);
              setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
              fetchReceitas();
              Alert.alert('Sucesso', 'Receita excluída com sucesso');
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir receita');
            }
          }
        }
      ]
    );
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === receitasFiltradas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(receitasFiltradas.map(r => r.receita_id)));
    }
  };

  const handleDeleteSelected = () => {
    const qtd = selectedIds.size;
    if (qtd === 0) return;
    Alert.alert(
      'Confirmar',
      `Deseja realmente excluir ${qtd} receita(s) selecionada(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingInProgress(true);
            try {
              for (const id of selectedIds) {
                await axios.delete(`${API_ENDPOINTS.RECEITAS}/${id}`);
              }
              setSelectedIds(new Set());
              fetchReceitas();
              Alert.alert('Sucesso', `${qtd} receita(s) excluída(s) com sucesso`);
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir receitas');
            } finally {
              setDeletingInProgress(false);
            }
          }
        }
      ]
    );
  };

  const receitasFiltradas = React.useMemo(() => {
    if (filtroRecebido === 'todos') return receitas;
    if (filtroRecebido === 'recebido') return receitas.filter(r => r.receita_recebido);
    return receitas.filter(r => !r.receita_recebido);
  }, [receitas, filtroRecebido]);

  const receitasPorTipo = React.useMemo(() => {
    const grupos = {};
    receitasFiltradas.forEach(r => {
      const tipoKey = r.receita_tipo || 'Sem tipo';
      if (!grupos[tipoKey]) grupos[tipoKey] = [];
      grupos[tipoKey].push(r);
    });
    const ordem = [...tiposReceita];
    const outrosTipos = Object.keys(grupos).filter(t => !ordem.includes(t)).sort();
    const ordemFinal = [...ordem.filter(t => grupos[t]), ...outrosTipos];
    return ordemFinal.map(tipo => {
      const itens = grupos[tipo];
      const ordenados = [...itens].sort((a, b) => {
        const dataA = (a.receita_data || '').split('T')[0];
        const dataB = (b.receita_data || '').split('T')[0];
        return dataA.localeCompare(dataB);
      });
      return { tipo, itens: ordenados };
    });
  }, [receitasFiltradas]);

  const handleDeleteGroup = (tipoGrupo, itens) => {
    const qtd = itens.length;
    if (qtd === 0) return;
    Alert.alert(
      'Confirmar',
      `Excluir todas as ${qtd} receita(s) do tipo "${tipoGrupo}"? Esta ação pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingInProgress(true);
            try {
              for (const r of itens) {
                await axios.delete(`${API_ENDPOINTS.RECEITAS}/${r.receita_id}`);
              }
              setSelectedIds(prev => {
                const next = new Set(prev);
                itens.forEach(r => next.delete(r.receita_id));
                return next;
              });
              fetchReceitas();
              Alert.alert('Sucesso', `${qtd} receita(s) excluída(s) com sucesso`);
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir receitas');
            } finally {
              setDeletingInProgress(false);
            }
          }
        }
      ]
    );
  };

  const handleToggleRecebido = async (receita) => {
    try {
      await axios.put(`${API_ENDPOINTS.PARCELA_ATUAL_RECEITA}/${receita.receita_id}`, {
        status: !receita.receita_recebido
      });
      fetchReceitas();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setDescricao('');
    setValor('');
    setValorDisplay('');
    setData(null);
    setTipo('');
    setContaId('');
    setRecebido(false);
    setRecorrente(false);
    setFrequencia('mensal');
    setProximasParcelas('12');
    setEditId(null);
    setShowForm(false);
  };

  const totalReceitas = receitasFiltradas
    .filter(r => r.receita_recebido)
    .reduce((sum, r) => sum + parseFloat(r.receita_valor || 0), 0);

  const previsaoReceitas = receitasFiltradas
    .reduce((sum, r) => sum + parseFloat(r.receita_valor || 0), 0);

  const opcoesMeses = gerarOpcoesMeses();

  // Função para abrir formulário de nova receita
  const handleAddPress = React.useCallback(() => {
    console.log('Botão adicionar clicado');
    // Resetar formulário e abrir modal
    setDescricao('');
    setValor('');
    setValorDisplay('');
    setData(null);
    setTipo('');
    setContaId('');
    setRecebido(false);
    setRecorrente(false);
    setFrequencia('mensal');
    setProximasParcelas('12');
    setEditId(null);
    setShowForm(true);
  }, []);

  // Configurar header com botão de adicionar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Receitas',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleAddPress}
          style={{ marginRight: 15, padding: 5 }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleAddPress]);

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{formatarValor(totalReceitas)}</Text>
        </View>
        <View style={[styles.statCard, styles.statCardPrevisao]}>
          <Text style={styles.statLabel}>Previsão</Text>
          <Text style={styles.statValuePrevisao}>{formatarValor(previsaoReceitas)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Quantidade</Text>
          <Text style={styles.statValue}>{receitasFiltradas.length}</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por mês:</Text>
        <Select
          value={mesFiltro}
          options={[
            { label: 'Todos os meses', value: '' },
            ...opcoesMeses.map(m => ({ label: m.label, value: m.value }))
          ]}
          onChange={setMesFiltro}
          placeholder="Selecione o mês"
        />
        <Text style={styles.filterLabel}>Status:</Text>
        <Select
          value={filtroRecebido}
          options={[
            { label: 'Todos', value: 'todos' },
            { label: 'Recebido', value: 'recebido' },
            { label: 'Não recebido', value: 'nao_recebido' }
          ]}
          onChange={setFiltroRecebido}
          placeholder="Status"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {receitasFiltradas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhuma receita encontrada{filtroRecebido !== 'todos' ? ' com esse filtro' : ''}
              </Text>
            </View>
          ) : (
            <>
              {receitasFiltradas.length > 0 && (
                <View style={styles.selectAllRow}>
                  <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
                    <Ionicons
                      name={selectedIds.size === receitasFiltradas.length ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={colors.primary}
                    />
                    <Text style={styles.selectAllText}>
                      {selectedIds.size === receitasFiltradas.length ? 'Desmarcar todas' : 'Selecionar todas'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {selectedIds.size > 0 && (
                <View style={styles.bulkActionsRow}>
                  <Text style={styles.bulkCount}>{selectedIds.size} selecionada(s)</Text>
                  <TouchableOpacity style={styles.bulkDeleteButton} onPress={handleDeleteSelected}>
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.bulkDeleteText}>Excluir selecionadas</Text>
                  </TouchableOpacity>
                </View>
              )}
              {receitasPorTipo.map(({ tipo: tipoGrupo, itens }) => (
                <View key={tipoGrupo}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupHeaderText}>{tipoGrupo}</Text>
                    <View style={styles.groupHeaderActions}>
                      <TouchableOpacity
                        style={styles.groupEditButton}
                        onPress={() => itens.length > 0 && handleEdit(itens[0])}
                      >
                        <Ionicons name="create" size={18} color={colors.primary} />
                        <Text style={styles.groupEditText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.groupDeleteButton}
                        onPress={() => handleDeleteGroup(tipoGrupo, itens)}
                      >
                        <Ionicons name="trash" size={18} color={colors.error} />
                        <Text style={styles.groupDeleteText}>Excluir grupo ({itens.length})</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {itens.map(receita => {
                    const conta = contas.find(c => c.conta_id === receita.conta_id);
                    const isSelected = selectedIds.has(receita.receita_id);
                    return (
                      <View key={receita.receita_id} style={styles.receitaCard}>
                        <TouchableOpacity
                          style={styles.cardCheckbox}
                          onPress={() => toggleSelect(receita.receita_id)}
                        >
                          <Ionicons
                            name={isSelected ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <View style={styles.receitaCardContent}>
                          <View style={styles.receitaHeader}>
                            <View style={styles.receitaInfo}>
                              <Text style={styles.receitaDescricao}>{receita.receita_descricao}</Text>
                              <Text style={styles.receitaValor}>{formatarValor(receita.receita_valor)}</Text>
                            </View>
                            <Switch
                              value={receita.receita_recebido || false}
                              onValueChange={() => handleToggleRecebido(receita)}
                            />
                          </View>
                          <View style={styles.receitaDetails}>
                            <Text style={styles.receitaDetail}>
                              <Ionicons name="calendar" size={14} /> {formatarData(receita.receita_data)}
                            </Text>
                            <Text style={styles.receitaDetail}>
                              <Ionicons name="pricetag" size={14} /> {receita.receita_tipo}
                            </Text>
                            {conta && (
                              <View style={styles.receitaDetail}>
                                {(() => {
                                  const b = getBancoById(conta.conta_banco || conta.Conta_Banco);
                                  return b ? (
                                    <View style={styles.contaBadgeRow}>
                                      <View style={[styles.contaBankBadge, { backgroundColor: b.cor }]}>
                                        <Text style={styles.contaBankBadgeText}>{b.abbr}</Text>
                                      </View>
                                      <Text style={styles.contaNomeText}>{conta.conta_nome}</Text>
                                    </View>
                                  ) : (
                                    <View style={styles.contaBadgeRow}>
                                      <Ionicons name="wallet" size={14} color={colors.textSecondary} />
                                      <Text style={styles.contaNomeText}>{conta.conta_nome}</Text>
                                    </View>
                                  );
                                })()}
                              </View>
                            )}
                          </View>
                          <View style={styles.receitaActions}>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleEdit(receita)}
                            >
                              <Ionicons name="create" size={20} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleDelete(receita.receita_id)}
                            >
                              <Ionicons name="trash" size={20} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </>
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
                {editId ? 'Editar Receita' : 'Nova Receita'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={styles.input}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição da receita"
              />

              <Text style={styles.label}>Valor *</Text>
              <TextInput
                style={styles.input}
                value={valorDisplay || formatCurrency(valor)}
                onChangeText={(text) => {
                  // Remove tudo que não é número
                  const numbers = text.replace(/\D/g, '');
                  setValor(numbers);
                  // Formata para exibição
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

              <Text style={styles.label}>Tipo *</Text>
              <Select
                value={tipo}
                options={tiposReceita.map(t => ({ label: t, value: t }))}
                onChange={setTipo}
                placeholder="Selecione o tipo"
              />

              <AccountSelector
                value={contaId}
                onChange={(id) => setContaId(id ? String(id) : '')}
                contas={contas}
                placeholder="Selecione uma conta"
                label="Conta"
              />

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Recebido</Text>
                <Switch value={recebido} onValueChange={setRecebido} />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Recorrente</Text>
                <Switch value={recorrente} onValueChange={setRecorrente} />
              </View>

              {recorrente && (
                <>
                  <Text style={styles.label}>Frequência</Text>
                  <Select
                    value={frequencia}
                    options={[
                      { label: 'Mensal', value: 'mensal' },
                      { label: 'Semanal', value: 'semanal' },
                      { label: 'Quinzenal', value: 'quinzenal' }
                    ]}
                    onChange={setFrequencia}
                    placeholder="Selecione a frequência"
                  />

                  <Text style={styles.label}>Número de Parcelas</Text>
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
                  style={[styles.formButton, styles.formButtonSave, submitting && styles.formButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.formButtonTextSave}>
                        {recorrente && !editId ? `Processando ${proximasParcelas || 0} parcelas...` : 'Processando...'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.formButtonTextSave}>
                      {editId ? 'Atualizar' : 'Salvar'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {deletingInProgress && (
        <View style={styles.processingDeleteBar}>
          <Text style={styles.processingDeleteText}>Processando exclusão... Aguarde.</Text>
        </View>
      )}
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
  statCardPrevisao: {
    flex: 0.9,
  },
  statValuePrevisao: {
    fontSize: 16,
    fontWeight: '600',
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
  selectAllRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    marginBottom: 8,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  bulkActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  bulkCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  bulkDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bulkDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8ecf4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  groupHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  groupHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  groupEditText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  groupDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  groupDeleteText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  receitaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  cardCheckbox: {
    marginRight: 12,
    paddingTop: 2,
  },
  receitaCardContent: {
    flex: 1,
  },
  receitaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  receitaInfo: {
    flex: 1,
  },
  receitaDescricao: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  receitaValor: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4caf50',
  },
  receitaDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  receitaDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  receitaDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  contaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contaBankBadge: {
    width: 24,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contaBankBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  contaNomeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  receitaActions: {
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
  formButtonDisabled: {
    opacity: 0.7,
  },
  processingDeleteBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e3a5f',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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

