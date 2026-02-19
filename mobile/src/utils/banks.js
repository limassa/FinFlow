/**
 * Bancos brasileiros com abreviatura e cor para exibição
 */
export const BANCOS = [
  { id: 'bb', nome: 'Banco do Brasil', abbr: 'BB', cor: '#003b6f' },
  { id: 'caixa', nome: 'Caixa Econômica', abbr: 'CE', cor: '#0066b3' },
  { id: 'itau', nome: 'Itaú', abbr: 'IT', cor: '#ec7000' },
  { id: 'bradesco', nome: 'Bradesco', abbr: 'BR', cor: '#cc092f' },
  { id: 'santander', nome: 'Santander', abbr: 'SA', cor: '#ec0000' },
  { id: 'nubank', nome: 'Nubank', abbr: 'NU', cor: '#820ad1' },
  { id: 'inter', nome: 'Banco Inter', abbr: 'IN', cor: '#ff7a00' },
  { id: 'c6', nome: 'C6 Bank', abbr: 'C6', cor: '#000000' },
  { id: 'btg', nome: 'BTG Pactual', abbr: 'BT', cor: '#1a1a1a' },
  { id: 'xp', nome: 'XP Investimentos', abbr: 'XP', cor: '#000000' },
  { id: 'safra', nome: 'Banco Safra', abbr: 'SF', cor: '#003366' },
  { id: 'sicoob', nome: 'Sicoob', abbr: 'SI', cor: '#0055a4' },
  { id: 'sicredi', nome: 'Sicredi', abbr: 'SC', cor: '#c41230' },
  { id: 'neon', nome: 'Neon', abbr: 'NE', cor: '#00d9a5' },
  { id: 'original', nome: 'Banco Original', abbr: 'OR', cor: '#0066cc' },
  { id: 'pan', nome: 'Banco Pan', abbr: 'PN', cor: '#009c3b' },
  { id: 'picpay', nome: 'PicPay', abbr: 'PP', cor: '#21c25e' },
  { id: 'mercado_pago', nome: 'Mercado Pago', abbr: 'MP', cor: '#009ee3' },
  { id: 'outros', nome: 'Outros', abbr: '--', cor: '#64748b' },
];

export function getBancoById(id) {
  return BANCOS.find(b => b.id === id) || BANCOS.find(b => b.id === 'outros');
}
