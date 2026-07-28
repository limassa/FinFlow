const pool = require('../database/connection');

const DEFAULT_PREFS = {
  contas_a_vencer: true,
  contas_vencidas: true,
  metas_financeiras: true,
  resumo_mensal: true,
  resumo_semanal: true,
  dicas_economia: true,
};

const DICAS = [
  'Antes de comprar, espere 24 horas. Muitas compras por impulso perdem a graça no dia seguinte.',
  'Anote todo gasto pequeno por uma semana. Você se surpreende com o que some no café e no delivery.',
  'Defina um teto semanal para lazer e respeite como se fosse uma conta fixa.',
  'Compare preços em pelo menos dois lugares antes de compras maiores.',
  'Cancele assinaturas que você não usou no último mês.',
  'Guarde automaticamente uma pequena parte de cada receita assim que ela cair na conta.',
  'Cozinhar em casa alguns dias da semana costuma render mais economia do que qualquer cupom.',
  'Revise as faturas do cartão: taxas e recorrências esquecidas são comuns.',
];

let schemaReady = false;

function ymdLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateOnly(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const s = String(value).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / ms);
}

function weekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function formatBRL(n) {
  return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mergePrefs(raw) {
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      parsed = {};
    }
  }
  return { ...DEFAULT_PREFS, ...(parsed || {}) };
}

