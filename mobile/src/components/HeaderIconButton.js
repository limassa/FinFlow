import React from 'react';
import { Ionicons } from '@expo/vector-icons';

/**
 * Ícone de header sem fundo circular (padrão Contas / iOS).
 * Usa Ionicons com onPress — TouchableOpacity no header gera círculo no iOS.
 */
export function HeaderIconButton({ name, onPress, side = 'right', size = 28, color = '#fff' }) {
  const style =
    side === 'left'
      ? { marginLeft: 15, padding: 4 }
      : { marginRight: 15, padding: 4 };

  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={style}
      onPress={onPress}
    />
  );
}
