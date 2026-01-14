import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { colors } from '../theme/theme';
import { formatarTelefone } from '../utils/formatters';

export default function FaleConoscoScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: '',
    mensagem: ''
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Fale Conosco',
    });
  }, [navigation]);

  const handleChange = (field, value) => {
    if (field === 'telefone') {
      // Formatar telefone enquanto digita
      const formatted = formatarTelefone(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    // Validação
    if (!formData.nome || !formData.email || !formData.mensagem) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Atenção', 'Por favor, insira um email válido.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.FALE_CONOSCO, formData);

      if (response.data.status === 'success' || response.data.message) {
        Alert.alert(
          'Sucesso!',
          'Mensagem enviada com sucesso! Entraremos em contato em breve.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpar formulário
                setFormData({
                  nome: '',
                  email: '',
                  telefone: '',
                  tipo: '',
                  mensagem: ''
                });
                // Voltar para tela anterior
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Erro ao enviar mensagem. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao enviar mensagem. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubbles" size={48} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Fale Conosco</Text>
          <Text style={styles.headerSubtitle}>
            Sua opinião é muito importante para nós
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={colors.primary} />
            <Text style={styles.statLabel}>Suporte</Text>
            <Text style={styles.statValue}>24/7</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="mail" size={24} color={colors.primary} />
            <Text style={styles.statLabel}>Resposta</Text>
            <Text style={styles.statValue}>24h</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Envie sua mensagem</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              placeholderTextColor={colors.textSecondary}
              value={formData.nome}
              onChangeText={(value) => handleChange('nome', value)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(99) 99999-9999"
              placeholderTextColor={colors.textSecondary}
              value={formData.telefone}
              onChangeText={(value) => handleChange('telefone', value)}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Contato</Text>
            <View style={styles.selectContainer}>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipo === 'sugestao' && styles.selectOptionActive
                ]}
                onPress={() => handleChange('tipo', 'sugestao')}
                disabled={loading}
              >
                <Text style={[
                  styles.selectOptionText,
                  formData.tipo === 'sugestao' && styles.selectOptionTextActive
                ]}>
                  Sugestão
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipo === 'duvida' && styles.selectOptionActive
                ]}
                onPress={() => handleChange('tipo', 'duvida')}
                disabled={loading}
              >
                <Text style={[
                  styles.selectOptionText,
                  formData.tipo === 'duvida' && styles.selectOptionTextActive
                ]}>
                  Dúvida
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipo === 'problema' && styles.selectOptionActive
                ]}
                onPress={() => handleChange('tipo', 'problema')}
                disabled={loading}
              >
                <Text style={[
                  styles.selectOptionText,
                  formData.tipo === 'problema' && styles.selectOptionTextActive
                ]}>
                  Problema
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.selectContainer}>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipo === 'elogio' && styles.selectOptionActive
                ]}
                onPress={() => handleChange('tipo', 'elogio')}
                disabled={loading}
              >
                <Text style={[
                  styles.selectOptionText,
                  formData.tipo === 'elogio' && styles.selectOptionTextActive
                ]}>
                  Elogio
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipo === 'outro' && styles.selectOptionActive
                ]}
                onPress={() => handleChange('tipo', 'outro')}
                disabled={loading}
              >
                <Text style={[
                  styles.selectOptionText,
                  formData.tipo === 'outro' && styles.selectOptionTextActive
                ]}>
                  Outro
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mensagem *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Digite sua mensagem, sugestão ou dúvida..."
              placeholderTextColor={colors.textSecondary}
              value={formData.mensagem}
              onChangeText={(value) => handleChange('mensagem', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={styles.submitIcon} />
                <Text style={styles.submitButtonText}>Enviar Mensagem</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  selectOption: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectOptionTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

