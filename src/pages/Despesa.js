import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

function Despesa() {
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
  const [loading, setLoading] = useState(true); // Mudando para true para forçar o carregamento
  const [pago, setPago] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState('mensal');
  const [proximasParcelas, setProximasParcelas] = useState(12);
  
  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

  const tiposDespesa = [
    'Alimentação',
    'Transporte',
    'Saúde',
    'Moradia',
    'Aluguel',
    'Outros',
    'Veículos'
  ];        
  const [tipo, setTipo] = useState('');

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
    }
  }, [userId, mesFiltro]);

  const fetchContas = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/contas?userId=${userId}`);
      setContas(res.data);
    } catch (err) {
      console.log('Erro ao buscar contas:', err);
    }
  };

  const fetchDespesas = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:3001/api/despesas?userId=${userId}`;
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
      
      await axios.post('http://localhost:3001/api/despesas', despesaData);
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
    }
  };

  const handleEdit = (despesa) => {
    setDescricao(despesa.despesa_descricao);
    setValor(despesa.despesa_valor);
    // Formatar a data para o formato YYYY-MM-DD que o input date espera
    const dataFormatada = despesa.despesa_data ? new Date(despesa.despesa_data).toISOString().split('T')[0] : '';
    setData(dataFormatada);
    // Formatar a data de vencimento para o formato YYYY-MM-DD
    const dataVencimentoFormatada = despesa.despesa_dtvencimento ? new Date(despesa.despesa_dtvencimento).toISOString().split('T')[0] : '';
    setDataVencimento(dataVencimentoFormatada);
    setTipo(despesa.despesa_tipo);
    setPago(despesa.despesa_pago || false);
    setContaId(despesa.conta_id || '');
    setEditId(despesa.despesa_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta despesa? Esta ação pode ser desfeita.')) {
      try {
        await axios.delete(`http://localhost:3001/api/despesas/${id}`);
        fetchDespesas();
      } catch (err) {
        alert('Erro ao deletar despesa');
      }
    }
  };

  const handleTogglePago = async (despesa) => {
    try {
      // Usar a nova rota para marcar apenas a parcela atual
      await axios.put(`http://localhost:3001/api/parcela-atual/despesa/${despesa.despesa_id}`, {
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
    
    try {
      await axios.put(`http://localhost:3001/api/despesas/${editId}`, { 
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
      return new Date(data).toLocaleDateString('pt-BR');
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
        <h2>Despesas</h2>
        <div className="receita-stats">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{formatarValor(despesas.filter(despesa => despesa.despesa_pago)
              .reduce((sum, despesa) => sum + parseFloat(despesa.despesa_valor || 0), 0))}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Quantidade</span>
            <span className="stat-value">{despesas.length}</span>
          </div>
        </div>
      </div>

      {/* Filtro por mês */}
      <div className="filtro-container">
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
              <select value={tipo} onChange={e => setTipo(e.target.value)} required>
                <option value="">Selecione</option>
                    {tiposDespesa.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
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
                    max="60"
                    value={proximasParcelas}
                    onChange={e => setProximasParcelas(parseInt(e.target.value))}
                  />
                </div>
              </>
            )}
          
          <div className="form-buttons">
            {editId ? (
              <>
                <button type="submit" className="btn-atualizar">
                  <FaEdit /> Atualizar Despesa
                </button>
                <button type="button" onClick={handleCancel} className="btn-cancelar">
                  Cancelar
                </button>
              </>
            ) : (
              <button type="submit" className="btn-adicionar">
                <FaPlus /> Adicionar Despesa
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Grid de Despesas */}
      <div className="grid-container">
        <h3>Lista de Despesas</h3>
        
        {loading ? (
          <div className="loading">Carregando...</div>
            ) : despesas.length === 0 ? (
          <div className="no-data">Nenhuma despesa encontrada</div>
        ) : (
          <div className="despesas-grid">
            <div className="grid-header">
              <div className="grid-cell">Descrição</div>
              <div className="grid-cell">Valor</div>
              <div className="grid-cell">Data</div>
              <div className="grid-cell">Data Vencimento</div>
              <div className="grid-cell">Tipo</div>
              <div className="grid-cell">Conta</div>
              <div className="grid-cell">Pago</div>
              <div className="grid-cell">Ações</div>
            </div>
            {despesas.map(despesa => {
              const conta = contas.find(c => c.Conta_Id === despesa.Conta_id);
              return (
                <div key={despesa.despesa_id} className="grid-row">
                  <div className="grid-cell">{despesa.despesa_descricao}</div>
                  <div className="grid-cell valor">{formatarValor(despesa.despesa_valor)}</div>
                  <div className="grid-cell">{formatarData(despesa.despesa_data)}</div>
                  <div className="grid-cell">{formatarData(despesa.despesa_dtvencimento)}</div>
                  <div className="grid-cell">{despesa.despesa_tipo}</div>
                  <div className="grid-cell">{conta ? conta.conta_nome : '-'}</div>
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
                      onClick={() => handleDelete(despesa.id)}
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
    </div>
  );
}

export default Despesa;