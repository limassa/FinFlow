import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { getBancoById } from '../utils/banks';
import { getBankLogoXml } from '../utils/bankLogoXml';

/**
 * Logo do banco (SVG) com fallback para iniciais coloridas.
 */
export default function BankLogo({ banco, bancoId, size = 28, style }) {
  const data = banco || (bancoId ? getBancoById(bancoId) : null);
  if (!data) return null;

  const xml = getBankLogoXml(data.id);
  if (xml) {
    return (
      <View style={[styles.wrap, { width: size, height: size }, style]}>
        <SvgXml xml={xml} width={size} height={size} />
      </View>
    );
  }

  return (
    <View style={[styles.badge, { width: size, height: size * 0.9, backgroundColor: data.cor }, style]}>
      <Text style={[styles.badgeText, { fontSize: Math.max(10, size * 0.38) }]}>{data.abbr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
});
