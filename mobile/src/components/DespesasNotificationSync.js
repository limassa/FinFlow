import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  syncDespesasNaoPagasNotifications,
  cancelDespesasNaoPagasNotification,
} from '../services/despesasNotifications';

/**
 * Mantém a notificação diária de despesas não pagas sincronizada
 * enquanto o usuário estiver logado.
 */
export default function DespesasNotificationSync() {
  const { user, getUserId } = useAuth();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const userId = getUserId();
    if (!user || !userId) {
      cancelDespesasNaoPagasNotification();
      return undefined;
    }

    syncDespesasNaoPagasNotifications(userId);

    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        syncDespesasNaoPagasNotifications(userId);
      }
      appState.current = nextState;
    });

    return () => {
      sub.remove();
    };
  }, [user, getUserId]);

  return null;
}
