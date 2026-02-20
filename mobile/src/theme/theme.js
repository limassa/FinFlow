import { DefaultTheme } from 'react-native-paper';

/* Paleta alinhada ao Web (Liz Software): #4F46E5, #2563EB, #EFF6FF */
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB',
    accent: '#4F46E5',
    background: '#EFF6FF',
    surface: '#ffffff',
    text: '#0f172a',
    placeholder: '#94a3b8',
    disabled: '#cbd5e1',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    success: '#059669',
    error: '#DC2626',
    warning: '#f59e0b',
    info: '#2563EB',
  },
};

export const colors = {
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
};

