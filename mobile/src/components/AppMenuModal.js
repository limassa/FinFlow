import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';

const MENU_COLLAPSE_KEY = 'claricash_menu_sections_collapsed';

const MENU_SECTIONS = [
  {
    title: 'PRINCIPAL',
    emoji: '🏠',
    items: [
      { screen: 'Home', label: 'Home', icon: 'home' },
      { screen: 'Dashboard', label: 'Dashboard', icon: 'bar-chart' },
    ],
  },
  {
    title: 'FINANÇAS',
    emoji: '💰',
    items: [
      { screen: 'Contas', label: 'Contas', icon: 'wallet' },
      { screen: 'Receita', label: 'Receitas', icon: 'trending-up' },
      { screen: 'Despesa', label: 'Despesas', icon: 'trending-down' },
      { screen: 'CartaoCredito', label: 'Cartão de Crédito', icon: 'card' },
    ],
  },
  {
    title: 'ORGANIZAÇÃO',
    emoji: '📅',
    items: [
      { screen: 'Calendario', label: 'Calendário', icon: 'calendar' },
      { screen: 'Agenda', label: 'Agenda', icon: 'grid-outline' },
      { screen: 'Orcamento', label: 'Orçamento', icon: 'pie-chart' },
      { screen: 'Categorias', label: 'Categorias', icon: 'pricetags' },
    ],
  },
  {
    title: 'FERRAMENTAS',
    emoji: '🧮',
    items: [
      { screen: 'Calculadoras', label: 'Calculadoras', icon: 'calculator' },
    ],
  },
  {
    title: 'SISTEMA',
    emoji: '⚙️',
    items: [
      { screen: 'Sobre', label: 'Sobre', icon: 'information-circle' },
      { screen: 'Configuracoes', label: 'Configurações', icon: 'settings' },
    ],
  },
];

function getDeepestRouteName(state) {
  if (!state) return null;
  const route = state.routes?.[state.index];
  if (!route) return null;
  if (route.state) return getDeepestRouteName(route.state);
  return route.name || null;
}

function normalizeActiveScreen(name) {
  if (!name) return null;
  if (name === 'Configurações') return 'Configuracoes';
  return name;
}

