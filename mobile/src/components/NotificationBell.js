import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';

const TIPO_LABEL = {
  contas_a_vencer: 'A vencer',
  contas_vencidas: 'Vencidas',
  metas_financeiras: 'Metas',
  resumo_mensal: 'Mensal',
  resumo_semanal: 'Semanal',
  dicas_economia: 'Dica',
};

const HREF_TO_SCREEN = {
  '/layout/despesa': 'Despesa',
  '/layout/dashboard': 'Dashboard',
  '/layout/principal': 'Home',
  '/layout/configuracoes': 'Configuracoes',
};

export function NotificationBell() {
  const { getUserId } = useAuth();
  const { navigationRef } = useMenu();
  const { colors, isDark } = useTheme();
  const userId = getUserId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);

  const carregar = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.USER_NOTIFICACOES}?userId=${userId}`);
      setItems(res.data?.items || []);
      setNaoLidas(res.data?.naoLidas || 0);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 60000);
    return () => clearInterval(id);
  }, [carregar]);

  const navigateTo = (screen) => {
    const nav = navigationRef?.current;
    if (!nav) return;
    if (screen === 'Home') {
      nav.navigate('MainTabs', {
        screen: 'Home',
        params: { screen: 'MainMenu', params: { screen: 'Home' } },
      });
      return;
    }
    if (screen === 'Configuracoes') {
      nav.navigate('MainTabs', { screen: 'Configurações' });
      return;
    }
    nav.navigate('MainTabs', {
      screen: 'Home',
      params: { screen: 'MainMenu', params: { screen } },
    });
  };

  const marcarLida = async (key) => {
    if (!userId || !key) return;
    try {
      await axios.post(API_ENDPOINTS.USER_NOTIFICACOES_LIDA, { userId, key });
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, lida: true } : i)));
      setNaoLidas((n) => Math.max(0, n - 1));
    } catch (err) {
      console.error('Erro ao marcar notificação:', err);
    }
  };

  const marcarTodas = async () => {
    if (!userId) return;
    try {
      await axios.post(API_ENDPOINTS.USER_NOTIFICACOES_LIDA, { userId, all: true });
      setItems((prev) => prev.map((i) => ({ ...i, lida: true })));
      setNaoLidas(0);
    } catch (err) {
      console.error('Erro ao marcar todas:', err);
    }
  };

  const abrirItem = async (item) => {
    if (!item.lida) await marcarLida(item.key);
    setOpen(false);
    const screen = item.href ? HREF_TO_SCREEN[item.href] : null;
    if (screen) navigateTo(screen);
  };

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await carregar();
  };

  if (!userId) return null;

  const badgeLabel = naoLidas > 99 ? '99+' : String(naoLidas);

  return (
    <View style={styles.wrap}>
      <Ionicons
        name="notifications-outline"
        size={26}
        color="#fff"
        style={styles.bell}
        onPress={toggle}
      />
      {naoLidas > 0 ? (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View
            style={[
              styles.panel,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.panelTitle, { color: colors.text }]}>Notificações</Text>
              <TouchableOpacity onPress={marcarTodas} disabled={!naoLidas} hitSlop={8}>
                <Text style={[styles.markAll, { color: naoLidas ? colors.primary : colors.textSecondary }]}>
                  Marcar lidas
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {loading ? (
                <View style={styles.empty}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Carregando...</Text>
                </View>
              ) : null}
              {!loading && items.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Nenhuma notificação no momento.
                  </Text>
                </View>
              ) : null}
              {!loading &&
                items.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.item,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: item.lida
                          ? 'transparent'
                          : isDark
                            ? 'rgba(37, 99, 235, 0.18)'
                            : '#EFF6FF',
                      },
                    ]}
                    onPress={() => abrirItem(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tipo, { color: colors.primary }]}>
                      {TIPO_LABEL[item.tipo] || item.tipo}
                    </Text>
                    <Text
                      style={[
                        styles.titulo,
                        { color: item.lida ? colors.textSecondary : colors.text },
                      ]}
                    >
                      {item.titulo}
                    </Text>
                    <Text
                      style={[
                        styles.msg,
                        { color: item.lida ? colors.textSecondary : colors.text },
                      ]}
                    >
                      {item.mensagem}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.footer, { borderTopColor: colors.border }]}
              onPress={() => {
                setOpen(false);
                navigateTo('Configuracoes');
              }}
            >
              <Text style={[styles.footerText, { color: colors.primary }]}>
                Preferências de notificação
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bell: {
    marginRight: 0,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    width: 320,
    maxWidth: '92%',
    maxHeight: '70%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 2,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  markAll: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    maxHeight: 360,
  },
  empty: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 3,
  },
  tipo: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  titulo: {
    fontSize: 13,
    fontWeight: '700',
  },
  msg: {
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
