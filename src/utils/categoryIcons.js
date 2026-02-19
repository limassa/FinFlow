import {
  FaUniversity,
  FaPiggyBank,
  FaWallet,
  FaCreditCard,
  FaChartLine,
  FaEllipsisH,
  FaUtensils,
  FaCar,
  FaHeartbeat,
  FaHome,
  FaHouseUser,
  FaGift,
  FaGraduationCap,
  FaFilm,
  FaMoneyBillWave,
  FaShoppingCart,
  FaPhone,
  FaPaw,
} from 'react-icons/fa';

/** Ícone padrão quando o tipo não está mapeado */
export const DEFAULT_ICON = FaEllipsisH;

/** Mapeamento tipo de conta → ícone */
export const ICONS_CONTA = {
  'Conta Corrente': FaUniversity,
  'Conta Poupança': FaPiggyBank,
  Carteira: FaWallet,
  'Cartão de Crédito': FaCreditCard,
  Investimentos: FaChartLine,
  Outros: FaEllipsisH,
};

/** Mapeamento tipo de despesa → ícone */
export const ICONS_DESPESA = {
  Alimentação: FaUtensils,
  Transporte: FaCar,
  Saúde: FaHeartbeat,
  Moradia: FaHome,
  Aluguel: FaHouseUser,
  Outros: FaEllipsisH,
  Veículos: FaCar,
  Poupança: FaPiggyBank,
  Investimento: FaChartLine,
  Educação: FaGraduationCap,
  Lazer: FaFilm,
  Presentes: FaGift,
  Telefonia: FaPhone,
  'Pet Shop': FaPaw,
};

/** Mapeamento tipo de receita → ícone */
export const ICONS_RECEITA = {
  Salário: FaMoneyBillWave,
  Venda: FaShoppingCart,
  Presente: FaGift,
  Investimento: FaChartLine,
  Aluguel: FaHouseUser,
  Outros: FaEllipsisH,
};

/** Retorna o componente de ícone para um tipo (conta, despesa ou receita) */
export function getIconForTipo(tipo, categoria = 'despesa') {
  const map = categoria === 'conta' ? ICONS_CONTA : categoria === 'receita' ? ICONS_RECEITA : ICONS_DESPESA;
  return map[tipo] || DEFAULT_ICON;
}
