import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  colors as sharedColors,
  getColorsForScheme,
  getNavigationTheme,
  getPaperTheme,
  setActiveColors,
} from '../theme/theme';

const THEME_PREF_KEY = 'claricash_theme_preference';

/** @typedef {'system' | 'light' | 'dark'} ThemePreference */

const ThemeContext = createContext({
  preference: /** @type {ThemePreference} */ ('system'),
  colorScheme: 'light',
  isDark: false,
  colors: sharedColors,
  paperTheme: getPaperTheme('light'),
  navigationTheme: getNavigationTheme('light'),
  setPreference: async (/** @type {ThemePreference} */ _pref) => {},
});

export function ThemeProvider({ children }) {
  const hookScheme = useColorScheme();
  const [appearanceScheme, setAppearanceScheme] = useState(
    () => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light')
  );
  const [preference, setPreferenceState] = useState(/** @type {ThemePreference} */ ('system'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(THEME_PREF_KEY);
        if (!cancelled && (saved === 'system' || saved === 'light' || saved === 'dark')) {
          setPreferenceState(saved);
        }
      } catch (e) {
        console.log('Erro ao carregar preferência de tema:', e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setAppearanceScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const systemScheme =
    hookScheme === 'dark' || hookScheme === 'light' ? hookScheme : appearanceScheme;

  const colorScheme = preference === 'system' ? systemScheme : preference;

  useEffect(() => {
    setActiveColors(getColorsForScheme(colorScheme));
  }, [colorScheme]);

  const setPreference = useCallback(async (pref) => {
    setPreferenceState(pref);
    try {
      await SecureStore.setItemAsync(THEME_PREF_KEY, pref);
    } catch (e) {
      console.log('Erro ao salvar preferência de tema:', e);
    }
  }, []);

  const value = useMemo(() => {
    const palette = getColorsForScheme(colorScheme);
    setActiveColors(palette);
    return {
      preference,
      colorScheme,
      isDark: colorScheme === 'dark',
      colors: { ...palette },
      paperTheme: getPaperTheme(colorScheme),
      navigationTheme: getNavigationTheme(colorScheme),
      setPreference,
      ready,
    };
  }, [preference, colorScheme, setPreference, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** Escuta mudanças do sistema quando preference === system (backup do useColorScheme) */
export function subscribeSystemAppearance(callback) {
  const sub = Appearance.addChangeListener(({ colorScheme }) => {
    callback(colorScheme === 'dark' ? 'dark' : 'light');
  });
  return () => sub.remove();
}
