import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSearch, FaPrint, FaSave } from 'react-icons/fa';
import '../App.css';

function Vendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState('data');
  const [showModal, setShowModal] = useState(false);
  const [novaVenda, setNovaVenda] = useState({
    cliente: '',
    produtos: [],
    formaPagamento: '',
    total: 0,
    desconto: 0,
    observacoes: ''
  });

  // Dados de exemplo para demonstração
  useEffect(() => {
    const vendasExemplo = [
      {
        id: 1,
        data: '2024-01-15',
        cliente: 'João Silva',
        produtos: 'Produto A, Produto B',
        total: 150.00,
        formaPagamento: 'Cartão',
        status: 'Concluída'
      },
      {
        id: 2,
        data: '2024-01-14',
        cliente: 'Maria Santos',
        produtos: 'Produto C',
        total: 75.50,
        formaPagamento: 'Dinheiro',
        status: 'Concluída'
      },
      {
        id: 3,
        data: '2024-01-13',
        cliente: 'Pedro Costa',
        produtos: 'Produto A, Produto D',
        total: 200.00,
        formaPagamento: 'PIX',
        status: 'Pendente'
      }
    ];
    setVendas(vendasExemplo);
  }, []);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const handleOrdenacaoChange = (e) => {
    setOrdenacao(e.target.value);
  };

  const handleNovaVenda = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNovaVenda({
      cliente: '',
      produtos: [],
      formaPagamento: '',
      total: 0,
      desconto: 0,
      observacoes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovaVenda(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalvarVenda = () => {
    // Aqui você implementaria a lógica para salvar a venda
    console.log('Salvando venda:', novaVenda);
    handleCloseModal();
  };

  const vendasFiltradas = vendas.filter(venda =>
    venda.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
    venda.produtos.toLowerCase().includes(filtro.toLowerCase())
  );

  const vendasOrdenadas = [...vendasFiltradas].sort((a, b) => {
    switch (ordenacao) {
      case 'data':
        return new Date(b.data) - new Date(a.data);
      case 'cliente':
        return a.cliente.localeCompare(b.cliente);
      case 'total':
        return b.total - a.total;
      default:
        return 0;
    }
  });

  const totalVendas = vendas.reduce((total, venda) => total + venda.total, 0);
  const vendasHoje = vendas.filter(venda => 
    new Date(venda.data).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="receita-container">
      <div className="receita-header">
        <h2>Controle de Vendas</h2>
        <div className="receita-stats">
          <div className="stat-card">
            <span className="stat-label">Total Vendas</span>
            <span className="stat-value">R$ {totalVendas.toFixed(2)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Vendas Hoje</span>
            <span className="stat-value">{vendasHoje}</span>
          </div>
        </div>
      </div>

      <div className="filtro-container">
        <div className="filtro-icon">
          <FaSearch />
        </div>
        <input
          type="text"
          placeholder="Buscar por cliente ou produto..."
          value={filtro}
          onChange={handleFiltroChange}
          className="filtro-input"
        />
        <select
          value={ordenacao}
          onChange={handleOrdenacaoChange}
          className="filtro-select"
        >
          <option value="data">Data</option>
          <option value="cliente">Cliente</option>
          <option value="total">Valor</option>
        </select>
      </div>

      <div className="form-container">
        <div className="form-header">
          <h3>Vendas Realizadas</h3>
          <button onClick={handleNovaVenda} className="btn-adicionar">
            <FaPlus />
            Nova Venda
          </button>
        </div>

        <div className="grid-container">
          <div className="vendas-grid">
            <div className="grid-header">
              <div className="grid-cell">Data</div>
              <div className="grid-cell">Cliente</div>
              <div className="grid-cell">Produtos</div>
              <div className="grid-cell">Total</div>
              <div className="grid-cell">Pagamento</div>
              <div className="grid-cell">Status</div>
              <div className="grid-cell">Ações</div>
            </div>
            
            {vendasOrdenadas.map((venda) => (
              <div key={venda.id} className="grid-row">
                <div className="grid-cell">{new Date(venda.data).toLocaleDateString('pt-BR')}</div>
                <div className="grid-cell">{venda.cliente}</div>
                <div className="grid-cell">{venda.produtos}</div>
                <div className="grid-cell valor">R$ {venda.total.toFixed(2)}</div>
                <div className="grid-cell">{venda.formaPagamento}</div>
                <div className="grid-cell">
                  <span className={`status ${venda.status.toLowerCase()}`}>
                    {venda.status}
                  </span>
                </div>
                <div className="grid-cell acoes">
                  <button className="btn-edit" title="Editar">
                    <FaPlus />
                  </button>
                  <button className="btn-delete" title="Excluir">
                    <FaPlus />
                  </button>
                  <button className="btn-print" title="Imprimir">
                    <FaPrint />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Nova Venda */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nova Venda</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Cliente</label>
                <input
                  type="text"
                  name="cliente"
                  value={novaVenda.cliente}
                  onChange={handleInputChange}
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div className="form-group">
                <label>Produtos</label>
                <textarea
                  name="produtos"
                  value={novaVenda.produtos}
                  onChange={handleInputChange}
                  placeholder="Lista de produtos"
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Total</label>
                  <input
                    type="number"
                    name="total"
                    value={novaVenda.total}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Desconto</label>
                  <input
                    type="number"
                    name="desconto"
                    value={novaVenda.desconto}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Forma de Pagamento</label>
                <select
                  name="formaPagamento"
                  value={novaVenda.formaPagamento}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Observações</label>
                <textarea
                  name="observacoes"
                  value={novaVenda.observacoes}
                  onChange={handleInputChange}
                  placeholder="Observações da venda"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn-salvar" onClick={handleSalvarVenda}>
                <FaSave />
                Salvar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Voltar */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          type="button" 
          className="dashboard-back-button"
          onClick={() => navigate('/principal')}
        >
          <FaArrowLeft />
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
}

export default Vendas; 