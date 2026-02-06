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
import { colors } from '../theme/theme';
import { Picker } from '@react-native-picker/picker';

export default function CalculadoraJurosScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Calculadora de Juros',
    });
  }, [navigation]);
  const [formData, setFormData] = useState({
    valorInicial: '',
    taxaJuros: '',
    tipoTaxa: 'anual',
    periodo: '',
    tipoPeriodo: 'meses',
    aporteMensal: ''
  });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (name === 'valorInicial' || name === 'aporteMensal') {
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

  const calcularJurosCompostos = () => {
    setLoading(true);
    
    try {
      const valorInicial = parseCurrency(formData.valorInicial);
      const taxaJuros = parseFloat(formData.taxaJuros) || 0;
      const periodo = parseInt(formData.periodo) || 0;
      const aporteMensal = parseCurrency(formData.aporteMensal);
      const tipoTaxa = formData.tipoTaxa;
      const tipoPeriodo = formData.tipoPeriodo;

      if (valorInicial <= 0 && aporteMensal <= 0) {
        Alert.alert('Erro', 'Por favor, informe pelo menos um valor inicial ou aporte mensal.');
        setLoading(false);
        return;
      }

      if (taxaJuros <= 0) {
        Alert.alert('Erro', 'Por favor, informe uma taxa de juros válida.');
        setLoading(false);
        return;
      }

      if (periodo <= 0) {
        Alert.alert('Erro', 'Por favor, informe um período válido.');
        setLoading(false);
        return;
      }

      let taxaMensal;
      if (tipoTaxa === 'anual') {
        taxaMensal = Math.pow(1 + taxaJuros / 100, 1/12) - 1;
      } else {
        taxaMensal = taxaJuros / 100;
      }

      let periodoMeses;
      if (tipoPeriodo === 'anos') {
        periodoMeses = periodo * 12;
      } else {
        periodoMeses = periodo;
      }
      
      let montanteFinal = valorInicial;
      let totalAportes = valorInicial;
      const detalhesMensais = [];

      for (let mes = 1; mes <= periodoMeses; mes++) {
        const montanteAntesJuros = montanteFinal;
        montanteFinal = montanteFinal * (1 + taxaMensal);
        const jurosMensal = montanteFinal - montanteAntesJuros;
        
        if (aporteMensal > 0) {
          montanteFinal += aporteMensal;
          totalAportes += aporteMensal;
        }

        const jurosAcumulado = montanteFinal - totalAportes;

        detalhesMensais.push({
          mes,
          totalInvestido: totalAportes,
          jurosMensal,
          montante: montanteFinal,
          jurosAcumulado
        });
      }

      const jurosTotais = montanteFinal - totalAportes;

      setResultado({
        montanteFinal,
        jurosTotais,
        totalAportes,
        periodo,
        tipoPeriodo,
        periodoMeses,
        taxaJuros,
        tipoTaxa,
        detalhesMensais
      });
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao calcular. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
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
          <Text style={styles.label}>Aporte Mensal (R$)</Text>
          <TextInput
            style={styles.input}
            value={formData.aporteMensal}
            onChangeText={(value) => handleInputChange('aporteMensal', value)}
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
          <Text style={styles.label}>Período</Text>
          <TextInput
            style={styles.input}
            value={formData.periodo}
            onChangeText={(value) => handleInputChange('periodo', value)}
            placeholder="0"
            keyboardType="numeric"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.tipoPeriodo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipoPeriodo: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Meses" value="meses" />
              <Picker.Item label="Anos" value="anos" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={calcularJurosCompostos}
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
            <Text style={styles.resultLabel}>Montante Final</Text>
            <Text style={styles.resultValue}>{formatarValor(resultado.montanteFinal)}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Total Investido</Text>
            <Text style={styles.resultValue}>{formatarValor(resultado.totalAportes)}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Juros Totais</Text>
            <Text style={[styles.resultValue, styles.resultPositive]}>
              {formatarValor(resultado.jurosTotais)}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Período: </Text>
              {resultado.periodo} {resultado.tipoPeriodo === 'anos' ? 'ano(s)' : 'mês(es)'} ({resultado.periodoMeses} meses)
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Taxa: </Text>
              {resultado.taxaJuros}% {resultado.tipoTaxa === 'anual' ? 'ao ano' : 'ao mês'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Rentabilidade: </Text>
              {((resultado.jurosTotais / resultado.totalAportes) * 100).toFixed(2)}%
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
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
  resultPositive: {
    color: '#4caf50',
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
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#333',
  },
});

