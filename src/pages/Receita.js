import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaHome, FaChevronDown, FaChevronRight, FaChevronLeft, FaCalendarAlt } from 'react-icons/fa';
import { getIconForTipo, getIconComponentByName, getColorForTipo } from '../utils/categoryIcons';
import { getBancoById } from '../utils/banks';
import BankLogo from '../components/BankLogo';

import { extrairNomeBaseRecorrente, receitaEhRecorrente } from '../utils/recorrentes';
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

function Receita() {
  const navigate = useNavigate();
  const [receitas, setReceitas] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [contaId, setContaId] = useState('');
  const [contas, setContas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [mesAtual, setMesAtual] = useState(currentMonthYm);
  const [abaLista, setAbaLista] = useState('atual');
  const [todasReceitasCache, setTodasReceitasCache] = useState(null);
  const [loadingTodas, setLoadingTodas] = useState(false);
  const [buscaLista, setBuscaLista] = useState('');
  const [listaAvancadaAgruparCategoria, setListaAvancadaAgruparCategoria] = useState(false);
  const [modalFiltroLista, setModalFiltroLista] = useState(false);
  const [filtroRecebido, setFiltroRecebido] = useState('todos');
  const [loading, setLoading] = useState(false);
  
  
  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;
  console.log('Usuario logado em Receita:', usuario);
  console.log('UserId em Receita:', userId);

  console.log('Usuário logado:', usuario);
  console.log('User ID:', userId);
  
  // Estado para categorias customizadas
  const [categoriasCustomizadas, setCategoriasCustomizadas] = useState([]);
  const [iconesCustomizados, setIconesCustomizados] = useState({});
  const [coresCustomizadas, setCoresCustomizadas] = useState({});
  
  // Categorias padrão
  const tiposReceitaPadrao = [
    'Salário',
    'Venda',
    'Presente',
    'Investimento',
    'Aluguel',
    'Outros'
  ];
  
  // Combinar categorias padrão com customizadas
  const tiposReceita = [...tiposReceitaPadrao, ...categoriasCustomizadas];
  const [tipo, setTipo] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [recebido, setRecebido] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState('mensal');
  const [proximasParcelas, setProximasParcelas] = useState(12);
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

  const fetchCategoriasCustomizadas = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.CATEGORIAS}?userId=${userId}&tipo=receita`);
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
        tipo: 'receita',
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

  const fetchReceitasMes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const url = `${API_ENDPOINTS.RECEITAS}?userId=${userId}&mes=${mesAtual}`;
      const res = await axios.get(url);
      const rows = res.data || [];
      setReceitas(rows);
      const total = rows
        .filter(receita => receita.receita_recebido)
        .reduce((sum, receita) => sum + parseFloat(receita.receita_valor || receita.valor || 0), 0);
      setTotalReceitas(total);
    } catch (err) {
      console.log('Erro ao buscar receitas:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, mesAtual]);

  const fetchReceitasTodas = useCallback(async () => {
    if (!userId) return;
    setLoadingTodas(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`);
      setTodasReceitasCache(res.data || []);
    } catch (err) {
      console.log('Erro ao buscar receitas:', err);
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
  }, [abaLista, fetchReceitasMes, fetchReceitasTodas]);

  useEffect(() => {
    if (!userId) return;
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
        if (!cancelled) setTodasReceitasCache(res.data || []);
      } catch (err) {
        console.log('Erro ao carregar histórico:', err);
      } finally {
        if (!cancelled) setLoadingTodas(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, abaLista, todasReceitasCache]);

  const poolReceitas = useMemo(() => {
    const todas = todasReceitasCache;
    const mes = receitas;
    if (!todas || todas.length === 0) return mes;
    const m = new Map(todas.map(r => [r.receita_id, r]));
    mes.forEach(r => m.set(r.receita_id, r));
    return Array.from(m.values());
  }, [receitas, todasReceitasCache]);

  const listaPorAba = useMemo(() => {
    if (abaLista === 'atual') return receitas;
    if (abaLista === 'historico') return todasReceitasCache || [];
    const hoje = ymdToday();
    return (todasReceitasCache || []).filter(r => ymdFromIso(r.receita_data) > hoje);
  }, [abaLista, receitas, todasReceitasCache]);

  const listaAposBusca = useMemo(() => {
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

  const receitasFiltradas = useMemo(() => {
    const lista = Array.isArray(listaAposBusca) ? listaAposBusca : [];
    if (filtroRecebido === 'todos') return lista;
    if (filtroRecebido === 'recebido') return lista.filter(r => r.receita_recebido);
    return lista.filter(r => !r.receita_recebido);
  }, [listaAposBusca, filtroRecebido]);

  const receitasPorTipo = useMemo(() => {
    const grupos = {};
    receitasFiltradas.forEach(r => {
      const tipoKey = r.receita_tipo || 'Sem tipo';
      const nomeBase = extrairNomeBaseRecorrente(r.receita_descricao || '');
      if (!grupos[tipoKey]) grupos[tipoKey] = {};
      if (!grupos[tipoKey][nomeBase]) grupos[tipoKey][nomeBase] = [];
      grupos[tipoKey][nomeBase].push(r);
    });
    const ordem = [...tiposReceita];
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
  }, [receitasFiltradas, tiposReceita]);

  const receitasOrdenadasPorData = useMemo(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descricao || !valor || !data || !tipo) {
      alert('Preencha todos os campos');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const receitaData = {
        descricao, 
        valor: valorParaNumero(valor), 
        data, 
        tipo,
        recebido,
        conta_id: contaId || null,
        usuario_id: userId,
        recorrente,
        frequencia,
        proximasParcelas
      };
      
      await axios.post(API_ENDPOINTS.RECEITAS, receitaData);
      setDescricao('');
      setValor('');
      setData('');
      setTipo('');
      setRecebido(false);
      setContaId('');
      setRecorrente(false);
      setFrequencia('mensal');
      setProximasParcelas(12);
      await refreshAfterMutation();
      alert(recorrente ? 'Receitas recorrentes criadas com sucesso!' : 'Receita adicionada com sucesso');
    } catch (err) {
      alert('Erro ao adicionar receita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (receita) => {
    setDescricao(receita.receita_descricao);
    // Formatar valor para exibição
    const valorNum = parseFloat(receita.receita_valor) || 0;
    setValor(valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    // Formatar a data para o formato YYYY-MM-DD que o input date espera
    // Usar método mais seguro para evitar problemas de fuso horário
    const dataFormatada = receita.receita_data ? 
      receita.receita_data.split('T')[0] : '';
    setData(dataFormatada);
    setTipo(receita.receita_tipo);
    setRecebido(receita.receita_recebido || false);
    setContaId(receita.conta_id || '');
    setEditId(receita.receita_id);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!descricao || !valor || !data || !tipo) {
      alert('Preencha todos os campos');
      return;
    }
    if (submitting) return;
    const receitaEditando = poolReceitas.find(r => r.receita_id === editId);
    const payload = { descricao, valor: valorParaNumero(valor), data, tipo, recebido, conta_id: contaId || null };
    if (receitaEditando && receitaEhRecorrente(receitaEditando)) {
      setModalEditarRecorrente({
        mensagem: 'Replicar alterações para os itens não recebidos da série?',
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
      await axios.put(`${API_ENDPOINTS.RECEITAS}/${editId}`, payload);
      await finalizarEdicao();
      alert('Receita atualizada com sucesso');
    } catch (err) {
      alert('Erro ao atualizar receita');
    } finally {
      setSubmitting(false);
    }
  };

  const aplicarUpdateComReplicacao = async (payload, replicar) => {
    setModalEditarRecorrente(null);
    setSubmitting(true);
    try {
      await axios.put(`${API_ENDPOINTS.RECEITAS}/${editId}`, payload);
      if (replicar) {
        const receitaEditando = poolReceitas.find(r => r.receita_id === editId);
        const nomeBase = extrairNomeBaseRecorrente(receitaEditando?.receita_descricao || '');
        const outrosNaoRecebidos = poolReceitas.filter(r =>
          r.receita_id !== editId &&
          !r.receita_recebido &&
          extrairNomeBaseRecorrente(r.receita_descricao || '') === nomeBase &&
          (r.receita_tipo || '') === (payload.tipo || '')
        );
        for (const r of outrosNaoRecebidos) {
          await axios.put(`${API_ENDPOINTS.RECEITAS}/${r.receita_id}`, {
            descricao: r.receita_descricao,
            valor: payload.valor,
            data: r.receita_data,
            tipo: payload.tipo,
            recebido: r.receita_recebido,
            conta_id: payload.conta_id || r.conta_id
          });
        }
        if (outrosNaoRecebidos.length > 0) {
          alert(`Receita atualizada. ${outrosNaoRecebidos.length} item(ns) não recebidos da série também foram atualizados.`);
        } else {
          alert('Receita atualizada com sucesso');
        }
      } else {
        alert('Receita atualizada com sucesso');
      }
      await finalizarEdicao();
    } catch (err) {
      alert('Erro ao atualizar receita');
    } finally {
      setSubmitting(false);
    }
  };

  const finalizarEdicao = async () => {
    setDescricao('');
    setValor('');
    setData('');
    setTipo('');
    setRecebido(false);
    setContaId('');
    setEditId(null);
    await refreshAfterMutation();
  };
  const handleTogglePago = async (receita) => {
    try {
      // Usar a nova rota para marcar apenas a parcela atual
      await axios.put(`${API_ENDPOINTS.PARCELA_ATUAL_RECEITA}/${receita.receita_id}`, {
        status: !receita.receita_recebido
      });
      await refreshAfterMutation();
    } catch (err) {
      console.log('Erro ao atualizar status de recebimento:', err);
      alert('Erro ao atualizar status de recebimento');
    }
  };

  const handleCancel = () => {
    setDescricao('');
    setValor('');
    setData('');
    setTipo('');
    setRecebido(false);
    setContaId('');
    setEditId(null);
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
      alert(ids.length === 1 ? 'Receita excluída com sucesso!' : `${ids.length} receita(s) excluída(s) com sucesso!`);
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Erro ao excluir receitas.');
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleDelete = (id) => {
    const receita = poolReceitas.find(r => r.receita_id === id);
    if (!receita) return;
    if (receitaEhRecorrente(receita)) {
      const itensGrupo = getItensDoGrupo(receita);
      setModalExclusao({
        mensagem: `Excluir receita recorrente "${extrairNomeBaseRecorrente(receita.receita_descricao)}"?`,
        onSim: async () => {
          setModalExclusao(null);
          const itensNaoRecebidos = itensGrupo.filter(r => !r.receita_recebido);
          await executarExclusoes(itensNaoRecebidos.map(r => r.receita_id));
        },
        onTodas: async () => {
          setModalExclusao(null);
          await executarExclusoes(itensGrupo.map(r => r.receita_id));
        },
        onCancelar: () => setModalExclusao(null)
      });
    } else {
      if (window.confirm('Deseja realmente excluir esta receita? Esta ação pode ser desfeita.')) {
        executarExclusoes([id]);
      }
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
      setModalExclusao({
        mensagem: `Excluir ${qtd} receita(s) selecionada(s)?`,
        onSim: async () => {
          setModalExclusao(null);
          const idsNaoRecebidos = itensSelecionados.filter(r => !r.receita_recebido).map(r => r.receita_id);
          await executarExclusoes(idsNaoRecebidos);
          setSelectedIds(new Set());
        },
        onTodas: async () => {
          setModalExclusao(null);
          await executarExclusoes([...selectedIds]);
          setSelectedIds(new Set());
        },
        onCancelar: () => setModalExclusao(null)
      });
    } else {
      if (window.confirm(`Excluir ${qtd} receita(s) selecionada(s)?`)) {
        executarExclusoes([...selectedIds]);
        setSelectedIds(new Set());
      }
    }
  };

  const handleDeleteGroup = (tipoGrupo, itens) => {
    const qtd = itens.length;
    if (qtd === 0) return;
    const nomeGrupo = itens[0] ? extrairNomeBaseRecorrente(itens[0].receita_descricao || '') : tipoGrupo;
    setModalExclusao({
      mensagem: `Excluir receitas do grupo "${nomeGrupo}" (${tipoGrupo})?`,
      onSim: async () => {
        setModalExclusao(null);
        const itensNaoRecebidos = itens.filter(r => !r.receita_recebido);
        if (itensNaoRecebidos.length === 0) {
          alert('Nenhuma receita não recebida neste grupo.');
          return;
        }
        await executarExclusoes(itensNaoRecebidos.map(r => r.receita_id));
        setSelectedIds(prev => {
          const next = new Set(prev);
          itensNaoRecebidos.forEach(r => next.delete(r.receita_id));
          return next;
        });
      },
      onTodas: async () => {
        setModalExclusao(null);
        await executarExclusoes(itens.map(r => r.receita_id));
        setSelectedIds(prev => {
          const next = new Set(prev);
          itens.forEach(r => next.delete(r.receita_id));
          return next;
        });
      },
      onCancelar: () => setModalExclusao(null)
    });
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

  // Função para obter ícone (considera customizados)
  const getIcone = (tipo) => {
    if (iconesCustomizados[tipo]) {
      return getIconComponentByName(iconesCustomizados[tipo]);
    }
    return getIconForTipo(tipo, 'receita');
  };

  const getCor = (tipo) => getColorForTipo(tipo, 'receita', coresCustomizadas);

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (!userId) {
    return <div>Usuário não logado</div>;
  }

  const showListaLoading = abaLista === 'atual'
    ? loading
    : (loadingTodas && todasReceitasCache === null);

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
                  placeholder="Ex: Freelance, Comissão, etc."
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
          onTodas={modalExclusao.onTodas}
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
          <h2>Receitas</h2>
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
            <span className="stat-value">{formatarValor(receitasFiltradas.filter(receita => receita.receita_recebido)
              .reduce((sum, receita) => sum + parseFloat(receita.receita_valor || 0), 0))}</span>
          </div>
          <div className="stat-card stat-card-previsao">
            <span className="stat-label">Previsão</span>
            <span className="stat-value">{formatarValor(receitasFiltradas.filter(r => !r.receita_recebido).reduce((sum, receita) => sum + parseFloat(receita.receita_valor || 0), 0))}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Quantidade</span>
            <span className="stat-value">{receitasFiltradas.length}</span>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="form-container" ref={formContainerRef}>
        <h3>{editId ? 'Editar Receita' : 'Adicionar Nova Receita'}</h3>
        <form onSubmit={editId ? handleUpdate : handleSubmit} className="receita-form">
          <div className="form-row">
            <div className="form-group">
              <label>Descrição:</label>
              <input
                type="text"
                placeholder="Descrição da receita"
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
                min="1900-01-01"
                max="2099-12-31"
                required
              />
            </div>
            <div className="form-group">
              <label>Categoria:</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <SelectWithIcons
                    options={tiposReceita}
                    value={tipo}
                    onChange={setTipo}
                    categoria="receita"
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
              <label>Conta (Opcional):</label>
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
                  checked={recebido}
                  onChange={e => setRecebido(e.target.checked)}
                />
                Recebido
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
                  {submitting ? 'Processando...' : <><FaEdit /> Atualizar Receita</>}
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
                  <><FaPlus /> Adicionar Receita</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

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
                  value={filtroRecebido}
                  onChange={(e) => setFiltroRecebido(e.target.value)}
                  className="filtro-select"
                  style={{ width: '100%' }}
                >
                  <option value="todos">Todos</option>
                  <option value="recebido">Recebido</option>
                  <option value="nao_recebido">Não recebido</option>
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

      {/* Grid de Receitas */}
      <div className="grid-container">
        <div className="grid-header-row">
          <h3>Lista de Receitas</h3>
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
        ) : receitasFiltradas.length === 0 ? (
          <div className="no-data">Nenhuma receita encontrada{filtroRecebido !== 'todos' ? ' com esse filtro' : ''}</div>
        ) : (
          <div className="receitas-grid">
            <div className="grid-header">
              <div className="grid-cell grid-cell-check">
                <input
                  type="checkbox"
                  checked={receitasFiltradas.length > 0 && selectedIds.size === receitasFiltradas.length}
                  onChange={toggleSelectAll}
                  title="Selecionar todas"
                />
              </div>
              <div className="grid-cell">Descrição</div>
              <div className="grid-cell">Valor</div>
              <div className="grid-cell">Data</div>
              <div className="grid-cell">Tipo</div>
              <div className="grid-cell">Conta</div>
              <div className="grid-cell">Recebido</div>
              <div className="grid-cell">Ações</div>
            </div>
            {listarAgrupado ? receitasPorTipo.map(({ tipo: tipoGrupo, subgrupos }) => {
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
                              title={`Editar receita do grupo ${labelSubgrupo}`}
                            >
                              <FaEdit /> Editar
                            </button>
                            <button
                              type="button"
                              className="btn-delete btn-delete-group"
                              onClick={(e) => { e.stopPropagation(); handleDeleteGroup(tipoGrupo, itens); }}
                              title={`Excluir todas as receitas do grupo ${labelSubgrupo}`}
                            >
                              <FaTrash /> Excluir grupo ({itens.length})
                            </button>
                          </span>
                        </div>
                        {!colapsado && itens.map(receita => {
                  const conta = contas.find(c => c.conta_id === receita.conta_id || c.Conta_id === receita.Conta_id);
                  return (
                    <div key={receita.receita_id} className="grid-row">
                      <div className="grid-cell grid-cell-check">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(receita.receita_id)}
                          onChange={() => toggleSelect(receita.receita_id)}
                          title="Selecionar para excluir"
                        />
                      </div>
                      <div className="grid-cell">{receita.receita_descricao}</div>
                      <div className="grid-cell valor">{formatarValor(receita.receita_valor)}</div>
                      <div className="grid-cell">{formatarData(receita.receita_data)}</div>
                      <div className="grid-cell grid-cell-tipo">
                      {(() => {
                        const Icon = getIcone(receita.receita_tipo);
                        return <><Icon className="category-icon" style={{ color: getCor(receita.receita_tipo) }} /> {receita.receita_tipo}</>;
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
                          checked={receita.receita_recebido || false}
                          onChange={async (e) => {
                            try {
                              await axios.put(`${API_ENDPOINTS.RECEITAS}/${receita.receita_id}`, {
                                descricao: receita.receita_descricao,
                                valor: receita.receita_valor,
                                data: receita.receita_data,
                                tipo: receita.receita_tipo,
                                recebido: e.target.checked,
                                conta_id: receita.conta_id
                              });
                              await refreshAfterMutation();
                            } catch (err) {
                              alert('Erro ao atualizar status de recebimento');
                            }
                          }}
                        />
                          <span
                            className={`status-badge ${receita.receita_recebido ? 'pago' : 'pendente'}`}
                            title={receita.receita_recebido ? 'Recebido' : 'Pendente'}
                            aria-label={receita.receita_recebido ? 'Recebido' : 'Pendente'}
                          />
                        </label>
                      </div>
                      <div className="grid-cell acoes">
                        <button 
                          onClick={() => handleEdit(receita)}
                          className="btn-edit"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(receita.receita_id)}
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
            }) : receitasOrdenadasPorData.map(receita => {
              const conta = contas.find(c => c.conta_id === receita.conta_id || c.Conta_id === receita.Conta_id);
              return (
                <div key={receita.receita_id} className="grid-row">
                  <div className="grid-cell grid-cell-check">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(receita.receita_id)}
                      onChange={() => toggleSelect(receita.receita_id)}
                      title="Selecionar para excluir"
                    />
                  </div>
                  <div className="grid-cell">{receita.receita_descricao}</div>
                  <div className="grid-cell valor">{formatarValor(receita.receita_valor)}</div>
                  <div className="grid-cell">{formatarData(receita.receita_data)}</div>
                  <div className="grid-cell grid-cell-tipo">
                    {(() => {
                      const Icon = getIcone(receita.receita_tipo);
                      return <><Icon className="category-icon" style={{ color: getCor(receita.receita_tipo) }} /> {receita.receita_tipo}</>;
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
                      checked={receita.receita_recebido || false}
                      onChange={() => handleTogglePago(receita)}
                      title={receita.receita_recebido ? "Marcar como não recebido" : "Marcar como recebido"}
                    />
                      <span
                        className={`status-badge ${receita.receita_recebido ? 'pago' : 'pendente'}`}
                        title={receita.receita_recebido ? 'Recebido' : 'Pendente'}
                        aria-label={receita.receita_recebido ? 'Recebido' : 'Pendente'}
                      />
                    </label>
                  </div>
                  <div className="grid-cell acoes">
                    <button onClick={() => handleEdit(receita)} className="btn-edit" title="Editar">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(receita.receita_id)} className="btn-delete" title="Excluir">
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

export default Receita;