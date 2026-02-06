// Versão alternativa do relatório sem dependências externas
import { formatarValor, formatarData } from '../utils/formatters';

class RelatorioPDF {
  constructor() {
    this.currentY = 20;
    this.margin = 20;
    this.pageWidth = 210;
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  // Gerar relatório como HTML que pode ser impresso
  generateReceitasReport(receitas, periodo) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Receitas - FinFlow</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
          }
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
          }
          .header h2 {
            color: #666;
            margin: 5px 0;
            font-size: 18px;
          }
          .info {
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #007bff;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          .valor {
            text-align: right;
          }
          .data {
            text-align: center;
          }
          .recebido {
            text-align: center;
          }
          .total {
            font-weight: bold;
            background-color: #f8f9fa;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FinFlow</h1>
          <h2>Relatório de Receitas</h2>
          <div class="info">
            Período: ${periodo}<br>
            Gerado em: ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        ${receitas.length === 0 ? 
          '<p>Nenhuma receita encontrada no período.</p>' :
          `<table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Conta</th>
                <th>Recebido</th>
              </tr>
            </thead>
            <tbody>
              ${receitas.map(receita => `
                <tr>
                  <td>${receita.descricao || receita.receita_descricao}</td>
                  <td class="valor">${formatarValor(receita.valor || receita.receita_valor)}</td>
                  <td class="data">${formatarData(receita.data || receita.receita_data)}</td>
                  <td>${receita.tipo || receita.receita_tipo}</td>
                  <td>${receita.conta || '-'}</td>
                  <td class="recebido">${receita.recebido || receita.receita_recebido ? 'Sim' : 'Não'}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td colspan="1"><strong>Total:</strong></td>
                <td class="valor"><strong>${formatarValor(receitas.reduce((sum, r) => sum + parseFloat(r.valor || r.receita_valor || 0), 0))}</strong></td>
                <td colspan="4"></td>
              </tr>
            </tbody>
          </table>`
        }
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir / Salvar como PDF
          </button>
        </div>
      </body>
      </html>
    `;

    return this.createPDFWindow(html, `FinFlow_Receitas_${periodo}.html`);
  }

  // Gerar relatório de despesas
  generateDespesasReport(despesas, periodo) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Despesas - FinFlow</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #dc3545;
            padding-bottom: 10px;
          }
          .header h1 {
            color: #dc3545;
            margin: 0;
            font-size: 24px;
          }
          .header h2 {
            color: #666;
            margin: 5px 0;
            font-size: 18px;
          }
          .info {
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #dc3545;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          .valor {
            text-align: right;
          }
          .data {
            text-align: center;
          }
          .pago {
            text-align: center;
          }
          .total {
            font-weight: bold;
            background-color: #f8f9fa;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FinFlow</h1>
          <h2>Relatório de Despesas</h2>
          <div class="info">
            Período: ${periodo}<br>
            Gerado em: ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        ${despesas.length === 0 ? 
          '<p>Nenhuma despesa encontrada no período.</p>' :
          `<table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Vencimento</th>
                <th>Tipo</th>
                <th>Conta</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              ${despesas.map(despesa => `
                <tr>
                  <td>${despesa.descricao || despesa.despesa_descricao}</td>
                  <td class="valor">${formatarValor(despesa.valor || despesa.despesa_valor)}</td>
                  <td class="data">${formatarData(despesa.data || despesa.despesa_data)}</td>
                  <td class="data">${formatarData(despesa.dataVencimento || despesa.despesa_dtvencimento) || '-'}</td>
                  <td>${despesa.tipo || despesa.despesa_tipo}</td>
                  <td>${despesa.conta || '-'}</td>
                  <td class="pago">${despesa.pago || despesa.despesa_pago ? 'Sim' : 'Não'}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td colspan="1"><strong>Total:</strong></td>
                <td class="valor"><strong>${formatarValor(despesas.reduce((sum, d) => sum + parseFloat(d.valor || d.despesa_valor || 0), 0))}</strong></td>
                <td colspan="5"></td>
              </tr>
            </tbody>
          </table>`
        }
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir / Salvar como PDF
          </button>
        </div>
      </body>
      </html>
    `;

    return this.createPDFWindow(html, `FinFlow_Despesas_${periodo}.html`);
  }

  // Gerar relatório consolidado
  generateConsolidatedReport(receitas, despesas, periodo) {
    const totalReceitas = receitas.reduce((sum, r) => sum + parseFloat(r.valor || r.receita_valor || 0), 0);
    const totalDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor || d.despesa_valor || 0), 0);
    const saldo = totalReceitas - totalDespesas;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Consolidado - FinFlow</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
          }
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
          }
          .header h2 {
            color: #666;
            margin: 5px 0;
            font-size: 18px;
          }
          .info {
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
          }
          .summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .summary h3 {
            margin: 0 0 10px 0;
            color: #333;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .positive { color: #28a745; }
          .negative { color: #dc3545; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #007bff;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
          }
          .receitas th { background-color: #28a745; }
          .despesas th { background-color: #dc3545; }
          td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          .valor { text-align: right; }
          .data { text-align: center; }
          .total {
            font-weight: bold;
            background-color: #f8f9fa;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FinFlow</h1>
          <h2>Relatório Consolidado</h2>
          <div class="info">
            Período: ${periodo}<br>
            Gerado em: ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        <div class="summary">
          <h3>Resumo Financeiro</h3>
          <div class="summary-item">
            <span>Total Receitas:</span>
            <span class="positive">${formatarValor(totalReceitas)}</span>
          </div>
          <div class="summary-item">
            <span>Total Despesas:</span>
            <span class="negative">${formatarValor(totalDespesas)}</span>
          </div>
          <div class="summary-item">
            <span><strong>Saldo:</strong></span>
            <span class="${saldo >= 0 ? 'positive' : 'negative'}"><strong>${formatarValor(saldo)}</strong></span>
          </div>
        </div>
        
        <h3>Receitas</h3>
        ${receitas.length === 0 ? 
          '<p>Nenhuma receita no período.</p>' :
          `<table class="receitas">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Recebido</th>
              </tr>
            </thead>
            <tbody>
              ${receitas.map(r => `
                <tr>
                  <td>${r.descricao || r.receita_descricao}</td>
                  <td class="valor">${formatarValor(r.valor || r.receita_valor)}</td>
                  <td class="data">${formatarData(r.data || r.receita_data)}</td>
                  <td>${r.tipo || r.receita_tipo}</td>
                  <td class="data">${r.recebido || r.receita_recebido ? 'Sim' : 'Não'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>`
        }
        
        <h3>Despesas</h3>
        ${despesas.length === 0 ? 
          '<p>Nenhuma despesa no período.</p>' :
          `<table class="despesas">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              ${despesas.map(d => `
                <tr>
                  <td>${d.descricao || d.despesa_descricao}</td>
                  <td class="valor">${formatarValor(d.valor || d.despesa_valor)}</td>
                  <td class="data">${formatarData(d.data || d.despesa_data)}</td>
                  <td>${d.tipo || d.despesa_tipo}</td>
                  <td class="data">${d.pago || d.despesa_pago ? 'Sim' : 'Não'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>`
        }
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir / Salvar como PDF
          </button>
        </div>
      </body>
      </html>
    `;

    return this.createPDFWindow(html, `FinFlow_Consolidado_${periodo}.html`);
  }

  // Gerar relatório por categoria
  generateCategoryReport(receitas, despesas, periodo) {
    // Agrupar receitas por categoria
    const receitasPorCategoria = {};
    receitas.forEach(r => {
      const tipo = r.tipo || r.receita_tipo;
      if (!receitasPorCategoria[tipo]) {
        receitasPorCategoria[tipo] = 0;
      }
      receitasPorCategoria[tipo] += parseFloat(r.valor || r.receita_valor || 0);
    });

    // Agrupar despesas por categoria
    const despesasPorCategoria = {};
    despesas.forEach(d => {
      const tipo = d.tipo || d.despesa_tipo;
      if (!despesasPorCategoria[tipo]) {
        despesasPorCategoria[tipo] = 0;
      }
      despesasPorCategoria[tipo] += parseFloat(d.valor || d.despesa_valor || 0);
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório por Categoria - FinFlow</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
          }
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
          }
          .header h2 {
            color: #666;
            margin: 5px 0;
            font-size: 18px;
          }
          .info {
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #007bff;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
          }
          .receitas th { background-color: #28a745; }
          .despesas th { background-color: #dc3545; }
          td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          .valor { text-align: right; }
          .total {
            font-weight: bold;
            background-color: #f8f9fa;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FinFlow</h1>
          <h2>Relatório por Categoria</h2>
          <div class="info">
            Período: ${periodo}<br>
            Gerado em: ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        <h3>Receitas por Categoria</h3>
        ${Object.keys(receitasPorCategoria).length === 0 ? 
          '<p>Nenhuma receita no período.</p>' :
          `<table class="receitas">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(receitasPorCategoria).map(([categoria, valor]) => `
                <tr>
                  <td>${categoria}</td>
                  <td class="valor">${formatarValor(valor)}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td><strong>Total:</strong></td>
                <td class="valor"><strong>${formatarValor(Object.values(receitasPorCategoria).reduce((sum, val) => sum + val, 0))}</strong></td>
              </tr>
            </tbody>
          </table>`
        }
        
        <h3>Despesas por Categoria</h3>
        ${Object.keys(despesasPorCategoria).length === 0 ? 
          '<p>Nenhuma despesa no período.</p>' :
          `<table class="despesas">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(despesasPorCategoria).map(([categoria, valor]) => `
                <tr>
                  <td>${categoria}</td>
                  <td class="valor">${formatarValor(valor)}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td><strong>Total:</strong></td>
                <td class="valor"><strong>${formatarValor(Object.values(despesasPorCategoria).reduce((sum, val) => sum + val, 0))}</strong></td>
              </tr>
            </tbody>
          </table>`
        }
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir / Salvar como PDF
          </button>
        </div>
      </body>
      </html>
    `;

    return this.createPDFWindow(html, `FinFlow_Categoria_${periodo}.html`);
  }

  // Criar janela para exibir o relatório
  createPDFWindow(html, filename) {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
    
    // Adicionar evento para salvar como arquivo
    setTimeout(() => {
      newWindow.focus();
    }, 100);
    
    return {
      save: () => {
        // O usuário pode usar Ctrl+P para imprimir/salvar como PDF
        newWindow.print();
      }
    };
  }

  // Método de compatibilidade
  save(filename) {
    // Este método é chamado pelo modal
    console.log('Relatório gerado:', filename);
  }
}

export default RelatorioPDF; 