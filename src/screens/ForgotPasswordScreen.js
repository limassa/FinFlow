import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { colors } from '../theme/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um email vâ”œÃ­lido');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });

      if (response.data.message) {
        setMessage(response.data.message);
        Alert.alert(
          'Sucesso',
          'Email de redefiniâ”œÂºâ”œÃºo enviado! Verifique sua caixa de entrada.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao processar solicitaâ”œÂºâ”œÃºo';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo do App */}
        <View style={styles.logoContainer}>
          <Svg width="80" height="80" viewBox="0 0 80 80">
            <Defs>
              <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#667eea" stopOpacity="1" />
                <Stop offset="100%" stopColor="#764ba2" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Circle cx="40" cy="40" r="36" fill="url(#logoGradient)" />
            <Path d="M 16 30 L 40 16 L 64 30 L 40 44 Z" fill="white" opacity="0.9" />
            <Path d="M 16 50 L 40 64 L 64 50 L 40 36 Z" fill="white" opacity="0.7" />
            <Path d="M 40 16 L 40 64" stroke="white" strokeWidth="4" fill="none" opacity="0.8" />
          </Svg>
          <Text style={styles.logoTitle}>Claricash</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Esqueceu sua senha?</Text>
          <Text style={styles.subtitle}>
            Nâ”œÃºo se preocupe! Digite seu email e enviaremos um link para redefinir sua senha.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          {message ? (
            <View style={styles.messageContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar email de redefiniâ”œÂºâ”œÃºo</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={16} color={colors.primary} />
            <Text style={styles.linkText}>Voltar ao login</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 16,
  },
  formContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  messageText: {
    color: '#2e7d32',
    fontSize: 14,
    flex: 1,
  },
});

