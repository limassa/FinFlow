import React, { useState, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatarValor } from '../utils/formatters';

const parseCurrency = (value) => {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};

const formatCurrencyInput = (value) => {
  if (!value) return '';
  const onlyNumbers = value.replace(/\D/g, '');
  if (onlyNumbers.length === 0) return '';
  const num = parseInt(onlyNumbers, 10) / 100;
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function CalculadoraSalarioHoraScreen() {
  const navigation = useNavigation();
  const scrollRef = React.useRef(null);
  const [salarioMensal, setSalarioMensal] = useState('');
  const [horasPorMes, setHorasPorMes] = useState('220');
  const [resultado, setResultado] = useState(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  React.useEffect(() => {
    if (resultado && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [resultado]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Salário por Hora',
    });
  }, [navigation]);

  const handleSalarioChange = (value) => {
    const formatted = formatCurrencyInput(value);
    setSalarioMensal(formatted);
    setResultado(null);
  };

  const calcular = () => {
    const salario = parseCurrency(salarioMensal);
    const horas = parseFloat(horasPorMes.replace(',', '.')) || 0;

    if (salario <= 0) {
      Alert.alert('Atenção', 'Informe o salário mensal.');
      return;
    }
    if (horas <= 0) {
      Alert.alert('Atenção', 'Informe a quantidade de horas por mês (ex: 220 para 44h/semana).');
      return;
    }

    const valorHora = salario / horas;
    setResultado({
      valorHora,
      salario,
      horasPorMes: horas,
    });
  };

  const limpar = () => {
    setSalarioMensal('');
    setHorasPorMes('220');
    setResultado(null);
  };

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Use 220 horas para carga de 44h/semana ou 200h para 40h/semana (média mensal).
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Salário mensal (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          placeholderTextColor={colors.placeholder}
          value={salarioMensal}
          onChangeText={handleSalarioChange}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Horas trabalhadas por mês</Text>
        <TextInput
          style={styles.input}
          placeholder="220"
          placeholderTextColor={colors.placeholder}
          value={horasPorMes}
          onChangeText={(v) => {
            setHorasPorMes(v.replace(/[^\d,.]/g, '').replace(',', '.'));
            setResultado(null);
          }}
          keyboardType="decimal-pad"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={calcular}>
        <Ionicons name="calculator" size={22} color="#fff" />
        <Text style={styles.buttonText}>Calcular</Text>
      </TouchableOpacity>

      {resultado && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Valor por hora</Text>
          <Text style={styles.resultValue}>{formatarValor(resultado.valorHora)}</Text>
          <Text style={styles.resultDetail}>
            {formatarValor(resultado.salario)} ÷ {resultado.horasPorMes} h/mês
          </Text>
          <TouchableOpacity style={styles.limparButton} onPress={limpar}>
            <Text style={styles.limparText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    marginTop: 24,
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  resultDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  limparButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  limparText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
}
