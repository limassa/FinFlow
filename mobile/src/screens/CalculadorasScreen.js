import React, { useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const calculadoras = [
  {
    id: 'juros',
    name: 'Calculadora de Juros',
    description: 'O que é: Simula quanto seu dinheiro cresce com juros compostos ao longo do tempo. Informe valor inicial, taxa e período.',
    icon: 'calculator',
    route: 'CalculadoraJuros',
  },
  {
    id: 'retiradas',
    name: 'Calculadora de Retiradas',
    description: 'O que é: Calcula quanto você pode sacar por mês de um investimento sem zerar o saldo. Ideal para planejar aposentadoria.',
    icon: 'cash',
    route: 'CalculadoraRetiradas',
  },
  {
    id: 'aporte-meta',
    name: 'Aporte para Meta',
    description: 'O que é: Descobre quanto precisa investir por mês para alcançar um valor-alvo no futuro, considerando juros.',
    icon: 'trending-up',
    route: 'CalculadoraAporteMeta',
  },
  {
    id: 'salario-hora',
    name: 'Salário por Hora',
    description: 'O que é: Converte seu salário mensal em valor por hora trabalhada, útil para freelancers e comparações.',
    icon: 'time',
    route: 'CalculadoraSalarioHora',
  },
];

export default function CalculadorasScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Calculadoras',
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Escolha uma calculadora</Text>
      {calculadoras.map((calc) => (
        <TouchableOpacity
          key={calc.id}
          style={styles.card}
          onPress={() => {
            // Navegar no Stack da aba Home para manter o menu horizontal (tabs) visível
            const parent = navigation.getParent();
            if (parent) {
              parent.navigate(calc.route);
            } else {
              navigation.navigate(calc.route);
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={calc.icon} size={32} color={colors.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{calc.name}</Text>
            <Text style={styles.cardDescription}>{calc.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
}
