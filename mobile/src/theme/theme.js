import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';

/* Paleta alinhada ao Web (Liz Software): #4F46E5, #2563EB, #EFF6FF */
export const lightColors = {
  primary: '#2563EB',
  primaryDark: '#4F46E5',
  secondary: '#1d4ed8',
  success: '#059669',
  error: '#DC2626',
  warning: '#f59e0b',
  background: '#EFF6FF',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#cbd5e1',
  placeholder: '#94a3b8',
  card: '#ffffff',
  tabBar: '#ffffff',
  header: '#2563EB',
  offlineBanner: '#92400e',
  offlineBannerBg: '#fef3c7',
};

export const darkColors = {
  primary: '#60A5FA',
  primaryDark: '#818CF8',
  secondary: '#3B82F6',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  placeholder: '#64748b',
  card: '#1e293b',
  tabBar: '#0f172a',
  header: '#1e293b',
  offlineBanner: '#fde68a',
  offlineBannerBg: '#78350f',
};

/**
 * Objeto mutável compartilhado — componentes que leem colors.* no render
 * acompanham a troca de tema após re-render do ThemeProvider.
 * StyleSheet.create no nível do módulo NÃO atualiza sozinho.
 */
export const colors = { ...lightColors };

export function setActiveColors(palette) {
  Object.assign(colors, palette);
}

export function getColorsForScheme(scheme) {
  return scheme === 'dark' ? darkColors : lightColors;
}

export function getPaperTheme(scheme) {
  const palette = getColorsForScheme(scheme);
  const base = scheme === 'dark' ? MD3DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      accent: palette.primaryDark,
      background: palette.background,
      surface: palette.surface,
      text: palette.text,
      placeholder: palette.placeholder,
      disabled: palette.border,
      backdrop: 'rgba(0, 0, 0, 0.5)',
      success: palette.success,
      error: palette.error,
      warning: palette.warning,
      info: palette.primary,
      onSurface: palette.text,
    },
  };
}

export function getNavigationTheme(scheme) {
  const palette = getColorsForScheme(scheme);
  const base = scheme === 'dark' ? NavDarkTheme : NavDefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      notification: palette.error,
    },
  };
}

/** Theme Paper legado (claro) — preferir getPaperTheme via ThemeContext */
export const theme = getPaperTheme('light');
