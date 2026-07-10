import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function getMenuScreenOptions(openMenu, overrides = {}) {
  return ({ navigation, route }) => ({
    headerStyle: { backgroundColor: '#2563EB' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
    headerLeft: () => (
      <TouchableOpacity
        onPress={openMenu}
        style={{ marginLeft: 15, padding: 5 }}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={28} color="#fff" />
      </TouchableOpacity>
    ),
    ...overrides({ navigation, route }),
  });
}
