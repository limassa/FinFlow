import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTags, FaPlus, FaEdit, FaTrash, FaHome, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

// Ícones disponíveis
const iconesDisponiveis = [
  'ellipsis-horizontal', 'cart', 'car', 'home', 'medkit', 'school',
  'restaurant', 'film', 'shirt', 'cash', 'card', 'airplane',
  'gift', 'paw', 'fitness', 'musical-notes', 'book', 'game-controller',
  'phone-portrait', 'laptop', 'wifi', 'water', 'flash', 'construct',
  'briefcase', 'trophy', 'heart', 'star', 'leaf', 'globe'
];

// Cores disponíveis
const coresDisponiveis = [
  '#6B7280', '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6',
  '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
];

function Categorias() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const userId = usuario?.id;

  // Estados
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [tipoAtivo, setTipoAtivo] = useState('despesa'); // 'despesa' ou 'receita'

  // Form
  const [formCategoria, setFormCategoria] = useState({
    nome: '',
    tipo: 'despesa',
    icone: 'ellipsis-horizontal',
    cor: '#6B7280'
  });

  useEffect(() => {
    if (userId) {
      carregarCategorias();
    }
  }, [userId, tipoAtivo]);

  const carregarCategorias = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.CATEGORIAS}?userId=${userId}&tipo=${tipoAtivo}`);
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const abrirModal = (categoria = null) => {
    if (categoria) {
      setEditando(categoria);
      setFormCategoria({
        nome: categoria.categoria_nome,
        tipo: categoria.categoria_tipo,
        icone: categoria.categoria_icone || 'ellipsis-horizontal',
        cor: categoria.categoria_cor || '#6B7280'
      });
    } else {
      setEditando(null);
      setFormCategoria({
        nome: '',
        tipo: tipoAtivo,
        icone: 'ellipsis-horizontal',
        cor: '#6B7280'
      });
    }
    setShowModal(true);
  };

  const salvarCategoria = async (e) => {
    e.preventDefault();
    
    try {
      if (editando) {
        await axios.put(`${API_ENDPOINTS.CATEGORIAS}/${editando.categoria_id}`, {
          nome: formCategoria.nome,
          icone: formCategoria.icone,
          cor: formCategoria.cor,
          ordem: editando.categoria_ordem
        });
      } else {
        await axios.post(API_ENDPOINTS.CATEGORIAS, {
          usuario_id: userId,
          nome: formCategoria.nome,
          tipo: formCategoria.tipo,
          icone: formCategoria.icone,
          cor: formCategoria.cor,
          ordem: categorias.length
        });
      }

      setShowModal(false);
      carregarCategorias();
    } catch (error) {
      if (error.response?.status === 409) {
        alert('Já existe uma categoria com este nome.');
      } else {
        console.error('Erro ao salvar categoria:', error);
        alert('Erro ao salvar categoria');
      }
    }
  };

  const excluirCategoria = async (id) => {
    if (!window.confirm('Deseja excluir esta categoria?')) return;
    
    try {
      await axios.delete(`${API_ENDPOINTS.CATEGORIAS}/${id}`);
      carregarCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria');
    }
  };

  const moverCategoria = async (id, direcao) => {
    const index = categorias.findIndex(c => c.categoria_id === id);
    if (
      (direcao === 'up' && index === 0) || 
      (direcao === 'down' && index === categorias.length - 1)
    ) {
      return;
    }

    const novaOrdem = [...categorias];
    const targetIndex = direcao === 'up' ? index - 1 : index + 1;
    [novaOrdem[index], novaOrdem[targetIndex]] = [novaOrdem[targetIndex], novaOrdem[index]];

    // Atualizar ordem no backend
    try {
      await Promise.all(
        novaOrdem.map((cat, i) => 
          axios.put(`${API_ENDPOINTS.CATEGORIAS}/${cat.categoria_id}`, {
            nome: cat.categoria_nome,
            icone: cat.categoria_icone,
            cor: cat.categoria_cor,
            ordem: i
          })
        )
      );
      carregarCategorias();
    } catch (error) {
      console.error('Erro ao reordenar:', error);
    }
  };

  // Renderizar ícone (simulado - em produção usar react-icons ou similar)
  const renderIcone = (icone, cor) => {
    return (
      <div 
        className="categoria-icone-preview"
        style={{ backgroundColor: cor }}
      >
        <span className="icone-nome">{icone.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  };

  if (!userId) {
    navigate('/');
    return null;
  }

  return (
    <div className="categorias-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-title">
          <FaTags className="header-icon" />
          <h1>Categorias</h1>
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
          className={`tab-btn ${tipoAtivo === 'despesa' ? 'active despesas' : ''}`}
          onClick={() => setTipoAtivo('despesa')}
        >
          Despesas
        </button>
        <button 
          className={`tab-btn ${tipoAtivo === 'receita' ? 'active receitas' : ''}`}
          onClick={() => setTipoAtivo('receita')}
        >
          Receitas
        </button>
      </div>

      {/* Toolbar */}
      <div className="categorias-toolbar">
        <p className="info-text">
          Crie suas próprias categorias para organizar melhor suas {tipoAtivo === 'despesa' ? 'despesas' : 'receitas'}.
        </p>
        <button className="btn-add" onClick={() => abrirModal()}>
          <FaPlus /> Nova Categoria
        </button>
      </div>

      {/* Lista de Categorias */}
      <div className="categorias-lista">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : categorias.length === 0 ? (
          <div className="empty-state">
            <FaTags className="empty-icon" />
            <p>Nenhuma categoria customizada</p>
            <p className="empty-subtitle">As categorias padrão do sistema continuam disponíveis.</p>
            <button className="btn-add" onClick={() => abrirModal()}>
              <FaPlus /> Criar Categoria
            </button>
          </div>
        ) : (
          <div className="categorias-grid">
            {categorias.map((cat, index) => (
              <div 
                key={cat.categoria_id} 
                className="categoria-card"
                style={{ borderLeftColor: cat.categoria_cor }}
              >
                <div className="categoria-info">
                  {renderIcone(cat.categoria_icone, cat.categoria_cor)}
                  <span className="categoria-nome">{cat.categoria_nome}</span>
                </div>
                <div className="categoria-acoes">
                  <button 
                    onClick={() => moverCategoria(cat.categoria_id, 'up')}
                    disabled={index === 0}
                    title="Mover para cima"
                  >
                    <FaArrowUp />
                  </button>
                  <button 
                    onClick={() => moverCategoria(cat.categoria_id, 'down')}
                    disabled={index === categorias.length - 1}
                    title="Mover para baixo"
                  >
                    <FaArrowDown />
                  </button>
                  <button onClick={() => abrirModal(cat)} title="Editar">
                    <FaEdit />
                  </button>
                  <button onClick={() => excluirCategoria(cat.categoria_id)} title="Excluir">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-categoria" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button className="btn-fechar" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={salvarCategoria} className="modal-form">
              <div className="form-group">
                <label>Nome da Categoria</label>
                <input
                  type="text"
                  value={formCategoria.nome}
                  onChange={e => setFormCategoria({ ...formCategoria, nome: e.target.value })}
                  placeholder="Ex: Academia, Streaming, etc."
                  required
                  maxLength={100}
                />
              </div>
              
              {!editando && (
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={formCategoria.tipo}
                    onChange={e => setFormCategoria({ ...formCategoria, tipo: e.target.value })}
                  >
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>Ícone</label>
                <div className="icones-grid">
                  {iconesDisponiveis.map(icone => (
                    <button
                      key={icone}
                      type="button"
                      className={`icone-btn ${formCategoria.icone === icone ? 'selected' : ''}`}
                      onClick={() => setFormCategoria({ ...formCategoria, icone })}
                      title={icone}
                    >
                      {icone.slice(0, 2).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Cor</label>
                <div className="cores-grid">
                  {coresDisponiveis.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      className={`cor-btn ${formCategoria.cor === cor ? 'selected' : ''}`}
                      style={{ backgroundColor: cor }}
                      onClick={() => setFormCategoria({ ...formCategoria, cor })}
                    />
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="categoria-preview">
                <span>Preview:</span>
                <div className="preview-item" style={{ borderLeftColor: formCategoria.cor }}>
                  {renderIcone(formCategoria.icone, formCategoria.cor)}
                  <span>{formCategoria.nome || 'Nome da categoria'}</span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editando ? 'Salvar' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categorias;
