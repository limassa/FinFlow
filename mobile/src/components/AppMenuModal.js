import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';

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

export default function AppMenuModal() {
  const { menuVisible, closeMenu, navigationRef } = useMenu();
  const { user, getUserId } = useAuth();
  const { colors } = useTheme();
  const userId = getUserId();
  const [userFoto, setUserFoto] = useState(null);
  const userNome = user?.usuario_nome || user?.nome || '';
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (!userId || !menuVisible) return;
    axios
      .get(`${API_ENDPOINTS.USER_FOTO}?userId=${userId}`)
      .then((res) => {
        if (res.data?.foto) setUserFoto(res.data.foto);
      })
      .catch(() => {});
  }, [userId, menuVisible]);

  const navigateTo = (screen) => {
    closeMenu();

    // No iOS o Modal precisa fechar antes da navegação; caminho raiz: MainTabs > Home > MainMenu
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

      // Contas / Configurações: mesma tela do rodapé (header JS, ícones soltos)
      if (screen === 'Contas') {
        nav.navigate('MainTabs', { screen: 'Contas' });
        return;
      }
      if (screen === 'Configuracoes') {
        nav.navigate('MainTabs', { screen: 'Configurações' });
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
            {MENU_SECTIONS.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {section.emoji} {section.title}
                </Text>
                {section.items.map((item) => (
                  <TouchableOpacity
                    key={item.screen}
                    style={styles.item}
                    onPress={() => navigateTo(item.screen)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={item.icon} size={22} color={colors.primary} />
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
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
      paddingTop: 12,
      paddingBottom: 4,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      color: colors.textSecondary,
      paddingHorizontal: 20,
      paddingBottom: 6,
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
    itemLabel: {
      fontSize: 16,
      color: colors.text,
    },
  });
}
