import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GraficoEvolucaoMensal from '../components/GraficoEvolucaoMensal';
import GraficosPizza from '../components/GraficosPizza';
import { useTheme } from '../context/ThemeContext';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Dashboard',
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Acompanhe a evolução e a distribuição das suas finanças.</Text>
        <View style={styles.chartsContainer}>
          <GraficoEvolucaoMensal />
          <GraficosPizza />
        </View>
      </ScrollView>
    </View>
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
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    chartsContainer: {
      gap: 8,
    },
  });
}
