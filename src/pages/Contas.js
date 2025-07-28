import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaWallet } from 'react-icons/fa';
import axios from 'axios';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

function Contas() {
  const [contas, setContas] = useState([]);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [saldo, setSaldo] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

  const tiposConta = [
    'Conta Corrente',
    'Conta Poupança',
    'Carteira',
    'Cartão de Crédito',
    'Investimentos',
    'Outros'
  ];

  useEffect(() => {
    if (userId) {
      fetchContas();
    }
  }, [userId]);

  const fetchContas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3001/api/contas?userId=${userId}`);
      setContas(res.data);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !tipo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      await axios.post('http://localhost:3001/api/contas', { 
        nome, 
        tipo,
        saldo: saldo || 0,
        usuario_id: userId
      });
      setNome('');
      setTipo('');
      setSaldo('');
      fetchContas();
      alert('Conta adicionada com sucesso');
    } catch (err) {
      alert('Erro ao adicionar conta');
    }
  };

  const handleEdit = (conta) => {
    setNome(conta.nome);
    setTipo(conta.tipo);
    setSaldo(conta.saldo || '');
    setEditId(conta.id);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!nome || !tipo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      await axios.put(`http://localhost:3001/api/contas/${editId}`, { 
        nome, 
        tipo,
        saldo: saldo || 0
      });
      setNome('');
      setTipo('');
      setSaldo('');
      setEditId(null);
      fetchContas();
      alert('Conta atualizada com sucesso');
    } catch (err) {
      alert('Erro ao atualizar conta');
    }
  };

  const handleCancel = () => {
    setNome('');
    setTipo('');
    setSaldo('');
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta conta? Esta ação pode ser desfeita.')) {
      try {
        await axios.delete(`http://localhost:3001/api/contas/${id}`);
        fetchContas();
      } catch (err) {
        alert('Erro ao deletar conta');
      }
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
        <h2>Minhas Contas</h2>
        <div className="receita-stats">
          <div className="stat-card">
            <span className="stat-label">Total de Contas</span>
            <span className="stat-value">{contas.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Saldo Total</span>
            <span className="stat-value">
              {formatarValor(contas.reduce((sum, conta) => sum + parseFloat(conta.saldo || 0), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="form-container">
        <h3>{editId ? 'Editar Conta' : 'Adicionar Nova Conta'}</h3>
        <form onSubmit={editId ? handleUpdate : handleSubmit} className="receita-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome da Conta:</label>
              <input
                type="text"
                placeholder="Ex: Banco do Brasil"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Tipo:</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)} required>
                <option value="">Selecione</option>
                {tiposConta.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Saldo Inicial:</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={saldo}
                onChange={e => setSaldo(e.target.value)}
              />
            </div>
          </div>
          <div className="form-buttons">
            {editId ? (
              <>
                <button type="submit" className="btn-atualizar">
                  <FaEdit /> Atualizar Conta
                </button>
                <button type="button" onClick={handleCancel} className="btn-cancelar">
                  Cancelar
                </button>
              </>
            ) : (
              <button type="submit" className="btn-adicionar">
                <FaPlus /> Adicionar Conta
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Grid de Contas */}
      <div className="grid-container">
        <h3>Lista de Contas</h3>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : contas.length === 0 ? (
          <div className="no-data">Nenhuma conta encontrada</div>
        ) : (
          <div className="contas-grid">
            <div className="grid-header">
              <div className="grid-cell">Nome</div>
              <div className="grid-cell">Tipo</div>
              <div className="grid-cell">Saldo</div>
              <div className="grid-cell">Ações</div>
            </div>
            {contas.map(conta => (
              <div key={conta.id} className="grid-row">
                <div className="grid-cell">{conta.nome}</div>
                <div className="grid-cell">{conta.tipo}</div>
                <div className="grid-cell valor">{formatarValor(conta.saldo || 0)}</div>
                <div className="grid-cell acoes">
                  <button 
                    onClick={() => handleEdit(conta)}
                    className="btn-edit"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(conta.id)}
                    className="btn-delete"
                    title="Excluir"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Contas; 