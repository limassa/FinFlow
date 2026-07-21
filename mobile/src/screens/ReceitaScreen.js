import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
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
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor, formatarData } from '../utils/formatters';
import { currentMonthYm, ymdToday, ymdFromIso, addMonthsYm, formatMesPtBr, ymPrimeiroDia } from '../utils/abaListaFinanceira';
import { HeaderIconButton } from '../components/HeaderIconButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { formatCurrency, parseCurrencyToNumber } from '../utils/currencyMask';
import { colors } from '../theme/theme';
import DatePicker from '../components/DatePicker';
import Select from '../components/Select';
import SelectWithIcons from '../components/SelectWithIcons';
import AccountSelector from '../components/AccountSelector';
import { getBancoById } from '../utils/banks';
import { extrairNomeBaseRecorrente, receitaEhRecorrente } from '../utils/recorrentes';

const tiposReceitaPadrao = ['Salário', 'Venda', 'Presente', 'Investimento', 'Aluguel', 'Outros'];

export default function ReceitaScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [receitas, setReceitas] = useState([]);
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mesAtual, setMesAtual] = useState(currentMonthYm);
  const [showMesPicker, setShowMesPicker] = useState(false);
  const [abaLista, setAbaLista] = useState('atual');
  const [todasReceitasCache, setTodasReceitasCache] = useState(null);
  const [loadingTodas, setLoadingTodas] = useState(false);
  const [buscaLista, setBuscaLista] = useState('');
  const [listaAvancadaAgruparCategoria, setListaAvancadaAgruparCategoria] = useState(false);
  const [modalFiltroLista, setModalFiltroLista] = useState(false);
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
  const [exibirAgrupado, setExibirAgrupado] = useState(false);
  const [gruposColapsados, setGruposColapsados] = useState(new Set());
  const [categoriasCustomizadas, setCategoriasCustomizadas] = useState([]);

  const tiposReceita = React.useMemo(() => {
    const padrao = [...tiposReceitaPadrao];
    const custom = (categoriasCustomizadas || []).filter(c => c && !padrao.includes(c));
    return [...padrao, ...custom];
  }, [categoriasCustomizadas]);

  const fetchReceitasMes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const url = `${API_ENDPOINTS.RECEITAS}?userId=${userId}&mes=${mesAtual}`;
      const res = await axios.get(url);
      const receitasNormalizadas = (res.data || []).map(receita => ({
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
  }, [userId, mesAtual]);

  const fetchReceitasTodas = useCallback(async () => {
    if (!userId) return;
    setLoadingTodas(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`);
      const receitasNormalizadas = (res.data || []).map(receita => ({
        ...receita,
        receita_id: receita.receita_id || receita.Receita_Id || receita.id,
        receita_descricao: receita.receita_descricao || receita.Receita_Descricao || receita.descricao,
        receita_valor: receita.receita_valor || receita.Receita_Valor || receita.valor || 0,
        receita_data: receita.receita_data || receita.Receita_Data || receita.data,
        receita_tipo: receita.receita_tipo || receita.Receita_Tipo || receita.tipo,
        receita_recebido: receita.receita_recebido !== undefined ? receita.receita_recebido : (receita.Receita_Recebido !== undefined ? receita.Receita_Recebido : false),
        conta_id: receita.conta_id || receita.Conta_id || receita.Conta_Id || receita.contaId || null
      }));
      setTodasReceitasCache(receitasNormalizadas);
    } catch (err) {
      console.error('Erro ao buscar receitas:', err);
      Alert.alert('Erro', 'Erro ao atualizar lista');
    } finally {
      setLoadingTodas(false);
    }
  }, [userId]);

  const refreshAfterMutation = useCallback(async () => {
    await fetchReceitasMes();
    if (abaLista === 'historico' || abaLista === 'futuros') {
      await fetchReceitasTodas();
    } else {
      setTodasReceitasCache(null);
    }
  }, [abaLista, fetchReceitasTodas, fetchReceitasMes]);

  const fetchCategoriasCustomizadas = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_ENDPOINTS.CATEGORIAS}?userId=${userId}&tipo=receita`);
      const nomes = (res.data || []).map(c => c.categoria_nome || c.categoria_Nome).filter(Boolean);
      setCategoriasCustomizadas(nomes);
    } catch (err) {
      console.log('Erro ao buscar categorias:', err);
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

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchContas();
    fetchCategoriasCustomizadas();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchReceitasMes();
  }, [userId, mesAtual, fetchReceitasMes]);

  useEffect(() => {
    if (!userId) return;
    if (abaLista !== 'historico' && abaLista !== 'futuros') return;
    if (todasReceitasCache !== null) return;
    let cancelled = false;
    (async () => {
      setLoadingTodas(true);
      try {
        const res = await axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`);
        const receitasNormalizadas = (res.data || []).map(receita => ({
          ...receita,
          receita_id: receita.receita_id || receita.Receita_Id || receita.id,
          receita_descricao: receita.receita_descricao || receita.Receita_Descricao || receita.descricao,
          receita_valor: receita.receita_valor || receita.Receita_Valor || receita.valor || 0,
          receita_data: receita.receita_data || receita.Receita_Data || receita.data,
          receita_tipo: receita.receita_tipo || receita.Receita_Tipo || receita.tipo,
          receita_recebido: receita.receita_recebido !== undefined ? receita.receita_recebido : (receita.Receita_Recebido !== undefined ? receita.Receita_Recebido : false),
          conta_id: receita.conta_id || receita.Conta_id || receita.Conta_Id || receita.contaId || null
        }));
        if (!cancelled) setTodasReceitasCache(receitasNormalizadas);
      } catch (err) {
        console.error('Erro ao buscar receitas:', err);
        if (!cancelled) Alert.alert('Erro', 'Erro ao carregar histórico completo');
      } finally {
        if (!cancelled) setLoadingTodas(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, abaLista, todasReceitasCache]);

  const poolReceitas = React.useMemo(() => {
    const todas = todasReceitasCache;
    const mes = receitas;
    if (!todas || todas.length === 0) return mes;
    const m = new Map(todas.map(r => [r.receita_id, r]));
    mes.forEach(r => m.set(r.receita_id, r));
    return Array.from(m.values());
  }, [receitas, todasReceitasCache]);

  const listaPorAba = React.useMemo(() => {
    if (abaLista === 'atual') return receitas;
    if (abaLista === 'historico') return todasReceitasCache || [];
    const hoje = ymdToday();
    const all = todasReceitasCache || [];
    return all.filter(r => ymdFromIso(r.receita_data) > hoje);
  }, [abaLista, receitas, todasReceitasCache]);

  const listaAposBusca = React.useMemo(() => {
    let list = listaPorAba;
    if ((abaLista === 'historico' || abaLista === 'futuros') && buscaLista.trim()) {
      const q = buscaLista.trim().toLowerCase();
      list = list.filter(r =>
        (r.receita_descricao || '').toLowerCase().includes(q) ||
        (r.receita_tipo || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [listaPorAba, abaLista, buscaLista]);

  const receitasFiltradas = React.useMemo(() => {
    const lista = Array.isArray(listaAposBusca) ? listaAposBusca : [];
    if (filtroRecebido === 'todos') return lista;
    if (filtroRecebido === 'recebido') return lista.filter(r => r.receita_recebido);
    return lista.filter(r => !r.receita_recebido);
  }, [listaAposBusca, filtroRecebido]);

  const receitasPorTipo = React.useMemo(() => {
    const grupos = {};
    receitasFiltradas.forEach(r => {
      const tipoKey = r.receita_tipo || 'Sem tipo';
      const nomeBase = extrairNomeBaseRecorrente(r.receita_descricao || '');
      if (!grupos[tipoKey]) grupos[tipoKey] = {};
      if (!grupos[tipoKey][nomeBase]) grupos[tipoKey][nomeBase] = [];
      grupos[tipoKey][nomeBase].push(r);
    });
    const ordem = [...tiposReceitaPadrao, ...categoriasCustomizadas];
    const outrosTipos = Object.keys(grupos).filter(t => !ordem.includes(t)).sort();
    const ordemFinal = [...ordem.filter(t => grupos[t]), ...outrosTipos];
    return ordemFinal.map(tipo => {
      const subgruposRaw = grupos[tipo];
      const subgrupos = Object.entries(subgruposRaw).map(([nomeBase, itens]) => {
        const ordenados = [...itens].sort((a, b) => {
          const dataA = (a.receita_data || '').split('T')[0];
          const dataB = (b.receita_data || '').split('T')[0];
          return dataA.localeCompare(dataB);
        });
        return { nomeBase, itens: ordenados };
      }).sort((a, b) => (a.nomeBase || '').localeCompare(b.nomeBase || ''));
      return { tipo, subgrupos };
    });
  }, [receitasFiltradas, categoriasCustomizadas]);

  const receitasOrdenadasPorData = React.useMemo(() => {
    return [...receitasFiltradas].sort((a, b) => {
      const dataA = (a.receita_data || '').split('T')[0];
      const dataB = (b.receita_data || '').split('T')[0];
      return dataA.localeCompare(dataB);
    });
  }, [receitasFiltradas]);

  const listarAgrupado = abaLista === 'atual' ? exibirAgrupado : listaAvancadaAgruparCategoria;

  const setAbaListaComLimpeza = (aba) => {
    setAbaLista(aba);
    setSelectedIds(new Set());
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
        const receitaEditando = poolReceitas.find(r => r.receita_id === editId);
        if (receitaEditando && receitaEhRecorrente(receitaEditando)) {
          Alert.alert(
            'Replicar alterações?',
            'Replicar para os itens não recebidos da série?',
            [
              { text: 'Não, apenas este', onPress: () => salvarReceitaEdit(receitaData) },
              { text: 'Sim, replicar', onPress: () => salvarReceitaEditReplicar(receitaData) }
            ]
          );
          setSubmitting(false);
          return;
        }
        await axios.put(`${API_ENDPOINTS.RECEITAS}/${editId}`, receitaData);
        Alert.alert('Sucesso', 'Receita atualizada com sucesso');
        resetForm();
        await refreshAfterMutation();
      } else {
        await axios.post(API_ENDPOINTS.RECEITAS, receitaData);
        Alert.alert('Sucesso', recorrente ? 'Receitas recorrentes criadas com sucesso!' : 'Receita adicionada com sucesso');
        resetForm();
        await refreshAfterMutation();
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao salvar receita');
    } finally {
      setSubmitting(false);
    }
  };

  const salvarReceitaEdit = async (receitaData) => {
    try {
      await axios.put(`${API_ENDPOINTS.RECEITAS}/${editId}`, receitaData);
      Alert.alert('Sucesso', 'Receita atualizada');
      resetForm();
      await refreshAfterMutation();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao salvar receita');
    } finally {
      setSubmitting(false);
    }
  };

  const salvarReceitaEditReplicar = async (receitaData) => {
    try {
      await axios.put(`${API_ENDPOINTS.RECEITAS}/${editId}`, receitaData);
      const receitaEditando = poolReceitas.find(r => r.receita_id === editId);
      const nomeBase = extrairNomeBaseRecorrente(receitaEditando?.receita_descricao || '');
      const outrosNaoRecebidos = poolReceitas.filter(r =>
        r.receita_id !== editId && !r.receita_recebido &&
        extrairNomeBaseRecorrente(r.receita_descricao || '') === nomeBase &&
        (r.receita_tipo || '') === (receitaData.tipo || '')
      );
      for (const r of outrosNaoRecebidos) {
        await axios.put(`${API_ENDPOINTS.RECEITAS}/${r.receita_id}`, {
          descricao: r.receita_descricao,
          valor: receitaData.valor,
          data: r.receita_data,
          tipo: receitaData.tipo,
          recebido: r.receita_recebido,
          conta_id: receitaData.conta_id || r.conta_id
        });
      }
      Alert.alert('Sucesso', outrosNaoRecebidos.length > 0 ? `${outrosNaoRecebidos.length} item(ns) também atualizado(s)` : 'Receita atualizada');
      resetForm();
      await refreshAfterMutation();
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

  const getItensDoGrupo = (receitaRef) => {
    if (!receitaRef) return [];
    const nomeBase = extrairNomeBaseRecorrente(receitaRef.receita_descricao || '');
    return poolReceitas.filter(r =>
      extrairNomeBaseRecorrente(r.receita_descricao || '') === nomeBase &&
      (r.receita_tipo || '') === (receitaRef.receita_tipo || '')
    );
  };

  const executarExclusoes = async (ids) => {
    if (ids.length === 0) return;
    setDeletingInProgress(true);
    try {
      for (const id of ids) {
        await axios.delete(`${API_ENDPOINTS.RECEITAS}/${id}`);
      }
      setSelectedIds(prev => { const next = new Set(prev); ids.forEach(id => next.delete(id)); return next; });
      await refreshAfterMutation();
      Alert.alert('Sucesso', ids.length === 1 ? 'Receita excluída' : `${ids.length} receita(s) excluída(s)`);
    } catch (err) {
      Alert.alert('Erro', 'Erro ao excluir receitas');
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleDelete = (id) => {
    const receita = poolReceitas.find(r => r.receita_id === id);
    if (!receita) return;
    if (receitaEhRecorrente(receita)) {
      const itensGrupo = getItensDoGrupo(receita);
      const nomeBase = extrairNomeBaseRecorrente(receita.receita_descricao);
      Alert.alert(
        'Excluir receita recorrente',
        `"${nomeBase}" - O que deseja excluir?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'SIM (Somente em aberto)', onPress: () => executarExclusoes(itensGrupo.filter(r => !r.receita_recebido).map(r => r.receita_id)) },
          { text: 'Todas (do grupo)', style: 'destructive', onPress: () => executarExclusoes(itensGrupo.map(r => r.receita_id)) }
        ]
      );
    } else {
      Alert.alert('Confirmar', 'Deseja realmente excluir esta receita?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => executarExclusoes([id]) }
      ]);
    }
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
    const itensSelecionados = [...selectedIds].map(id => poolReceitas.find(r => r.receita_id === id)).filter(Boolean);
    const temRecorrente = itensSelecionados.some(r => receitaEhRecorrente(r));
    if (temRecorrente) {
      Alert.alert(
        'Excluir receitas',
        `${qtd} selecionada(s) - O que deseja excluir?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'SIM (Somente em aberto)', onPress: async () => { await executarExclusoes(itensSelecionados.filter(r => !r.receita_recebido).map(r => r.receita_id)); setSelectedIds(new Set()); } },
          { text: 'Todas (do grupo)', style: 'destructive', onPress: async () => { await executarExclusoes([...selectedIds]); setSelectedIds(new Set()); } }
        ]
      );
    } else {
      Alert.alert('Confirmar', `Excluir ${qtd} receita(s)?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => { await executarExclusoes([...selectedIds]); setSelectedIds(new Set()); } }
      ]);
    }
  };

  const handleDeleteGroup = (labelGrupo, itens) => {
    const qtd = itens.length;
    if (qtd === 0) return;
    Alert.alert(
      'Excluir receitas',
      `"${labelGrupo}" - O que deseja excluir?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'SIM (Somente em aberto)', onPress: async () => {
          const naoRecebidas = itens.filter(r => !r.receita_recebido);
          if (naoRecebidas.length === 0) { Alert.alert('Info', 'Nenhuma não recebida neste grupo'); return; }
          await executarExclusoes(naoRecebidas.map(r => r.receita_id));
          setSelectedIds(prev => { const n = new Set(prev); naoRecebidas.forEach(r => n.delete(r.receita_id)); return n; });
        }},
        { text: 'Todas (do grupo)', style: 'destructive', onPress: async () => {
          await executarExclusoes(itens.map(r => r.receita_id));
          setSelectedIds(prev => { const n = new Set(prev); itens.forEach(r => n.delete(r.receita_id)); return n; });
        }}
      ]
    );
  };

  const handleToggleRecebido = async (receita) => {
    try {
      await axios.put(`${API_ENDPOINTS.PARCELA_ATUAL_RECEITA}/${receita.receita_id}`, {
        status: !receita.receita_recebido
      });
      await refreshAfterMutation();
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

  const showListaLoading = abaLista === 'atual'
    ? loading
    : (loadingTodas && todasReceitasCache === null);

  const renderReceitaCard = (receita) => {
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
  };

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
        <HeaderIconButton name="add" side="right" onPress={handleAddPress} />
      ),
    });
  }, [navigation, handleAddPress]);

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{formatarValor(totalReceitas)}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPrevisao]}>
            <Text style={[styles.statLabel, styles.statLabelPrevisao]}>Previsão</Text>
            <Text style={styles.statValuePrevisao}>{formatarValor(previsaoReceitas)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Qtde</Text>
            <Text style={styles.statValue}>{receitasFiltradas?.length ?? 0}</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.tabRow}>
          {[
            { id: 'historico', label: 'Histórico' },
            { id: 'atual', label: 'Atual' },
            { id: 'futuros', label: 'Futuros' }
          ].map(({ id, label }) => (
            <TouchableOpacity
              key={id}
              style={[styles.tabBtn, abaLista === id && styles.tabBtnActive]}
              onPress={() => setAbaListaComLimpeza(id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabBtnText, abaLista === id && styles.tabBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {abaLista === 'atual' && (
          <View style={styles.monthNavRow}>
            <TouchableOpacity
              onPress={() => setMesAtual(addMonthsYm(mesAtual, -1))}
              style={styles.monthNavArrow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={26} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.monthNavTitle}>{formatMesPtBr(mesAtual)}</Text>
            <TouchableOpacity
              onPress={() => setMesAtual(addMonthsYm(mesAtual, 1))}
              style={styles.monthNavArrow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-forward" size={26} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowMesPicker(true)}
              style={styles.monthNavArrow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalFiltroLista(true)}
              style={styles.monthNavArrow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="filter" size={22} color={colors.primary} />
            </TouchableOpacity>
            {showMesPicker && (
              <DateTimePicker
                value={new Date(`${ymPrimeiroDia(mesAtual)}T00:00:00`)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setShowMesPicker(false);
                  if (event.type === 'dismissed') return;
                  if (selectedDate) {
                    const y = selectedDate.getFullYear();
                    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    setMesAtual(`${y}-${m}`);
                    if (Platform.OS === 'ios') setShowMesPicker(false);
                  }
                }}
              />
            )}
          </View>
        )}
        {(abaLista === 'historico' || abaLista === 'futuros') && (
          <View style={styles.filterIconRow}>
            <TouchableOpacity
              style={styles.filterIconBtnOnly}
              onPress={() => setModalFiltroLista(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="filter" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showListaLoading ? (
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
              {listarAgrupado ? (
                receitasPorTipo.map(({ tipo: tipoGrupo, subgrupos }) => {
                  const tipoKey = `tipo:${tipoGrupo}`;
                  const tipoColapsado = gruposColapsados.has(tipoKey);
                  const toggleTipo = () => {
                    setGruposColapsados(prev => {
                      const next = new Set(prev);
                      if (next.has(tipoKey)) next.delete(tipoKey);
                      else next.add(tipoKey);
                      return next;
                    });
                  };
                  const totalTipo = subgrupos.reduce((s, sg) => s + sg.itens.length, 0);
                  const itensPlanos = subgrupos.flatMap(sg => sg.itens);
                  return (
                    <View key={tipoKey}>
                      <View style={styles.groupHeader}>
                        <TouchableOpacity style={styles.groupHeaderLeft} onPress={toggleTipo} activeOpacity={0.7}>
                          <Ionicons name={tipoColapsado ? 'chevron-forward' : 'chevron-down'} size={18} color={colors.text} />
                          <Text style={styles.groupHeaderText}>{tipoGrupo}</Text>
                          <Text style={styles.groupCount}>({totalTipo})</Text>
                        </TouchableOpacity>
                        <View style={styles.groupHeaderActions}>
                          <TouchableOpacity
                            style={styles.groupEditButton}
                            onPress={() => itensPlanos.length > 0 && handleEdit(itensPlanos[0])}
                          >
                            <Ionicons name="create" size={18} color={colors.primary} />
                            <Text style={styles.groupEditText}>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.groupDeleteButton}
                            onPress={() => handleDeleteGroup(tipoGrupo, itensPlanos)}
                          >
                            <Ionicons name="trash" size={18} color={colors.error} />
                            <Text style={styles.groupDeleteText}>Excluir</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {!tipoColapsado && subgrupos.map(({ nomeBase, itens }) => {
                        const subKey = `${tipoKey}:${nomeBase}`;
                        const subColapsado = gruposColapsados.has(subKey);
                        const toggleSub = () => {
                          setGruposColapsados(prev => {
                            const next = new Set(prev);
                            if (next.has(subKey)) next.delete(subKey);
                            else next.add(subKey);
                            return next;
                          });
                        };
                        return (
                          <View key={subKey} style={styles.subGroup}>
                            <View style={styles.subGroupHeader}>
                              <TouchableOpacity style={styles.groupHeaderLeft} onPress={toggleSub} activeOpacity={0.7}>
                                <Ionicons name={subColapsado ? 'chevron-forward' : 'chevron-down'} size={16} color={colors.textSecondary} />
                                <Text style={styles.subGroupText}>{nomeBase}</Text>
                                <Text style={styles.subGroupCount}>({itens.length})</Text>
                              </TouchableOpacity>
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
                                  onPress={() => handleDeleteGroup(nomeBase, itens)}
                                >
                                  <Ionicons name="trash" size={18} color={colors.error} />
                                  <Text style={styles.groupDeleteText}>Excluir</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            {!subColapsado && itens.map(receita => renderReceitaCard(receita))}
                          </View>
                        );
                      })}
                    </View>
                  );
                })
              ) : (
                receitasOrdenadasPorData.map(receita => renderReceitaCard(receita))
              )}
            </>
          )}
        </ScrollView>
      )}

      <Modal
        visible={modalFiltroLista}
        animationType="fade"
        transparent
        onRequestClose={() => setModalFiltroLista(false)}
      >
        <TouchableOpacity
          style={styles.filtroListaModalOverlay}
          activeOpacity={1}
          onPress={() => setModalFiltroLista(false)}
        >
          <View style={styles.filtroListaModalBox} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Filtros</Text>
            {(abaLista === 'historico' || abaLista === 'futuros') && (
              <>
                <Text style={styles.filterLabel}>Nome ou categoria</Text>
                <TextInput
                  style={styles.input}
                  value={buscaLista}
                  onChangeText={setBuscaLista}
                  placeholder="Digite para filtrar..."
                  placeholderTextColor={colors.placeholder}
                />
              </>
            )}
            <Text style={styles.filterLabel}>Status</Text>
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
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                if (abaLista === 'atual') setExibirAgrupado(!exibirAgrupado);
                else setListaAvancadaAgruparCategoria(!listaAvancadaAgruparCategoria);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(abaLista === 'atual' ? exibirAgrupado : listaAvancadaAgruparCategoria) ? 'checkbox' : 'square-outline'}
                size={22}
                color={(abaLista === 'atual' ? exibirAgrupado : listaAvancadaAgruparCategoria) ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.checkboxLabel}>Agrupar (Categoria)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.formButtonSave, { marginTop: 16 }]}
              onPress={() => setModalFiltroLista(false)}
            >
              <Text style={styles.formButtonTextSave}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editId ? 'Editar Receita' : 'Nova Receita'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.formContainer}
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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

              <Text style={styles.label}>Categoria *</Text>
              <SelectWithIcons
                value={tipo}
                options={tiposReceita.map(t => ({ label: t, value: t }))}
                onChange={setTipo}
                categoria="receita"
                placeholder="Selecione a categoria"
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
        </KeyboardAvoidingView>
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
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 90,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statLabelPrevisao: {
    fontSize: 10,
  },
  statValuePrevisao: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: '#fff',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 4,
  },
  monthNavArrow: {
    padding: 4,
  },
  monthNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  filterIconRow: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  filterIconBtnOnly: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  filtroListaModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  filtroListaModalBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
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
  groupHeaderNivel1: {
    backgroundColor: '#e8f4fd',
  },
  groupHeaderSubnivel: {
    backgroundColor: '#f5f9fc',
    paddingLeft: 20,
  },
  groupHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupCount: {
    fontSize: 13,
    opacity: 0.85,
    marginLeft: 6,
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
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  subGroup: {
    marginLeft: 12,
    marginBottom: 8,
  },
  subGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f9fc',
    borderRadius: 6,
    marginBottom: 6,
  },
  subGroupText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
  },
  subGroupCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
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
    color: colors.success,
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

