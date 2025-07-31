import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

function Receita() {
  const [receitas, setReceitas] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [contaId, setContaId] = useState('');
  const [contas, setContas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [mesFiltro, setMesFiltro] = useState('');
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
  const [recebido, setRecebido] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState('mensal');
  const [proximasParcelas, setProximasParcelas] = useState(12);

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
    
    console.log('Tentando adicionar receita com userId:', userId);
    
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
    }
  };

  const handleEdit = (receita) => {
    setDescricao(receita.receita_descricao);
    setValor(receita.receita_valor);
    // Formatar a data para o formato YYYY-MM-DD que o input date espera
    const dataFormatada = receita.receita_data ? new Date(receita.receita_data).toISOString().split('T')[0] : '';
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
        fetchReceitas();
      } catch (err) {
        alert('Erro ao deletar receita');
      }
    }
  };



  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
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
        <h2>Receitas</h2>
        <div className="receita-stats">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{formatarValor(receitas.filter(receita => receita.receita_recebido)
              .reduce((sum, receita) => sum + parseFloat(receita.receita_valor || 0), 0))}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Quantidade</span>
            <span className="stat-value">{receitas.length}</span>
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
              <select value={tipo} onChange={e => setTipo(e.target.value)} required>
                <option value="">Selecione</option>
                {tiposReceita.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            

            <div className="form-group">
              <label>Conta (Opcional):</label>
              <select value={contaId} onChange={e => setContaId(e.target.value)}>
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
                  <FaEdit /> Atualizar Receita
                </button>
                <button type="button" onClick={handleCancel} className="btn-cancelar">
                  Cancelar
                </button>
              </>
            ) : (
              <button type="submit" className="btn-adicionar">
                <FaPlus /> Adicionar Receita
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Grid de Receitas */}
      <div className="grid-container">
        <h3>Lista de Receitas</h3>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : receitas.length === 0 ? (
          <div className="no-data">Nenhuma receita encontrada</div>
        ) : (
          <div className="receitas-grid">
            <div className="grid-header">
              <div className="grid-cell">Descrição</div>
              <div className="grid-cell">Valor</div>
              <div className="grid-cell">Data</div>
              <div className="grid-cell">Tipo</div>
              <div className="grid-cell">Conta</div>
              <div className="grid-cell">Recebido</div>
              <div className="grid-cell">Ações</div>
            </div>
            {console.log('Renderizando receitas:', receitas)}
            {receitas.map(receita => {
              console.log('Receita individual:', receita);
              const conta = contas.find(c => c.conta_id === receita.conta_id);
              return (
                <div key={receita.receita_id} className="grid-row">
                  <div className="grid-cell">{receita.receita_descricao}</div>
                  <div className="grid-cell valor">{formatarValor(receita.receita_valor)}</div>
                  <div className="grid-cell">{formatarData(receita.receita_data)}</div>
                  <div className="grid-cell">{receita.receita_tipo}</div>
                  <div className="grid-cell">{conta ? conta.conta_nome : '-'}</div>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default Receita;