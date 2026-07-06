// IMPORTANTE: gesture-handler DEVE ser importado ANTES de tudo
import 'react-native-gesture-handler';

import React from 'react';
import { TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
import AgendaScreen from './src/screens/AgendaScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import CalculadoraJurosScreen from './src/screens/CalculadoraJurosScreen';
import CalculadoraRetiradasScreen from './src/screens/CalculadoraRetiradasScreen';
import CalculadoraAporteMetaScreen from './src/screens/CalculadoraAporteMetaScreen';
import SobreScreen from './src/screens/SobreScreen';
import FaleConoscoScreen from './src/screens/FaleConoscoScreen';
import SairScreen from './src/screens/SairScreen';
import CalculadorasScreen from './src/screens/CalculadorasScreen';
import CalculadoraSalarioHoraScreen from './src/screens/CalculadoraSalarioHoraScreen';
import CategoriasScreen from './src/screens/CategoriasScreen';
import OrcamentoScreen from './src/screens/OrcamentoScreen';
import CartaoCreditoScreen from './src/screens/CartaoCreditoScreen';

// Auth Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import CustomDrawerContent from './src/components/CustomDrawerContent';

// Theme
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Stack da aba Home: Drawer + telas de Calculadoras (para manter menu horizontal visível)
function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2563EB' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CalculadoraJuros"
        component={CalculadoraJurosScreen}
        options={{ title: 'Calculadora de Juros' }}
      />
      <Stack.Screen
        name="CalculadoraRetiradas"
        component={CalculadoraRetiradasScreen}
        options={{ title: 'Calculadora de Retiradas' }}
      />
      <Stack.Screen
        name="CalculadoraSalarioHora"
        component={CalculadoraSalarioHoraScreen}
        options={{ title: 'Salário por Hora' }}
      />
      <Stack.Screen
        name="CalculadoraAporteMeta"
        component={CalculadoraAporteMetaScreen}
        options={{ title: 'Aporte para Meta' }}
      />
    </Stack.Navigator>
  );
}

// Drawer Navigator com menu lateral
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#2563EB',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15, padding: 5 }}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        ),
        drawerActiveTintColor: '#2563EB',
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
        name="Agenda"
        component={AgendaScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          title: 'Agenda',
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
            <TouchableOpacity
              onPress={() => navigation.navigate('Contas')}
              style={{ marginRight: 15, padding: 5 }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
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
            <TouchableOpacity
              onPress={() => navigation.navigate('Receita')}
              style={{ marginRight: 15, padding: 5 }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
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
            <TouchableOpacity
              onPress={() => navigation.navigate('Despesa')}
              style={{ marginRight: 15, padding: 5 }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="Categorias"
        component={CategoriasScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="pricetags" size={size} color={color} />
          ),
          title: 'Categorias',
        }}
      />
      <Drawer.Screen
        name="Orcamento"
        component={OrcamentoScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
          title: 'Orçamento',
        }}
      />
      <Drawer.Screen
        name="CartaoCredito"
        component={CartaoCreditoScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
          title: 'Cartão de Crédito',
        }}
      />
      <Drawer.Screen
        name="Calculadoras"
        component={CalculadorasScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
          title: 'Calculadoras',
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
        name="Configuracoes"
        component={ConfiguracoesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          title: 'Configurações',
        }}
      />
    </Drawer.Navigator>
  );
}

// Tab Navigator para rotas autenticadas (Home, Contas, Configurações, Sair)
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
          } else if (route.name === 'Configurações') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Sair') {
            iconName = 'log-out-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: { backgroundColor: '#2563EB' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const parent = navigation.getParent();
            if (parent) {
              parent.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Home',
                      state: {
                        routes: [{ name: 'Drawer' }],
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
      <Tab.Screen
        name="Contas"
        component={ContasScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Contas',
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={{ marginLeft: 15 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="Configurações"
        component={ConfiguracoesScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Configurações',
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={{ marginLeft: 15 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="Sair"
        component={SairScreen}
        options={{
          title: 'Sair',
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator principal
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.bootContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
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