export default function AppMenuModal() {
  const { menuVisible, closeMenu, navigationRef } = useMenu();
  const { user, getUserId, logout } = useAuth();
  const { colors } = useTheme();
  const userId = getUserId();
  const [userFoto, setUserFoto] = useState(null);
  const [activeScreen, setActiveScreen] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const userNome = user?.usuario_nome || user?.nome || '';
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    AsyncStorage.getItem(MENU_COLLAPSE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setCollapsed(parsed);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!menuVisible) return;
    try {
      const rootState = navigationRef?.current?.getRootState?.();
      setActiveScreen(normalizeActiveScreen(getDeepestRouteName(rootState)));
    } catch {
      setActiveScreen(null);
    }
  }, [menuVisible, navigationRef]);

  useEffect(() => {
    if (!userId || !menuVisible) return;
    axios
      .get(`${API_ENDPOINTS.USER_FOTO}?userId=${userId}`)
      .then((res) => {
        if (res.data?.foto) setUserFoto(res.data.foto);
      })
      .catch(() => {});
  }, [userId, menuVisible]);

  const toggleSection = useCallback((title) => {
    setCollapsed((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      AsyncStorage.setItem(MENU_COLLAPSE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const navigateTo = (screen) => {
    closeMenu();

    setTimeout(() => {
      const nav = navigationRef?.current;
      if (!nav) return;

      if (screen === 'Home') {
        nav.navigate('MainTabs', {
          screen: 'Home',
          params: {
            screen: 'MainMenu',
            params: { screen: 'Home' },
          },
        });
        return;
      }

      if (screen === 'Contas') {
        nav.navigate('MainTabs', { screen: 'Contas' });
        return;
      }
      if (screen === 'Configuracoes') {
        nav.navigate('MainTabs', { screen: 'Configurações' });
        return;
      }
      if (screen === 'Sair') {
        nav.navigate('MainTabs', { screen: 'Sair' });
        return;
      }

      nav.navigate('MainTabs', {
        screen: 'Home',
        params: {
          screen: 'MainMenu',
          params: { screen },
        },
      });
    }, 150);
  };

  const handleSair = () => {
    closeMenu();
    setTimeout(() => {
      Alert.alert('Sair', 'Deseja realmente sair?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => logout() },
      ]);
    }, 180);
  };

  const abrirConfiguracoes = () => {
    navigateTo('Configuracoes');
  };

  return (
    <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeMenu} />
        <View style={styles.panel}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.fotoWrapper} onPress={abrirConfiguracoes} activeOpacity={0.8}>
              {userFoto ? (
                <Image
                  source={{
                    uri: userFoto.startsWith('data:') ? userFoto : `data:image/jpeg;base64,${userFoto}`,
                  }}
                  style={styles.foto}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.fotoPlaceholder}>
                  <Text style={styles.fotoPlaceholderText}>?</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.userLabel} numberOfLines={1}>
              {userNome || 'Usuário'}
            </Text>
          </View>

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {MENU_SECTIONS.map((section) => {
              const isCollapsed = !!collapsed[section.title];
              return (
                <View key={section.title} style={styles.section}>
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(section.title)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sectionTitleRow}>
                      <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                      <Text style={styles.sectionTitle} numberOfLines={1}>
                        {section.title}
                      </Text>
                    </View>
                    <Ionicons
                      name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {!isCollapsed &&
                    section.items.map((item) => {
                      const active = activeScreen === item.screen;
                      return (
                        <TouchableOpacity
                          key={item.screen}
                          style={[styles.item, active && styles.itemActive]}
                          onPress={() => navigateTo(item.screen)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={item.icon}
                            size={22}
                            color={active ? '#fff' : colors.primary}
                          />
                          <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.item, styles.sairItem, activeScreen === 'Sair' && styles.itemActive]}
              onPress={handleSair}
              activeOpacity={0.7}
            >
              <Ionicons
                name="log-out-outline"
                size={22}
                color={activeScreen === 'Sair' ? '#fff' : colors.error}
              />
              <Text
                style={[
                  styles.itemLabel,
                  styles.sairLabel,
                  activeScreen === 'Sair' && styles.itemLabelActive,
                ]}
              >
                Sair
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      flexDirection: 'row',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    panel: {
      width: '82%',
      maxWidth: 320,
      backgroundColor: colors.menuPanel || colors.surface,
      zIndex: 1,
    },
    header: {
      padding: 20,
      paddingTop: 56,
      paddingBottom: 16,
      backgroundColor: colors.menuHeader || colors.header,
      alignItems: 'center',
    },
    fotoWrapper: {
      marginBottom: 8,
    },
    foto: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    fotoPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255,255,255,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fotoPlaceholderText: {
      fontSize: 24,
      color: '#fff',
      fontWeight: '600',
    },
    userLabel: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      maxWidth: '100%',
    },
    list: {
      flex: 1,
    },
    section: {
      paddingTop: 8,
      paddingBottom: 4,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 8,
      gap: 8,
    },
    sectionTitleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
    },
    sectionEmoji: {
      fontSize: 13,
      lineHeight: 16,
    },
    sectionTitle: {
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 14,
    },
    itemActive: {
      backgroundColor: colors.primary,
      borderBottomColor: 'transparent',
    },
    itemLabel: {
      fontSize: 16,
      color: colors.text,
    },
    itemLabelActive: {
      color: '#fff',
      fontWeight: '600',
    },
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingBottom: 20,
    },
    sairItem: {
      borderBottomWidth: 0,
      marginTop: 4,
    },
    sairLabel: {
      color: colors.error,
      fontWeight: '600',
    },
  });
}
