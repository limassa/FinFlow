import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaWallet, FaHome } from 'react-icons/fa';
import { getIconForTipo } from '../utils/categoryIcons';
import { getBancoById } from '../utils/banks';
import SelectWithIcons from '../components/SelectWithIcons';
import BankSelector from '../components/BankSelector';
import axios from 'axios';
import { getUsuarioLogado } from '../functions/auth';
import { API_ENDPOINTS } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, parseCurrencyToNumber } from '../utils/currencyMask';
import '../App.css';

function Contas() {
  const navigate = useNavigate();
  const [contas, setContas] = useState([]);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [banco, setBanco] = useState('');
  const [saldo, setSaldo] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const usuario = getUsuarioLogado();
  const userId = usuario ? usuario.id : null;
  console.log('Usuario logado em Contas:', usuario);
  console.log('UserId em Contas:', userId);

  // Função para navegar para home e rolar para o topo
  const navigateToHome = () => {
    navigate('/layout/principal');
    // Scroll para o topo após a navegação
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  const tiposConta = [
    'Conta Corrente', 'Conta Poupança', 'Carteira', 'Cartão de Crédito',
    'Investimentos', 'Outros'
  ];

  useEffect(() => {
    if (userId) {
      fetchContas();
    }
  }, [userId]);

  const fetchContas = async () => {
    setLoading(true);
    try {
      console.log('Buscando contas para userId:', userId);
      const res = await axios.get(`${API_ENDPOINTS.CONTAS}?userId=${userId}`);
      console.log('Contas recebidas:', res.data);
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
    
    const payload = { 
      nome, 
      tipo,
      banco: (banco && String(banco).trim()) ? String(banco).trim() : null,
      saldo: parseCurrencyToNumber(saldo) || 0,
      incrementarSaldoTotal: true,
      usuario_id: userId
    };
    console.log('[Contas] POST payload:', payload);
    try {
      await axios.post(API_ENDPOINTS.CONTAS, payload);
      setNome('');
      setTipo('');
      setBanco('');
      setSaldo('');
      await fetchContas(); // Recarregar contas
      alert('Conta adicionada com sucesso');
    } catch (err) {
      alert('Erro ao adicionar conta');
    }
  };

  const handleEdit = (conta) => {
    setNome(conta.conta_nome);
    setTipo(conta.conta_tipo);
    setBanco(conta.conta_banco || conta.Conta_Banco || '');
    const saldoNum = parseFloat(conta.conta_saldo || 0);
    setSaldo(formatCurrency(Math.round(saldoNum * 100).toString()));
    setEditId(conta.conta_id);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!nome || !tipo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    const payload = { 
      nome, 
      tipo,
      banco: (banco && String(banco).trim()) ? String(banco).trim() : null,
      saldo: parseCurrencyToNumber(saldo) || 0
    };
    console.log('[Contas] PUT payload:', payload);
    try {
      await axios.put(`${API_ENDPOINTS.CONTAS}/${editId}`, payload);
      setNome('');
      setTipo('');
      setSaldo('');
      setEditId(null);
      await fetchContas(); // Recarregar contas
      alert('Conta atualizada com sucesso');
    } catch (err) {
      alert('Erro ao atualizar conta');
    }
  };

  const handleCancel = () => {
    setNome('');
    setTipo('');
    setBanco('');
    setSaldo('');
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta conta? Esta ação pode ser desfeita.')) {
      try {
        await axios.delete(`${API_ENDPOINTS.CONTAS}/${id}`);
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
        <div className="header-content">
          <h2>Conta</h2>
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
            <span className="stat-label">Quantidade</span>
            <span className="stat-value">{contas.length}</span>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="form-container">
        <h3>{editId ? 'Editar Conta' : 'Adicionar Nova Conta'}</h3>
        <form onSubmit={editId ? handleUpdate : handleSubmit} className="receita-form">
          <div className="form-row">
            <div className="form-group">
              <label>Banco:</label>
              <BankSelector
                key={editId ? `edit-${editId}` : 'new'}
                value={banco}
                onChange={setBanco}
                placeholder="Selecione o banco"
              />
            </div>
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
              <SelectWithIcons
                options={tiposConta}
                value={tipo}
                onChange={setTipo}
                categoria="conta"
                placeholder="Selecione"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Saldo Inicial:</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={saldo}
                onChange={e => {
                  const numbers = e.target.value.replace(/\D/g, '');
                  setSaldo(formatCurrency(numbers));
                }}
              />
            </div>
            <div className="form-group">
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
            {console.log('Renderizando contas:', contas)}
            {contas.map(conta => {
              console.log('Conta individual:', conta);
              return (
                <div key={conta.conta_id} className="grid-row">
                  <div className="grid-cell">
                    {(() => {
                      const bancoId = conta.conta_banco || conta.Conta_Banco;
                      const b = bancoId ? getBancoById(bancoId) : null;
                      return b ? (
                        <span className="bank-badge bank-badge-inline" style={{ backgroundColor: b.cor }} title={b.nome}>
                          {b.abbr}
                        </span>
                      ) : (
                        <span className="bank-badge bank-badge-inline" style={{ backgroundColor: '#64748b' }}>--</span>
                      );
                    })()}
                  </div>
                  <div className="grid-cell">{conta.conta_nome}</div>
                  <div className="grid-cell grid-cell-tipo">
                    {(() => {
                      const Icon = getIconForTipo(conta.conta_tipo, 'conta');
                      return <><Icon className="category-icon" /> {conta.conta_tipo}</>;
                    })()}
                  </div>
                  <div className="grid-cell valor">{formatarValor(conta.conta_saldo || 0)}</div>
                  <div className="grid-cell acoes">
                    <button 
                      onClick={() => handleEdit(conta)}
                      className="btn-edit"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(conta.conta_id)}
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

export default Contas; 