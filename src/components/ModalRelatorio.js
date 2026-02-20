import React, { useState } from 'react';
import { FaFilePdf, FaDownload, FaTimes, FaFileExcel } from 'react-icons/fa';
import RelatorioPDF from './RelatorioPDF';
import { formatarNomeArquivo } from '../utils/formatters';
import '../App.css';
import { formatarData, normalizarDataInput, formatarValor } from '../utils/formatters';

function ModalRelatorio({ isOpen, onClose, receitas, despesas }) {
  const [tipoRelatorio, setTipoRelatorio] = useState('consolidado');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const definirPeriodoPadrao = (tipo) => {
    const hoje = new Date();
    let inicio, fim;

    switch (tipo) {
      case 'mes_atual':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'mes_anterior':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        break;
      case 'ultimo_trimestre':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
        fim = hoje;
        break;
      case 'ultimo_ano':
        inicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
        fim = hoje;
        break;
      default:
        return;
    }

    setDataInicio(inicio.toISOString().split('T')[0]);
    setDataFim(fim.toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  const gerarRelatorio = () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, selecione as datas de início e fim do período.');
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      alert('A data de início não pode ser maior que a data de fim.');
      return;
    }

    // Filtrar dados por período
    const dataInicioObj = new Date(dataInicio);
    // Ajustar data fim para incluir todo o dia (23:59:59)
    const dataFimObj = new Date(dataFim);
    dataFimObj.setHours(23, 59, 59, 999);
    
    const receitasFiltradas = receitas.filter(receita => {
      const dataReceita = new Date(receita.receita_data);
      return dataReceita >= dataInicioObj && dataReceita <= dataFimObj;
    });

    const despesasFiltradas = despesas.filter(despesa => {
      const dataDespesa = new Date(despesa.despesa_data);
      return dataDespesa >= dataInicioObj && dataDespesa <= dataFimObj;
    });

    // Usar as datas originais selecionadas pelo usuário para o período
    const periodo = `${dataInicio.split('-').reverse().join('/')} a ${dataFim.split('-').reverse().join('/')}`;
    const relatorio = new RelatorioPDF();
    let doc;

    switch (tipoRelatorio) {
      case 'receitas':
        doc = relatorio.generateReceitasReport(receitasFiltradas, periodo);
        break;
      case 'despesas':
        doc = relatorio.generateDespesasReport(despesasFiltradas, periodo);
        break;
      case 'consolidado':
        doc = relatorio.generateConsolidatedReport(receitasFiltradas, despesasFiltradas, periodo);
        break;
      case 'categoria':
        doc = relatorio.generateCategoryReport(receitasFiltradas, despesasFiltradas, periodo);
        break;
      default:
        return;
    }

    // Abrir o relatório em uma nova janela
    if (doc) {
      doc.save();
    }
    // Não fechar o modal para permitir gerar outros relatórios
  };

  // Exportar para Excel (CSV)
  const exportarExcel = () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, selecione as datas de início e fim do período.');
      return;
    }

    // Filtrar dados por período
    const dataInicioObj = new Date(dataInicio);
    const dataFimObj = new Date(dataFim);
    dataFimObj.setHours(23, 59, 59, 999);
    
    const receitasFiltradas = receitas.filter(receita => {
      const dataReceita = new Date(receita.receita_data);
      return dataReceita >= dataInicioObj && dataReceita <= dataFimObj;
    });

    const despesasFiltradas = despesas.filter(despesa => {
      const dataDespesa = new Date(despesa.despesa_data);
      return dataDespesa >= dataInicioObj && dataDespesa <= dataFimObj;
    });

    let csvContent = '';
    let filename = '';

    switch (tipoRelatorio) {
      case 'receitas':
        csvContent = 'Data;Descrição;Tipo;Valor;Recebido\n';
        receitasFiltradas.forEach(r => {
          csvContent += `${formatarData(r.receita_data)};${r.receita_descricao};${r.receita_tipo};${parseFloat(r.receita_valor).toFixed(2).replace('.', ',')};${r.receita_recebido ? 'Sim' : 'Não'}\n`;
        });
        filename = 'receitas';
        break;
        
      case 'despesas':
        csvContent = 'Data;Descrição;Tipo;Valor;Pago;Vencimento\n';
        despesasFiltradas.forEach(d => {
          csvContent += `${formatarData(d.despesa_data)};${d.despesa_descricao};${d.despesa_tipo};${parseFloat(d.despesa_valor).toFixed(2).replace('.', ',')};${d.despesa_pago ? 'Sim' : 'Não'};${d.despesa_dtvencimento ? formatarData(d.despesa_dtvencimento) : '-'}\n`;
        });
        filename = 'despesas';
        break;
        
      case 'consolidado':
      case 'categoria':
      default:
        // Criar planilha com abas separadas
        csvContent = 'RECEITAS\n';
        csvContent += 'Data;Descrição;Tipo;Valor;Recebido\n';
        receitasFiltradas.forEach(r => {
          csvContent += `${formatarData(r.receita_data)};${r.receita_descricao};${r.receita_tipo};${parseFloat(r.receita_valor).toFixed(2).replace('.', ',')};${r.receita_recebido ? 'Sim' : 'Não'}\n`;
        });
        csvContent += `\nTotal Receitas;;;"${receitasFiltradas.reduce((sum, r) => sum + parseFloat(r.receita_valor), 0).toFixed(2).replace('.', ',')}"\n\n`;
        
        csvContent += 'DESPESAS\n';
        csvContent += 'Data;Descrição;Tipo;Valor;Pago;Vencimento\n';
        despesasFiltradas.forEach(d => {
          csvContent += `${formatarData(d.despesa_data)};${d.despesa_descricao};${d.despesa_tipo};${parseFloat(d.despesa_valor).toFixed(2).replace('.', ',')};${d.despesa_pago ? 'Sim' : 'Não'};${d.despesa_dtvencimento ? formatarData(d.despesa_dtvencimento) : '-'}\n`;
        });
        csvContent += `\nTotal Despesas;;;"${despesasFiltradas.reduce((sum, d) => sum + parseFloat(d.despesa_valor), 0).toFixed(2).replace('.', ',')}"\n\n`;
        
        const totalReceitas = receitasFiltradas.reduce((sum, r) => sum + parseFloat(r.receita_valor), 0);
        const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + parseFloat(d.despesa_valor), 0);
        csvContent += `RESUMO\n`;
        csvContent += `Total Receitas;${totalReceitas.toFixed(2).replace('.', ',')}\n`;
        csvContent += `Total Despesas;${totalDespesas.toFixed(2).replace('.', ',')}\n`;
        csvContent += `Saldo;${(totalReceitas - totalDespesas).toFixed(2).replace('.', ',')}\n`;
        filename = 'relatorio_consolidado';
        break;
    }

    // Criar e baixar arquivo
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${dataInicio}_${dataFim}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <FaFilePdf /> Gerar Relatório
          </h3>
          <button onClick={onClose} className="modal-close">
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Tipo de Relatório:</label>
            <select 
              value={tipoRelatorio} 
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="form-select"
            >
              <option value="consolidado">Relatório Consolidado</option>
              <option value="receitas">Relatório de Receitas</option>
              <option value="despesas">Relatório de Despesas</option>
              <option value="categoria">Relatório por Categoria</option>
            </select>
          </div>

                                <div className="form-group">
                        <label>Data de Início:</label>
                        <input
                          type="date"
                          value={dataInicio}
                          onChange={(e) => setDataInicio(normalizarDataInput(e.target.value))}
                          className="form-select"
                          min="1900-01-01"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div className="form-group">
                        <label>Data de Fim:</label>
                        <input
                          type="date"
                          value={dataFim}
                          onChange={(e) => setDataFim(normalizarDataInput(e.target.value))}
                          className="form-select"
                          min="1900-01-01"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '10px',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          type="button"
                          onClick={() => definirPeriodoPadrao('mes_atual')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Mês Atual
                        </button>
                        <button
                          type="button"
                          onClick={() => definirPeriodoPadrao('mes_anterior')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Mês Anterior
                        </button>
                        <button
                          type="button"
                          onClick={() => definirPeriodoPadrao('ultimo_trimestre')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Último Trimestre
                        </button>
                        <button
                          type="button"
                          onClick={() => definirPeriodoPadrao('ultimo_ano')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Último Ano
                        </button>
                      </div>

                      {dataInicio && dataFim && (
                        <div style={{
                          background: '#e8f5e8',
                          padding: '10px',
                          borderRadius: '5px',
                          marginTop: '10px',
                          fontSize: '12px',
                          color: '#2d5a2d'
                        }}>
                          <strong>Período selecionado:</strong> {formatarData(dataInicio)} a {formatarData(dataFim)}
                        </div>
                      )}

          <div className="relatorio-info">
            <h4>Informações do Relatório:</h4>
            <ul>
              <li><strong>Consolidado:</strong> Receitas e despesas com resumo financeiro</li>
              <li><strong>Receitas:</strong> Lista detalhada de todas as receitas</li>
              <li><strong>Despesas:</strong> Lista detalhada de todas as despesas</li>
              <li><strong>Categoria:</strong> Agrupamento por tipo de receita/despesa</li>
            </ul>
            <p style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
              <strong>Como usar:</strong> Selecione o período desejado e clique em &quot;Gerar Relatório&quot;. 
              O relatório será aberto em uma nova janela. Use Ctrl+P para imprimir ou salvar como PDF.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancelar">
            Cancelar
          </button>
          <button
            onClick={exportarExcel}
            className="btn-exportar-excel"
            disabled={!dataInicio || !dataFim}
            style={{ background: '#217346', marginRight: '8px' }}
          >
            <FaFileExcel /> Excel/CSV
          </button>
          <button
            onClick={gerarRelatorio}
            className="btn-gerar-relatorio"
            disabled={!dataInicio || !dataFim}
          >
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalRelatorio; 