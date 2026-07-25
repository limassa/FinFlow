import React, { useState, useEffect } from 'react';
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
import { API_ENDPOINTS } from '../config/api';
import { colors } from '../theme/theme';

const MENU_ITEMS = [
  { screen: 'Home', label: 'Home', icon: 'home' },
  { screen: 'Dashboard', label: 'Dashboard', icon: 'bar-chart' },
  { screen: 'Calendario', label: 'Calendário', icon: 'calendar' },
  { screen: 'Agenda', label: 'Agenda', icon: 'grid-outline' },
  { screen: 'Contas', label: 'Contas', icon: 'wallet' },
  { screen: 'Receita', label: 'Receitas', icon: 'trending-up' },
  { screen: 'Despesa', label: 'Despesas', icon: 'trending-down' },
  { screen: 'Categorias', label: 'Categorias', icon: 'pricetags' },
  { screen: 'Orcamento', label: 'Orçamento', icon: 'pie-chart' },
  { screen: 'CartaoCredito', label: 'Cartão de Crédito', icon: 'card' },
  { screen: 'Calculadoras', label: 'Calculadoras', icon: 'calculator' },
  { screen: 'Sobre', label: 'Sobre', icon: 'information-circle' },
  { screen: 'Configuracoes', label: 'Configurações', icon: 'settings' },
];

export default function AppMenuModal() {
  const { menuVisible, closeMenu, navigationRef } = useMenu();
  const { user, getUserId } = useAuth();
  const userId = getUserId();
  const [userFoto, setUserFoto] = useState(null);
  const userNome = user?.usuario_nome || user?.nome || '';

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
            {MENU_ITEMS.map((item) => (
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.primary,
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    gap: 14,
  },
  itemLabel: {
    fontSize: 16,
    color: '#0f172a',
  },
});
