// Funções de formatação para relatórios PDF

export const formatarValor = (valor) => {
  if (!valor) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarData = (data) => {
  if (!data) return '-';
  
  try {
    // Usar split para evitar problemas de fuso horário
    const dataFormatada = data.split('T')[0]; // YYYY-MM-DD
    const [ano, mes, dia] = dataFormatada.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    return '-';
  }
};

export const formatarDataHora = (data) => {
  if (!data) return '-';
  
  try {
    const dataObj = new Date(data);
    return dataObj.toLocaleString('pt-BR');
  } catch (error) {
    return '-';
  }
};

/** Normaliza input date (YYYY-MM-DD) para ano com no máximo 4 dígitos */
export const normalizarDataInput = (valor) => {
  if (!valor || typeof valor !== 'string') return valor;
  const parts = valor.split('-');
  if (parts.length < 1) return valor;
  const ano = parts[0];
  if (ano && ano.length > 4) {
    parts[0] = ano.slice(0, 4);
    return parts.join('-');
  }
  return valor;
};

/** Formata valor monetário enquanto digita (estilo calculadora) */
export const formatarValorInput = (valor) => {
  if (!valor && valor !== 0) return '';
  
  // Remove tudo que não é número
  let numeros = String(valor).replace(/\D/g, '');
  
  // Se não tem números, retorna vazio
  if (!numeros) return '';
  
  // Converte para número e divide por 100 para ter 2 casas decimais
  const numero = parseInt(numeros, 10) / 100;
  
  // Formata com separador de milhar e decimal brasileiro
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/** Converte valor formatado de volta para número */
export const valorParaNumero = (valorFormatado) => {
  if (!valorFormatado) return 0;
  
  // Remove pontos de milhar e troca vírgula por ponto
  const numero = String(valorFormatado)
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(numero) || 0;
};

export const formatarPeriodo = (dataInicio, dataFim) => {
  const inicio = formatarData(dataInicio);
  const fim = formatarData(dataFim);
  return `${inicio} a ${fim}`;
};

export const formatarNomeArquivo = (tipo, periodo) => {
  const dataAtual = new Date().toISOString().split('T')[0];
  return `Claricash_${tipo}_${periodo}_${dataAtual}.pdf`;
}; 