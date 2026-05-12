/** Mês corrente local YYYY-MM */
export function currentMonthYm() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}`;
}

/** Data local YYYY-MM-DD */
export function ymdToday() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
}

export function ymdFromIso(iso) {
  return (iso || '').split('T')[0];
}

export function addMonthsYm(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMesPtBr(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  const nomeMes = d.toLocaleDateString('pt-BR', { month: 'long' });
  const capitalizado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  return `${capitalizado}/${y}`;
}

/** Recebe YYYY-MM-DD e devolve YYYY-MM */
export function ymdToYm(ymd) {
  return (ymd || '').slice(0, 7);
}

/** Devolve a primeira data válida (YYYY-MM-DD) do mês informado (YYYY-MM) */
export function ymPrimeiroDia(ym) {
  return `${ym}-01`;
}
