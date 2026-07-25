import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderIconButton } from '../components/HeaderIconButton';

/**
 * Header JS (igual ao das tabs) — evita o círculo nativo do iOS no native-stack.
 */
function MenuStackHeader({ title, openMenu, headerRight }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top, backgroundColor: '#2563EB' }]}>
      <View style={styles.bar}>
        <View style={styles.side}>
          <HeaderIconButton name="menu" side="left" onPress={openMenu} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.sideRight]}>
          {typeof headerRight === 'function' ? headerRight() : headerRight || null}
        </View>
      </View>
    </View>
  );
}

export function getMenuScreenOptions(openMenu, overrides = {}) {
  return ({ navigation, route }) => {
    const extra =
      typeof overrides === 'function' ? overrides({ navigation, route }) : overrides || {};

    return {
      headerStyle: { backgroundColor: '#2563EB' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      // Header customizado: mesmo visual das tabs (ícones soltos, sem círculo no iOS)
      header: ({ options }) => (
        <MenuStackHeader
          title={options.title ?? route.name}
          openMenu={openMenu}
          headerRight={options.headerRight}
        />
      ),
      ...extra,
    };
  };
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#2563EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 1,
      },
      android: { elevation: 4 },
    }),
  },
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    minWidth: 56,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
