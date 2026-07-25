import React from 'react';
import { Ionicons } from '@expo/vector-icons';

/**
 * Ícone de header solto — padrão original da tela Contas.
 * Ionicons direto com onPress (sem TouchableOpacity/Pressable),
 * para não gerar círculo atrás no iOS.
 */
export function HeaderIconButton({ name, onPress, side = 'right', size = 28, color = '#fff' }) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={side === 'left' ? { marginLeft: 15 } : { marginRight: 15 }}
      onPress={onPress}
    />
  );
}
