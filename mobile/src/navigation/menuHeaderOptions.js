import React from 'react';
import { HeaderIconButton } from '../components/HeaderIconButton';

export function getMenuScreenOptions(openMenu, overrides = {}) {
  return ({ navigation, route }) => ({
    headerStyle: { backgroundColor: '#2563EB' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
    headerLeft: () => (
      <HeaderIconButton name="menu" side="left" onPress={openMenu} />
    ),
    ...overrides({ navigation, route }),
  });
}
