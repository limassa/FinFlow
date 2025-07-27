import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

function Receita() {
  const [receitas, setReceitas] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [editId, setEditId] = useState(null);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [mesFiltro, setMesFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  
  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;

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
    }
  }, [userId, mesFiltro]);

  const fetchReceitas = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:3001/api/receitas?userId=${userId}`;
      if (mesFiltro) {
        url += `&mes=${mesFiltro}`;
      }
      
      const res = await axios.get(url);
      setReceitas(res.data);
      
      // Calcular total
      const total = res.data.reduce((sum, receita) => sum + parseFloat(receita.valor), 0);
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
      await axios.post('http://localhost:3001/api/receitas', { 
        descricao, 
        valor, 
        data, 
        tipo,
        usuario_id: userId // Mudando de userId para usuario_id
      });
      setDescricao('');
      setValor('');
      setData('');
      setTipo('');
      fetchReceitas();
      alert('Receita adicionada com sucesso');
    } catch (err) {
      alert('Erro ao adicionar receita');
    }
  };

  const handleEdit = (receita) => {
    setDescricao(receita.descricao);
    setValor(receita.valor);
    setData(receita.date); // Mudando de 'data' para 'date'
    setTipo(receita.tipo);
    setEditId(receita.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta receita? Esta ação pode ser desfeita.')) {
      try {
        await axios.delete(`http://localhost:3001/api/receitas/${id}`);
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
            <span className="stat-value">{formatarValor(totalReceitas)}</span>
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
        <h3>Adicionar Nova Receita</h3>
        <form onSubmit={handleSubmit} className="receita-form">
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
          </div>
          <button type="submit" className="btn-adicionar">
            <FaPlus /> Adicionar Receita
          </button>
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
              <div className="grid-cell">Ações</div>
            </div>
            {receitas.map(receita => (
              <div key={receita.id} className="grid-row">
                <div className="grid-cell">{receita.descricao}</div>
                <div className="grid-cell valor">{formatarValor(receita.valor)}</div>
                <div className="grid-cell">{formatarData(receita.date)}</div>
                <div className="grid-cell">{receita.tipo}</div>
                <div className="grid-cell acoes">
                  <button 
                    onClick={() => handleEdit(receita)}
                    className="btn-edit"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(receita.id)}
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

export default Receita;