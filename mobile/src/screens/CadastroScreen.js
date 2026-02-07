import React, { useState, useMemo } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import { formatarTelefone, removerFormatacaoTelefone } from '../utils/formatters';

// Requisitos de senha (mesma lógica do web)
const getRequisitosSenha = (senha) => {
  const req = [];
  req.push({ text: 'Pelo menos 8 caracteres', valid: senha.length >= 8 });
  req.push({ text: 'Pelo menos uma letra maiúscula', valid: /[A-Z]/.test(senha) });
  req.push({ text: 'Pelo menos uma letra minúscula', valid: /[a-z]/.test(senha) });
  req.push({ text: 'Pelo menos um número', valid: /\d/.test(senha) });
  req.push({ text: 'Pelo menos um caractere especial (!@#$%^&*...)', valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha) });
  const commonSequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
  const hasSeq = commonSequences.some(s => senha.toLowerCase().includes(s));
  req.push({ text: 'Não pode conter sequências comuns (123, abc)', valid: !hasSeq });
  let repeated = false;
  for (let i = 0; i < senha.length - 2; i++) {
    if (senha[i] === senha[i + 1] && senha[i] === senha[i + 2]) { repeated = true; break; }
  }
  req.push({ text: 'Não pode conter 3 caracteres repetidos', valid: !repeated });
  return req;
};

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { cadastro } = useAuth();

  const requisitosSenha = useMemo(() => getRequisitosSenha(senha), [senha]);
  const senhaOk = useMemo(() => requisitosSenha.every(r => r.valid), [requisitosSenha]);

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }
    if (senha !== senhaConfirm) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    if (!senhaOk) {
      Alert.alert('Erro', 'A senha não atende a todos os requisitos de segurança');
      return;
    }

    setLoading(true);
    const result = await cadastro(nome, email, removerFormatacaoTelefone(telefone), senha);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Erro ao cadastrar');
    } else {
      Alert.alert('Sucesso', 'Cadastro realizado! Faça login para acessar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Cadastre-se no Claricash</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor={colors.placeholder}
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone (opcional)"
            placeholderTextColor={colors.placeholder}
            value={telefone}
            onChangeText={(v) => setTelefone(formatarTelefone(v))}
            keyboardType="phone-pad"
            maxLength={15}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.placeholder}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
          />
          {senha.length > 0 && (
            <View style={styles.requisitosBox}>
              <Text style={styles.requisitosTitle}>Requisitos:</Text>
              {requisitosSenha.map((r, i) => (
                <View key={i} style={styles.requisitoRow}>
                  <Ionicons
                    name={r.valid ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={r.valid ? '#22c55e' : colors.textSecondary}
                  />
                  <Text style={[styles.requisitoText, r.valid && styles.requisitoOk]}>{r.text}</Text>
                </View>
              ))}
            </View>
          )}

          <TextInput
            style={[styles.input, senhaConfirm && senha !== senhaConfirm && styles.inputError]}
            placeholder="Confirmar senha"
            placeholderTextColor={colors.placeholder}
            value={senhaConfirm}
            onChangeText={setSenhaConfirm}
            secureTextEntry
            autoCapitalize="none"
          />
          {senhaConfirm && senha !== senhaConfirm && (
            <Text style={styles.errorMsg}>As senhas não coincidem.</Text>
          )}

          <TouchableOpacity
            style={[styles.button, (loading || !senhaOk || senha !== senhaConfirm) && styles.buttonDisabled]}
            onPress={handleCadastro}
            disabled={loading || !senhaOk || senha !== senhaConfirm}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Já tem uma conta? Faça login
            </Text>
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
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
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
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
  },
  requisitosBox: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  requisitosTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  requisitoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requisitoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  requisitoOk: {
    color: '#22c55e',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorMsg: {
    fontSize: 12,
    color: colors.error,
    marginTop: -8,
    marginBottom: 12,
  },
});

