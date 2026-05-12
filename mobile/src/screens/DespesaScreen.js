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
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor, formatarData } from '../utils/formatters';
import { currentMonthYm, ymdToday, ymdFromIso, addMonthsYm, formatMesPtBr, ymPrimeiroDia } from '../utils/abaListaFinanceira';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { formatCurrency, parseCurrencyToNumber } from '../utils/currencyMask';
import { colors } from '../theme/theme';
import DatePicker from '../components/DatePicker';
import Select from '../components/Select';
import SelectWithIcons from '../components/SelectWithIcons';
import AccountSelector from '../components/AccountSelector';
import { getBancoById } from '../utils/banks';
import { extrairNomeBaseRecorrente, despesaEhRecorrente } from '../utils/recorrentes';

const tiposDespesaPadrao = [
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
  'Presentes',
  'Telefonia',
  'Pet Shop',
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
  const [mesAtual, setMesAtual] = useState(currentMonthYm);
  const [showMesPicker, setShowMesPicker] = useState(false);
  const [abaLista, setAbaLista] = useState('atual');
  const [todasDespesasCache, setTodasDespesasCache] = useState(null);
  const [loadingTodas, setLoadingTodas] = useState(false);
  const [buscaLista, setBuscaLista] = useState('');
  const [listaAvancadaAgruparCategoria, setListaAvancadaAgruparCategoria] = useState(false);
  const [modalFiltroLista, setModalFiltroLista] = useState(false);
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
  const [exibirAgrupado, setExibirAgrupado] = useState(false);
  const [gruposColapsados, setGruposColapsados] = useState(new Set());
  // Metas
  const [metas, setMetas] = useState([]);
  const [mostrarMetas, setMostrarMetas] = useState(false);
  const [metaCategoria, setMetaCategoria] = useState('');
  const [metaValor, setMetaValor] = useState('');
  const [categoriasCustomizadas, setCategoriasCustomizadas] = useState([]);

  const tiposDespesa = React.useMemo(() => {
    const padrao = [...tiposDespesaPadrao];
    const custom = (categoriasCustomizadas || []).filter(c => c && !padrao.includes(c));
    return [...padrao, ...custom];
  }, [categoriasCustomizadas]);

  const fetchDespesasMes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const url = `${API_ENDPOINTS.DESPESAS}?userId=${userId}&mes=${mesAtual}`;
      const res = await axios.get(url);
      const despesasNormalizadas = (res.data || []).map(despesa => ({
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
  }, [userId, mesAtual]);

  const fetchDespesasTodas = useCallback(async () => {
    if (!userId) return;
    setLoadingTodas(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`);
      const despesasNormalizadas = (res.data || []).map(despesa => ({
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
      setTodasDespesasCache(despesasNormalizadas);
    } catch (err) {
      console.error('Erro ao buscar todas as despesas:', err);
      Alert.alert('Erro', 'Erro ao atualizar lista');
    } finally {
      setLoadingTodas(false);
    }
  }, [userId]);

  const refreshAfterMutation = useCallback(async () => {
    await fetchDespesasMes();
    if (abaLista === 'historico' || abaLista === 'futuros') {
      await fetchDespesasTodas();
    } else {
      setTodasDespesasCache(null);
    }
  }, [abaLista, fetchDespesasTodas, fetchDespesasMes]);

  const fetchCategoriasCustomizadas = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_ENDPOINTS.CATEGORIAS}?userId=${userId}&tipo=despesa`);
      const nomes = (res.data || []).map(c => c.categoria_nome || c.categoria_Nome).filter(Boolean);
      setCategoriasCustomizadas(nomes);
    } catch (err) {
      console.log('Erro ao buscar categorias:', err);
    }
  };

  const fetchMetas = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_ENDPOINTS.METAS_DESPESA}?userId=${userId}`);
      setMetas(res.data || []);
    } catch (err) {
      console.log('Erro ao buscar metas:', err);
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
        conta_saldo: conta.conta_saldo || conta.Conta_Saldo || conta.saldo,
        conta_banco: conta.conta_banco || conta.Conta_Banco
      }));
      setContas(contasNormalizadas);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchContas();
    fetchMetas();
    fetchCategoriasCustomizadas();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchDespesasMes();
  }, [userId, mesAtual, fetchDespesasMes]);

  useEffect(() => {
    if (!userId) return;
    if (abaLista !== 'historico' && abaLista !== 'futuros') return;
    if (todasDespesasCache !== null) return;
    let cancelled = false;
    (async () => {
      setLoadingTodas(true);
      try {
        const res = await axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`);
        const despesasNormalizadas = (res.data || []).map(despesa => ({
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
        if (!cancelled) setTodasDespesasCache(despesasNormalizadas);
      } catch (err) {
        console.error('Erro ao buscar todas as despesas:', err);
        if (!cancelled) Alert.alert('Erro', 'Erro ao carregar histórico completo');
      } finally {
        if (!cancelled) setLoadingTodas(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, abaLista, todasDespesasCache]);

  const poolDespesas = React.useMemo(() => {
    const todas = todasDespesasCache;
    const mes = despesas;
    if (!todas || todas.length === 0) return mes;
    const m = new Map(todas.map(d => [d.despesa_id, d]));
    mes.forEach(d => m.set(d.despesa_id, d));
    return Array.from(m.values());
  }, [despesas, todasDespesasCache]);

  const listaPorAba = React.useMemo(() => {
    if (abaLista === 'atual') return despesas;
    if (abaLista === 'historico') return todasDespesasCache || [];
    const hoje = ymdToday();
    const all = todasDespesasCache || [];
    return all.filter(d => ymdFromIso(d.despesa_data) > hoje);
  }, [abaLista, despesas, todasDespesasCache]);

  const listaAposBusca = React.useMemo(() => {
    let list = listaPorAba;
    if ((abaLista === 'historico' || abaLista === 'futuros') && buscaLista.trim()) {
      const q = buscaLista.trim().toLowerCase();
      list = list.filter(d =>
        (d.despesa_descricao || '').toLowerCase().includes(q) ||
        (d.despesa_tipo || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [listaPorAba, abaLista, buscaLista]);

  const despesasFiltradas = React.useMemo(() => {
    if (filtroPago === 'todos') return listaAposBusca;
    if (filtroPago === 'pago') return listaAposBusca.filter(d => d.despesa_pago);
    return listaAposBusca.filter(d => !d.despesa_pago);
  }, [listaAposBusca, filtroPago]);

  const despesasPorTipo = React.useMemo(() => {
    const grupos = {};
    despesasFiltradas.forEach(d => {
      const tipoKey = d.despesa_tipo || 'Sem tipo';
      const nomeBase = extrairNomeBaseRecorrente(d.despesa_descricao || '');
      if (!grupos[tipoKey]) grupos[tipoKey] = {};
      if (!grupos[tipoKey][nomeBase]) grupos[tipoKey][nomeBase] = [];
      grupos[tipoKey][nomeBase].push(d);
    });
    const ordem = [...tiposDespesaPadrao, ...categoriasCustomizadas];
    const outrosTipos = Object.keys(grupos).filter(t => !ordem.includes(t)).sort();
    const ordemFinal = [...ordem.filter(t => grupos[t]), ...outrosTipos];
    return ordemFinal.map(tipo => {
      const subgruposRaw = grupos[tipo];
      const subgrupos = Object.entries(subgruposRaw).map(([nomeBase, itens]) => {
        const ordenados = [...itens].sort((a, b) => {
          const dataA = (a.despesa_data || '').split('T')[0];
          const dataB = (b.despesa_data || '').split('T')[0];
          return dataA.localeCompare(dataB);
        });
        return { nomeBase, itens: ordenados };
      }).sort((a, b) => (a.nomeBase || '').localeCompare(b.nomeBase || ''));
      return { tipo, subgrupos };
    });
  }, [despesasFiltradas, categoriasCustomizadas]);

  const despesasOrdenadasPorData = React.useMemo(() => {
    return [...despesasFiltradas].sort((a, b) => {
      const dataA = (a.despesa_data || '').split('T')[0];
      const dataB = (b.despesa_data || '').split('T')[0];
      return dataA.localeCompare(dataB);
    });
  }, [despesasFiltradas]);

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
        const despesaEditando = poolDespesas.find(d => d.despesa_id === editId);
        if (despesaEditando && despesaEhRecorrente(despesaEditando)) {
          Alert.alert(
            'Replicar alterações?',
            'Replicar para os itens não pagos da série?',
            [
              { text: 'Não, apenas este', onPress: async () => { await salvarDespesaEdit(despesaData); } },
              { text: 'Sim, replicar', onPress: async () => { await salvarDespesaEditReplicar(despesaData); } }
            ]
          );
          setSubmitting(false);
          return;
        }
        await axios.put(`${API_ENDPOINTS.DESPESAS}/${editId}`, despesaData);
        Alert.alert('Sucesso', 'Despesa atualizada com sucesso');
        resetForm();
        await refreshAfterMutation();
      } else {
        await axios.post(API_ENDPOINTS.DESPESAS, despesaData);
        Alert.alert('Sucesso', recorrente ? 'Despesas recorrentes criadas com sucesso!' : 'Despesa adicionada com sucesso');
        resetForm();
        await refreshAfterMutation();
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao salvar despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const salvarDespesaEdit = async (despesaData) => {
    try {
      await axios.put(`${API_ENDPOINTS.DESPESAS}/${editId}`, despesaData);
      Alert.alert('Sucesso', 'Despesa atualizada');
      resetForm();
      await refreshAfterMutation();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao salvar despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const salvarDespesaEditReplicar = async (despesaData) => {
    try {
      await axios.put(`${API_ENDPOINTS.DESPESAS}/${editId}`, despesaData);
      const despesaEditando = poolDespesas.find(d => d.despesa_id === editId);
      const nomeBase = extrairNomeBaseRecorrente(despesaEditando?.despesa_descricao || '');
      const outrosNaoPagos = poolDespesas.filter(d =>
        d.despesa_id !== editId && !d.despesa_pago &&
        extrairNomeBaseRecorrente(d.despesa_descricao || '') === nomeBase &&
        (d.despesa_tipo || '') === (despesaData.tipo || '')
      );
      for (const d of outrosNaoPagos) {
        await axios.put(`${API_ENDPOINTS.DESPESAS}/${d.despesa_id}`, {
          descricao: d.despesa_descricao,
          valor: despesaData.valor,
          data: d.despesa_data,
          dataVencimento: d.despesa_dtvencimento || despesaData.dataVencimento,
          tipo: despesaData.tipo,
          pago: d.despesa_pago,
          conta_id: despesaData.conta_id || d.conta_id
        });
      }
      Alert.alert('Sucesso', outrosNaoPagos.length > 0 ? `${outrosNaoPagos.length} item(ns) também atualizado(s)` : 'Despesa atualizada');
      resetForm();
      await refreshAfterMutation();
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

  const getItensDoGrupo = (despesaRef) => {
    if (!despesaRef) return [];
    const nomeBase = extrairNomeBaseRecorrente(despesaRef.despesa_descricao || '');
    return poolDespesas.filter(d =>
      extrairNomeBaseRecorrente(d.despesa_descricao || '') === nomeBase &&
      (d.despesa_tipo || '') === (despesaRef.despesa_tipo || '')
    );
  };

  const executarExclusoes = async (ids) => {
    if (ids.length === 0) return;
    setDeletingInProgress(true);
    try {
      for (const id of ids) {
        await axios.delete(`${API_ENDPOINTS.DESPESAS}/${id}`);
      }
      setSelectedIds(prev => { const next = new Set(prev); ids.forEach(id => next.delete(id)); return next; });
      await refreshAfterMutation();
      Alert.alert('Sucesso', ids.length === 1 ? 'Despesa excluída' : `${ids.length} despesa(s) excluída(s)`);
    } catch (err) {
      Alert.alert('Erro', 'Erro ao excluir despesas');
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleDelete = (id) => {
    const despesa = poolDespesas.find(d => d.despesa_id === id);
    if (!despesa) return;
    if (despesaEhRecorrente(despesa)) {
      const itensGrupo = getItensDoGrupo(despesa);
      const nomeBase = extrairNomeBaseRecorrente(despesa.despesa_descricao);
      Alert.alert(
        'Excluir despesa recorrente',
        `"${nomeBase}" - O que deseja excluir?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'SIM (Somente em aberto)', onPress: () => executarExclusoes(itensGrupo.filter(d => !d.despesa_pago).map(d => d.despesa_id)) },
          { text: 'Todas (do grupo)', style: 'destructive', onPress: () => executarExclusoes(itensGrupo.map(d => d.despesa_id)) }
        ]
      );
    } else {
      Alert.alert('Confirmar', 'Deseja realmente excluir esta despesa?', [
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
    if (selectedIds.size === despesasFiltradas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(despesasFiltradas.map(d => d.despesa_id)));
    }
  };

  const handleDeleteSelected = () => {
    const qtd = selectedIds.size;
    if (qtd === 0) return;
    const itensSelecionados = [...selectedIds].map(id => poolDespesas.find(d => d.despesa_id === id)).filter(Boolean);
    const temRecorrente = itensSelecionados.some(d => despesaEhRecorrente(d));
    if (temRecorrente) {
      Alert.alert(
        'Excluir despesas',
        `${qtd} selecionada(s) - O que deseja excluir?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'SIM (Somente em aberto)', onPress: async () => { await executarExclusoes(itensSelecionados.filter(d => !d.despesa_pago).map(d => d.despesa_id)); setSelectedIds(new Set()); } },
          { text: 'Todas (do grupo)', style: 'destructive', onPress: async () => { await executarExclusoes([...selectedIds]); setSelectedIds(new Set()); } }
        ]
      );
    } else {
      Alert.alert('Confirmar', `Excluir ${qtd} despesa(s)?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => { await executarExclusoes([...selectedIds]); setSelectedIds(new Set()); } }
      ]);
    }
  };

  const handleDeleteGroup = (labelGrupo, itens) => {
    const qtd = itens.length;
    if (qtd === 0) return;
    Alert.alert(
      'Excluir despesas',
      `"${labelGrupo}" - O que deseja excluir?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'SIM (Somente em aberto)', onPress: async () => {
          const emAberto = itens.filter(d => !d.despesa_pago);
          if (emAberto.length === 0) { Alert.alert('Info', 'Nenhuma em aberto neste grupo'); return; }
          await executarExclusoes(emAberto.map(d => d.despesa_id));
          setSelectedIds(prev => { const n = new Set(prev); emAberto.forEach(d => n.delete(d.despesa_id)); return n; });
        }},
        { text: 'Todas (do grupo)', style: 'destructive', onPress: async () => {
          await executarExclusoes(itens.map(d => d.despesa_id));
          setSelectedIds(prev => { const n = new Set(prev); itens.forEach(d => n.delete(d.despesa_id)); return n; });
        }}
      ]
    );
  };

  const handleTogglePago = async (despesa) => {
    try {
      await axios.put(`${API_ENDPOINTS.PARCELA_ATUAL_DESPESA}/${despesa.despesa_id}`, {
        status: !despesa.despesa_pago
      });
      await refreshAfterMutation();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao atualizar status');
    }
  };

  const renderDespesaCard = (despesa) => {
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
              <View style={styles.despesaDetail}>
                {(() => {
                  const b = getBancoById(conta.conta_banco || conta.Conta_Banco);
                  if (b) {
                    return (
                      <View style={styles.contaBadgeRow}>
                        <View style={[styles.contaBankBadge, { backgroundColor: b.cor }]}>
                          <Text style={styles.contaBankBadgeText}>{b.abbr}</Text>
                        </View>
                        <Text style={styles.contaNomeText}>{conta.conta_nome}</Text>
                      </View>
                    );
                  }
                  return (
                    <View style={styles.contaBadgeRow}>
                      <Ionicons name="wallet" size={14} color={colors.textSecondary} />
                      <Text style={styles.contaNomeText}>{conta.conta_nome}</Text>
                    </View>
                  );
                })()}
              </View>
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
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{ marginRight: 15, padding: 5 }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const totalDespesas = despesasFiltradas
    .filter(d => d.despesa_pago)
    .reduce((sum, d) => sum + parseFloat(d.despesa_valor || 0), 0);

  const previsaoDespesas = despesasFiltradas
    .reduce((sum, d) => sum + parseFloat(d.despesa_valor || 0), 0);

  // Totais por categoria (para metas) — mês navegável em "Atual"
  const totaisPorCategoria = () => {
    const totais = {};
    despesas
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

  const showListaLoading = abaLista === 'atual'
    ? loading
    : (loadingTodas && todasDespesasCache === null);

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={[styles.statValue, { color: colors.error }]}>{formatarValor(totalDespesas)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Previsão</Text>
            <Text style={styles.statValuePrevisao}>{formatarValor(previsaoDespesas)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Qtde</Text>
            <Text style={styles.statValue}>{despesasFiltradas?.length ?? 0}</Text>
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
              style={styles.filterIconBtn}
              onPress={() => setModalFiltroLista(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="filter" size={22} color={colors.primary} />
              <Text style={styles.filterIconLabel}>Buscar / agrupar</Text>
            </TouchableOpacity>
          </View>
        )}
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
        {abaLista === 'atual' && (
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setExibirAgrupado(!exibirAgrupado)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={exibirAgrupado ? 'checkbox' : 'square-outline'}
              size={22}
              color={exibirAgrupado ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.checkboxLabel}>Agrupar (Categoria)</Text>
          </TouchableOpacity>
        )}
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
              <SelectWithIcons
                value={metaCategoria}
                options={tiposDespesa.map(t => ({ label: t, value: t }))}
                onChange={setMetaCategoria}
                categoria="despesa"
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

      {showListaLoading ? (
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
              {listarAgrupado ? (
                despesasPorTipo.map(({ tipo: tipoGrupo, subgrupos }) => {
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
                      <View style={[styles.groupHeader, styles.groupHeaderNivel1]}>
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
                            <TouchableOpacity style={[styles.groupHeader, styles.groupHeaderSubnivel]} onPress={toggleSub} activeOpacity={0.7}>
                              <View style={styles.groupHeaderLeft}>
                                <Ionicons name={subColapsado ? 'chevron-forward' : 'chevron-down'} size={16} color={colors.textSecondary} />
                                <Text style={styles.groupHeaderText}>{nomeBase}</Text>
                                <Text style={styles.subGroupCount}>({itens.length})</Text>
                              </View>
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
                            </TouchableOpacity>
                            {!subColapsado && itens.map(despesa => renderDespesaCard(despesa))}
                          </View>
                        );
                      })}
                    </View>
                  );
                })
              ) : (
                despesasOrdenadasPorData.map(despesa => renderDespesaCard(despesa))
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
            <Text style={styles.modalTitle}>Buscar e exibição</Text>
            <Text style={styles.filterLabel}>Nome ou categoria</Text>
            <TextInput
              style={styles.input}
              value={buscaLista}
              onChangeText={setBuscaLista}
              placeholder="Digite para filtrar..."
              placeholderTextColor={colors.placeholder}
            />
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setListaAvancadaAgruparCategoria(!listaAvancadaAgruparCategoria)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={listaAvancadaAgruparCategoria ? 'checkbox' : 'square-outline'}
                size={22}
                color={listaAvancadaAgruparCategoria ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.checkboxLabel}>Agrupar por categoria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.metaAddButton} onPress={() => setModalFiltroLista(false)}>
              <Text style={styles.metaAddButtonText}>Fechar</Text>
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

              <Text style={styles.label}>Categoria *</Text>
              <SelectWithIcons
                value={tipo}
                options={tiposDespesa.map(t => ({ label: t, value: t }))}
                onChange={setTipo}
                categoria="despesa"
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
  },
  filterIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
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
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
    flexDirection: 'column',
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
  subGroup: {
    marginLeft: 12,
    marginBottom: 8,
  },
  subGroupCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
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
    color: colors.error,
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
  despesaDetailText: {
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

