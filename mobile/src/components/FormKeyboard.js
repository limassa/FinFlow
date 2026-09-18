import React from 'react';
import {
  View,
  Text,
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

/** Props para TextInput no iOS (barra "Ocultar teclado" acima do teclado). */
export function keyboardInputProps() {
  if (Platform.OS !== 'ios') return {};
  return { inputAccessoryViewID: KEYBOARD_ACCESSORY_ID };
}

/** Montar uma vez na raiz do app (iOS). */
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
        >
          <Ionicons name="chevron-down" size={20} color={text} />
          <Text style={[styles.accessoryText, { color: text }]}>Ocultar teclado</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}

/** Botão visível nos formulários (iOS e Android). */
export function KeyboardDismissButton({ colors, style }) {
  const text = colors?.primary || '#2563EB';
  const border = colors?.border || '#cbd5e1';
  const bg = colors?.surface || '#EFF6FF';

  return (
    <TouchableOpacity
      onPress={dismissKeyboard}
      style={[styles.formBtn, { borderColor: border, backgroundColor: bg }, style]}
      accessibilityRole="button"
      accessibilityLabel="Ocultar teclado"
    >
      <Ionicons name="keypad-outline" size={18} color={text} />
      <Text style={[styles.formBtnText, { color: text }]}>Ocultar teclado</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  accessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  accessoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  accessoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  formBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
