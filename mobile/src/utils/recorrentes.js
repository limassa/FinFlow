/**
 * Utilitários para itens recorrentes
 */

/** Extrai o nome base de descrição recorrente. Ex: "Fatura Claro (1/12)" -> "Fatura Claro" */
export function extrairNomeBaseRecorrente(descricao) {
  if (!descricao || typeof descricao !== 'string') return descricao || '';
  const m = descricao.match(/^(.+?)\s*\(\d+\s*\/\s*\d+\)\s*$/);
  return m ? m[1].trim() : descricao;
}

/** Verifica se a descrição tem formato de parcela recorrente (ex: 1/12) */
export function ehDescricaoRecorrente(descricao) {
  return /\(\d+\s*\/\s*\d+\)\s*$/.test(descricao || '');
}

/** Verifica se uma despesa é recorrente (por flag ou descrição) */
export function despesaEhRecorrente(despesa) {
  if (!despesa) return false;
  if (despesa.despesa_recorrente === true) return true;
  return ehDescricaoRecorrente(despesa.despesa_descricao || '');
}

/** Verifica se uma receita é recorrente (por flag ou descrição) */
export function receitaEhRecorrente(receita) {
  if (!receita) return false;
  if (receita.receita_recorrente === true) return true;
  return ehDescricaoRecorrente(receita.receita_descricao || '');
}
