import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaChartPie, FaPlus, FaEdit, FaTrash, FaHome, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/api';
import { getUsuarioLogado } from '../functions/auth';
import SelectWithIcons from '../components/SelectWithIcons';
import { getIconForTipo, getIconComponentByName } from '../utils/categoryIcons';
import '../App.css';

// Categorias padrão de despesa
const categoriasPadrao = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação',
  'Lazer', 'Vestuário', 'Assinaturas', 'Compras', 'Cartão de Crédito',
  'Investimentos', 'Impostos', 'Seguros', 'Doações', 'Outros'
];

function Orcamento() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const userId = usuario?.id;

  // Estados
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7));

  // Form
  const [formOrcamento, setFormOrcamento] = useState({
    categoria: '',
    valor: ''
  });
  const [editandoOrcamento, setEditandoOrcamento] = useState(null);

  // Categorias customizadas
  const [categoriasCustomizadas, setCategoriasCustomizadas] = useState([]);
  const [iconesCustomizados, setIconesCustomizados] = useState({});

  useEffect(() => {
    if (userId) {
      carregarOrcamentos();
      carregarCategorias();
    }
  }, [userId, mesSelecionado]);

  const carregarCategorias = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.CATEGORIAS}?userId=${userId}&tipo=despesa`);
      const nomes = res.data.map(cat => cat.categoria_nome);
      setCategoriasCustomizadas(nomes);
      
      const icones = {};
      res.data.forEach(cat => {
        if (cat.categoria_icone) {
          icones[cat.categoria_nome] = cat.categoria_icone;
        }
      });
      setIconesCustomizados(icones);
    } catch (err) {
      console.log('Erro ao buscar categorias:', err);
    }
  };

  // Função para obter ícone (considera customizados)
  const getIcone = (tipo) => {
    if (iconesCustomizados[tipo]) {
      return getIconComponentByName(iconesCustomizados[tipo]);
    }
    return getIconForTipo(tipo, 'despesa');
  };
  
  // Todas as categorias disponíveis (padrão + customizadas)
  const todasCategorias = [...categoriasPadrao, ...categoriasCustomizadas];

  const carregarOrcamentos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.ORCAMENTOS}?userId=${userId}&mes=${mesSelecionado}`);
      setOrcamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
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

  const formatarMes = (mes) => {
    const [ano, mesNum] = mes.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mesNum, 10) - 1]} ${ano}`;
  };

  // Opções de mês: Jan (ano-1) até Dez (ano+2). Ex: hoje 2025 → Jan/24 até Dez/27
  const gerarOpcoesMeses = () => {
    const opcoes = [];
    const anoMin = new Date().getFullYear() - 1;
    const anoMax = new Date().getFullYear() + 2;
    for (let ano = anoMin; ano <= anoMax; ano++) {
      for (let m = 0; m < 12; m++) {
        opcoes.push({
          valor: `${ano}-${String(m + 1).padStart(2, '0')}`,
          label: `${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][m]} ${ano}`
        });
      }
    }
    return opcoes;
  };
  const opcoesMeses = gerarOpcoesMeses();

  const mudarMes = (delta) => {
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    const d = new Date(ano, mes - 1, 1);
    d.setMonth(d.getMonth() + delta);
    const novoMes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (opcoesMeses.some(o => o.valor === novoMes)) setMesSelecionado(novoMes);
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

  // Cálculos
  const calcularStatus = (orcado, realizado) => {
    const percentual = orcado > 0 ? (realizado / orcado) * 100 : 0;
    if (percentual <= 80) return 'ok';
    if (percentual <= 100) return 'atencao';
    return 'excedido';
  };

  const calcularTotais = () => {
    const totalOrcado = orcamentos.reduce((sum, o) => sum + parseFloat(o.orcamento_valor || 0), 0);
    const totalRealizado = orcamentos.reduce((sum, o) => sum + parseFloat(o.valor_realizado || 0), 0);
    const diferenca = totalOrcado - totalRealizado;
    return { totalOrcado, totalRealizado, diferenca };
  };

  // Handlers
  const abrirModal = () => {
    setEditandoOrcamento(null);
    setFormOrcamento({ categoria: '', valor: '' });
    setShowModal(true);
  };

  const abrirModalEdicao = (orc) => {
    setEditandoOrcamento(orc);
    setFormOrcamento({
      categoria: orc.orcamento_categoria,
      valor: orc.orcamento_valor?.toString().replace('.', ',') || ''
    });
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditandoOrcamento(null);
    setFormOrcamento({ categoria: '', valor: '' });
  };

  const salvarOrcamento = async (e) => {
    e.preventDefault();
    
    try {
      if (editandoOrcamento) {
        await axios.put(`${API_ENDPOINTS.ORCAMENTOS}/${editandoOrcamento.orcamento_id}`, {
          categoria: formOrcamento.categoria,
          valor: parseCurrency(formOrcamento.valor)
        });
      } else {
        await axios.post(API_ENDPOINTS.ORCAMENTOS, {
          usuario_id: userId,
          categoria: formOrcamento.categoria,
          valor: parseCurrency(formOrcamento.valor),
          mes: mesSelecionado
        });
      }
      fecharModal();
      carregarOrcamentos();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento');
    }
  };

  const excluirOrcamento = async (id) => {
    if (!window.confirm('Deseja excluir este orçamento?')) return;
    
    try {
      await axios.delete(`${API_ENDPOINTS.ORCAMENTOS}/${id}`);
      carregarOrcamentos();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      alert('Erro ao excluir orçamento');
    }
  };

  // Copiar orçamento do mês anterior
  const copiarMesAnterior = async () => {
    const mesAnterior = new Date(mesSelecionado + '-01');
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
    const mesAnteriorStr = mesAnterior.toISOString().slice(0, 7);

    try {
      const response = await axios.get(`${API_ENDPOINTS.ORCAMENTOS}?userId=${userId}&mes=${mesAnteriorStr}`);
      
      if (response.data.length === 0) {
        alert('Não há orçamentos no mês anterior para copiar.');
        return;
      }

      if (!window.confirm(`Deseja copiar ${response.data.length} orçamentos de ${formatarMes(mesAnteriorStr)}?`)) {
        return;
      }

      for (const orc of response.data) {
        await axios.post(API_ENDPOINTS.ORCAMENTOS, {
          usuario_id: userId,
          categoria: orc.orcamento_categoria,
          valor: orc.orcamento_valor,
          mes: mesSelecionado
        });
      }

      carregarOrcamentos();
    } catch (error) {
      console.error('Erro ao copiar orçamentos:', error);
      alert('Erro ao copiar orçamentos');
    }
  };

  // Categorias disponíveis (excluindo as já usadas, mas ao editar inclui a da própria)
  const categoriasDisponiveis = todasCategorias.filter(
    cat => !orcamentos.some(o => 
      o.orcamento_categoria === cat && 
      (!editandoOrcamento || o.orcamento_id !== editandoOrcamento.orcamento_id)
    )
  );

  const totais = calcularTotais();

  if (!userId) {
    navigate('/');
    return null;
  }

  return (
    <div className="orcamento-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-title">
          <FaChartPie className="header-icon" />
          <h1>Orçamento Mensal</h1>
        </div>
        <div className="header-actions">
          <button className="btn-home" onClick={() => navigate('/layout/principal')}>
            <FaHome /> Home
          </button>
        </div>
      </div>

      {/* Seletor de Mês e Ações */}
      <div className="orcamento-toolbar">
        <div className="mes-selector">
          <button 
            className="btn-mes"
            onClick={() => mudarMes(-1)}
            disabled={mesSelecionado === opcoesMeses[0]?.valor}
          >
            ‹
          </button>
          <select
            className="mes-select"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
          >
            {opcoesMeses.map(o => (
              <option key={o.valor} value={o.valor}>{o.label}</option>
            ))}
          </select>
          <button 
            className="btn-mes"
            onClick={() => mudarMes(1)}
            disabled={mesSelecionado === opcoesMeses[opcoesMeses.length - 1]?.valor}
          >
            ›
          </button>
        </div>
        <div className="toolbar-actions">
          <button className="btn-secondary" onClick={copiarMesAnterior}>
            Copiar do Mês Anterior
          </button>
          <button className="btn-add" onClick={abrirModal}>
            <FaPlus /> Adicionar Categoria
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="orcamento-resumo">
        <div className="resumo-card orcado">
          <span className="resumo-label">Total Orçado</span>
          <span className="resumo-valor">{formatarValor(totais.totalOrcado)}</span>
        </div>
        <div className="resumo-card realizado">
          <span className="resumo-label">Total Realizado</span>
          <span className="resumo-valor">{formatarValor(totais.totalRealizado)}</span>
        </div>
        <div className={`resumo-card diferenca ${totais.diferenca >= 0 ? 'positivo' : 'negativo'}`}>
          <span className="resumo-label">{totais.diferenca >= 0 ? 'Sobra' : 'Excedido'}</span>
          <span className="resumo-valor">{formatarValor(Math.abs(totais.diferenca))}</span>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="orcamento-lista">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : orcamentos.length === 0 ? (
          <div className="empty-state">
            <FaChartPie className="empty-icon" />
            <p>Nenhum orçamento definido para este mês</p>
            <button className="btn-add" onClick={abrirModal}>
              <FaPlus /> Definir Orçamento
            </button>
          </div>
        ) : (
          <div className="orcamento-grid">
            {orcamentos.map(orc => {
              const status = calcularStatus(
                parseFloat(orc.orcamento_valor), 
                parseFloat(orc.valor_realizado)
              );
              const percentual = orc.orcamento_valor > 0 
                ? (orc.valor_realizado / orc.orcamento_valor) * 100 
                : 0;
              const diferenca = parseFloat(orc.orcamento_valor) - parseFloat(orc.valor_realizado);
              
              return (
                <div key={orc.orcamento_id} className={`orcamento-card ${status}`}>
                  <div className="orcamento-card-header">
                    <h3>
                      {(() => {
                        const Icon = getIcone(orc.orcamento_categoria);
                        return <Icon className="category-icon" style={{ marginRight: '8px' }} />;
                      })()}
                      {orc.orcamento_categoria}
                    </h3>
                    <div className="orcamento-status">
                      {status === 'ok' && <FaCheckCircle className="status-icon ok" />}
                      {status === 'atencao' && <FaExclamationTriangle className="status-icon atencao" />}
                      {status === 'excedido' && <FaTimesCircle className="status-icon excedido" />}
                    </div>
                    <div className="orcamento-card-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => abrirModalEdicao(orc)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => excluirOrcamento(orc.orcamento_id)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="orcamento-valores">
                    <div className="valor-item">
                      <span className="valor-label">Orçado</span>
                      <span className="valor-numero">{formatarValor(orc.orcamento_valor)}</span>
                    </div>
                    <div className="valor-item">
                      <span className="valor-label">Realizado</span>
                      <span className="valor-numero">{formatarValor(orc.valor_realizado)}</span>
                    </div>
                  </div>
                  
                  <div className="orcamento-barra">
                    <div 
                      className={`barra-progresso ${status}`}
                      style={{ width: `${Math.min(percentual, 100)}%` }}
                    />
                  </div>
                  
                  <div className="orcamento-footer">
                    <span className={`diferenca ${diferenca >= 0 ? 'positivo' : 'negativo'}`}>
                      {diferenca >= 0 ? 'Sobra: ' : 'Excedido: '}
                      {formatarValor(Math.abs(diferenca))}
                    </span>
                    <span className="percentual">{percentual.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Novo Orçamento */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-orcamento" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Definir Orçamento</h3>
              <button className="btn-fechar" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={salvarOrcamento} className="modal-form">
              <div className="form-group">
                <label>Categoria</label>
                <SelectWithIcons
                  options={categoriasDisponiveis}
                  value={formOrcamento.categoria}
                  onChange={(val) => setFormOrcamento({ ...formOrcamento, categoria: val })}
                  categoria="despesa"
                  placeholder="Selecione uma categoria"
                  required
                  customIcons={iconesCustomizados}
                />
              </div>
              
              <div className="form-group">
                <label>Valor do Orçamento</label>
                <input
                  type="text"
                  value={formOrcamento.valor}
                  onChange={e => setFormOrcamento({ ...formOrcamento, valor: handleCurrencyInput(e.target.value) })}
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editandoOrcamento ? 'Atualizar' : 'Salvar'} Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orcamento;
