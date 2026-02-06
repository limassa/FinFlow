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

const tiposDespesa = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Moradia',
  'Aluguel',
  'Outros',
  'Veículos',
  'Poupança',
  'Investimento',
  'Educação',
  'Lazer',
  'Presentes'
];

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
  const [filtroPago, setFiltroPago] = useState('todos');
  
  // Form fields
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(''); // Armazena apenas números
  const [valorDisplay, setValorDisplay] = useState(''); // Valor formatado para exibição
  const [data, setData] = useState(null); // Date object
  const [dataVencimento, setDataVencimento] = useState(null); // Date object
  const [tipo, setTipo] = useState('');
  const [contaId, setContaId] = useState('');
  const [pago, setPago] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState('mensal');
  const [proximasParcelas, setProximasParcelas] = useState('12');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  // Metas
  const [metas, setMetas] = useState([]);
  const [mostrarMetas, setMostrarMetas] = useState(false);
  const [metaCategoria, setMetaCategoria] = useState('');
  const [metaValor, setMetaValor] = useState('');

  useEffect(() => {
    if (userId) {
      fetchDespesas();
      fetchContas();
      fetchMetas();
    }
  }, [userId, mesFiltro]);

  const fetchMetas = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_ENDPOINTS.METAS_DESPESA}?userId=${userId}`);
      setMetas(res.data || []);
    } catch (err) {
      console.log('Erro ao buscar metas:', err);
    }
  };

  const fetchDespesas = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.DESPESAS}?userId=${userId}`;
      if (mesFiltro) {
        url += `&mes=${mesFiltro}`;
      }
      const res = await axios.get(url);
      // Normalizar os dados para garantir que os campos estejam em minúscula
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
    } finally {
      setSubmitting(false);
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
    // Converter valor para formato de máscara
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
              setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
              fetchDespesas();
              Alert.alert('Sucesso', 'Despesa excluída com sucesso');
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir despesa');
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
    if (selectedIds.size === despesasFiltradas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(despesasFiltradas.map(d => d.despesa_id)));
    }
  };

  const handleDeleteSelected = () => {
    const qtd = selectedIds.size;
    if (qtd === 0) return;
    Alert.alert(
      'Confirmar',
      `Deseja realmente excluir ${qtd} despesa(s) selecionada(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingInProgress(true);
            try {
              for (const id of selectedIds) {
                await axios.delete(`${API_ENDPOINTS.DESPESAS}/${id}`);
              }
              setSelectedIds(new Set());
              fetchDespesas();
              Alert.alert('Sucesso', `${qtd} despesa(s) excluída(s) com sucesso`);
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir despesas');
            } finally {
              setDeletingInProgress(false);
            }
          }
        }
      ]
    );
  };

  const despesasFiltradas = React.useMemo(() => {
    if (filtroPago === 'todos') return despesas;
    if (filtroPago === 'pago') return despesas.filter(d => d.despesa_pago);
    return despesas.filter(d => !d.despesa_pago);
  }, [despesas, filtroPago]);

  const despesasPorTipo = React.useMemo(() => {
    const grupos = {};
    despesasFiltradas.forEach(d => {
      const tipoKey = d.despesa_tipo || 'Sem tipo';
      if (!grupos[tipoKey]) grupos[tipoKey] = [];
      grupos[tipoKey].push(d);
    });
    const ordem = [...tiposDespesa];
    const outrosTipos = Object.keys(grupos).filter(t => !ordem.includes(t)).sort();
    const ordemFinal = [...ordem.filter(t => grupos[t]), ...outrosTipos];
    return ordemFinal.map(tipo => {
      const itens = grupos[tipo];
      const ordenados = [...itens].sort((a, b) => {
        const dataA = (a.despesa_data || '').split('T')[0];
        const dataB = (b.despesa_data || '').split('T')[0];
        return dataA.localeCompare(dataB);
      });
      return { tipo, itens: ordenados };
    });
  }, [despesasFiltradas]);

  const handleDeleteGroup = (tipoGrupo, itens) => {
    const qtd = itens.length;
    if (qtd === 0) return;
    Alert.alert(
      'Confirmar',
      `Excluir todas as ${qtd} despesa(s) do tipo "${tipoGrupo}"? Esta ação pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingInProgress(true);
            try {
              for (const d of itens) {
                await axios.delete(`${API_ENDPOINTS.DESPESAS}/${d.despesa_id}`);
              }
              setSelectedIds(prev => {
                const next = new Set(prev);
                itens.forEach(d => next.delete(d.despesa_id));
                return next;
              });
              fetchDespesas();
              Alert.alert('Sucesso', `${qtd} despesa(s) excluída(s) com sucesso`);
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir despesas');
            } finally {
              setDeletingInProgress(false);
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

  // Configurar header do Drawer com botão de adicionar
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

  const totalDespesas = despesasFiltradas
    .filter(d => d.despesa_pago)
    .reduce((sum, d) => sum + parseFloat(d.despesa_valor || 0), 0);

  const previsaoDespesas = despesasFiltradas
    .reduce((sum, d) => sum + parseFloat(d.despesa_valor || 0), 0);

  const opcoesMeses = gerarOpcoesMeses();

  // Totais por categoria (para metas) - apenas despesas pagas do mês filtrado
  const totaisPorCategoria = () => {
    const totais = {};
    const mesAtual = mesFiltro || new Date().toISOString().slice(0, 7);
    despesasFiltradas
      .filter(d => d.despesa_pago && (d.despesa_data || '').slice(0, 7) === mesAtual)
      .forEach(d => {
        const tipo = d.despesa_tipo || 'Outros';
        totais[tipo] = (totais[tipo] || 0) + parseFloat(d.despesa_valor || 0);
      });
    return totais;
  };
  const totalGeralMetas = () => {
    return Object.values(totaisPorCategoria()).reduce((s, v) => s + v, 0);
  };

  const handleSalvarMeta = async () => {
    if (!metaCategoria || !metaValor) {
      Alert.alert('Atenção', 'Preencha categoria e % da meta');
      return;
    }
    try {
      const hoje = new Date();
      await axios.post(API_ENDPOINTS.METAS_DESPESA, {
        categoria: metaCategoria,
        valor_meta: parseFloat(metaValor.replace(',', '.')),
        periodo: 'mensal',
        mes: hoje.getMonth() + 1,
        ano: hoje.getFullYear(),
        usuario_id: userId
      });
      setMetaCategoria('');
      setMetaValor('');
      fetchMetas();
      Alert.alert('Sucesso', 'Meta salva com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar meta:', err);
      Alert.alert('Erro', 'Erro ao salvar meta');
    }
  };

  const handleExcluirMeta = (metaId) => {
    Alert.alert(
      'Excluir meta',
      'Deseja realmente excluir esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_ENDPOINTS.METAS_DESPESA}/${metaId}`);
              fetchMetas();
              Alert.alert('Sucesso', 'Meta excluída com sucesso!');
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir meta');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{formatarValor(totalDespesas)}</Text>
        </View>
        <View style={[styles.statCard, styles.statCardPrevisao]}>
          <Text style={styles.statLabel}>Previsão</Text>
          <Text style={styles.statValuePrevisao}>{formatarValor(previsaoDespesas)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Quantidade</Text>
          <Text style={styles.statValue}>{despesasFiltradas.length}</Text>
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
          value={filtroPago}
          options={[
            { label: 'Todos', value: 'todos' },
            { label: 'Pago', value: 'pago' },
            { label: 'Não pago', value: 'nao_pago' }
          ]}
          onChange={setFiltroPago}
          placeholder="Status"
        />
      </View>

      {/* Seção de Metas */}
      <View style={styles.metasContainer}>
        <TouchableOpacity
          style={styles.metasHeader}
          onPress={() => setMostrarMetas(!mostrarMetas)}
        >
          <Ionicons name="bulb" size={20} color={colors.primary} />
          <Text style={styles.metasHeaderText}>Metas de Despesas por Categoria</Text>
          <Ionicons name={mostrarMetas ? 'chevron-up' : 'chevron-down'} size={22} color={colors.text} />
        </TouchableOpacity>
        {mostrarMetas && (
          <>
            <View style={styles.metasForm}>
              <Select
                value={metaCategoria}
                options={tiposDespesa.map(t => ({ label: t, value: t }))}
                onChange={setMetaCategoria}
                placeholder="Selecione a categoria"
              />
              <TextInput
                style={styles.metaInput}
                placeholder="% da meta (ex: 30)"
                placeholderTextColor={colors.placeholder}
                value={metaValor}
                onChangeText={setMetaValor}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity style={styles.metaAddButton} onPress={handleSalvarMeta}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.metaAddButtonText}>Adicionar Meta</Text>
              </TouchableOpacity>
            </View>
            {metas.length > 0 && (
              <View style={styles.metasList}>
                {metas.map(meta => {
                  const totais = totaisPorCategoria();
                  const totalGeral = totalGeralMetas();
                  const gastoAtual = totais[meta.categoria] || 0;
                  const metaPercentual = parseFloat(meta.valor_meta) || 0;
                  const percentualAtual = totalGeral > 0 ? (gastoAtual / totalGeral) * 100 : 0;
                  const diferenca = Math.abs(percentualAtual - metaPercentual);
                  const statusOk = percentualAtual <= metaPercentual * 1.1;
                  return (
                    <View key={meta.meta_id} style={[styles.metaRow, !statusOk && styles.metaRowAtencao]}>
                      <View style={styles.metaRowInfo}>
                        <Text style={styles.metaRowCategoria}>{meta.categoria}</Text>
                        <Text style={styles.metaRowDetail}>
                          Meta: {metaPercentual.toFixed(1)}% | Atual: {percentualAtual.toFixed(1)}% ({formatarValor(gastoAtual)})
                        </Text>
                        <Text style={styles.metaRowDiferenca}>Diferença: {diferenca.toFixed(1)}%</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.metaDeleteBtn}
                        onPress={() => handleExcluirMeta(meta.meta_id)}
                      >
                        <Ionicons name="trash" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {despesasFiltradas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhuma despesa encontrada{filtroPago !== 'todos' ? ' com esse filtro' : ''}
              </Text>
            </View>
          ) : (
            <>
              {despesasFiltradas.length > 0 && (
                <View style={styles.selectAllRow}>
                  <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
                    <Ionicons
                      name={selectedIds.size === despesasFiltradas.length ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={colors.primary}
                    />
                    <Text style={styles.selectAllText}>
                      {selectedIds.size === despesasFiltradas.length ? 'Desmarcar todas' : 'Selecionar todas'}
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
              {despesasPorTipo.map(({ tipo: tipoGrupo, itens }) => (
                <View key={tipoGrupo}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupHeaderText}>{tipoGrupo}</Text>
                    <TouchableOpacity
                      style={styles.groupDeleteButton}
                      onPress={() => handleDeleteGroup(tipoGrupo, itens)}
                    >
                      <Ionicons name="trash" size={18} color={colors.error} />
                      <Text style={styles.groupDeleteText}>Excluir grupo ({itens.length})</Text>
                    </TouchableOpacity>
                  </View>
                  {itens.map(despesa => {
                    const conta = contas.find(c => c.conta_id === despesa.conta_id);
                    const isSelected = selectedIds.has(despesa.despesa_id);
                    return (
                      <View key={despesa.despesa_id} style={styles.despesaCard}>
                        <TouchableOpacity
                          style={styles.cardCheckbox}
                          onPress={() => toggleSelect(despesa.despesa_id)}
                        >
                          <Ionicons
                            name={isSelected ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <View style={styles.despesaCardContent}>
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
                {editId ? 'Editar Despesa' : 'Nova Despesa'}
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
                placeholder="Descrição da despesa"
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
  metasContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  metasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 8,
  },
  metasHeaderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  metasForm: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  metaInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  metaAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  metaAddButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  metasList: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  metaRowAtencao: {
    borderLeftColor: colors.warning,
  },
  metaRowInfo: {
    flex: 1,
  },
  metaRowCategoria: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  metaRowDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metaRowDiferenca: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDeleteBtn: {
    padding: 8,
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
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffcc80',
  },
  bulkCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
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
  despesaCard: {
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
  despesaCardContent: {
    flex: 1,
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

