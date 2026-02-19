import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaHome, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { getIconForTipo } from '../utils/categoryIcons';
import { getBancoById } from '../utils/banks';
import SelectWithIcons from '../components/SelectWithIcons';
import AccountSelector from '../components/AccountSelector';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import { useNavigate } from 'react-router-dom';
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
  const [mesFiltro, setMesFiltro] = useState('');
  const [filtroRecebido, setFiltroRecebido] = useState('todos');
  const [loading, setLoading] = useState(false);
  
  
  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;
  console.log('Usuario logado em Receita:', usuario);
  console.log('UserId em Receita:', userId);

  console.log('Usuário logado:', usuario);
  console.log('User ID:', userId);
  
  const tiposReceita = [
    'Salário',
    'Venda',
    'Presente',
    'Investimento',
    'Aluguel',
    'Outros'
  ];
  const [tipo, setTipo] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [recebido, setRecebido] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState('mensal');
  const [proximasParcelas, setProximasParcelas] = useState(12);
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
    if (userId) {
      fetchReceitas();
      fetchContas();
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

  const fetchReceitas = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.RECEITAS}?userId=${userId}`;
      if (mesFiltro) {
        url += `&mes=${mesFiltro}`;
      }
      
      console.log('Buscando receitas com URL:', url);
      const res = await axios.get(url);
      console.log('Receitas recebidas:', res.data);
      setReceitas(res.data);
      
      // Calcular total
      const total = res.data
      .filter(receita => receita.receita_recebido)
      .reduce((sum, receita) => sum + parseFloat(receita.receita_valor), 0);
      setTotalReceitas(total);
    } catch (err) {
      console.log('Erro ao buscar receitas:', err);
    } finally {
      setLoading(false);
    }
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
        valor, 
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
      fetchReceitas();
      alert(recorrente ? 'Receitas recorrentes criadas com sucesso!' : 'Receita adicionada com sucesso');
    } catch (err) {
      alert('Erro ao adicionar receita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (receita) => {
    setDescricao(receita.receita_descricao);
    setValor(receita.receita_valor);
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!descricao || !valor || !data || !tipo) {
      alert('Preencha todos os campos');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await axios.put(`${API_ENDPOINTS.RECEITAS}/${editId}`, {
        descricao,
        valor,
        data,
        tipo,
        recebido,
        conta_id: contaId || null
      });
      setDescricao('');
      setValor('');
      setData('');
      setTipo('');
      setRecebido(false);
      setContaId('');
      setEditId(null);
      fetchReceitas();
      alert('Receita atualizada com sucesso');
    } catch (err) {
      alert('Erro ao atualizar receita');
    } finally {
      setSubmitting(false);
    }
  };
  const handleTogglePago = async (receita) => {
    try {
      // Usar a nova rota para marcar apenas a parcela atual
      await axios.put(`${API_ENDPOINTS.PARCELA_ATUAL_RECEITA}/${receita.receita_id}`, {
        status: !receita.receita_recebido
      });
      fetchReceitas();
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

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta receita? Esta ação pode ser desfeita.')) {
      try {
        await axios.delete(`${API_ENDPOINTS.RECEITAS}/${id}`);
        setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        fetchReceitas();
      } catch (err) {
        alert('Erro ao deletar receita');
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

  const receitasFiltradas = React.useMemo(() => {
    if (filtroRecebido === 'todos') return receitas;
    if (filtroRecebido === 'recebido') return receitas.filter(r => r.receita_recebido);
    return receitas.filter(r => !r.receita_recebido);
  }, [receitas, filtroRecebido]);

  const toggleSelectAll = () => {
    if (selectedIds.size === receitasFiltradas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(receitasFiltradas.map(r => r.receita_id)));
    }
  };

  const handleDeleteSelected = async () => {
    const qtd = selectedIds.size;
    if (qtd === 0) return;
    if (!window.confirm(`Deseja realmente excluir ${qtd} receita(s) selecionada(s)? Esta ação pode ser desfeita.`)) {
      return;
    }
    setDeletingInProgress(true);
    try {
      for (const id of selectedIds) {
        await axios.delete(`${API_ENDPOINTS.RECEITAS}/${id}`);
      }
      setSelectedIds(new Set());
      fetchReceitas();
      alert(`${qtd} receita(s) excluída(s) com sucesso!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir receitas. Tente novamente.');
    } finally {
      setDeletingInProgress(false);
    }
  };

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
  }, [receitasFiltradas, tiposReceita]);

  const handleDeleteGroup = async (tipoGrupo, itens) => {
    const qtd = itens.length;
    if (qtd === 0) return;
    if (!window.confirm(`Excluir todas as ${qtd} receita(s) do tipo "${tipoGrupo}"? Esta ação pode ser desfeita.`)) return;
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
      alert(`${qtd} receita(s) excluída(s) com sucesso!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir receitas. Tente novamente.');
    } finally {
      setDeletingInProgress(false);
    }
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

  if (!userId) {
    return <div>Usuário não logado</div>;
  }

  return (
    <div className="receita-container">
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
      <div className="form-container">
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
              <label>Tipo:</label>
              <SelectWithIcons
                options={tiposReceita}
                value={tipo}
                onChange={setTipo}
                categoria="receita"
                placeholder="Selecione"
                required
              />
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

      {/* Grid de Receitas */}
      <div className="grid-container">
        <div className="grid-header-row">
          <h3>Lista de Receitas</h3>
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
                value={filtroRecebido} 
                onChange={(e) => setFiltroRecebido(e.target.value)}
                className="filtro-select"
              >
                <option value="todos">Todos</option>
                <option value="recebido">Recebido</option>
                <option value="nao_recebido">Não recebido</option>
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
            {receitasPorTipo.map(({ tipo: tipoGrupo, itens }) => {
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
                      const Icon = getIconForTipo(tipoGrupo, 'receita');
                      return <><Icon className="category-icon" /> {tipoGrupo}</>;
                    })()}
                    <span className="group-count">({itens.length})</span>
                  </span>
                  <span className="grid-group-header-actions">
                    <button
                      type="button"
                      className="btn-edit btn-edit-group"
                      onClick={(e) => { e.stopPropagation(); if (itens.length > 0) handleEdit(itens[0]); }}
                      title={`Editar receita do grupo ${tipoGrupo}`}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      type="button"
                      className="btn-delete btn-delete-group"
                      onClick={(e) => { e.stopPropagation(); handleDeleteGroup(tipoGrupo, itens); }}
                      title={`Excluir todas as receitas do tipo ${tipoGrupo}`}
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
                        const Icon = getIconForTipo(receita.receita_tipo, 'receita');
                        return <><Icon className="category-icon" /> {receita.receita_tipo}</>;
                      })()}
                    </div>
                      <div className="grid-cell grid-cell-conta">
                        {conta ? (
                          <>
                            {(() => {
                              const b = getBancoById(conta.conta_banco || conta.Conta_Banco);
                              return (
                                <span className="conta-com-badge">
                                  <span className="bank-badge bank-badge-sm" style={{ backgroundColor: b.cor }}>
                                    {b.abbr}
                                  </span>
                                  {conta.conta_nome || conta.Conta_Nome}
                                </span>
                              );
                            })()}
                          </>
                        ) : '-'}
                      </div>
                      <div className="grid-cell">
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
                              fetchReceitas();
                            } catch (err) {
                              alert('Erro ao atualizar status de recebimento');
                            }
                          }}
                        />
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