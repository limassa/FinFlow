// IMPORTANTE: gesture-handler DEVE ser importado ANTES de tudo
import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReceitaScreen from './src/screens/ReceitaScreen';
import DespesaScreen from './src/screens/DespesaScreen';
import ContasScreen from './src/screens/ContasScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import CalculadoraJurosScreen from './src/screens/CalculadoraJurosScreen';
import CalculadoraRetiradasScreen from './src/screens/CalculadoraRetiradasScreen';
import SobreScreen from './src/screens/SobreScreen';
import FaleConoscoScreen from './src/screens/FaleConoscoScreen';

// Auth Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Theme
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator com menu lateral
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#4a67af',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <Ionicons
            name="menu"
            size={28}
            color="#fff"
            style={{ marginLeft: 15 }}
            onPress={() => navigation.openDrawer()}
          />
        ),
        drawerActiveTintColor: '#4a67af',
        drawerInactiveTintColor: '#666',
        drawerStyle: {
          backgroundColor: '#fff',
        },
      })}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Calendario"
        component={CalendarioScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          title: 'Calendário',
        }}
      />
      <Drawer.Screen
        name="Contas"
        component={ContasScreen}
        options={({ navigation }) => ({
          drawerIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
          title: 'Contas',
          headerRight: () => (
            <Ionicons
              name="add"
              size={28}
              color="#fff"
              style={{ marginRight: 15 }}
              onPress={() => {
                // Navegar para Contas e abrir formulário
                navigation.navigate('Contas');
                // O componente ContasScreen vai gerenciar o estado do formulário
              }}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Receita"
        component={ReceitaScreen}
        options={({ navigation }) => ({
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
          title: 'Receitas',
          headerRight: () => (
            <Ionicons
              name="add"
              size={28}
              color="#fff"
              style={{ marginRight: 15 }}
              onPress={() => {
                // Navegar para Receita e abrir formulário
                navigation.navigate('Receita');
                // O componente ReceitaScreen vai gerenciar o estado do formulário
              }}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Despesa"
        component={DespesaScreen}
        options={({ navigation }) => ({
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trending-down" size={size} color={color} />
          ),
          title: 'Despesas',
          headerRight: () => (
            <Ionicons
              name="add"
              size={28}
              color="#fff"
              style={{ marginRight: 15 }}
              onPress={() => {
                // Navegar para Despesa e abrir formulário
                navigation.navigate('Despesa');
                // O componente DespesaScreen vai gerenciar o estado do formulário
              }}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="CalculadoraJuros"
        component={CalculadoraJurosScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
          title: 'Calculadora de Juros',
        }}
      />
      <Drawer.Screen
        name="CalculadoraRetiradas"
        component={CalculadoraRetiradasScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
          ),
          title: 'Calculadora de Retiradas',
        }}
      />
      <Drawer.Screen
        name="Configuracoes"
        component={ConfiguracoesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          title: 'Configurações',
        }}
      />
      <Drawer.Screen
        name="Sobre"
        component={SobreScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle" size={size} color={color} />
          ),
          title: 'Sobre',
        }}
      />
      <Drawer.Screen
        name="FaleConosco"
        component={FaleConoscoScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
          title: 'Fale Conosco',
        }}
      />
    </Drawer.Navigator>
  );
}

// Tab Navigator para rotas autenticadas (apenas Home e Contas)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Contas') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4a67af',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DrawerNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Navegar para a tela Home dentro do Drawer quando clicar na tab
            const parent = navigation.getParent();
            if (parent) {
              // Resetar navegação para Home
              parent.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Home',
                      state: {
                        routes: [{ name: 'Home' }],
                        index: 0,
                      },
                    },
                  ],
                })
              );
            }
          },
        })}
      />
      <Tab.Screen name="Contas" component={ContasScreen} />
    </Tab.Navigator>
  );
}

// Stack Navigator principal
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Você pode adicionar um componente de loading aqui
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Receita" component={ReceitaScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Despesa" component={DespesaScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FaleConosco" component={FaleConoscoScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
