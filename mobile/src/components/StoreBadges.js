import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Linking } from 'react-native';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.lizsoftwares.finflow';
// Reativar quando o app estiver publicado na App Store
const SHOW_APP_STORE = false;
const APP_STORE_URL = 'https://apps.apple.com/br/app/id6787544258';

/**
 * Badges oficiais das lojas.
 * App Store fica oculta até SHOW_APP_STORE = true (e asset PNG disponível).
 */
export default function StoreBadges({ style }) {
  const openUrl = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('Não foi possível abrir a loja:', e?.message);
    }
  };

  return (
    <View style={[styles.wrap, style]}>
      {SHOW_APP_STORE ? (
        <TouchableOpacity
          style={styles.link}
          onPress={() => openUrl(APP_STORE_URL)}
          activeOpacity={0.85}
          accessibilityLabel="Baixar na App Store"
        >
          {/* Adicione mobile/assets/app-store-badge.png ao reativar */}
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.link}
        onPress={() => openUrl(PLAY_STORE_URL)}
        activeOpacity={0.85}
        accessibilityLabel="Disponível no Google Play"
      >
        <Image
          source={require('../../assets/google-play-badge.png')}
          style={styles.badgeGoogle}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  link: {
    lineHeight: 0,
  },
  badgeGoogle: {
    width: 155,
    height: 58,
  },
});
