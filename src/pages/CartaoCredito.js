import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaPlus, FaEdit, FaTrash, FaHome, FaShoppingCart, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import SelectWithIcons from '../components/SelectWithIcons';
import '../App.css';

const bandeiras = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' },
  { value: 'hipercard', label: 'Hipercard' },
  { value: 'diners', label: 'Diners Club' },
  { value: 'outro', label: 'Outro' }
];

const coresCartao = [
  '#4F46E5', '#2563EB', '#0891B2', '#059669', '#D97706', 
  '#DC2626', '#7C3AED', '#DB2777', '#1F2937', '#6B7280'
];

function CartaoCredito() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const userId = usuario?.id;

  // Estados
  const [cartoes, setCartoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalCartao, setShowModalCartao] = useState(false);
  const [showModalCompra, setShowModalCompra] = useState(false);
  const [editandoCartao, setEditandoCartao] = useState(null);
  const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7));
  const [abaAtiva, setAbaAtiva] = useState('cartoes'); // 'cartoes' ou 'fatura'

  // Form Cartão
  const [formCartao, setFormCartao] = useState({
    nome: '',
    bandeira: 'visa',
    limite: '',
    dia_fechamento: 1,
    dia_vencimento: 10,
    cor: '#4F46E5'
  });

  // Form Compra
  const [formCompra, setFormCompra] = useState({
    cartao_id: '',
    descricao: '',
    valor_total: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    parcelas: 1
  });

  // Categorias de despesa (fixas por enquanto)
  const categoriasDespesa = [
    'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação',
    'Lazer', 'Vestuário', 'Assinaturas', 'Compras', 'Outros'
  ];

  useEffect(() => {
    if (userId) {
      carregarDados();
    }
  }, [userId, mesSelecionado]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [cartoesRes, comprasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.CARTOES}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.COMPRAS_CARTAO}?userId=${userId}&mes=${mesSelecionado}`)
      ]);
      setCartoes(cartoesRes.data);
      setCompras(comprasRes.data);
      
      if (cartoesRes.data.length > 0 && !cartaoSelecionado) {
        setCartaoSelecionado(cartoesRes.data[0].cartao_id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatadores
  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (data) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  };

  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseFloat(String(value).replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleCurrencyInput = (value) => {
    let cleanValue = value.replace(/[^\d]/g, '');
    if (!cleanValue) cleanValue = '000';
    while (cleanValue.length < 3) cleanValue = '0' + cleanValue;
    const integerPart = cleanValue.slice(0, -2).replace(/^0+/, '') || '0';
    const decimalPart = cleanValue.slice(-2);
    return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + decimalPart;
  };

  // Handlers Cartão
  const abrirModalCartao = (cartao = null) => {
    if (cartao) {
      setEditandoCartao(cartao);
      setFormCartao({
        nome: cartao.cartao_nome,
        bandeira: cartao.cartao_bandeira || 'visa',
        limite: cartao.cartao_limite?.toString().replace('.', ',') || '',
        dia_fechamento: cartao.cartao_dia_fechamento || 1,
        dia_vencimento: cartao.cartao_dia_vencimento || 10,
        cor: cartao.cartao_cor || '#4F46E5'
      });
    } else {
      setEditandoCartao(null);
      setFormCartao({
        nome: '',
        bandeira: 'visa',
        limite: '',
        dia_fechamento: 1,
        dia_vencimento: 10,
        cor: '#4F46E5'
      });
    }
    setShowModalCartao(true);
  };

  const salvarCartao = async (e) => {
    e.preventDefault();
    
    try {
      const dados = {
        usuario_id: userId,
        nome: formCartao.nome,
        bandeira: formCartao.bandeira,
        limite: parseCurrency(formCartao.limite),
        dia_fechamento: parseInt(formCartao.dia_fechamento),
        dia_vencimento: parseInt(formCartao.dia_vencimento),
        cor: formCartao.cor
      };

      if (editandoCartao) {
        await axios.put(`${API_ENDPOINTS.CARTOES}/${editandoCartao.cartao_id}`, dados);
      } else {
        await axios.post(API_ENDPOINTS.CARTOES, dados);
      }

      setShowModalCartao(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      alert('Erro ao salvar cartão');
    }
  };

  const excluirCartao = async (id) => {
    if (!window.confirm('Deseja excluir este cartão? Todas as compras associadas serão mantidas no histórico.')) {
      return;
    }
    
    try {
      await axios.delete(`${API_ENDPOINTS.CARTOES}/${id}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      alert('Erro ao excluir cartão');
    }
  };

  // Handlers Compra
  const abrirModalCompra = () => {
    setFormCompra({
      cartao_id: cartaoSelecionado || (cartoes[0]?.cartao_id || ''),
      descricao: '',
      valor_total: '',
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      parcelas: 1
    });
    setShowModalCompra(true);
  };

  const salvarCompra = async (e) => {
    e.preventDefault();
    
    try {
      const dados = {
        usuario_id: userId,
        cartao_id: parseInt(formCompra.cartao_id),
        descricao: formCompra.descricao,
        valor_total: parseCurrency(formCompra.valor_total),
        data: formCompra.data,
        categoria: formCompra.categoria,
        parcelas: parseInt(formCompra.parcelas)
      };

      await axios.post(API_ENDPOINTS.COMPRAS_CARTAO, dados);
      setShowModalCompra(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      alert('Erro ao salvar compra');
    }
  };

  const excluirCompra = async (id, deletarParcelas = false) => {
    const msg = deletarParcelas 
      ? 'Deseja excluir esta compra e TODAS as parcelas restantes?' 
      : 'Deseja excluir apenas esta parcela?';
    
    if (!window.confirm(msg)) return;
    
    try {
      await axios.delete(`${API_ENDPOINTS.COMPRAS_CARTAO}/${id}?deletarParcelas=${deletarParcelas}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir compra:', error);
      alert('Erro ao excluir compra');
    }
  };

  // Cálculos
  const calcularFatura = (cartaoId) => {
    return compras
      .filter(c => c.cartao_id === cartaoId)
      .reduce((sum, c) => sum + parseFloat(c.compra_valor_parcela || 0), 0);
  };

  const calcularLimiteDisponivel = (cartao) => {
    const fatura = calcularFatura(cartao.cartao_id);
    return (parseFloat(cartao.cartao_limite) || 0) - fatura;
  };

  if (!userId) {
    navigate('/');
    return null;
  }

  return (
    <div className="cartao-credito-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-title">
          <FaCreditCard className="header-icon" />
          <h1>Cartões de Crédito</h1>
        </div>
        <div className="header-actions">
          <button className="btn-home" onClick={() => navigate('/layout/principal')}>
            <FaHome /> Home
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${abaAtiva === 'cartoes' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('cartoes')}
        >
          <FaCreditCard /> Meus Cartões
        </button>
        <button 
          className={`tab-btn ${abaAtiva === 'fatura' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('fatura')}
        >
          <FaCalendarAlt /> Fatura do Mês
        </button>
      </div>

      {/* Aba: Meus Cartões */}
      {abaAtiva === 'cartoes' && (
        <div className="cartoes-section">
          <div className="section-header">
            <h2>Meus Cartões</h2>
            <button className="btn-add" onClick={() => abrirModalCartao()}>
              <FaPlus /> Novo Cartão
            </button>
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : cartoes.length === 0 ? (
            <div className="empty-state">
              <FaCreditCard className="empty-icon" />
              <p>Nenhum cartão cadastrado</p>
              <button className="btn-add" onClick={() => abrirModalCartao()}>
                <FaPlus /> Adicionar Cartão
              </button>
            </div>
          ) : (
            <div className="cartoes-grid">
              {cartoes.map(cartao => (
                <div 
                  key={cartao.cartao_id} 
                  className="cartao-card"
                  style={{ borderLeftColor: cartao.cartao_cor }}
                >
                  <div className="cartao-header" style={{ backgroundColor: cartao.cartao_cor }}>
                    <span className="cartao-bandeira">{cartao.cartao_bandeira?.toUpperCase()}</span>
                    <div className="cartao-actions">
                      <button onClick={() => abrirModalCartao(cartao)}><FaEdit /></button>
                      <button onClick={() => excluirCartao(cartao.cartao_id)}><FaTrash /></button>
                    </div>
                  </div>
                  <div className="cartao-body">
                    <h3>{cartao.cartao_nome}</h3>
                    <div className="cartao-info">
                      <div className="info-item">
                        <span className="info-label">Limite</span>
                        <span className="info-value">{formatarValor(cartao.cartao_limite)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Fatura Atual</span>
                        <span className="info-value despesa">{formatarValor(calcularFatura(cartao.cartao_id))}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Disponível</span>
                        <span className={`info-value ${calcularLimiteDisponivel(cartao) >= 0 ? 'receita' : 'despesa'}`}>
                          {formatarValor(calcularLimiteDisponivel(cartao))}
                        </span>
                      </div>
                    </div>
                    <div className="cartao-datas">
                      <span>Fecha dia {cartao.cartao_dia_fechamento}</span>
                      <span>Vence dia {cartao.cartao_dia_vencimento}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aba: Fatura do Mês */}
      {abaAtiva === 'fatura' && (
        <div className="fatura-section">
          <div className="section-header">
            <div className="fatura-filtros">
              <select 
                value={cartaoSelecionado || ''} 
                onChange={e => setCartaoSelecionado(e.target.value)}
                className="form-select"
              >
                <option value="">Todos os cartões</option>
                {cartoes.map(c => (
                  <option key={c.cartao_id} value={c.cartao_id}>{c.cartao_nome}</option>
                ))}
              </select>
              <input 
                type="month" 
                value={mesSelecionado} 
                onChange={e => setMesSelecionado(e.target.value)}
                className="form-input"
              />
            </div>
            <button className="btn-add" onClick={abrirModalCompra}>
              <FaShoppingCart /> Nova Compra
            </button>
          </div>

          {/* Resumo da Fatura */}
          <div className="fatura-resumo">
            <div className="resumo-card">
              <FaChartLine className="resumo-icon" />
              <div>
                <span className="resumo-label">Total da Fatura</span>
                <span className="resumo-valor">
                  {formatarValor(
                    compras
                      .filter(c => !cartaoSelecionado || c.cartao_id == cartaoSelecionado)
                      .reduce((sum, c) => sum + parseFloat(c.compra_valor_parcela || 0), 0)
                  )}
                </span>
              </div>
            </div>
            <div className="resumo-card">
              <FaShoppingCart className="resumo-icon" />
              <div>
                <span className="resumo-label">Total de Compras</span>
                <span className="resumo-valor">
                  {compras.filter(c => !cartaoSelecionado || c.cartao_id == cartaoSelecionado).length}
                </span>
              </div>
            </div>
          </div>

          {/* Lista de Compras */}
          <div className="compras-lista">
            <h3>Compras do Mês</h3>
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : compras.filter(c => !cartaoSelecionado || c.cartao_id == cartaoSelecionado).length === 0 ? (
              <div className="empty-state">
                <FaShoppingCart className="empty-icon" />
                <p>Nenhuma compra neste mês</p>
              </div>
            ) : (
              <div className="compras-table">
                <div className="table-header">
                  <span>Descrição</span>
                  <span>Cartão</span>
                  <span>Categoria</span>
                  <span>Data</span>
                  <span>Valor</span>
                  <span>Ações</span>
                </div>
                {compras
                  .filter(c => !cartaoSelecionado || c.cartao_id == cartaoSelecionado)
                  .map(compra => (
                    <div key={compra.compra_id} className="table-row">
                      <span className="compra-descricao">{compra.compra_descricao}</span>
                      <span className="compra-cartao">{compra.cartao_nome}</span>
                      <span className="compra-categoria">{compra.compra_categoria || '-'}</span>
                      <span className="compra-data">{formatarData(compra.compra_data)}</span>
                      <span className="compra-valor despesa">{formatarValor(compra.compra_valor_parcela)}</span>
                      <span className="compra-acoes">
                        {compra.compra_parcelas > 1 ? (
                          <>
                            <button onClick={() => excluirCompra(compra.compra_id, false)} title="Excluir só esta parcela">
                              <FaTrash />
                            </button>
                            <button onClick={() => excluirCompra(compra.compra_id, true)} title="Excluir todas parcelas">
                              <FaTrash style={{ color: '#DC2626' }} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => excluirCompra(compra.compra_id)}>
                            <FaTrash />
                          </button>
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Novo/Editar Cartão */}
      {showModalCartao && (
        <div className="modal-overlay" onClick={() => setShowModalCartao(false)}>
          <div className="modal-content modal-cartao" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editandoCartao ? 'Editar Cartão' : 'Novo Cartão'}</h3>
              <button className="btn-fechar" onClick={() => setShowModalCartao(false)}>×</button>
            </div>
            <form onSubmit={salvarCartao} className="modal-form">
              <div className="form-group">
                <label>Nome do Cartão</label>
                <input
                  type="text"
                  value={formCartao.nome}
                  onChange={e => setFormCartao({ ...formCartao, nome: e.target.value })}
                  placeholder="Ex: Nubank, Itaú, etc."
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Bandeira</label>
                  <select
                    value={formCartao.bandeira}
                    onChange={e => setFormCartao({ ...formCartao, bandeira: e.target.value })}
                  >
                    {bandeiras.map(b => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Limite</label>
                  <input
                    type="text"
                    value={formCartao.limite}
                    onChange={e => setFormCartao({ ...formCartao, limite: handleCurrencyInput(e.target.value) })}
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Dia do Fechamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formCartao.dia_fechamento}
                    onChange={e => setFormCartao({ ...formCartao, dia_fechamento: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Dia do Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formCartao.dia_vencimento}
                    onChange={e => setFormCartao({ ...formCartao, dia_vencimento: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Cor do Cartão</label>
                <div className="cores-selector">
                  {coresCartao.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      className={`cor-btn ${formCartao.cor === cor ? 'selected' : ''}`}
                      style={{ backgroundColor: cor }}
                      onClick={() => setFormCartao({ ...formCartao, cor })}
                    />
                  ))}
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModalCartao(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editandoCartao ? 'Salvar' : 'Criar Cartão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Compra */}
      {showModalCompra && (
        <div className="modal-overlay" onClick={() => setShowModalCompra(false)}>
          <div className="modal-content modal-compra" onClick={e => e.stopPropagation()}>
            <div className="modal-header despesas">
              <h3>Nova Compra</h3>
              <button className="btn-fechar" onClick={() => setShowModalCompra(false)}>×</button>
            </div>
            <form onSubmit={salvarCompra} className="modal-form">
              <div className="form-group">
                <label>Cartão</label>
                <select
                  value={formCompra.cartao_id}
                  onChange={e => setFormCompra({ ...formCompra, cartao_id: e.target.value })}
                  required
                >
                  <option value="">Selecione o cartão</option>
                  {cartoes.map(c => (
                    <option key={c.cartao_id} value={c.cartao_id}>{c.cartao_nome}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={formCompra.descricao}
                  onChange={e => setFormCompra({ ...formCompra, descricao: e.target.value })}
                  placeholder="Ex: Supermercado, Farmácia, etc."
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Valor Total</label>
                  <input
                    type="text"
                    value={formCompra.valor_total}
                    onChange={e => setFormCompra({ ...formCompra, valor_total: handleCurrencyInput(e.target.value) })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={formCompra.parcelas}
                    onChange={e => setFormCompra({ ...formCompra, parcelas: e.target.value })}
                  />
                </div>
              </div>
              
              {formCompra.parcelas > 1 && (
                <div className="parcelas-info">
                  <span>
                    {formCompra.parcelas}x de {formatarValor(parseCurrency(formCompra.valor_total) / parseInt(formCompra.parcelas || 1))}
                  </span>
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Data da Compra</label>
                  <input
                    type="date"
                    value={formCompra.data}
                    onChange={e => setFormCompra({ ...formCompra, data: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={formCompra.categoria}
                    onChange={e => setFormCompra({ ...formCompra, categoria: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {categoriasDespesa.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModalCompra(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Registrar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartaoCredito;
