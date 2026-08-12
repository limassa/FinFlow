import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaHome, FaBullseye, FaCheckCircle, FaExclamationCircle, FaChevronDown, FaChevronRight, FaChevronLeft, FaCreditCard, FaCalendarAlt } from 'react-icons/fa';
import { getIconForTipo, getIconComponentByName, getColorForTipo } from '../utils/categoryIcons';
import { getBancoById } from '../utils/banks';
import BankLogo from '../components/BankLogo';
import { extrairNomeBaseRecorrente, despesaEhRecorrente } from '../utils/recorrentes';
import ConfirmacaoExclusao from '../components/ConfirmacaoExclusao';
import ConfirmacaoEdicaoRecorrente from '../components/ConfirmacaoEdicaoRecorrente';
import SelectWithIcons from '../components/SelectWithIcons';
import AccountSelector from '../components/AccountSelector';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { normalizarDataInput, formatarValorInput, valorParaNumero } from '../utils/formatters';
import { getUsuarioLogado } from '../functions/auth';
import { useNavigate } from 'react-router-dom';
import { currentMonthYm, ymdToday, ymdFromIso, addMonthsYm, formatMesPtBr, ymdToYm, ymPrimeiroDia } from '../utils/abaListaFinanceira';
import '../App.css';

function Despesa() {
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [contaId, setContaId] = useState('');
  const [contas, setContas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [mesAtual, setMesAtual] = useState(currentMonthYm);
  const [abaLista, setAbaLista] = useState('atual');
  const [todasDespesasCache, setTodasDespesasCache] = useState(null);
  const [loadingTodas, setLoadingTodas] = useState(false);
  const [buscaLista, setBuscaLista] = useState('');
  const [listaAvancadaAgruparCategoria, setListaAvancadaAgruparCategoria] = useState(false);
  const [modalFiltroLista, setModalFiltroLista] = useState(false);
  const [filtroPago, setFiltroPago] = useState('todos');
  const [loading, setLoading] = useState(true); // Mudando para true para forçar o carregamento
  const [pago, setPago] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState('mensal');
  const [proximasParcelas, setProximasParcelas] = useState(12);
  
  // Estados para metas
  const [metas, setMetas] = useState([]);
  const [mostrarMetas, setMostrarMetas] = useState(false);
  const [metaCategoria, setMetaCategoria] = useState('');
  const [metaValor, setMetaValor] = useState('');
  
  // Estados para cartões de crédito
  const [faturasCartao, setFaturasCartao] = useState([]);
  const [cartaoExpandido, setCartaoExpandido] = useState(null);
  const [mostrarCartoes, setMostrarCartoes] = useState(true);
  
  // Estado para categorias customizadas
  const [categoriasCustomizadas, setCategoriasCustomizadas] = useState([]);
  const [iconesCustomizados, setIconesCustomizados] = useState({});
  const [coresCustomizadas, setCoresCustomizadas] = useState({});
  
  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

  // Categorias padrão
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
    'Pet Shop'
  ];
  
  // Combinar categorias padrão com customizadas
  const tiposDespesa = [...tiposDespesaPadrao, ...categoriasCustomizadas];        
  const [tipo, setTipo] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [gruposColapsados, setGruposColapsados] = useState(new Set());
  const [exibirAgrupado, setExibirAgrupado] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(null);
  const [modalEditarRecorrente, setModalEditarRecorrente] = useState(null);
  
  const formContainerRef = useRef(null);
  
  // Estado para modal de criar categoria rápida
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);

  // Função para navegar para home e rolar para o topo
  const navigateToHome = () => {
    navigate('/layout/principal');
    // Scroll para o topo após a navegação
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  const fetchContas = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.CONTAS}?userId=${userId}`);
      setContas(res.data);
    } catch (err) {
      console.log('Erro ao buscar contas:', err);
    }
  };

  const fetchMetas = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.METAS_DESPESA}?userId=${userId}`);
      setMetas(res.data);
    } catch (err) {
      console.log('Erro ao buscar metas:', err);
    }
  };

  const fetchFaturasCartao = async () => {
    try {
      // Se não tiver filtro de mês, busca todas as compras
      const mesParam = `&mes=${mesAtual}`;
      const [cartoesRes, comprasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.CARTOES}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.COMPRAS_CARTAO}?userId=${userId}${mesParam}`)
      ]);
      
      // Agrupar compras por cartão
      const faturas = cartoesRes.data.map(cartao => {
        const comprasCartao = comprasRes.data.filter(c => c.cartao_id === cartao.cartao_id);
        const valorTotal = comprasCartao.reduce((sum, c) => sum + parseFloat(c.compra_valor_parcela || 0), 0);
        return {
          ...cartao,
          compras: comprasCartao,
          valorFatura: valorTotal
        };
      }).filter(f => f.valorFatura > 0); // Só mostra cartões com fatura
      
      setFaturasCartao(faturas);
    } catch (err) {
      console.log('Erro ao buscar faturas de cartão:', err);
    }
  };

  const fetchCategoriasCustomizadas = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.CATEGORIAS}?userId=${userId}&tipo=despesa`);
      const nomes = res.data.map(cat => cat.categoria_nome);
      setCategoriasCustomizadas(nomes);
      
      // Criar mapa de ícones e cores customizados
      const icones = {};
      const cores = {};
      res.data.forEach(cat => {
        if (cat.categoria_icone) {
          icones[cat.categoria_nome] = cat.categoria_icone;
        }
        if (cat.categoria_cor) {
          cores[cat.categoria_nome] = cat.categoria_cor;
        }
      });
      setIconesCustomizados(icones);
      setCoresCustomizadas(cores);
    } catch (err) {
      console.log('Erro ao buscar categorias customizadas:', err);
    }
  };

  const criarCategoriaRapida = async () => {
    if (!novaCategoriaNome.trim()) return;
    
    setSalvandoCategoria(true);
    try {
      await axios.post(API_ENDPOINTS.CATEGORIAS, {
        usuario_id: userId,
        nome: novaCategoriaNome.trim(),
        tipo: 'despesa',
        icone: 'ellipsis',
        cor: '#6B7280'
      });
      
      // Atualizar lista de categorias
      await fetchCategoriasCustomizadas();
      
      // Selecionar a nova categoria
      setTipo(novaCategoriaNome.trim());
      
      // Fechar modal e limpar
      setMostrarModalCategoria(false);
      setNovaCategoriaNome('');
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      alert('Erro ao criar categoria');
    } finally {
      setSalvandoCategoria(false);
    }
  };

  const fetchDespesasMes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const url = `${API_ENDPOINTS.DESPESAS}?userId=${userId}&mes=${mesAtual}`;
      const res = await axios.get(url);
      const rows = res.data || [];
      setDespesas(rows);
      const total = rows
        .filter(despesa => despesa.despesa_pago)
        .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || despesa.valor || 0), 0);
      setTotalDespesas(total);
    } catch (err) {
      console.error('❌ Erro ao buscar Despesas:', err);
      console.error('❌ Detalhes do erro:', err.response?.data);
    } finally {
      setLoading(false);
    }
  }, [userId, mesAtual]);

  const fetchDespesasTodas = useCallback(async () => {
    if (!userId) return;
    setLoadingTodas(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`);
      setTodasDespesasCache(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar todas as despesas:', err);
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
    await fetchFaturasCartao();
  }, [abaLista, fetchDespesasMes, fetchDespesasTodas]);

  useEffect(() => {
    if (!userId) return;
    fetchContas();
    fetchMetas();
    fetchCategoriasCustomizadas();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchDespesasMes();
    fetchFaturasCartao();
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
        if (!cancelled) setTodasDespesasCache(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      } finally {
        if (!cancelled) setLoadingTodas(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, abaLista, todasDespesasCache]);

  const poolDespesas = useMemo(() => {
    const todas = todasDespesasCache;
    const mes = despesas;
    if (!todas || todas.length === 0) return mes;
    const m = new Map(todas.map(d => [d.despesa_id, d]));
    mes.forEach(d => m.set(d.despesa_id, d));
    return Array.from(m.values());
  }, [despesas, todasDespesasCache]);

  const listaPorAba = useMemo(() => {
    if (abaLista === 'atual') return despesas;
    if (abaLista === 'historico') return todasDespesasCache || [];
    const hoje = ymdToday();
    return (todasDespesasCache || []).filter(d => ymdFromIso(d.despesa_data) > hoje);
  }, [abaLista, despesas, todasDespesasCache]);

  const listaAposBusca = useMemo(() => {
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

  const despesasFiltradas = useMemo(() => {
    if (filtroPago === 'todos') return listaAposBusca;
    if (filtroPago === 'pago') return listaAposBusca.filter(d => d.despesa_pago);
    return listaAposBusca.filter(d => !d.despesa_pago);
  }, [listaAposBusca, filtroPago]);

  const despesasPorTipo = useMemo(() => {
    const grupos = {};
    despesasFiltradas.forEach(d => {
      const tipoKey = d.despesa_tipo || 'Sem tipo';
      const nomeBase = extrairNomeBaseRecorrente(d.despesa_descricao || '');
      if (!grupos[tipoKey]) grupos[tipoKey] = {};
      if (!grupos[tipoKey][nomeBase]) grupos[tipoKey][nomeBase] = [];
      grupos[tipoKey][nomeBase].push(d);
    });
    const ordem = [...tiposDespesa];
    const outrosTipos = Object.keys(grupos).filter(t => !ordem.includes(t)).sort();
    const ordemFinal = [...ordem.filter(t => grupos[t]), ...outrosTipos];
    return ordemFinal.map(tipo => {
      const subgruposRaw = grupos[tipo];
      const subgrupos = Object.entries(subgruposRaw).map(([nomeBase, itens]) => {
        const ordenados = [...itens].sort((a, b) => {
          const dataA = (a.despesa_dtvencimento || a.despesa_data || '').split('T')[0];
          const dataB = (b.despesa_dtvencimento || b.despesa_data || '').split('T')[0];
          return dataA.localeCompare(dataB);
        });
        return { nomeBase, itens: ordenados };
      }).sort((a, b) => (a.nomeBase || '').localeCompare(b.nomeBase || ''));
      return { tipo, subgrupos };
    });
  }, [despesasFiltradas, tiposDespesa]);

  const despesasOrdenadasPorVencimento = useMemo(() => {
    return [...despesasFiltradas].sort((a, b) => {
      const dataA = (a.despesa_dtvencimento || a.despesa_data || '').split('T')[0];
      const dataB = (b.despesa_dtvencimento || b.despesa_data || '').split('T')[0];
      return dataA.localeCompare(dataB);
    });
  }, [despesasFiltradas]);

  const listarAgrupado = abaLista === 'atual' ? exibirAgrupado : listaAvancadaAgruparCategoria;

  const setAbaListaComLimpeza = (aba) => {
    setAbaLista(aba);
    setSelectedIds(new Set());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descricao || !valor || !data || !tipo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const despesaData = {
        descricao, 
        valor: valorParaNumero(valor), 
        data, 
        dataVencimento,
        tipo,
        pago,
        conta_id: contaId || null,
        usuario_id: userId,
        recorrente,
        frequencia,
        proximasParcelas
      };
      
      await axios.post(API_ENDPOINTS.DESPESAS, despesaData);
      setDescricao('');
      setValor('');
      setData('');
      setDataVencimento('');
      setTipo('');
      setPago(false);
      setContaId('');
      setRecorrente(false);
      setFrequencia('mensal');
      setProximasParcelas(12);
      await refreshAfterMutation();
      alert(recorrente ? 'Despesas recorrentes criadas com sucesso!' : 'Despesa adicionada com sucesso');
    } catch (err) {
      alert('Erro ao adicionar despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (despesa) => {
    setDescricao(despesa.despesa_descricao);
    const valorNum = parseFloat(despesa.despesa_valor) || 0;
    setValor(valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    const dataFormatada = despesa.despesa_data ? despesa.despesa_data.split('T')[0] : '';
    setData(dataFormatada);
    const dataVencimentoFormatada = despesa.despesa_dtvencimento ? despesa.despesa_dtvencimento.split('T')[0] : '';
    setDataVencimento(dataVencimentoFormatada);
    setTipo(despesa.despesa_tipo);
    setPago(despesa.despesa_pago || false);
    setContaId(despesa.conta_id || '');
    setRecorrente(despesa.despesa_recorrente || false);
    setFrequencia(despesa.despesa_frequencia || 'mensal');
    setProximasParcelas(despesa.despesa_proximasparcelas || 12);
    setEditId(despesa.despesa_id);
    setTimeout(() => formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const getItensDoGrupo = (despesaRef) => {
    if (!despesaRef) return [];
    const nomeBase = extrairNomeBaseRecorrente(despesaRef.despesa_descricao || '');
    return poolDespesas.filter(d =>
      extrairNomeBaseRecorrente(d.despesa_descricao || '') === nomeBase &&
      (d.despesa_tipo || '') === (despesaRef.despesa_tipo || '')
    );
  };

  const handleDelete = (id) => {
    pedirConfirmacaoExclusao([id]);
  };

  const executarExclusoes = async (ids) => {
    if (ids.length === 0) return;
    const qtd = ids.length;
    setDeletingInProgress(true);
    try {
      for (const id of ids) {
        await axios.delete(`${API_ENDPOINTS.DESPESAS}/${id}`);
      }
      setSelectedIds(prev => { const next = new Set(prev); ids.forEach(id => next.delete(id)); return next; });
      await refreshAfterMutation();
      alert(`${qtd} registro${qtd === 1 ? '' : 's'} apagado${qtd === 1 ? '' : 's'}`);
    } catch (err) {
      console.error('Erro ao excluir despesas:', err);
      alert(err.response?.data?.error || err.message || 'Erro ao excluir despesas.');
    } finally {
      setDeletingInProgress(false);
    }
  };

  const pedirConfirmacaoExclusao = (ids) => {
    const lista = (ids || []).filter(Boolean);
    if (lista.length === 0) return;
    const qtd = lista.length;
    setModalExclusao({
      mensagem: `Deseja excluir ${qtd} registro${qtd === 1 ? '' : 's'}?`,
      onSim: async () => {
        setModalExclusao(null);
        await executarExclusoes(lista);
      },
      onCancelar: () => setModalExclusao(null),
    });
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
    if (selectedIds.size === 0) return;
    pedirConfirmacaoExclusao([...selectedIds]);
  };

  const handleDeleteGroup = (_tipoGrupo, itens) => {
    const ids = (itens || []).map(d => d.despesa_id).filter(Boolean);
    pedirConfirmacaoExclusao(ids);
  };

  const handleTogglePago = async (despesa) => {
    try {
      // Usar a nova rota para marcar apenas a parcela atual
      await axios.put(`${API_ENDPOINTS.PARCELA_ATUAL_DESPESA}/${despesa.despesa_id}`, {
        status: !despesa.despesa_pago
      });
      await refreshAfterMutation();
    } catch (err) {
      console.log('Erro ao atualizar status de pago:', err);
      alert('Erro ao atualizar status de pago');
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!descricao || !valor || !data || !tipo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    if (submitting) return;
    const despesaEditando = poolDespesas.find(d => d.despesa_id === editId);
    const payload = { descricao, valor: valorParaNumero(valor), data, dataVencimento, tipo, pago, conta_id: contaId || null };
    if (despesaEditando && despesaEhRecorrente(despesaEditando)) {
      setModalEditarRecorrente({
        mensagem: 'Replicar alterações para os itens não pagos da série?',
        payload,
        onSim: () => aplicarUpdateComReplicacao(payload, true),
        onNao: () => aplicarUpdateComReplicacao(payload, false),
        onCancelar: () => setModalEditarRecorrente(null)
      });
    } else {
      aplicarUpdateSimples(payload);
    }
  };

  const aplicarUpdateSimples = async (payload) => {
    setSubmitting(true);
    try {
      await axios.put(`${API_ENDPOINTS.DESPESAS}/${editId}`, {
        ...payload,
        pago: payload.pago,
        conta_id: payload.conta_id
      });
      await finalizarEdicao();
      alert('Despesa atualizada com sucesso');
    } catch (err) {
      alert('Erro ao atualizar despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const aplicarUpdateComReplicacao = async (payload, replicar) => {
    setModalEditarRecorrente(null);
    setSubmitting(true);
    try {
      await axios.put(`${API_ENDPOINTS.DESPESAS}/${editId}`, {
        descricao: payload.descricao,
        valor: payload.valor,
        data: payload.data,
        dataVencimento: payload.dataVencimento,
        tipo: payload.tipo,
        pago: payload.pago,
        conta_id: payload.conta_id
      });
      if (replicar) {
        const despesaEditando = poolDespesas.find(d => d.despesa_id === editId);
        const nomeBase = extrairNomeBaseRecorrente(despesaEditando?.despesa_descricao || '');
        const outrosNaoPagos = poolDespesas.filter(d =>
          d.despesa_id !== editId &&
          !d.despesa_pago &&
          extrairNomeBaseRecorrente(d.despesa_descricao || '') === nomeBase &&
          (d.despesa_tipo || '') === (payload.tipo || '')
        );
        for (const d of outrosNaoPagos) {
          await axios.put(`${API_ENDPOINTS.DESPESAS}/${d.despesa_id}`, {
            descricao: d.despesa_descricao,
            valor: payload.valor,
            data: d.despesa_data,
            dataVencimento: d.despesa_dtvencimento || payload.dataVencimento,
            tipo: payload.tipo,
            pago: d.despesa_pago,
            conta_id: payload.conta_id || d.conta_id
          });
        }
        if (outrosNaoPagos.length > 0) {
          alert(`Despesa atualizada. ${outrosNaoPagos.length} item(ns) não pagos da série também foram atualizados.`);
        } else {
          alert('Despesa atualizada com sucesso');
        }
      } else {
        alert('Despesa atualizada com sucesso');
      }
      await finalizarEdicao();
    } catch (err) {
      alert('Erro ao atualizar despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const finalizarEdicao = async () => {
    setDescricao('');
    setValor('');
    setData('');
    setDataVencimento('');
    setTipo('');
    setPago(false);
    setContaId('');
    setEditId(null);
    await refreshAfterMutation();
  };

  const handleCancel = () => {
    setDescricao('');
    setValor('');
    setData('');
    setDataVencimento('');
    setTipo('');
    setPago(false);
    setContaId('');
    setEditId(null);
  };

  const formatarData = (data) => {
    if (!data) return '00/00/0000';
    try {
      // Usar split para evitar problemas de fuso horário
      const dataFormatada = data.split('T')[0]; // YYYY-MM-DD
      const [ano, mes, dia] = dataFormatada.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      return '00/00/0000';
    }
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Função para obter ícone (considera customizados)
  const getIcone = (tipo) => {
    if (iconesCustomizados[tipo]) {
      return getIconComponentByName(iconesCustomizados[tipo]);
    }
    return getIconForTipo(tipo, 'despesa');
  };

  const getCor = (tipo) => getColorForTipo(tipo, 'despesa', coresCustomizadas);

  const handleSalvarMeta = async () => {
    if (!metaCategoria || !metaValor) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = hoje.getMonth() + 1;
      
      await axios.post(API_ENDPOINTS.METAS_DESPESA, {
        categoria: metaCategoria,
        valor_meta: parseFloat(metaValor),
        periodo: 'mensal',
        mes: mes,
        ano: ano,
        usuario_id: userId
      });
      
      setMetaCategoria('');
      setMetaValor('');
      fetchMetas();
      alert('Meta salva com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar meta:', err);
      alert('Erro ao salvar meta');
    }
  };

  const handleExcluirMeta = async (metaId) => {
    if (!confirm('Deseja realmente excluir esta meta?')) {
      return;
    }

    try {
      await axios.delete(`${API_ENDPOINTS.METAS_DESPESA}/${metaId}`);
      fetchMetas();
      alert('Meta excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir meta:', err);
      alert('Erro ao excluir meta');
    }
  };

  // Calcular totais por categoria e comparar com metas
  const calcularTotaisPorCategoria = () => {
    const totais = {};
    despesas
      .filter(d => d.despesa_pago && d.despesa_data?.slice(0, 7) === mesAtual)
      .forEach(despesa => {
        if (!totais[despesa.despesa_tipo]) {
          totais[despesa.despesa_tipo] = 0;
        }
        totais[despesa.despesa_tipo] += parseFloat(despesa.despesa_valor || 0);
      });
    
    return totais;
  };

  // Calcular total geral de despesas do mês
  const calcularTotalGeral = () => {
    return despesas
      .filter(d => d.despesa_pago && d.despesa_data?.slice(0, 7) === mesAtual)
      .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0);
  };

  if (!userId) {
    return <div>Usuário não logado</div>;
  }

  const showListaLoading = abaLista === 'atual'
    ? loading
    : (loadingTodas && todasDespesasCache === null);

  return (
    <div className="receita-container">
      {/* Modal de criação rápida de categoria */}
      {mostrarModalCategoria && (
        <div className="modal-overlay" onClick={() => setMostrarModalCategoria(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Nova Categoria</h3>
              <button className="modal-close" onClick={() => setMostrarModalCategoria(false)}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="form-group">
                <label>Nome da Categoria:</label>
                <input
                  type="text"
                  value={novaCategoriaNome}
                  onChange={(e) => setNovaCategoriaNome(e.target.value)}
                  placeholder="Ex: Academia, Streaming, etc."
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setMostrarModalCategoria(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={criarCategoriaRapida}
                  disabled={salvandoCategoria || !novaCategoriaNome.trim()}
                >
                  {salvandoCategoria ? 'Salvando...' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalExclusao && (
        <ConfirmacaoExclusao
          mensagem={modalExclusao.mensagem}
          onSim={modalExclusao.onSim}
          onCancelar={modalExclusao.onCancelar}
        />
      )}
      {modalEditarRecorrente && (
        <ConfirmacaoEdicaoRecorrente
          mensagem={modalEditarRecorrente.mensagem}
          onSim={modalEditarRecorrente.onSim}
          onNao={modalEditarRecorrente.onNao}
          onCancelar={modalEditarRecorrente.onCancelar}
        />
      )}
      <div className="receita-header">
        <div className="header-content">
          <h2>Despesas</h2>
          <button 
            onClick={navigateToHome}
            className="btn-home"
            title="Voltar para Home"
          >
            <FaHome /> Home
          </button>
        </div>
        <div className="receita-stats">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{formatarValor(despesasFiltradas.filter(despesa => despesa.despesa_pago)
              .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0))}</span>
          </div>
          <div className="stat-card stat-card-previsao">
            <span className="stat-label">Previsão</span>
            <span className="stat-value">{formatarValor(despesasFiltradas.filter(d => !d.despesa_pago).reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0))}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Quantidade</span>
            <span className="stat-value">{despesasFiltradas.length}</span>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="form-container" ref={formContainerRef}>
        <h3>{editId ? 'Editar Despesa' : 'Adicionar Nova Despesa'}</h3>
        <form onSubmit={editId ? handleUpdate : handleSubmit} className="receita-form">
          <div className="form-row">
            <div className="form-group">
              <label>Descrição:</label>
              <input
                type="text"
                placeholder="Descrição da despesa"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Valor:</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={valor}
                onChange={e => setValor(formatarValorInput(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Data:</label>
              <input
                type="date"
                value={data}
                onChange={e => setData(normalizarDataInput(e.target.value))}
                required
                min="1900-01-01"
                max="2099-12-31"
              />
            </div>
            <div className="form-group">
              <label>Data de Vencimento:</label>
              <input
                type="date"
                value={dataVencimento}
                onChange={e => setDataVencimento(normalizarDataInput(e.target.value))}
                min="1900-01-01"
                max="2099-12-31"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Categoria:</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <SelectWithIcons
                    options={tiposDespesa}
                    value={tipo}
                    onChange={setTipo}
                    categoria="despesa"
                    placeholder="Selecione"
                    required
                    customIcons={iconesCustomizados}
                    customColors={coresCustomizadas}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarModalCategoria(true)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '2px solid #4F46E5',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                  title="Criar nova categoria"
                >
                  +
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Conta:</label>
              <AccountSelector
                value={contaId}
                onChange={setContaId}
                contas={contas}
                placeholder="Selecione uma conta"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={pago}
                  onChange={e => setPago(e.target.checked)}
                />
                Pago
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={recorrente}
                  onChange={e => setRecorrente(e.target.checked)}
                />
                Recorrente
              </label>
            </div>
          </div>
            {recorrente && (
              <>
                <div className="form-group">
                  <label>Frequência:</label>
                  <select value={frequencia} onChange={e => setFrequencia(e.target.value)}>
                    <option value="mensal">Mensal</option>
                    <option value="semanal">Semanal</option>
                    <option value="quinzenal">Quinzenal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Número de Parcelas:</label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={proximasParcelas}
                    onChange={e => setProximasParcelas(parseInt(e.target.value) || 1)}
                  />
                </div>
              </>
            )}
          
          <div className="form-buttons">
            {editId ? (
              <>
                <button type="submit" className="btn-atualizar" disabled={submitting}>
                  {submitting ? 'Processando...' : <><FaEdit /> Atualizar Despesa</>}
                </button>
                <button type="button" onClick={handleCancel} className="btn-cancelar">
                  Cancelar
                </button>
              </>
            ) : (
              <button type="submit" className="btn-adicionar" disabled={submitting}>
                {submitting ? (
                  <>Processando{recorrente ? ` ${proximasParcelas} parcelas` : ''}...</>
                ) : (
                  <><FaPlus /> Adicionar Despesa</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Seção de Metas */}
      <div className="metas-container">
        <div className="metas-header" onClick={() => setMostrarMetas(!mostrarMetas)}>
          <h3><FaBullseye /> Metas de Despesas por Categoria</h3>
          <span>{mostrarMetas ? '▼' : '▶'}</span>
        </div>
        
        {mostrarMetas && (
          <>
            <div className="metas-form">
              <div className="metas-inputs">
                <SelectWithIcons
                  options={tiposDespesa}
                  value={metaCategoria}
                  onChange={setMetaCategoria}
                  categoria="despesa"
                  placeholder="Selecione a categoria"
                  customIcons={iconesCustomizados}
                  customColors={coresCustomizadas}
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="% da meta (ex: 30)"
                  value={metaValor}
                  onChange={e => setMetaValor(e.target.value)}
                />
                <button onClick={handleSalvarMeta} className="btn-adicionar">
                  <FaPlus /> Adicionar Meta
                </button>
              </div>
            </div>

            {metas.length > 0 && (
              <div className="metas-grid">
                <div className="metas-grid-header">
                  <div>Categoria</div>
                  <div>Meta %</div>
                  <div>Gasto Atual (%)</div>
                  <div>Diferença</div>
                  <div>Ações</div>
                </div>
                {metas.map(meta => {
                  const totais = calcularTotaisPorCategoria();
                  const gastoAtual = totais[meta.categoria] || 0;
                  const totalGeral = calcularTotalGeral();
                  
                  // Converter valor_meta para número
                  const metaPercentual = parseFloat(meta.valor_meta) || 0;
                  
                  // Calcular o percentual que a categoria representa do total
                  const percentualAtual = totalGeral > 0 ? (gastoAtual / totalGeral) * 100 : 0;
                  
                  // Comparar com a meta percentual
                  const diferenca = Math.abs(percentualAtual - metaPercentual);
                  const status = percentualAtual <= metaPercentual * 1.1 ? 'ok' : 'atencao';
                  
                  return (
                    <div key={meta.meta_id} className={`metas-grid-row ${status}`}>
                      <div>{(() => {
                    const Icon = getIcone(meta.categoria);
                    return <><Icon className="category-icon" style={{ color: getCor(meta.categoria) }} /> {meta.categoria}</>;
                  })()}</div>
                      <div>{metaPercentual.toFixed(1)}%</div>
                      <div>{formatarValor(gastoAtual)} ({percentualAtual.toFixed(1)}%)</div>
                      <div>
                        {status === 'ok' && <FaCheckCircle className="status-ok" />}
                        {status === 'atencao' && <FaExclamationCircle className="status-atencao" />}
                        {diferenca.toFixed(1)}%
                      </div>
                      <div>
                        <button 
                          onClick={() => handleExcluirMeta(meta.meta_id)}
                          className="btn-delete"
                          title="Excluir meta"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Seção de Faturas de Cartão */}
      {faturasCartao.length > 0 && (
        <div className="cartoes-fatura-container">
          <div className="metas-header" onClick={() => setMostrarCartoes(!mostrarCartoes)}>
            <h3><FaCreditCard /> Faturas de Cartão de Crédito</h3>
            <span>{mostrarCartoes ? '▼' : '▶'}</span>
          </div>
          
          {mostrarCartoes && (
            <div className="cartoes-fatura-lista">
              {faturasCartao.map(cartao => (
                <div key={cartao.cartao_id} className="cartao-fatura-item">
                  <div 
                    className="cartao-fatura-header"
                    onClick={() => setCartaoExpandido(cartaoExpandido === cartao.cartao_id ? null : cartao.cartao_id)}
                    style={{ borderLeftColor: cartao.cartao_cor }}
                  >
                    <div className="cartao-fatura-info">
                      <FaCreditCard style={{ color: cartao.cartao_cor }} />
                      <span className="cartao-nome">{cartao.cartao_nome}</span>
                      <span className="cartao-bandeira">({cartao.cartao_bandeira})</span>
                    </div>
                    <div className="cartao-fatura-valor">
                      <span className="valor despesa">{formatarValor(cartao.valorFatura)}</span>
                      <span className="qtd-compras">{cartao.compras.length} compra(s)</span>
                      <span>{cartaoExpandido === cartao.cartao_id ? <FaChevronDown /> : <FaChevronRight />}</span>
                    </div>
                  </div>
                  
                  {cartaoExpandido === cartao.cartao_id && (
                    <div className="cartao-compras-lista">
                      <div className="compras-header">
                        <span>Descrição</span>
                        <span>Categoria</span>
                        <span>Data</span>
                        <span>Parcela</span>
                        <span>Vencimento</span>
                        <span>Valor</span>
                      </div>
                      {cartao.compras.map(compra => {
                        const diaVen = cartao.cartao_dia_vencimento || 10;
                        const mesFat = (compra.compra_mes_fatura || '').trim();
                        const vencimento = mesFat ? `${String(diaVen).padStart(2, '0')}/${mesFat.slice(5, 7)}` : '-';
                        return (
                        <div key={compra.compra_id} className="compra-row">
                          <span>{compra.compra_descricao}</span>
                          <span>
                            {compra.compra_categoria ? (
                              <>{(() => {
                                const Icon = getIcone(compra.compra_categoria);
                                return <Icon className="category-icon" style={{ color: getCor(compra.compra_categoria) }} />;
                              })()} {compra.compra_categoria}</>
                            ) : '-'}
                          </span>
                          <span>{formatarData(compra.compra_data)}</span>
                          <span>
                            {compra.compra_parcelas > 1 
                              ? `${compra.compra_parcela_atual}/${compra.compra_parcelas}` 
                              : '-'}
                          </span>
                          <span>{vencimento}</span>
                          <span className="despesa">{formatarValor(compra.compra_valor_parcela)}</span>
                        </div>
                      );})}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="cartao-fatura-total">
                <span>Total Faturas:</span>
                <span className="valor despesa">
                  {formatarValor(faturasCartao.reduce((sum, c) => sum + c.valorFatura, 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {modalFiltroLista && (
        <div className="modal-overlay" onClick={() => setModalFiltroLista(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>Filtros</h3>
              <button type="button" className="modal-close" onClick={() => setModalFiltroLista(false)}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              {(abaLista === 'historico' || abaLista === 'futuros') && (
                <div className="form-group">
                  <label>Nome ou categoria</label>
                  <input
                    type="text"
                    value={buscaLista}
                    onChange={(e) => setBuscaLista(e.target.value)}
                    placeholder="Digite para filtrar..."
                  />
                </div>
              )}
              <div className="form-group">
                <label>Status</label>
                <select
                  value={filtroPago}
                  onChange={(e) => setFiltroPago(e.target.value)}
                  className="filtro-select"
                  style={{ width: '100%' }}
                >
                  <option value="todos">Todos</option>
                  <option value="pago">Pago</option>
                  <option value="nao_pago">Não pago</option>
                </select>
              </div>
              <label className="filtro-checkbox-label" style={{ display: 'block', marginTop: '12px' }}>
                <input
                  type="checkbox"
                  checked={abaLista === 'atual' ? exibirAgrupado : listaAvancadaAgruparCategoria}
                  onChange={(e) => {
                    if (abaLista === 'atual') setExibirAgrupado(e.target.checked);
                    else setListaAvancadaAgruparCategoria(e.target.checked);
                  }}
                />
                Agrupar (Categoria)
              </label>
              <button type="button" className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setModalFiltroLista(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Despesas */}
      <div className="grid-container">
        <div className="grid-header-row">
          <h3>Lista de Despesas</h3>
          <div className="filtro-container filtro-row filtro-above-grid">
            <div className="filtro-group filtro-tabs">
              <button type="button" className={`filtro-tab ${abaLista === 'historico' ? 'filtro-tab-active' : ''}`} onClick={() => setAbaListaComLimpeza('historico')}>Histórico</button>
              <button type="button" className={`filtro-tab ${abaLista === 'atual' ? 'filtro-tab-active' : ''}`} onClick={() => setAbaListaComLimpeza('atual')}>Atual</button>
              <button type="button" className={`filtro-tab ${abaLista === 'futuros' ? 'filtro-tab-active' : ''}`} onClick={() => setAbaListaComLimpeza('futuros')}>Futuros</button>
            </div>
            {abaLista === 'atual' && (
              <div className="filtro-group filtro-mes-nav">
                <button type="button" className="filtro-mes-seta" onClick={() => setMesAtual(addMonthsYm(mesAtual, -1))} aria-label="Mês anterior"><FaChevronLeft /></button>
                <span className="filtro-mes-titulo">{formatMesPtBr(mesAtual)}</span>
                <button type="button" className="filtro-mes-seta" onClick={() => setMesAtual(addMonthsYm(mesAtual, 1))} aria-label="Próximo mês"><FaChevronRight /></button>
                <label className="filtro-mes-seta filtro-mes-calendario" title="Escolher mês">
                  <FaCalendarAlt />
                  <input
                    type="date"
                    value={ymPrimeiroDia(mesAtual)}
                    onChange={(e) => {
                      const novo = ymdToYm(e.target.value);
                      if (novo) setMesAtual(novo);
                    }}
                  />
                </label>
              </div>
            )}
            <button
              type="button"
              className="filtro-icon-btn"
              onClick={() => setModalFiltroLista(true)}
              title="Filtro"
              aria-label="Filtro"
            >
              <FaFilter size={16} color="#2563EB" aria-hidden="true" />
            </button>
          </div>
        </div>
        {selectedIds.size > 0 && (
          <div className="bulk-actions">
            <span className="bulk-count">{selectedIds.size} selecionada(s)</span>
            <button
              type="button"
              className="btn-delete bulk-delete"
              onClick={handleDeleteSelected}
              title="Excluir selecionadas"
            >
              <FaTrash /> Excluir selecionadas
            </button>
          </div>
        )}
        {showListaLoading ? (
          <div className="loading">Carregando...</div>
            ) : despesasFiltradas.length === 0 ? (
          <div className="no-data">Nenhuma despesa encontrada{filtroPago !== 'todos' ? ' com esse filtro' : ''}</div>
        ) : (
          <div className="despesas-grid">
            <div className="grid-header">
              <div className="grid-cell grid-cell-check">
                <input
                  type="checkbox"
                  checked={despesasFiltradas.length > 0 && selectedIds.size === despesasFiltradas.length}
                  onChange={toggleSelectAll}
                  title="Selecionar todas"
                />
              </div>
              <div className="grid-cell">Descrição</div>
              <div className="grid-cell">Valor</div>
              <div className="grid-cell">Data</div>
              <div className="grid-cell">Data Vencimento</div>
              <div className="grid-cell">Tipo</div>
              <div className="grid-cell">Conta</div>
              <div className="grid-cell">Pago</div>
              <div className="grid-cell">Ações</div>
            </div>
            {listarAgrupado ? despesasPorTipo.map(({ tipo: tipoGrupo, subgrupos }) => {
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
              const IconTipo = getIcone(tipoGrupo);
              return (
                <div key={tipoKey} className="grid-grupo-tipo">
                  <div
                    className={`grid-group-header grid-group-header-nivel1 ${tipoColapsado ? 'colapsado' : ''}`}
                    onClick={toggleTipo}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTipo(); } }}
                  >
                    <span className="grid-group-header-title">
                      {tipoColapsado ? <FaChevronRight className="group-chevron" /> : <FaChevronDown className="group-chevron" />}
                      <IconTipo className="category-icon" style={{ color: getCor(tipoGrupo) }} /> {tipoGrupo}
                      <span className="group-count">({totalTipo})</span>
                    </span>
                  </div>
                  {!tipoColapsado && subgrupos.map(({ nomeBase, itens }) => {
                    const grupoKey = `${tipoGrupo}|${nomeBase}`;
                    const colapsado = gruposColapsados.has(grupoKey);
                    const toggleSub = () => {
                      setGruposColapsados(prev => {
                        const next = new Set(prev);
                        if (next.has(grupoKey)) next.delete(grupoKey);
                        else next.add(grupoKey);
                        return next;
                      });
                    };
                    const labelSubgrupo = nomeBase;
                    return (
                      <React.Fragment key={grupoKey}>
                        <div
                          className={`grid-group-header grid-group-header-subnivel ${colapsado ? 'colapsado' : ''}`}
                          onClick={toggleSub}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSub(); } }}
                        >
                          <span className="grid-group-header-title">
                            {colapsado ? <FaChevronRight className="group-chevron" /> : <FaChevronDown className="group-chevron" />}
                            {labelSubgrupo}
                            <span className="group-count">({itens.length})</span>
                          </span>
                          <span className="grid-group-header-actions">
                            <button
                              type="button"
                              className="btn-edit btn-edit-group"
                              onClick={(e) => { e.stopPropagation(); if (itens.length > 0) handleEdit(itens[0]); }}
                              title={`Editar despesa do grupo ${labelSubgrupo}`}
                            >
                              <FaEdit /> Editar
                            </button>
                            <button
                              type="button"
                              className="btn-delete btn-delete-group"
                              onClick={(e) => { e.stopPropagation(); handleDeleteGroup(labelSubgrupo, itens); }}
                              title={`Excluir despesas do grupo ${labelSubgrupo}`}
                            >
                              <FaTrash /> Excluir grupo ({itens.length})
                            </button>
                          </span>
                        </div>
                        {!colapsado && itens.map(despesa => {
                  const conta = contas.find(c => c.Conta_Id === despesa.Conta_id || c.conta_id === despesa.conta_id);
                  return (
                    <div key={despesa.despesa_id} className="grid-row">
                      <div className="grid-cell grid-cell-check">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(despesa.despesa_id)}
                          onChange={() => toggleSelect(despesa.despesa_id)}
                          title="Selecionar para excluir"
                        />
                      </div>
                      <div className="grid-cell">{despesa.despesa_descricao}</div>
                      <div className="grid-cell valor">{formatarValor(despesa.despesa_valor)}</div>
                      <div className="grid-cell">{formatarData(despesa.despesa_data)}</div>
                      <div className="grid-cell">{formatarData(despesa.despesa_dtvencimento)}</div>
                      <div className="grid-cell grid-cell-tipo">
                        {(() => {
                          const Icon = getIcone(despesa.despesa_tipo);
                          return <><Icon className="category-icon" style={{ color: getCor(despesa.despesa_tipo) }} /> {despesa.despesa_tipo}</>;
                        })()}
                      </div>
                      <div className="grid-cell grid-cell-conta">
                        {conta ? (
                          <>
                            {(() => {
                              const b = getBancoById(conta.conta_banco || conta.Conta_Banco);
                              return (
                                <span className="conta-com-badge">
                                  <BankLogo banco={b} className="bank-badge-list" size={28} />
                                  {conta.conta_nome || conta.Conta_Nome}
                                </span>
                              );
                            })()}
                          </>
                        ) : '-'}
                      </div>
                      <div className="grid-cell grid-cell-status">
                        <label className="status-pago-wrap">
                          <input
                          type="checkbox"
                          checked={despesa.despesa_pago || false}
                          onChange={() => handleTogglePago(despesa)}
                          title={despesa.despesa_pago ? "Marcar como não pago" : "Marcar como pago"}
                        />
                          <span
                            className={`status-badge ${despesa.despesa_pago ? 'pago' : 'pendente'}`}
                            title={despesa.despesa_pago ? 'Pago' : 'Pendente'}
                            aria-label={despesa.despesa_pago ? 'Pago' : 'Pendente'}
                          />
                        </label>
                      </div>
                      <div className="grid-cell acoes">
                        <button 
                          onClick={() => handleEdit(despesa)}
                          className="btn-edit"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(despesa.despesa_id)}
                          className="btn-delete"
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }) : despesasOrdenadasPorVencimento.map(despesa => {
              const conta = contas.find(c => c.Conta_Id === despesa.Conta_id || c.conta_id === despesa.conta_id);
              return (
                <div key={despesa.despesa_id} className="grid-row">
                  <div className="grid-cell grid-cell-check">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(despesa.despesa_id)}
                      onChange={() => toggleSelect(despesa.despesa_id)}
                      title="Selecionar para excluir"
                    />
                  </div>
                  <div className="grid-cell">{despesa.despesa_descricao}</div>
                  <div className="grid-cell valor">{formatarValor(despesa.despesa_valor)}</div>
                  <div className="grid-cell">{formatarData(despesa.despesa_data)}</div>
                  <div className="grid-cell">{formatarData(despesa.despesa_dtvencimento)}</div>
                  <div className="grid-cell grid-cell-tipo">
                    {(() => {
                      const Icon = getIcone(despesa.despesa_tipo);
                      return <><Icon className="category-icon" style={{ color: getCor(despesa.despesa_tipo) }} /> {despesa.despesa_tipo}</>;
                    })()}
                  </div>
                  <div className="grid-cell grid-cell-conta">
                    {conta ? (
                      <>
                        {(() => {
                          const b = getBancoById(conta.conta_banco || conta.Conta_Banco);
                          return (
                            <span className="conta-com-badge">
                              <BankLogo banco={b} className="bank-badge-list" size={28} />
                              {conta.conta_nome || conta.Conta_Nome}
                            </span>
                          );
                        })()}
                      </>
                    ) : '-'}
                  </div>
                  <div className="grid-cell grid-cell-status">
                    <label className="status-pago-wrap">
                      <input
                      type="checkbox"
                      checked={despesa.despesa_pago || false}
                      onChange={() => handleTogglePago(despesa)}
                      title={despesa.despesa_pago ? "Marcar como não pago" : "Marcar como pago"}
                    />
                      <span
                        className={`status-badge ${despesa.despesa_pago ? 'pago' : 'pendente'}`}
                        title={despesa.despesa_pago ? 'Pago' : 'Pendente'}
                        aria-label={despesa.despesa_pago ? 'Pago' : 'Pendente'}
                      />
                    </label>
                  </div>
                  <div className="grid-cell acoes">
                    <button 
                      onClick={() => handleEdit(despesa)}
                      className="btn-edit"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(despesa.despesa_id)}
                      className="btn-delete"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deletingInProgress && (
        <div className="processing-delete-bar">
          <span>Processando exclusão... Aguarde.</span>
        </div>
      )}
    </div>
  );
}

export default Despesa;