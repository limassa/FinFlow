import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatarValor } from '../utils/formatters';
import { formatCurrency, parseCurrencyToNumber } from '../utils/currencyMask';
import { colors } from '../theme/theme';

/**
 * Calculadora: quanto investir por mês para atingir um total alvo.
 * PMT = FV * r / ((1+r)^n - 1), n = anos*12, r = taxa mensal (decimal)
 */
export default function CalculadoraAporteMetaScreen() {
  const navigation = useNavigation();
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (resultado && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [resultado]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Aporte para Meta',
    });
  }, [navigation]);

  const [formData, setFormData] = useState({
    taxaMensal: '0,60',
    anos: '30',
    totalAlvo: ''
  });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name, value) => {
    if (name === 'totalAlvo') {
      const numbers = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: formatCurrency(numbers) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calcular = () => {
    setLoading(true);
    setResultado(null);
    try {
      const taxaStr = (formData.taxaMensal || '0').replace(',', '.');
      const taxaMensalPct = parseFloat(taxaStr) || 0;
      const anos = parseInt(formData.anos, 10) || 0;
      const totalAlvo = parseCurrencyToNumber(formData.totalAlvo);

      if (totalAlvo <= 0) {
        Alert.alert('Erro', 'Informe o total alvo (valor positivo).');
        setLoading(false);
        return;
      }
      if (anos <= 0) {
        Alert.alert('Erro', 'Informe a quantidade de anos.');
        setLoading(false);
        return;
      }

      const r = taxaMensalPct / 100;
      const n = anos * 12;
      let pmt;
      if (r <= 0) {
        pmt = totalAlvo / n;
      } else {
        const fator = Math.pow(1 + r, n) - 1;
        pmt = (totalAlvo * r) / fator;
      }

      setResultado({
        aporteMensalNecessario: pmt,
        totalAlvo,
        anos,
        taxaMensal: taxaMensalPct,
        meses: n
      });
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro ao calcular. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView ref={scrollRef} style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Taxa real mensal (%)</Text>
          <TextInput
            style={styles.input}
            value={formData.taxaMensal}
            onChangeText={(value) => handleInputChange('taxaMensal', value)}
            placeholder="0,60"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Anos</Text>
          <TextInput
            style={styles.input}
            value={formData.anos}
            onChangeText={(value) => setFormData(prev => ({ ...prev, anos: value }))}
            placeholder="30"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total alvo (R$)</Text>
          <TextInput
            style={styles.input}
            value={formData.totalAlvo}
            onChangeText={(value) => handleInputChange('totalAlvo', value)}
            placeholder="900.000,00"
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={calcular}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="calculator" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Calcular</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {resultado && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado</Text>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Aporte mensal necessário</Text>
            <Text style={styles.resultValue}>
              {formatarValor(resultado.aporteMensalNecessario)}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Para atingir {formatarValor(resultado.totalAlvo)} em {resultado.anos} ano(s),
              com taxa de {resultado.taxaMensal}% ao mês, invista esse valor todo mês.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 20,
    paddingTop: 0,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
