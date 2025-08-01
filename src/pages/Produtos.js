import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSearch, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import '../App.css';

function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState('nome');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [novoProduto, setNovoProduto] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    preco: 0,
    estoque: 0,
    categoria: '',
    fornecedor: ''
  });

  // Dados de exemplo para demonstração
  useEffect(() => {
    const produtosExemplo = [
      {
        id: 1,
        codigo: 'PROD001',
        nome: 'Produto A',
        descricao: 'Descrição do produto A',
        preco: 25.50,
        estoque: 100,
        categoria: 'Eletrônicos',
        fornecedor: 'Fornecedor A'
      },
      {
        id: 2,
        codigo: 'PROD002',
        nome: 'Produto B',
        descricao: 'Descrição do produto B',
        preco: 15.75,
        estoque: 50,
        categoria: 'Informática',
        fornecedor: 'Fornecedor B'
      },
      {
        id: 3,
        codigo: 'PROD003',
        nome: 'Produto C',
        descricao: 'Descrição do produto C',
        preco: 45.00,
        estoque: 25,
        categoria: 'Acessórios',
        fornecedor: 'Fornecedor C'
      }
    ];
    setProdutos(produtosExemplo);
  }, []);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const handleOrdenacaoChange = (e) => {
    setOrdenacao(e.target.value);
  };

  const handleNovoProduto = () => {
    setEditando(null);
    setNovoProduto({
      codigo: '',
      nome: '',
      descricao: '',
      preco: 0,
      estoque: 0,
      categoria: '',
      fornecedor: ''
    });
    setShowModal(true);
  };

  const handleEditarProduto = (produto) => {
    setEditando(produto);
    setNovoProduto({ ...produto });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setNovoProduto({
      codigo: '',
      nome: '',
      descricao: '',
      preco: 0,
      estoque: 0,
      categoria: '',
      fornecedor: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoProduto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalvarProduto = () => {
    if (editando) {
      // Editar produto existente
      setProdutos(prev => prev.map(p => 
        p.id === editando.id ? { ...novoProduto, id: p.id } : p
      ));
    } else {
      // Adicionar novo produto
      const novoId = Math.max(...produtos.map(p => p.id), 0) + 1;
      setProdutos(prev => [...prev, { ...novoProduto, id: novoId }]);
    }
    handleCloseModal();
  };

  const handleExcluirProduto = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProdutos(prev => prev.filter(p => p.id !== id));
    }
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case 'nome':
        return a.nome.localeCompare(b.nome);
      case 'codigo':
        return a.codigo.localeCompare(b.codigo);
      case 'preco':
        return b.preco - a.preco;
      case 'estoque':
        return b.estoque - a.estoque;
      default:
        return 0;
    }
  });

  const totalProdutos = produtos.length;
  const valorTotalEstoque = produtos.reduce((total, produto) => total + (produto.preco * produto.estoque), 0);

  return (
    <div className="receita-container">
      <div className="receita-header">
        <h2>Controle de Produtos</h2>
        <div className="receita-stats">
          <div className="stat-card">
            <span className="stat-label">Total Produtos</span>
            <span className="stat-value">{totalProdutos}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Valor Estoque</span>
            <span className="stat-value">R$ {valorTotalEstoque.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="filtro-container">
        <div className="filtro-icon">
          <FaSearch />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, código ou categoria..."
          value={filtro}
          onChange={handleFiltroChange}
          className="filtro-input"
        />
        <select
          value={ordenacao}
          onChange={handleOrdenacaoChange}
          className="filtro-select"
        >
          <option value="nome">Nome</option>
          <option value="codigo">Código</option>
          <option value="preco">Preço</option>
          <option value="estoque">Estoque</option>
        </select>
      </div>

      <div className="form-container">
        <div className="form-header">
          <h3>Produtos Cadastrados</h3>
          <button onClick={handleNovoProduto} className="btn-adicionar">
            <FaPlus />
            Novo Produto
          </button>
        </div>

        <div className="grid-container">
          <div className="produtos-grid">
            <div className="grid-header">
              <div className="grid-cell">Código</div>
              <div className="grid-cell">Nome</div>
              <div className="grid-cell">Descrição</div>
              <div className="grid-cell">Preço</div>
              <div className="grid-cell">Estoque</div>
              <div className="grid-cell">Categoria</div>
              <div className="grid-cell">Fornecedor</div>
              <div className="grid-cell">Ações</div>
            </div>
            
            {produtosOrdenados.map((produto) => (
              <div key={produto.id} className="grid-row">
                <div className="grid-cell">{produto.codigo}</div>
                <div className="grid-cell">{produto.nome}</div>
                <div className="grid-cell">{produto.descricao}</div>
                <div className="grid-cell valor">R$ {produto.preco.toFixed(2)}</div>
                <div className="grid-cell">{produto.estoque}</div>
                <div className="grid-cell">{produto.categoria}</div>
                <div className="grid-cell">{produto.fornecedor}</div>
                <div className="grid-cell acoes">
                  <button 
                    className="btn-edit" 
                    title="Editar"
                    onClick={() => handleEditarProduto(produto)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn-delete" 
                    title="Excluir"
                    onClick={() => handleExcluirProduto(produto.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Produto */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editando ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Código</label>
                  <input
                    type="text"
                    name="codigo"
                    value={novoProduto.codigo}
                    onChange={handleInputChange}
                    placeholder="Código do produto"
                  />
                </div>
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={novoProduto.nome}
                    onChange={handleInputChange}
                    placeholder="Nome do produto"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  value={novoProduto.descricao}
                  onChange={handleInputChange}
                  placeholder="Descrição do produto"
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Preço</label>
                  <input
                    type="number"
                    name="preco"
                    value={novoProduto.preco}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Estoque</label>
                  <input
                    type="number"
                    name="estoque"
                    value={novoProduto.estoque}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    name="categoria"
                    value={novoProduto.categoria}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="Eletrônicos">Eletrônicos</option>
                    <option value="Informática">Informática</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Vestuário">Vestuário</option>
                    <option value="Alimentos">Alimentos</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fornecedor</label>
                  <input
                    type="text"
                    name="fornecedor"
                    value={novoProduto.fornecedor}
                    onChange={handleInputChange}
                    placeholder="Nome do fornecedor"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn-salvar" onClick={handleSalvarProduto}>
                <FaSave />
                {editando ? 'Atualizar' : 'Salvar'} Produto
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

export default Produtos; 