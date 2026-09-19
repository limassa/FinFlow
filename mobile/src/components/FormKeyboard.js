import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  InputAccessoryView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const KEYBOARD_ACCESSORY_ID = 'claricash-keyboard-dismiss';

export function dismissKeyboard() {
  Keyboard.dismiss();
}

/** Props para TextInput no iOS (seta acima do teclado). */
export function keyboardInputProps() {
  if (Platform.OS !== 'ios') return {};
  return { inputAccessoryViewID: KEYBOARD_ACCESSORY_ID };
}

/**
 * Barra nativa acima do teclado no iOS (seta para ocultar).
 * No Android o teclado do sistema já traz a seta de fechar.
 * Montar uma vez na raiz do app.
 */
export function KeyboardDismissAccessory({ colors }) {
  if (Platform.OS !== 'ios') return null;
  const bg = colors?.surface || '#f1f5f9';
  const border = colors?.border || '#cbd5e1';
  const text = colors?.primary || '#2563EB';

  return (
    <InputAccessoryView nativeID={KEYBOARD_ACCESSORY_ID}>
      <View style={[styles.accessory, { backgroundColor: bg, borderTopColor: border }]}>
        <TouchableOpacity
          onPress={dismissKeyboard}
          style={styles.accessoryBtn}
          accessibilityRole="button"
          accessibilityLabel="Ocultar teclado"
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-down" size={22} color={text} />
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  accessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  accessoryBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});
