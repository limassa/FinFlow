import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor } from '../utils/formatters';

export const DESPESAS_NOTIFICATION_ID = 'claricash-despesas-nao-pagas-daily';
export const DESPESAS_NOTIFICATION_TYPE = 'despesas_nao_pagas';
export const EVENTO_NOTIFICATION_TYPE = 'evento';

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

function isDespesaPaga(despesa) {
  const pago = despesa.despesa_pago ?? despesa.Despesa_Pago ?? despesa.pago;
  return pago === true || pago === 1 || pago === 'true' || pago === 't';
}

function isDespesaAtiva(despesa) {
  const ativo = despesa.despesa_ativo ?? despesa.Despesa_Ativo ?? despesa.ativo;
  if (ativo === undefined || ativo === null) return true;
  return ativo === true || ativo === 1 || ativo === 'true' || ativo === 't';
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
    await Notifications.cancelScheduledNotificationAsync(DESPESAS_NOTIFICATION_ID);
  } catch {
    // ignore
  }

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.content?.data?.type === DESPESAS_NOTIFICATION_TYPE)
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
          // Eventos novos e antigos (sem type); preserva despesas_nao_pagas
          return type !== DESPESAS_NOTIFICATION_TYPE;
        })
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );
  } catch (err) {
    console.error('Erro ao cancelar notificações de eventos:', err);
  }
}

/**
 * Agenda notificação diária de despesas não pagas.
 * Só agenda se: permissão concedida, lembretes ativos e existir ao menos 1 despesa não paga.
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
    const naoPagas = despesas.filter((d) => isDespesaAtiva(d) && !isDespesaPaga(d));

    if (naoPagas.length === 0) {
      await cancelDespesasNaoPagasNotification();
      return { scheduled: false, reason: 'none-unpaid', count: 0 };
    }

    const total = naoPagas.reduce((sum, d) => {
      const valor = parseFloat(d.despesa_valor ?? d.Despesa_Valor ?? d.valor ?? 0);
      return sum + (Number.isFinite(valor) ? valor : 0);
    }, 0);

    const { hour, minute } = parseHorario(lembretes.lembretesHorario);
    const count = naoPagas.length;
    const body =
      count === 1
        ? `Você tem 1 despesa não paga (${formatarValor(total)}).`
        : `Você tem ${count} despesas não pagas. Total: ${formatarValor(total)}.`;

    await cancelDespesasNaoPagasNotification();

    await Notifications.scheduleNotificationAsync({
      identifier: DESPESAS_NOTIFICATION_ID,
      content: {
        title: 'Despesas em aberto',
        body,
        data: { type: DESPESAS_NOTIFICATION_TYPE, count, total },
        sound: true,
        ...(Platform.OS === 'android' ? { channelId: 'lembretes-eventos' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return { scheduled: true, count, total, hour, minute };
  } catch (err) {
    console.error('Erro ao sincronizar notificações de despesas:', err);
    return { scheduled: false, reason: 'error', error: err?.message };
  }
}
