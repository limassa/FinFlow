// Formatadores de dados - mesmos do web

export const formatarValor = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
};

export const formatarData = (data) => {
  if (!data) return '00/00/0000';
  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch (error) {
    return '00/00/0000';
  }
};

/** YYYY-MM-DD no fuso local (evita mudar o dia com toISOString). */
export const formatDateLocalYmd = (data) => {
  if (!data) return '';
  try {
    const date = data instanceof Date ? data : new Date(data);
    if (Number.isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch (error) {
    return '';
  }
};

export const formatarDataInput = (data) => {
  if (!data) return '';
  try {
    return formatDateLocalYmd(data);
  } catch (error) {
    return '';
  }
};

export const gerarOpcoesMeses = () => {
  const opcoes = [];
  const hoje = new Date();
  
  for (let i = 0; i < 12; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mesAno = data.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    });
    const valor = data.toISOString().slice(0, 7); // YYYY-MM
    opcoes.push({ label: mesAno, value: valor });
  }
  return opcoes;
};

/**
 * Formata telefone com máscara (00) 00000-0000 ou (00) 0000-0000
 * @param {string} telefone - Número de telefone sem formatação
 * @returns {string} - Telefone formatado
 */
export const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  
  // Remove tudo que não é número
  const apenasNumeros = telefone.replace(/\D/g, '');
  
  // Limita a 11 dígitos (máximo para celular brasileiro)
  const numerosLimitados = apenasNumeros.slice(0, 11);
  
  // Aplica a máscara
  if (numerosLimitados.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return numerosLimitados
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    return numerosLimitados
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

/**
 * Remove a formatação do telefone, retornando apenas números
 * @param {string} telefone - Telefone formatado
 * @returns {string} - Apenas números
 */
export const removerFormatacaoTelefone = (telefone) => {
  if (!telefone) return '';
  return telefone.replace(/\D/g, '');
};