async function ensureSchema() {
  if (schemaReady) return;
  try {
    await pool.query(`
      ALTER TABLE "Usuario"
      ADD COLUMN IF NOT EXISTS "Usuario_NotificacoesPrefs" JSONB
      DEFAULT '{"contas_a_vencer":true,"contas_vencidas":true,"metas_financeiras":true,"resumo_mensal":true,"resumo_semanal":true,"dicas_economia":true}'::jsonb
    `);
  } catch (e) {
    try {
      await pool.query(`
        ALTER TABLE usuario
        ADD COLUMN IF NOT EXISTS usuario_notificacoesprefs JSONB
        DEFAULT '{"contas_a_vencer":true,"contas_vencidas":true,"metas_financeiras":true,"resumo_mensal":true,"resumo_semanal":true,"dicas_economia":true}'::jsonb
      `);
    } catch (e2) {
      console.log('⚠️ Coluna de prefs de notificação:', e2.message);
    }
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notificacao_lida (
        usuario_id INTEGER NOT NULL,
        notificacao_key VARCHAR(160) NOT NULL,
        lida_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (usuario_id, notificacao_key)
      )
    `);
  } catch (e) {
    console.log('⚠️ Tabela notificacao_lida:', e.message);
  }

  schemaReady = true;
}

async function getPrefs(userId) {
  await ensureSchema();
  try {
    let result = await pool.query(
      `SELECT "Usuario_NotificacoesPrefs" AS prefs FROM "Usuario" WHERE "Usuario_Id" = $1`,
      [userId]
    );
    if (!result.rows.length) {
      result = await pool.query(
        `SELECT usuario_notificacoesprefs AS prefs FROM usuario WHERE usuario_id = $1`,
        [userId]
      );
    }
    return mergePrefs(result.rows[0]?.prefs);
  } catch (e) {
    console.log('⚠️ getPrefs fallback:', e.message);
    return { ...DEFAULT_PREFS };
  }
}

async function savePrefs(userId, prefs) {
  await ensureSchema();
  const next = mergePrefs(prefs);
  try {
    const result = await pool.query(
      `UPDATE "Usuario" SET "Usuario_NotificacoesPrefs" = $1::jsonb WHERE "Usuario_Id" = $2 RETURNING "Usuario_Id"`,
      [JSON.stringify(next), userId]
    );
    if (result.rows.length) return next;
  } catch (_) {
    /* try lowercase */
  }
  const result = await pool.query(
    `UPDATE usuario SET usuario_notificacoesprefs = $1::jsonb WHERE usuario_id = $2 RETURNING usuario_id`,
    [JSON.stringify(next), userId]
  );
  if (!result.rows.length) return null;
  return next;
}

async function getLidas(userId) {
  await ensureSchema();
  try {
    const result = await pool.query(
      `SELECT notificacao_key FROM notificacao_lida WHERE usuario_id = $1`,
      [userId]
    );
    return new Set(result.rows.map((r) => r.notificacao_key));
  } catch (_) {
    return new Set();
  }
}

async function markRead(userId, keys = []) {
  await ensureSchema();
  const list = Array.isArray(keys) ? keys.filter(Boolean) : [];
  if (!list.length) return;
  for (const key of list) {
    await pool.query(
      `INSERT INTO notificacao_lida (usuario_id, notificacao_key)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id, notificacao_key) DO NOTHING`,
      [userId, key]
    );
  }
}

async function markAllRead(userId, keys = []) {
  return markRead(userId, keys);
}

async function fetchDespesasAbertas(userId) {
  try {
    const result = await pool.query(
      `SELECT "Despesa_Id" AS id, "Despesa_Descricao" AS descricao, "Despesa_Valor" AS valor,
              "Despesa_DtVencimento" AS vencimento, "Despesa_Tipo" AS tipo, "Despesa_Pago" AS pago
       FROM "Despesa"
       WHERE "Usuario_Id" = $1 AND COALESCE("Despesa_Pago", false) = false`,
      [userId]
    );
    return result.rows;
  } catch (_) {
    const result = await pool.query(
      `SELECT despesa_id AS id, despesa_descricao AS descricao, despesa_valor AS valor,
              despesa_dtvencimento AS vencimento, despesa_tipo AS tipo, despesa_pago AS pago
       FROM despesa
       WHERE usuario_id = $1 AND COALESCE(despesa_pago, false) = false`,
      [userId]
    );
    return result.rows;
  }
}

async function fetchTotaisMes(userId, ym) {
  const [y, m] = ym.split('-').map(Number);
  try {
    const receitas = await pool.query(
      `SELECT COALESCE(SUM("Receita_Valor"),0) AS total
       FROM "Receita"
       WHERE "Usuario_Id" = $1
         AND EXTRACT(YEAR FROM "Receita_Data") = $2
         AND EXTRACT(MONTH FROM "Receita_Data") = $3
         AND COALESCE("Receita_Recebido", false) = true`,
      [userId, y, m]
    );
    const despesas = await pool.query(
      `SELECT COALESCE(SUM("Despesa_Valor"),0) AS total
       FROM "Despesa"
       WHERE "Usuario_Id" = $1
         AND EXTRACT(YEAR FROM "Despesa_Data") = $2
         AND EXTRACT(MONTH FROM "Despesa_Data") = $3
         AND COALESCE("Despesa_Pago", false) = true`,
      [userId, y, m]
    );
    return {
      receitas: parseFloat(receitas.rows[0]?.total || 0),
      despesas: parseFloat(despesas.rows[0]?.total || 0),
    };
  } catch (_) {
    const receitas = await pool.query(
      `SELECT COALESCE(SUM(receita_valor),0) AS total
       FROM receita
       WHERE usuario_id = $1
         AND EXTRACT(YEAR FROM receita_data) = $2
         AND EXTRACT(MONTH FROM receita_data) = $3
         AND COALESCE(receita_recebido, false) = true`,
      [userId, y, m]
    );
    const despesas = await pool.query(
      `SELECT COALESCE(SUM(despesa_valor),0) AS total
       FROM despesa
       WHERE usuario_id = $1
         AND EXTRACT(YEAR FROM despesa_data) = $2
         AND EXTRACT(MONTH FROM despesa_data) = $3
         AND COALESCE(despesa_pago, false) = true`,
      [userId, y, m]
    );
    return {
      receitas: parseFloat(receitas.rows[0]?.total || 0),
      despesas: parseFloat(despesas.rows[0]?.total || 0),
    };
  }
}

async function fetchTotaisSemana(userId, inicio, fim) {
  try {
    const receitas = await pool.query(
      `SELECT COALESCE(SUM("Receita_Valor"),0) AS total
       FROM "Receita"
       WHERE "Usuario_Id" = $1
         AND "Receita_Data"::date BETWEEN $2::date AND $3::date
         AND COALESCE("Receita_Recebido", false) = true`,
      [userId, ymdLocal(inicio), ymdLocal(fim)]
    );
    const despesas = await pool.query(
      `SELECT COALESCE(SUM("Despesa_Valor"),0) AS total
       FROM "Despesa"
       WHERE "Usuario_Id" = $1
         AND "Despesa_Data"::date BETWEEN $2::date AND $3::date
         AND COALESCE("Despesa_Pago", false) = true`,
      [userId, ymdLocal(inicio), ymdLocal(fim)]
    );
    return {
      receitas: parseFloat(receitas.rows[0]?.total || 0),
      despesas: parseFloat(despesas.rows[0]?.total || 0),
    };
  } catch (_) {
    const receitas = await pool.query(
      `SELECT COALESCE(SUM(receita_valor),0) AS total
       FROM receita
       WHERE usuario_id = $1
         AND receita_data::date BETWEEN $2::date AND $3::date
         AND COALESCE(receita_recebido, false) = true`,
      [userId, ymdLocal(inicio), ymdLocal(fim)]
    );
    const despesas = await pool.query(
      `SELECT COALESCE(SUM(despesa_valor),0) AS total
       FROM despesa
       WHERE usuario_id = $1
         AND despesa_data::date BETWEEN $2::date AND $3::date
         AND COALESCE(despesa_pago, false) = true`,
      [userId, ymdLocal(inicio), ymdLocal(fim)]
    );
    return {
      receitas: parseFloat(receitas.rows[0]?.total || 0),
      despesas: parseFloat(despesas.rows[0]?.total || 0),
    };
  }
}

async function fetchMetasComGasto(userId) {
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();
  let metas = [];
  try {
    const result = await pool.query(
      `SELECT meta_id, categoria, valor_meta FROM meta_despesa
       WHERE usuario_id = $1 AND is_active = true`,
      [userId]
    );
    metas = result.rows;
  } catch (_) {
    return [];
  }

  let gastos = [];
  try {
    const result = await pool.query(
      `SELECT "Despesa_Tipo" AS tipo, COALESCE(SUM("Despesa_Valor"),0) AS total
       FROM "Despesa"
       WHERE "Usuario_Id" = $1
         AND EXTRACT(YEAR FROM "Despesa_Data") = $2
         AND EXTRACT(MONTH FROM "Despesa_Data") = $3
       GROUP BY "Despesa_Tipo"`,
      [userId, ano, mes]
    );
    gastos = result.rows;
  } catch (_) {
    const result = await pool.query(
      `SELECT despesa_tipo AS tipo, COALESCE(SUM(despesa_valor),0) AS total
       FROM despesa
       WHERE usuario_id = $1
         AND EXTRACT(YEAR FROM despesa_data) = $2
         AND EXTRACT(MONTH FROM despesa_data) = $3
       GROUP BY despesa_tipo`,
      [userId, ano, mes]
    );
    gastos = result.rows;
  }

  const mapGasto = {};
  gastos.forEach((g) => {
    mapGasto[g.tipo] = parseFloat(g.total || 0);
  });

  return metas.map((m) => {
    const gasto = mapGasto[m.categoria] || 0;
    const metaPct = parseFloat(m.valor_meta || 0);
    // valor_meta no app é % do orçamento/categoria — se > 100 assume valor em R$
    // Na prática o front salva percentual. Sem orçamento total, usamos gasto vs meta%
    // como alerta quando percentual de gasto da categoria já ultrapassa a meta configurada
    // se valor_meta <= 100: trata como percentual alvo (alerta em >= 80% da meta)
    // se > 100: trata como valor em R$
    let percentualUsado = 0;
    let estourada = false;
    let proxima = false;
    if (metaPct > 100) {
      percentualUsado = metaPct > 0 ? (gasto / metaPct) * 100 : 0;
      estourada = gasto >= metaPct;
      proxima = !estourada && percentualUsado >= 80;
    } else {
      // Sem total de orçamento: só alerta se houver gasto relevante e meta configurada
      percentualUsado = metaPct;
      estourada = false;
      proxima = gasto > 0 && metaPct > 0;
      // Melhor: se houver orçamento total do mês, comparar
    }
    return { ...m, gasto, metaPct, percentualUsado, estourada, proxima };
  });
}

async function fetchOrcamentoTotal(userId) {
  const ym = ymdLocal().slice(0, 7);
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(orcamento_valor),0) AS total
       FROM orcamento_mensal
       WHERE usuario_id = $1 AND orcamento_mes = $2 AND COALESCE(orcamento_ativo, true) = true`,
      [userId, ym]
    );
    return parseFloat(result.rows[0]?.total || 0);
  } catch (_) {
    return 0;
  }
}

