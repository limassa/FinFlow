import React, { useState, useLayoutEffect, useMemo } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatarValor } from '../utils/formatters';
import { Picker } from '@react-native-picker/picker';

export default function CalculadoraRetiradasScreen() {
  const navigation = useNavigation();
  const scrollRef = React.useRef(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [formData, setFormData] = useState({
    valorInicial: '',
    retiradaMensal: '',
    taxaJuros: '',
    tipoTaxa: 'anual',
    tempoRetirada: '',
    tipoTempo: 'anos'
  });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (resultado && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [resultado]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Calculadora de Retiradas',
    });
  }, [navigation]);

  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleInputChange = (name, value) => {
    if (name === 'valorInicial' || name === 'retiradaMensal') {
      let cleanValue = value.replace(/[^\d]/g, '');
      if (!cleanValue) {
        cleanValue = '000';
      }
      while (cleanValue.length < 3) {
        cleanValue = '0' + cleanValue;
      }
      const formatted = (parseInt(cleanValue) / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calcularRetiradas = () => {
    setLoading(true);
    
    try {
      const valorInicial = parseCurrency(formData.valorInicial);
      const retiradaMensal = parseCurrency(formData.retiradaMensal);
      const taxaJuros = parseFloat(formData.taxaJuros) || 0;
      const tempoRetirada = parseInt(formData.tempoRetirada) || 0;
      const tipoTaxa = formData.tipoTaxa;
      const tipoTempo = formData.tipoTempo;

      if (valorInicial <= 0) {
        Alert.alert('Erro', 'Por favor, informe um valor inicial válido.');
        setLoading(false);
        return;
      }

      if (retiradaMensal <= 0) {
        Alert.alert('Erro', 'Por favor, informe um valor de retirada mensal válido.');
        setLoading(false);
        return;
      }

      if (taxaJuros <= 0) {
        Alert.alert('Erro', 'Por favor, informe uma taxa de juros válida.');
        setLoading(false);
        return;
      }

      if (tempoRetirada <= 0) {
        Alert.alert('Erro', 'Por favor, informe um tempo de retirada válido.');
        setLoading(false);
        return;
      }

      let taxaMensal;
      if (tipoTaxa === 'anual') {
        taxaMensal = Math.pow(1 + taxaJuros / 100, 1/12) - 1;
      } else {
        taxaMensal = taxaJuros / 100;
      }

      let tempoMeses;
      if (tipoTempo === 'anos') {
        tempoMeses = tempoRetirada * 12;
      } else {
        tempoMeses = tempoRetirada;
      }

      let saldoAtual = valorInicial;
      let totalRetirado = 0;
      const detalhesMensais = [];
      let jurosTotais = 0;
      
      for (let mes = 1; mes <= tempoMeses; mes++) {
        const saldoAntesJuros = saldoAtual;
        saldoAtual = saldoAtual * (1 + taxaMensal);
        const juros = saldoAtual - saldoAntesJuros;
        jurosTotais += juros;
        
        if (saldoAtual >= retiradaMensal) {
          saldoAtual -= retiradaMensal;
          totalRetirado += retiradaMensal;
        } else {
          const retirado = saldoAtual;
          saldoAtual = 0;
          totalRetirado += retirado;
        }

        detalhesMensais.push({
          mes,
          juros,
          saldo: saldoAtual,
          retirado: mes <= tempoMeses ? retiradaMensal : 0
        });

        if (saldoAtual <= 0) {
          break;
        }
      }

      setResultado({
        valorInicial,
        retiradaMensal,
        tempoRetirada,
        tipoTempo,
        tempoMeses,
        taxaJuros,
        tipoTaxa,
        totalRetirado,
        jurosTotais,
        saldoFinal: saldoAtual,
        detalhesMensais
      });
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao calcular. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView ref={scrollRef} style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor Inicial (R$)</Text>
          <TextInput
            style={styles.input}
            value={formData.valorInicial}
            onChangeText={(value) => handleInputChange('valorInicial', value)}
            placeholder="0,00"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Retirada Mensal (R$)</Text>
          <TextInput
            style={styles.input}
            value={formData.retiradaMensal}
            onChangeText={(value) => handleInputChange('retiradaMensal', value)}
            placeholder="0,00"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Taxa de Juros (%)</Text>
          <TextInput
            style={styles.input}
            value={formData.taxaJuros}
            onChangeText={(value) => handleInputChange('taxaJuros', value)}
            placeholder="0,00"
            keyboardType="numeric"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.tipoTaxa}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipoTaxa: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Ao ano" value="anual" />
              <Picker.Item label="Ao mês" value="mensal" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tempo de Retirada</Text>
          <TextInput
            style={styles.input}
            value={formData.tempoRetirada}
            onChangeText={(value) => handleInputChange('tempoRetirada', value)}
            placeholder="0"
            keyboardType="numeric"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.tipoTempo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipoTempo: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Meses" value="meses" />
              <Picker.Item label="Anos" value="anos" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={calcularRetiradas}
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
            <Text style={styles.resultLabel}>Saldo Final</Text>
            <Text style={styles.resultValue}>{formatarValor(resultado.saldoFinal)}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Total Retirado</Text>
            <Text style={styles.resultValue}>{formatarValor(resultado.totalRetirado)}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Juros Totais</Text>
            <Text style={[styles.resultValue, styles.resultPositive]}>
              {formatarValor(resultado.jurosTotais)}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Valor Inicial: </Text>
              {formatCurrency(resultado.valorInicial)}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Retirada Mensal: </Text>
              {formatCurrency(resultado.retiradaMensal)}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Tempo: </Text>
              {resultado.tempoRetirada} {resultado.tipoTempo === 'anos' ? 'ano(s)' : 'mês(es)'} ({resultado.tempoMeses} meses)
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Taxa: </Text>
              {resultado.taxaJuros}% {resultado.tipoTaxa === 'anual' ? 'ao ano' : 'ao mês'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Rentabilidade: </Text>
              {((resultado.jurosTotais / resultado.valorInicial) * 100).toFixed(2)}%
            </Text>
          </View>
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 8,
  },
  picker: {
    height: 50,
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
    color: colors.text,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultPositive: {
    color: colors.success,
  },
  infoCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: '600',
    color: colors.text,
  },
});
}
