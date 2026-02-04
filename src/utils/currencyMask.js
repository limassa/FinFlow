// Máscara de moeda (R$ 0,00) com separador de milhares - igual Receita/Despesa

export const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const numbers = String(value).replace(/\D/g, '');
  if (!numbers) return '';
  let cleanValue = numbers;
  while (cleanValue.length < 3) {
    cleanValue = '0' + cleanValue;
  }
  const integerPart = cleanValue.slice(0, -2);
  const decimalPart = cleanValue.slice(-2);
  const formattedInteger = integerPart.replace(/^0+/, '') || '0';
  const formattedIntegerWithThousands = formattedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedIntegerWithThousands},${decimalPart}`;
};

export const parseCurrencyToNumber = (value) => {
  if (!value) return 0;
  const cleaned = String(value).replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};
