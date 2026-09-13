import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Linking, Platform } from 'react-native';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.lizsoftwares.finflow';

/**
 * Badges das lojas.
 * No iOS não exibimos Google Play / outras lojas (App Store Guideline 2.3.10).
 */
export default function StoreBadges({ style }) {
  // App Store Review 2.3.10: não promover plataformas de terceiros no app iOS
  if (Platform.OS === 'ios') {
    return null;
  }

  const openUrl = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('Não foi possível abrir a loja:', e?.message);
    }
  };

  return (
    <View style={[styles.wrap, style]}>
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
