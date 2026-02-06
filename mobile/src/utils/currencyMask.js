// Função para formatar valor como máscara de calculadora (R$ 0,00)
export const formatCurrency = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.toString().replace(/\D/g, '');
  
  // Se não tiver números, retorna vazio
  if (!numbers) return '';
  
  // Garantir pelo menos 3 dígitos (para centavos)
  let cleanValue = numbers;
  while (cleanValue.length < 3) {
    cleanValue = '0' + cleanValue;
  }
  
  // Formatar como moeda: últimos 2 dígitos são centavos
  const integerPart = cleanValue.slice(0, -2);
  const decimalPart = cleanValue.slice(-2);
  
  // Remover zeros à esquerda da parte inteira
  const formattedInteger = integerPart.replace(/^0+/, '') || '0';
  
  // Adicionar separador de milhares
  const formattedIntegerWithThousands = formattedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedIntegerWithThousands},${decimalPart}`;
};

// Função para remover formatação e retornar apenas o número
export const unformatCurrency = (value) => {
  if (!value) return '0';
  
  // Remove tudo que não é número
  const numbers = value.toString().replace(/\D/g, '');
  
  // Se não tiver números, retorna 0
  if (!numbers) return '0';
  
  // Divide por 100 para converter centavos em reais
  const amount = parseFloat(numbers) / 100;
  
  return amount.toString();
};

// Função para converter valor formatado para número (para enviar para API)
export const parseCurrencyToNumber = (value) => {
  if (!value) return 0;
  
  // Remove separador de milhares (ponto) e converte vírgula para ponto decimal
  const cleaned = value.toString().replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};
