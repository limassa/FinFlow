// IMPORTANTE: gesture-handler DEVE ser importado ANTES de tudo
import 'react-native-gesture-handler';

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthStack from './src/navigation/AuthStack';
import MainNavigator from './src/navigation/MainNavigator';
import { theme } from './src/theme/theme';

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.bootContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (user) {
    return <MainNavigator />;
  }

  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
});
