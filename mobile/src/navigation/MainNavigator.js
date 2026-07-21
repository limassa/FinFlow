import React, { useRef } from 'react';
import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ReceitaScreen from '../screens/ReceitaScreen';
import DespesaScreen from '../screens/DespesaScreen';
import ContasScreen from '../screens/ContasScreen';
import CalendarioScreen from '../screens/CalendarioScreen';
import AgendaScreen from '../screens/AgendaScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import CalculadoraJurosScreen from '../screens/CalculadoraJurosScreen';
import CalculadoraRetiradasScreen from '../screens/CalculadoraRetiradasScreen';
import CalculadoraAporteMetaScreen from '../screens/CalculadoraAporteMetaScreen';
import SobreScreen from '../screens/SobreScreen';
import FaleConoscoScreen from '../screens/FaleConoscoScreen';
import SairScreen from '../screens/SairScreen';
import CalculadorasScreen from '../screens/CalculadorasScreen';
import CalculadoraSalarioHoraScreen from '../screens/CalculadoraSalarioHoraScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import OrcamentoScreen from '../screens/OrcamentoScreen';
import CartaoCreditoScreen from '../screens/CartaoCreditoScreen';
import AppMenuModal from '../components/AppMenuModal';
import { HeaderIconButton } from '../components/HeaderIconButton';
import { MenuProvider, useMenu } from '../context/MenuContext';
import { getMenuScreenOptions } from './menuHeaderOptions';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainMenuStack() {
  const { openMenu } = useMenu();

  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Calendario"
        component={CalendarioScreen}
        options={getMenuScreenOptions(openMenu, () => ({ title: 'Calendário' }))}
      />
      <Stack.Screen
        name="Agenda"
        component={AgendaScreen}
        options={getMenuScreenOptions(openMenu, () => ({ title: 'Agenda' }))}
      />
      <Stack.Screen
        name="Contas"
        component={ContasScreen}
        options={getMenuScreenOptions(openMenu, () => ({
          title: 'Contas',
        }))}
      />
      <Stack.Screen
        name="Receita"
        component={ReceitaScreen}
        options={getMenuScreenOptions(openMenu, () => ({
          title: 'Receitas',
        }))}
      />
      <Stack.Screen
        name="Despesa"
        component={DespesaScreen}
        options={getMenuScreenOptions(openMenu, () => ({
          title: 'Despesas',
        }))}
      />
      <Stack.Screen
        name="Categorias"
        component={CategoriasScreen}
        options={getMenuScreenOptions(openMenu, () => ({ title: 'Categorias' }))}
      />
      <Stack.Screen
        name="Orcamento"
        component={OrcamentoScreen}
        options={getMenuScreenOptions(openMenu, () => ({ title: 'Orçamento' }))}
      />
      <Stack.Screen
        name="CartaoCredito"
        component={CartaoCreditoScreen}
        options={getMenuScreenOptions(openMenu, () => ({ title: 'Cartão de Crédito' }))}
      />
      <Stack.Screen
        name="Calculadoras"
        component={CalculadorasScreen}
        options={getMenuScreenOptions(openMenu, () => ({ title: 'Calculadoras' }))}
      />
      <Stack.Screen
        name="Sobre"
        component={SobreScreen}
        options={getMenuScreenOptions(openMenu, () => ({ title: 'Sobre' }))}
      />
      <Stack.Screen
        name="Configuracoes"
        component={ConfiguracoesScreen}
        options={getMenuScreenOptions(openMenu, () => ({ title: 'Configurações' }))}
      />
    </Stack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2563EB' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="MainMenu" component={MainMenuStack} options={{ headerShown: false }} />
      <Stack.Screen name="CalculadoraJuros" component={CalculadoraJurosScreen} options={{ title: 'Calculadora de Juros' }} />
      <Stack.Screen name="CalculadoraRetiradas" component={CalculadoraRetiradasScreen} options={{ title: 'Calculadora de Retiradas' }} />
      <Stack.Screen name="CalculadoraSalarioHora" component={CalculadoraSalarioHoraScreen} options={{ title: 'Salário por Hora' }} />
      <Stack.Screen name="CalculadoraAporteMeta" component={CalculadoraAporteMetaScreen} options={{ title: 'Aporte para Meta' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { openMenu } = useMenu();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Contas') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'Configurações') iconName = focused ? 'settings' : 'settings-outline';
          else if (route.name === 'Sair') iconName = 'log-out-outline';
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
          tabPress: () => {
            const parent = navigation.getParent();
            if (parent) {
              parent.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Home',
                      state: { routes: [{ name: 'MainMenu', state: { routes: [{ name: 'Home' }], index: 0 } }], index: 0 },
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
        options={{
          headerShown: true,
          title: 'Contas',
          headerLeft: () => (
            <HeaderIconButton name="menu" side="left" onPress={openMenu} />
          ),
        }}
      />
      <Tab.Screen
        name="Configurações"
        component={ConfiguracoesScreen}
        options={{
          headerShown: true,
          title: 'Configurações',
          headerLeft: () => (
            <HeaderIconButton name="menu" side="left" onPress={openMenu} />
          ),
        }}
      />
      <Tab.Screen
        name="Sair"
        component={SairScreen}
        options={{ title: 'Sair' }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Receita" component={ReceitaScreen} />
      <Stack.Screen name="Despesa" component={DespesaScreen} />
      <Stack.Screen name="FaleConosco" component={FaleConoscoScreen} />
    </Stack.Navigator>
  );
}

function MainNavigationTree() {
  return (
    <>
      <MainStack />
      <AppMenuModal />
    </>
  );
}

export default function MainNavigator() {
  const navigationRef = useRef(null);

  return (
    <NavigationContainer ref={navigationRef}>
      <MenuProvider navigationRef={navigationRef}>
        <MainNavigationTree />
      </MenuProvider>
    </NavigationContainer>
  );
}
