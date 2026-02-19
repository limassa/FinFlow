import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaHome, FaBullseye, FaCheckCircle, FaExclamationCircle, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { getIconForTipo } from '../utils/categoryIcons';
import SelectWithIcons from '../components/SelectWithIcons';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import { useNavigate } from 'react-router-dom';
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
  const [mesFiltro, setMesFiltro] = useState('');
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
  
  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

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
    'Presentes',
    'Telefonia',
    'Pet Shop'
  ];        
  const [tipo, setTipo] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [gruposColapsados, setGruposColapsados] = useState(new Set());

  // Função para navegar para home e rolar para o topo
  const navigateToHome = () => {
    navigate('/layout/principal');
    // Scroll para o topo após a navegação
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  // Gerar opções dos últimos 12 meses
  const gerarOpcoesMeses = () => {
    const opcoes = [];
    const hoje = new Date();
    
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesAno = data.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      });
      const valor = data.toISOString().slice(0, 7); // YYYY-MM
      opcoes.push({ label: mesAno, value: valor });
    }
    return opcoes;
  };

  const opcoesMeses = gerarOpcoesMeses();

  useEffect(() => {
    console.log('🔄 useEffect executado - userId:', userId, 'mesFiltro:', mesFiltro);
    if (userId) {
      console.log('🔄 Chamando fetchDespesas...');
      fetchDespesas();
      fetchContas();
      fetchMetas();
    }
  }, [userId, mesFiltro]);

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

  const fetchDespesas = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.DESPESAS}?userId=${userId}`;
      if (mesFiltro) {
        url += `&mes=${mesFiltro}`;
      }
      
      const res = await axios.get(url);
      setDespesas(res.data);
      
      // Calcular total apenas das despesas pagas
      const total = res.data
        .filter(despesa => despesa.despesa_pago)
        .reduce((sum, despesa) => sum + parseFloat(despesa.valor), 0);
      setTotalDespesas(total);
    } catch (err) {
      console.error('❌ Erro ao buscar Despesas:', err);
      console.error('❌ Detalhes do erro:', err.response?.data);
    } finally {
      setLoading(false);
    }
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
        valor, 
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
      fetchDespesas();
      alert(recorrente ? 'Despesas recorrentes criadas com sucesso!' : 'Despesa adicionada com sucesso');
    } catch (err) {
      alert('Erro ao adicionar despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (despesa) => {
    setDescricao(despesa.despesa_descricao);
    setValor(despesa.despesa_valor);
    // Formatar a data para o formato YYYY-MM-DD que o input date espera
    // Usar método mais seguro para evitar problemas de fuso horário
    const dataFormatada = despesa.despesa_data ? 
      despesa.despesa_data.split('T')[0] : '';
    setData(dataFormatada);
    // Formatar a data de vencimento para o formato YYYY-MM-DD
    const dataVencimentoFormatada = despesa.despesa_dtvencimento ? 
      despesa.despesa_dtvencimento.split('T')[0] : '';
    setDataVencimento(dataVencimentoFormatada);
    setTipo(despesa.despesa_tipo);
    setPago(despesa.despesa_pago || false);
    setContaId(despesa.conta_id || '');
    setEditId(despesa.despesa_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta despesa? Esta ação pode ser desfeita.')) {
      try {
        console.log('🗑️ Tentando deletar despesa ID:', id);
        const response = await axios.delete(`${API_ENDPOINTS.DESPESAS}/${id}`);
        console.log('✅ Despesa deletada com sucesso:', response.status);
        setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        fetchDespesas();
        alert('Despesa excluída com sucesso!');
      } catch (err) {
        console.error('❌ Erro ao deletar despesa:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Erro desconhecido';
        alert(`Erro ao deletar despesa: ${errorMessage}`);
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
    if (selectedIds.size === despesasFiltradas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(despesasFiltradas.map(d => d.despesa_id)));
    }
  };

  const handleDeleteSelected = async () => {
    const qtd = selectedIds.size;
    if (qtd === 0) return;
    if (!window.confirm(`Deseja realmente excluir ${qtd} despesa(s) selecionada(s)? Esta ação pode ser desfeita.`)) {
      return;
    }
    setDeletingInProgress(true);
    try {
      for (const id of selectedIds) {
        await axios.delete(`${API_ENDPOINTS.DESPESAS}/${id}`);
      }
      setSelectedIds(new Set());
      fetchDespesas();
      alert(`${qtd} despesa(s) excluída(s) com sucesso!`);
    } catch (err) {
      console.error('Erro ao excluir despesas:', err);
      alert(err.response?.data?.error || 'Erro ao excluir despesas. Tente novamente.');
    } finally {
      setDeletingInProgress(false);
    }
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
  }, [despesasFiltradas, tiposDespesa]);

  const handleDeleteGroup = async (tipoGrupo, itens) => {
    const qtd = itens.length;
    if (qtd === 0) return;
    if (!window.confirm(`Excluir todas as ${qtd} despesa(s) do tipo "${tipoGrupo}"? Esta ação pode ser desfeita.`)) return;
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
      alert(`${qtd} despesa(s) excluída(s) com sucesso!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir despesas. Tente novamente.');
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleTogglePago = async (despesa) => {
    try {
      // Usar a nova rota para marcar apenas a parcela atual
      await axios.put(`${API_ENDPOINTS.PARCELA_ATUAL_DESPESA}/${despesa.despesa_id}`, {
        status: !despesa.despesa_pago
      });
      fetchDespesas();
    } catch (err) {
      console.log('Erro ao atualizar status de pago:', err);
      alert('Erro ao atualizar status de pago');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!descricao || !valor || !data || !tipo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await axios.put(`${API_ENDPOINTS.DESPESAS}/${editId}`, { 
        descricao, 
        valor, 
        data, 
        dataVencimento,
        tipo,
        pago: pago,
        conta_id: contaId || null
      });
      setDescricao('');
      setValor('');
      setData('');
      setDataVencimento('');
      setTipo('');
      setPago(false);
      setContaId('');
      setEditId(null);
      fetchDespesas();
      alert('Despesa atualizada com sucesso');
    } catch (err) {
      alert('Erro ao atualizar despesa');
    } finally {
      setSubmitting(false);
    }
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
    const hoje = new Date();
    const mesAtual = mesFiltro || hoje.toISOString().slice(0, 7);
    
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
    const hoje = new Date();
    const mesAtual = mesFiltro || hoje.toISOString().slice(0, 7);
    
    return despesas
      .filter(d => d.despesa_pago && d.despesa_data?.slice(0, 7) === mesAtual)
      .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0);
  };

  if (!userId) {
    return <div>Usuário não logado</div>;
  }

  return (
    <div className="receita-container">
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
      <div className="form-container">
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
                type="number"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={e => setValor(e.target.value)}
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
                onChange={e => setData(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Data de Vencimento:</label>
              <input
                type="date"
                value={dataVencimento}
                onChange={e => setDataVencimento(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo:</label>
              <SelectWithIcons
                options={tiposDespesa}
                value={tipo}
                onChange={setTipo}
                categoria="despesa"
                placeholder="Selecione"
                required
              />
            </div>
            <div className="form-group">
              <label>Conta:</label>
              <select value={contaId} onChange={e => setContaId(e.target.value)} >
                <option value="">Selecione uma conta</option>
                {contas.map(conta => (
                  <option key={conta.conta_id} value={conta.conta_id}>{conta.conta_nome}</option>
                ))}
              </select>
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
                    const Icon = getIconForTipo(meta.categoria, 'despesa');
                    return <><Icon className="category-icon" /> {meta.categoria}</>;
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

      {/* Grid de Despesas */}
      <div className="grid-container">
        <div className="grid-header-row">
          <h3>Lista de Despesas</h3>
          <div className="filtro-container filtro-row filtro-above-grid">
            <div className="filtro-group">
              <FaFilter className="filtro-icon" />
              <select 
                value={mesFiltro} 
                onChange={(e) => setMesFiltro(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos os meses</option>
                {opcoesMeses.map(opcao => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filtro-group">
              <label className="filtro-label">Status:</label>
              <select 
                value={filtroPago} 
                onChange={(e) => setFiltroPago(e.target.value)}
                className="filtro-select"
              >
                <option value="todos">Todos</option>
                <option value="pago">Pago</option>
                <option value="nao_pago">Não pago</option>
              </select>
            </div>
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
        {loading ? (
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
            {despesasPorTipo.map(({ tipo: tipoGrupo, itens }) => {
              const colapsado = gruposColapsados.has(tipoGrupo);
              const toggleGrupo = () => {
                setGruposColapsados(prev => {
                  const next = new Set(prev);
                  if (next.has(tipoGrupo)) next.delete(tipoGrupo);
                  else next.add(tipoGrupo);
                  return next;
                });
              };
              return (
              <React.Fragment key={tipoGrupo}>
                <div 
                  className={`grid-group-header ${colapsado ? 'colapsado' : ''}`}
                  onClick={toggleGrupo}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGrupo(); } }}
                >
                  <span className="grid-group-header-title">
                    {colapsado ? <FaChevronRight className="group-chevron" /> : <FaChevronDown className="group-chevron" />}
                    {(() => {
                      const Icon = getIconForTipo(tipoGrupo, 'despesa');
                      return <><Icon className="category-icon" /> {tipoGrupo}</>;
                    })()}
                    <span className="group-count">({itens.length})</span>
                  </span>
                  <button
                    type="button"
                    className="btn-delete btn-delete-group"
                    onClick={(e) => { e.stopPropagation(); handleDeleteGroup(tipoGrupo, itens); }}
                    title={`Excluir todas as despesas do tipo ${tipoGrupo}`}
                  >
                    <FaTrash /> Excluir grupo ({itens.length})
                  </button>
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
                          const Icon = getIconForTipo(despesa.despesa_tipo, 'despesa');
                          return <><Icon className="category-icon" /> {despesa.despesa_tipo}</>;
                        })()}
                      </div>
                      <div className="grid-cell">{conta ? (conta.conta_nome || conta.Conta_Nome) : '-'}</div>
                      <div className="grid-cell">
                        <input
                          type="checkbox"
                          checked={despesa.despesa_pago || false}
                          onChange={() => handleTogglePago(despesa)}
                          title={despesa.despesa_pago ? "Marcar como não pago" : "Marcar como pago"}
                        />
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