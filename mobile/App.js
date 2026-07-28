// IMPORTANTE: gesture-handler DEVE ser importado ANTES de tudo
import 'react-native-gesture-handler';

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { OfflineProvider } from './src/context/OfflineContext';
import AuthStack from './src/navigation/AuthStack';
import MainNavigator from './src/navigation/MainNavigator';
import DespesasNotificationSync from './src/components/DespesasNotificationSync';

function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors, navigationTheme, isDark } = useTheme();

  if (loading) {
    return (
      <View style={[styles.bootContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return (
      <>
        <DespesasNotificationSync />
        <MainNavigator />
      </>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthStack />
    </NavigationContainer>
  );
}

function ThemedApp() {
  const { paperTheme, colors, isDark } = useTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <OfflineProvider>
        <AuthProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <AppNavigator />
          </View>
        </AuthProvider>
      </OfflineProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