async function listNotificacoes(userId, { diasAntes = 5 } = {}) {
  await ensureSchema();
  const prefs = await getPrefs(userId);
  const lidas = await getLidas(userId);
  const hoje = parseDateOnly(ymdLocal());
  const items = [];

  if (prefs.contas_a_vencer || prefs.contas_vencidas) {
    const despesas = await fetchDespesasAbertas(userId);
    for (const d of despesas) {
      const venc = parseDateOnly(d.vencimento);
      if (!venc) continue;
      const diff = daysBetween(hoje, venc);
      const desc = d.descricao || 'Despesa';
      const valor = formatBRL(d.valor);
      const vencLabel = venc.toLocaleDateString('pt-BR');

      if (prefs.contas_vencidas && diff < 0) {
        const key = `contas_vencidas_${d.id}`;
        items.push({
          key,
          tipo: 'contas_vencidas',
          titulo: 'Conta vencida',
          mensagem: `${desc} (${valor}) venceu em ${vencLabel}.`,
          createdAt: venc.toISOString(),
          lida: lidas.has(key),
          href: '/layout/despesa',
        });
      } else if (prefs.contas_a_vencer && diff >= 0 && diff <= Number(diasAntes || 0)) {
        const key = `contas_a_vencer_${d.id}`;
        const quando = diff === 0 ? 'vence hoje' : `vence em ${diff} dia(s)`;
        items.push({
          key,
          tipo: 'contas_a_vencer',
          titulo: 'Conta a vencer',
          mensagem: `${desc} (${valor}) ${quando} (${vencLabel}).`,
          createdAt: new Date().toISOString(),
          lida: lidas.has(key),
          href: '/layout/despesa',
        });
      }
    }
  }

  if (prefs.metas_financeiras) {
    const orcamentoTotal = await fetchOrcamentoTotal(userId);
    const metas = await fetchMetasComGasto(userId);
    for (const m of metas) {
      const metaPct = parseFloat(m.valor_meta || 0);
      if (!metaPct) continue;
      let limite = null;
      if (metaPct > 100) {
        limite = metaPct;
      } else if (orcamentoTotal > 0) {
        limite = (orcamentoTotal * metaPct) / 100;
      }
      if (limite == null) continue;
      const gasto = m.gasto || 0;
      const pct = limite > 0 ? (gasto / limite) * 100 : 0;
      if (pct < 80) continue;
      const key = `metas_financeiras_${m.meta_id}_${ymdLocal().slice(0, 7)}`;
      const estourada = pct >= 100;
      items.push({
        key,
        tipo: 'metas_financeiras',
        titulo: estourada ? 'Meta estourada' : 'Meta próxima do limite',
        mensagem: `${m.categoria}: ${formatBRL(gasto)} de ${formatBRL(limite)} (${pct.toFixed(0)}%).`,
        createdAt: new Date().toISOString(),
        lida: lidas.has(key),
        href: '/layout/despesa',
      });
    }
  }

  if (prefs.resumo_mensal) {
    const ym = ymdLocal().slice(0, 7);
    const totais = await fetchTotaisMes(userId, ym);
    const key = `resumo_mensal_${ym}`;
    const saldo = totais.receitas - totais.despesas;
    items.push({
      key,
      tipo: 'resumo_mensal',
      titulo: 'Resumo mensal',
      mensagem: `Receitas ${formatBRL(totais.receitas)} · Despesas ${formatBRL(totais.despesas)} · Saldo ${formatBRL(saldo)}.`,
      createdAt: new Date().toISOString(),
      lida: lidas.has(key),
      href: '/layout/dashboard',
    });
  }

  if (prefs.resumo_semanal) {
    const hojeDate = new Date();
    const day = hojeDate.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const inicio = new Date(hojeDate.getFullYear(), hojeDate.getMonth(), hojeDate.getDate() + diffToMon);
    const fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6);
    const totais = await fetchTotaisSemana(userId, inicio, fim);
    const key = `resumo_semanal_${weekKey(hojeDate)}`;
    const saldo = totais.receitas - totais.despesas;
    items.push({
      key,
      tipo: 'resumo_semanal',
      titulo: 'Resumo semanal',
      mensagem: `Receitas ${formatBRL(totais.receitas)} · Despesas ${formatBRL(totais.despesas)} · Saldo ${formatBRL(saldo)}.`,
      createdAt: new Date().toISOString(),
      lida: lidas.has(key),
      href: '/layout/dashboard',
    });
  }

  if (prefs.dicas_economia) {
    const hojeStr = ymdLocal();
    const idx = Number(hojeStr.replace(/-/g, '')) % DICAS.length;
    const key = `dicas_economia_${hojeStr}`;
    items.push({
      key,
      tipo: 'dicas_economia',
      titulo: 'Dica de economia',
      mensagem: DICAS[idx],
      createdAt: new Date().toISOString(),
      lida: lidas.has(key),
      href: '/layout/principal',
    });
  }

  items.sort((a, b) => {
    if (a.lida !== b.lida) return a.lida ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const naoLidas = items.filter((i) => !i.lida).length;
  return { prefs, items, naoLidas };
}

module.exports = {
  DEFAULT_PREFS,
  ensureSchema,
  getPrefs,
  savePrefs,
  listNotificacoes,
  markRead,
  markAllRead,
};
