// Formatadores de dados - mesmos do web

export const formatarValor = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
};

/**
 * Converte YYYY-MM-DD (ou ISO) em Date no fuso local (evita D-1 com new Date('YYYY-MM-DD')).
 */
export const parseLocalDateInput = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  const ymd = String(raw).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatarData = (data) => {
  if (!data) return '00/00/0000';
  try {
    if (typeof data === 'string') {
      const ymd = data.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        const [ano, mes, dia] = ymd.split('-');
        return `${dia}/${mes}/${ano}`;
      }
    }
    const date = parseLocalDateInput(data);
    if (!date) return '00/00/0000';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  } catch (error) {
    return '00/00/0000';
  }
};

/** YYYY-MM-DD no fuso local (evita mudar o dia com toISOString). */
export const formatDateLocalYmd = (data) => {
  if (!data) return '';
  try {
    const date = parseLocalDateInput(data);
    if (!date) return '';
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
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    opcoes.push({ label: mesAno, value: `${y}-${m}` });
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
