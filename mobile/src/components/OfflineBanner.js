import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../context/OfflineContext';
import { useTheme } from '../context/ThemeContext';

export default function OfflineBanner() {
  const { isOnline, enabled, lastSyncedAt } = useOffline();
  const { colors } = useTheme();

  if (isOnline || !enabled) return null;

  let syncLabel = 'dados em cache';
  if (lastSyncedAt) {
    try {
      const d = new Date(lastSyncedAt);
      syncLabel = `última sync ${d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch (_) {
      /* ignore */
    }
  }

  return (
    <View style={[styles.banner, { backgroundColor: colors.offlineBannerBg }]}>
      <Ionicons name="cloud-offline-outline" size={18} color={colors.offlineBanner} />
      <Text style={[styles.text, { color: colors.offlineBanner }]}>
        Sem conexão — modo offline ({syncLabel})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});
