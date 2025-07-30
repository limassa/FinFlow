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
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
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

export const formatarPeriodo = (dataInicio, dataFim) => {
  const inicio = formatarData(dataInicio);
  const fim = formatarData(dataFim);
  return `${inicio} a ${fim}`;
};

export const formatarNomeArquivo = (tipo, periodo) => {
  const dataAtual = new Date().toISOString().split('T')[0];
  return `FinFlow_${tipo}_${periodo}_${dataAtual}.pdf`;
}; 