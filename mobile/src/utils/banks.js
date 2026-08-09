/**
 * Bancos brasileiros com abreviatura, cor e logo SVG
 * Logos: github.com/Tgentil/Bancos-em-SVG (marcas dos respectivos bancos)
 */
export const BANCOS = [
  { id: 'bb', nome: 'Banco do Brasil', abbr: 'BB', cor: '#003b6f', logo: 'bb.svg' },
  { id: 'caixa', nome: 'Caixa Econômica', abbr: 'CE', cor: '#0066b3', logo: 'caixa.svg' },
  { id: 'itau', nome: 'Itaú', abbr: 'IT', cor: '#ec7000', logo: 'itau.svg' },
  { id: 'bradesco', nome: 'Bradesco', abbr: 'BR', cor: '#cc092f', logo: 'bradesco.svg' },
  { id: 'santander', nome: 'Santander', abbr: 'SA', cor: '#ec0000', logo: 'santander.svg' },
  { id: 'nubank', nome: 'Nubank', abbr: 'NU', cor: '#820ad1', logo: 'nubank.svg' },
  { id: 'inter', nome: 'Banco Inter', abbr: 'IN', cor: '#ff7a00', logo: 'inter.svg' },
  { id: 'c6', nome: 'C6 Bank', abbr: 'C6', cor: '#000000', logo: 'c6.svg' },
  { id: 'btg', nome: 'BTG Pactual', abbr: 'BT', cor: '#1a1a1a', logo: 'btg.svg' },
  { id: 'xp', nome: 'XP Investimentos', abbr: 'XP', cor: '#000000', logo: 'xp.svg' },
  { id: 'safra', nome: 'Banco Safra', abbr: 'SF', cor: '#003366', logo: 'safra.svg' },
  { id: 'sicoob', nome: 'Sicoob', abbr: 'SI', cor: '#0055a4', logo: 'sicoob.svg' },
  { id: 'sicredi', nome: 'Sicredi', abbr: 'SC', cor: '#c41230', logo: 'sicredi.svg' },
  { id: 'neon', nome: 'Neon', abbr: 'NE', cor: '#00d9a5', logo: 'neon.svg' },
  { id: 'original', nome: 'Banco Original', abbr: 'OR', cor: '#0066cc', logo: 'original.svg' },
  { id: 'pan', nome: 'Banco Pan', abbr: 'PN', cor: '#009c3b', logo: 'pan.svg' },
  { id: 'picpay', nome: 'PicPay', abbr: 'PP', cor: '#21c25e', logo: 'picpay.svg' },
  { id: 'mercado_pago', nome: 'Mercado Pago', abbr: 'MP', cor: '#009ee3', logo: 'mercado_pago.svg' },
  { id: 'outros', nome: 'Outros', abbr: '--', cor: '#64748b', logo: null },
];

export function getBancoById(id) {
  return BANCOS.find(b => b.id === id) || BANCOS.find(b => b.id === 'outros');
}
