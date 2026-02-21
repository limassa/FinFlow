import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaTags, FaPlus, FaEdit, FaTrash, FaHome, FaArrowUp, FaArrowDown,
  FaShoppingCart, FaCar, FaHouseUser, FaMedkit, FaGraduationCap,
  FaUtensils, FaFilm, FaTshirt, FaMoneyBillWave, FaCreditCard, FaPlane,
  FaGift, FaPaw, FaDumbbell, FaMusic, FaBook, FaGamepad,
  FaMobileAlt, FaLaptop, FaWifi, FaTint, FaBolt, FaTools,
  FaBriefcase, FaTrophy, FaHeart, FaStar, FaLeaf, FaGlobe,
  FaEllipsisH, FaBus, FaShoppingBag, FaPiggyBank, FaChartLine, FaPhone
} from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import '../App.css';

// Mapa de ícones disponíveis
const iconesMap = {
  'ellipsis': FaEllipsisH,
  'cart': FaShoppingCart,
  'car': FaCar,
  'home': FaHouseUser,
  'medkit': FaMedkit,
  'school': FaGraduationCap,
  'restaurant': FaUtensils,
  'film': FaFilm,
  'shirt': FaTshirt,
  'cash': FaMoneyBillWave,
  'card': FaCreditCard,
  'airplane': FaPlane,
  'gift': FaGift,
  'paw': FaPaw,
  'fitness': FaDumbbell,
  'music': FaMusic,
  'book': FaBook,
  'gamepad': FaGamepad,
  'phone': FaMobileAlt,
  'laptop': FaLaptop,
  'wifi': FaWifi,
  'water': FaTint,
  'flash': FaBolt,
  'tools': FaTools,
  'briefcase': FaBriefcase,
  'trophy': FaTrophy,
  'heart': FaHeart,
  'star': FaStar,
  'leaf': FaLeaf,
  'globe': FaGlobe,
  'bus': FaBus,
  'bag': FaShoppingBag,
  'piggy': FaPiggyBank,
  'chart': FaChartLine,
  'telephone': FaPhone
};

const iconesDisponiveis = Object.keys(iconesMap);

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
    tipoDespesa: true,
    tipoReceita: false,
    icone: 'ellipsis',
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
        tipoDespesa: categoria.categoria_tipo === 'despesa',
        tipoReceita: categoria.categoria_tipo === 'receita',
        icone: categoria.categoria_icone || 'ellipsis',
        cor: categoria.categoria_cor || '#6B7280'
      });
    } else {
      setEditando(null);
      setFormCategoria({
        nome: '',
        tipoDespesa: tipoAtivo === 'despesa',
        tipoReceita: tipoAtivo === 'receita',
        icone: 'ellipsis',
        cor: '#6B7280'
      });
    }
    setShowModal(true);
  };

  const salvarCategoria = async (e) => {
    if (e) e.preventDefault();
    
    if (!formCategoria.nome.trim()) {
      alert('Por favor, informe o nome da categoria');
      return;
    }

    if (!formCategoria.tipoDespesa && !formCategoria.tipoReceita) {
      alert('Selecione pelo menos um tipo (Despesa ou Receita)');
      return;
    }
    
    try {
      if (editando) {
        await axios.put(`${API_ENDPOINTS.CATEGORIAS}/${editando.categoria_id}`, {
          nome: formCategoria.nome,
          icone: formCategoria.icone,
          cor: formCategoria.cor,
          ordem: editando.categoria_ordem
        });
      } else {
        // Criar categoria para cada tipo selecionado
        const promises = [];
        
        if (formCategoria.tipoDespesa) {
          promises.push(axios.post(API_ENDPOINTS.CATEGORIAS, {
            usuario_id: userId,
            nome: formCategoria.nome,
            tipo: 'despesa',
            icone: formCategoria.icone,
            cor: formCategoria.cor,
            ordem: categorias.length
          }));
        }
        
        if (formCategoria.tipoReceita) {
          promises.push(axios.post(API_ENDPOINTS.CATEGORIAS, {
            usuario_id: userId,
            nome: formCategoria.nome,
            tipo: 'receita',
            icone: formCategoria.icone,
            cor: formCategoria.cor,
            ordem: categorias.length
          }));
        }

        await Promise.all(promises);
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

  // Renderizar ícone usando react-icons
  const renderIcone = (icone, cor) => {
    const IconComponent = iconesMap[icone] || FaEllipsisH;
    return (
      <div 
        className="categoria-icone-preview"
        style={{ backgroundColor: cor }}
      >
        <IconComponent size={18} color="white" />
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
            
            <div className="modal-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
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
                  <label>Tipo (selecione um ou ambos)</label>
                  <div className="checkbox-group" style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formCategoria.tipoDespesa}
                        onChange={e => setFormCategoria({ ...formCategoria, tipoDespesa: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#EF4444' }}
                      />
                      <span style={{ color: '#EF4444', fontWeight: '500' }}>Despesa</span>
                    </label>
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formCategoria.tipoReceita}
                        onChange={e => setFormCategoria({ ...formCategoria, tipoReceita: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#10B981' }}
                      />
                      <span style={{ color: '#10B981', fontWeight: '500' }}>Receita</span>
                    </label>
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label>Ícone</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px',
                  padding: '12px',
                  background: 'transparent',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {iconesDisponiveis.map(icone => {
                    const IconComponent = iconesMap[icone];
                    const isSelected = formCategoria.icone === icone;
                    return (
                      <button
                        key={icone}
                        type="button"
                        onClick={() => setFormCategoria({ ...formCategoria, icone })}
                        title={icone}
                        style={{
                          width: '42px',
                          height: '42px',
                          border: isSelected ? '3px solid #4F46E5' : '2px solid #d1d5db',
                          borderRadius: '10px',
                          background: isSelected ? '#EEF2FF' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <IconComponent 
                          size={20} 
                          style={{ 
                            color: isSelected ? '#4F46E5' : '#1f2937',
                            minWidth: '20px',
                            minHeight: '20px'
                          }}
                        />
                      </button>
                    );
                  })}
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
            </div>
            
            {/* Botões fora do scroll para sempre aparecerem */}
            <div className="modal-footer" style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px', 
              padding: '16px 20px', 
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              flexShrink: 0
            }}>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 24px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-save"
                onClick={salvarCategoria}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {editando ? 'Salvar' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categorias;
