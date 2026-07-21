import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';

export const DESPESAS_NOTIFICATION_ID_PREFIX = 'claricash-despesa-';
export const DESPESAS_NOTIFICATION_TYPE = 'despesas_nao_pagas';
export const EVENTO_NOTIFICATION_TYPE = 'evento';

/** Limite para não estourar o máximo de notificações agendadas do iOS (~64). */
const MAX_DESPESAS_NOTIFICATIONS = 40;

let handlerConfigured = false;

export function ensureNotificationHandler() {
  if (handlerConfigured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  handlerConfigured = true;
}

function parseHorario(horario) {
  const raw = String(horario || '18:15');
  const [h, m] = raw.split(':').map((n) => parseInt(n, 10));
  const hour = Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 18;
  const minute = Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 15;
  return { hour, minute };
}

/** Soma minutos a um horário HH:MM, rolando para o dia seguinte se passar de 23:59. */
function addMinutesToTime(hour, minute, extraMinutes) {
  const total = hour * 60 + minute + extraMinutes;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return {
    hour: Math.floor(normalized / 60),
    minute: normalized % 60,
  };
}

function isDespesaPaga(despesa) {
  const pago = despesa.despesa_pago ?? despesa.Despesa_Pago ?? despesa.pago;
  return pago === true || pago === 1 || pago === 'true' || pago === 't';
}

function isDespesaAtiva(despesa) {
  const ativo = despesa.despesa_ativo ?? despesa.Despesa_Ativo ?? despesa.ativo;
  if (ativo === undefined || ativo === null) return true;
  return ativo === true || ativo === 1 || ativo === 'true' || ativo === 't';
}

function getDespesaId(despesa) {
  return despesa.despesa_id ?? despesa.Despesa_Id ?? despesa.id;
}

function getDespesaDescricao(despesa) {
  return (
    despesa.despesa_descricao ||
    despesa.Despesa_Descricao ||
    despesa.descricao ||
    'Despesa'
  );
}

function getDespesaValor(despesa) {
  const valor = parseFloat(despesa.despesa_valor ?? despesa.Despesa_Valor ?? despesa.valor ?? 0);
  return Number.isFinite(valor) ? valor : 0;
}

function notificationIdForDespesa(despesaId, index) {
  return `${DESPESAS_NOTIFICATION_ID_PREFIX}${despesaId ?? index}`;
}

export async function getNotificationPermissionStatus() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Pede permissão só se ainda não foi decidida. Retorna true se granted. */
export async function ensureNotificationPermission() {
  ensureNotificationHandler();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  if (current.status === 'denied') return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function cancelDespesasNaoPagasNotification() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter(
          (n) =>
            n.content?.data?.type === DESPESAS_NOTIFICATION_TYPE ||
            String(n.identifier || '').startsWith(DESPESAS_NOTIFICATION_ID_PREFIX) ||
            n.identifier === 'claricash-despesas-nao-pagas-daily'
        )
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );
  } catch {
    // ignore
  }
}

/** Cancela só notificações de eventos da Agenda (não mexe nas de despesas). */
export async function cancelEventoNotifications() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => {
          const type = n.content?.data?.type;
          const id = String(n.identifier || '');
          // Preserva notificações de despesas não pagas
          if (type === DESPESAS_NOTIFICATION_TYPE) return false;
          if (id.startsWith(DESPESAS_NOTIFICATION_ID_PREFIX)) return false;
          if (id === 'claricash-despesas-nao-pagas-daily') return false;
          return true;
        })
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );
  } catch (err) {
    console.error('Erro ao cancelar notificações de eventos:', err);
  }
}

/**
 * Agenda uma notificação diária por despesa não paga (descrição + valor).
 * Só agenda se: permissão concedida, lembretes ativos e existir ao menos 1 despesa não paga.
 * Várias despesas são espaçadas em 1 minuto para aparecerem uma após a outra.
 */
export async function syncDespesasNaoPagasNotifications(userId) {
  if (!userId) {
    await cancelDespesasNaoPagasNotification();
    return { scheduled: false, reason: 'no-user' };
  }

  ensureNotificationHandler();

  try {
    const [lembretesRes, despesasRes] = await Promise.all([
      axios.get(`${API_ENDPOINTS.USER_LEMBRETES}?userId=${userId}`).catch(() => ({ data: null })),
      axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`),
    ]);

    const lembretes = lembretesRes.data || {};
    const lembretesAtivos = lembretes.lembretesAtivos !== false;

    if (!lembretesAtivos) {
      await cancelDespesasNaoPagasNotification();
      return { scheduled: false, reason: 'lembretes-off' };
    }

    const permitted = await ensureNotificationPermission();
    if (!permitted) {
      await cancelDespesasNaoPagasNotification();
      return { scheduled: false, reason: 'permission-denied' };
    }

    const despesas = Array.isArray(despesasRes.data) ? despesasRes.data : [];
    const naoPagas = despesas
      .filter((d) => isDespesaAtiva(d) && !isDespesaPaga(d))
      .sort((a, b) => {
        const da = String(a.despesa_dtvencimento || a.Despesa_DtVencimento || a.despesa_data || '');
        const db = String(b.despesa_dtvencimento || b.Despesa_DtVencimento || b.despesa_data || '');
        return da.localeCompare(db);
      });

    await cancelDespesasNaoPagasNotification();

    if (naoPagas.length === 0) {
      return { scheduled: false, reason: 'none-unpaid', count: 0 };
    }

    const base = parseHorario(lembretes.lembretesHorario);
    const paraAgendar = naoPagas.slice(0, MAX_DESPESAS_NOTIFICATIONS);

    for (let i = 0; i < paraAgendar.length; i++) {
      const despesa = paraAgendar[i];
      const despesaId = getDespesaId(despesa);
      const descricao = getDespesaDescricao(despesa);
      const valor = getDespesaValor(despesa);
      const { hour, minute } = addMinutesToTime(base.hour, base.minute, i);

      await Notifications.scheduleNotificationAsync({
        identifier: notificationIdForDespesa(despesaId, i),
        content: {
          title: 'Despesa em aberto',
          body: `${descricao} — ${formatarValor(valor)}`,
          data: {
            type: DESPESAS_NOTIFICATION_TYPE,
            despesa_id: despesaId,
            descricao,
            valor,
          },
          sound: true,
          ...(Platform.OS === 'android' ? { channelId: 'lembretes-eventos' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }

    return {
      scheduled: true,
      count: paraAgendar.length,
      truncated: naoPagas.length > paraAgendar.length,
      hour: base.hour,
      minute: base.minute,
    };
  } catch (err) {
    console.error('Erro ao sincronizar notificações de despesas:', err);
    return { scheduled: false, reason: 'error', error: err?.message };
  }
}
