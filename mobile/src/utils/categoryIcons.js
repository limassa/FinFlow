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

/** Mapa ícones customizados (mesmos do web Categorias.js) -> Ionicons */
export const ICONS_CATEGORIA_CUSTOM = {
  ellipsis: 'ellipsis-horizontal',
  cart: 'cart',
  car: 'car',
  home: 'home',
  medkit: 'medical',
  school: 'school',
  restaurant: 'restaurant',
  film: 'film',
  shirt: 'shirt',
  cash: 'cash',
  card: 'card',
  airplane: 'airplane',
  gift: 'gift',
  paw: 'paw',
  fitness: 'barbell',
  music: 'musical-notes',
  book: 'book',
  gamepad: 'game-controller',
  phone: 'call',
  laptop: 'laptop',
  wifi: 'wifi',
  water: 'water',
  flash: 'flash',
  tools: 'construct',
  briefcase: 'briefcase',
  trophy: 'trophy',
  heart: 'heart',
  star: 'star',
  leaf: 'leaf',
  globe: 'globe',
  bus: 'bus',
  bag: 'bag',
  piggy: 'wallet',
  chart: 'analytics',
  telephone: 'call',
};

export const ICONES_DISPONIVEIS = Object.keys(ICONS_CATEGORIA_CUSTOM);

export const CORES_DISPONIVEIS = [
  '#6B7280', '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6',
  '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
];

export const CORES_DESPESA = {
  Alimentação: '#F97316',
  Transporte: '#3B82F6',
  Saúde: '#EF4444',
  Moradia: '#8B5CF6',
  Aluguel: '#7C3AED',
  Outros: '#6B7280',
  Veículos: '#0EA5E9',
  Poupança: '#10B981',
  Investimento: '#059669',
  Investimentos: '#059669',
  Educação: '#6366F1',
  Lazer: '#EC4899',
  Presentes: '#F43F5E',
  Telefonia: '#14B8A6',
  'Pet Shop': '#A855F7',
  Vestuário: '#D946EF',
  Assinaturas: '#06B6D4',
  Compras: '#F59E0B',
  'Cartão de Crédito': '#DC2626',
  Impostos: '#64748B',
  Seguros: '#2563EB',
  Doações: '#22C55E',
};

export const CORES_RECEITA = {
  Salário: '#059669',
  Venda: '#F59E0B',
  Presente: '#EC4899',
  Investimento: '#2563EB',
  Aluguel: '#8B5CF6',
  Outros: '#6B7280',
};

/** Retorna o nome do ícone Ionicons para categoria customizada (pelo nome do web) */
export function getIconIoniconsForCategoria(iconName) {
  return ICONS_CATEGORIA_CUSTOM[iconName] || 'ellipsis-horizontal';
}

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

/** Retorna a cor do ícone/categoria */
export function getColorForTipo(tipo, categoria = 'despesa', coresCustom = {}) {
  if (coresCustom && coresCustom[tipo]) return coresCustom[tipo];
  const map = categoria === 'receita' ? CORES_RECEITA : CORES_DESPESA;
  return map[tipo] || '#6B7280';
}
