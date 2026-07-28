import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderIconButton } from '../components/HeaderIconButton';
import { useTheme } from '../context/ThemeContext';

/**
 * Header JS (igual ao das tabs) — evita o círculo nativo do iOS no native-stack.
 */
function MenuStackHeader({ title, titleContent, openMenu, headerRight }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top, backgroundColor: colors.header }]}>
      <View style={styles.bar}>
        <View style={styles.side}>
          <HeaderIconButton name="menu" side="left" onPress={openMenu} />
        </View>
        <View style={styles.titleWrap}>
          {titleContent || (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
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
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      header: ({ options }) => {
        let titleContent = null;
        if (typeof options.headerTitle === 'function') {
          titleContent = options.headerTitle({
            children: options.title ?? route.name,
          });
        } else if (typeof options.headerTitle === 'string') {
          titleContent = (
            <Text style={styles.title} numberOfLines={1}>
              {options.headerTitle}
            </Text>
          );
        } else if (React.isValidElement(options.headerTitle)) {
          titleContent = options.headerTitle;
        }

        return (
          <MenuStackHeader
            title={options.title ?? route.name}
            titleContent={titleContent}
            openMenu={openMenu}
            headerRight={options.headerRight}
          />
        );
      },
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
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

/** Avatar + texto no título do header (ex.: Home) */
export function HeaderGreetingTitle({ fotoUri, title }) {
  return (
    <View style={headerTitleStyles.row}>
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={headerTitleStyles.foto} />
      ) : (
        <View style={headerTitleStyles.fotoPlaceholder}>
          <Text style={headerTitleStyles.fotoPlaceholderText}>?</Text>
        </View>
      )}
      <Text style={headerTitleStyles.text} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const headerTitleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    gap: 8,
  },
  foto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  fotoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  fotoPlaceholderText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
});
