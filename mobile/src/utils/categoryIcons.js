/**
 * Mapeamento de categorias para ícones Ionicons.
 * Mantém consistência com o web (categoryIcons.js).
 */

const DEFAULT_ICON = 'ellipsis-horizontal';

export const ICONS_CONTA = {
  'Conta Corrente': 'business',
  'Conta Poupança': 'wallet',
  Carteira: 'wallet-outline',
  'Cartão de Crédito': 'card',
  Investimentos: 'trending-up',
  Outros: DEFAULT_ICON,
};

export const ICONS_DESPESA = {
  Alimentação: 'restaurant',
  Transporte: 'car',
  Saúde: 'heart',
  Moradia: 'home',
  Aluguel: 'business',
  Outros: DEFAULT_ICON,
  Veículos: 'car-sport',
  Poupança: 'wallet',
  Investimento: 'trending-up',
  Educação: 'school',
  Lazer: 'film',
  Presentes: 'gift',
  Telefonia: 'call',
  'Pet Shop': 'paw',
};

export const ICONS_RECEITA = {
  Salário: 'cash',
  Venda: 'cart',
  Presente: 'gift',
  Investimento: 'trending-up',
  Aluguel: 'business',
  Outros: DEFAULT_ICON,
};

/** Retorna o nome do ícone Ionicons para um tipo (conta, despesa ou receita) */
export function getIconNameForTipo(tipo, categoria = 'despesa') {
  const map =
    categoria === 'conta'
      ? ICONS_CONTA
      : categoria === 'receita'
      ? ICONS_RECEITA
      : ICONS_DESPESA;
  return map[tipo] || DEFAULT_ICON;
}
