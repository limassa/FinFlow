import React, { useMemo, useState } from 'react';
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
  ActivityIndicator,
  Linking,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  { icon: 'cash-outline', label: 'Controle de Receitas' },
  { icon: 'card-outline', label: 'Gestão de Despesas' },
  { icon: 'bar-chart-outline', label: 'Relatórios Detalhados' },
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(email, senha);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Erro ao fazer login');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo_nova.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoTitle}>Claricash</Text>
          <Text style={styles.logoSubtitle}>Controle Financeiro</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            selectionColor={colors.primary}
          />

          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Senha"
              placeholderTextColor={colors.placeholder}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              selectionColor={colors.primary}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setMostrarSenha(!mostrarSenha)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Text style={styles.linkText}>
              Não tem uma conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.blueFooter}>
          <View style={styles.features}>
            {FEATURES.map((item) => (
              <View key={item.label} style={styles.featureItem}>
                <Ionicons name={item.icon} size={18} color="#fff" />
                <Text style={styles.featureText}>{item.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.developedBy}
            onPress={() => Linking.openURL('https://lizsoftware.com.br')}
            activeOpacity={0.7}
          >
            <Text style={styles.developedByLabel}>Desenvolvido por</Text>
            <Text style={styles.developedByLink}>Liz Software</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
      paddingBottom: 0,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
      marginTop: 20,
    },
    logoImage: {
      width: 120,
      height: 120,
    },
    logoTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary,
      marginTop: 16,
    },
    logoSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    formContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      fontSize: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    passwordWrapper: {
      position: 'relative',
      marginBottom: 16,
    },
    passwordInput: {
      marginBottom: 0,
      paddingRight: 48,
    },
    eyeButton: {
      position: 'absolute',
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
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
      alignItems: 'center',
    },
    linkText: {
      color: colors.primary,
      fontSize: 14,
    },
    forgotPasswordButton: {
      alignSelf: 'flex-end',
      marginBottom: 16,
      marginTop: -8,
    },
    forgotPasswordText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    blueFooter: {
      marginTop: 24,
      marginHorizontal: -20,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 36,
      backgroundColor: '#2563EB',
      alignItems: 'center',
    },
    features: {
      width: '100%',
      marginBottom: 8,
      gap: 10,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    featureText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    developedBy: {
      marginTop: 20,
      alignItems: 'center',
    },
    developedByLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
      marginBottom: 6,
    },
    developedByLink: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '700',
    },
  });
}
