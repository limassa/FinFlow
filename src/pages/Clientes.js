import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSearch, FaEdit, FaTrash, FaSave, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../App.css';

function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState('nome');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  });

  // Dados de exemplo para demonstração
  useEffect(() => {
    const clientesExemplo = [
      {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999',
        cpf: '123.456.789-00',
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        observacoes: 'Cliente VIP'
      },
      {
        id: 2,
        nome: 'Maria Santos',
        email: 'maria@email.com',
        telefone: '(11) 88888-8888',
        cpf: '987.654.321-00',
        endereco: 'Av. Paulista, 456',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-000',
        observacoes: 'Cliente frequente'
      },
      {
        id: 3,
        nome: 'Pedro Costa',
        email: 'pedro@email.com',
        telefone: '(11) 77777-7777',
        cpf: '456.789.123-00',
        endereco: 'Rua Augusta, 789',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01305-000',
        observacoes: 'Novo cliente'
      }
    ];
    setClientes(clientesExemplo);
  }, []);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const handleOrdenacaoChange = (e) => {
    setOrdenacao(e.target.value);
  };

  const handleNovoCliente = () => {
    setEditando(null);
    setNovoCliente({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: ''
    });
    setShowModal(true);
  };

  const handleEditarCliente = (cliente) => {
    setEditando(cliente);
    setNovoCliente({ ...cliente });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setNovoCliente({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoCliente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalvarCliente = () => {
    if (editando) {
      // Editar cliente existente
      setClientes(prev => prev.map(c => 
        c.id === editando.id ? { ...novoCliente, id: c.id } : c
      ));
    } else {
      // Adicionar novo cliente
      const novoId = Math.max(...clientes.map(c => c.id), 0) + 1;
      setClientes(prev => [...prev, { ...novoCliente, id: novoId }]);
    }
    handleCloseModal();
  };

  const handleExcluirCliente = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClientes(prev => prev.filter(c => c.id !== id));
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.email.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.telefone.includes(filtro) ||
    cliente.cpf.includes(filtro)
  );

  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case 'nome':
        return a.nome.localeCompare(b.nome);
      case 'email':
        return a.email.localeCompare(b.email);
      case 'cidade':
        return a.cidade.localeCompare(b.cidade);
      default:
        return 0;
    }
  });

  const totalClientes = clientes.length;
  const clientesAtivos = clientes.length; // Aqui você pode adicionar lógica para clientes ativos

  return (
    <div className="receita-container">
      <div className="receita-header">
        <h2>Controle de Clientes</h2>
        <div className="receita-stats">
          <div className="stat-card">
            <span className="stat-label">Total Clientes</span>
            <span className="stat-value">{totalClientes}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Clientes Ativos</span>
            <span className="stat-value">{clientesAtivos}</span>
          </div>
        </div>
      </div>

      <div className="filtro-container">
        <div className="filtro-icon">
          <FaSearch />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, email, telefone ou CPF..."
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
          <option value="email">Email</option>
          <option value="cidade">Cidade</option>
        </select>
      </div>

      <div className="form-container">
        <div className="form-header">
          <h3>Clientes Cadastrados</h3>
          <button onClick={handleNovoCliente} className="btn-adicionar">
            <FaPlus />
            Novo Cliente
          </button>
        </div>

        <div className="grid-container">
          <div className="clientes-grid">
            <div className="grid-header">
              <div className="grid-cell">Nome</div>
              <div className="grid-cell">Email</div>
              <div className="grid-cell">Telefone</div>
              <div className="grid-cell">CPF</div>
              <div className="grid-cell">Cidade</div>
              <div className="grid-cell">Estado</div>
              <div className="grid-cell">Observações</div>
              <div className="grid-cell">Ações</div>
            </div>
            
            {clientesOrdenados.map((cliente) => (
              <div key={cliente.id} className="grid-row">
                <div className="grid-cell">
                  <div className="cliente-info">
                    <FaUser className="cliente-icon" />
                    {cliente.nome}
                  </div>
                </div>
                <div className="grid-cell">
                  <div className="cliente-info">
                    <FaEnvelope className="cliente-icon" />
                    {cliente.email}
                  </div>
                </div>
                <div className="grid-cell">
                  <div className="cliente-info">
                    <FaPhone className="cliente-icon" />
                    {cliente.telefone}
                  </div>
                </div>
                <div className="grid-cell">{cliente.cpf}</div>
                <div className="grid-cell">{cliente.cidade}</div>
                <div className="grid-cell">{cliente.estado}</div>
                <div className="grid-cell">{cliente.observacoes}</div>
                <div className="grid-cell acoes">
                  <button 
                    className="btn-edit" 
                    title="Editar"
                    onClick={() => handleEditarCliente(cliente)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn-delete" 
                    title="Excluir"
                    onClick={() => handleExcluirCliente(cliente.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Cliente */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editando ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    name="nome"
                    value={novoCliente.nome}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={novoCliente.email}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={novoCliente.telefone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="form-group">
                  <label>CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={novoCliente.cpf}
                    onChange={handleInputChange}
                    placeholder="123.456.789-00"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={novoCliente.endereco}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={novoCliente.cidade}
                    onChange={handleInputChange}
                    placeholder="Cidade"
                  />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={novoCliente.estado}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={novoCliente.cep}
                  onChange={handleInputChange}
                  placeholder="12345-678"
                />
              </div>
              
              <div className="form-group">
                <label>Observações</label>
                <textarea
                  name="observacoes"
                  value={novoCliente.observacoes}
                  onChange={handleInputChange}
                  placeholder="Observações sobre o cliente"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn-salvar" onClick={handleSalvarCliente}>
                <FaSave />
                {editando ? 'Atualizar' : 'Salvar'} Cliente
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

export default Clientes; 