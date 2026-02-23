import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { colors } from '../theme/theme';
import { formatarTelefone, removerFormatacaoTelefone } from '../utils/formatters';
import TimePicker from '../components/TimePicker';

export default function ConfiguracoesScreen() {
  const navigation = useNavigation();
  const { user, logout, getUserId } = useAuth();
  const userId = getUserId();
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Configurações',
    });
  }, [navigation]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('perfil');
  const [showPassword, setShowPassword] = useState(false);

  // Estados do formulário de perfil
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  // Configurações de lembretes
  const [lembretesConfig, setLembretesConfig] = useState({
    lembretesAtivos: true,
    lembretesEmail: true,
    lembretesWhatsApp: false,
    lembretesDiasAntes: 5,
    lembretesHorario: '18:15'
  });

  // Versão do sistema
  const [versao, setVersao] = useState(null);

  // Foto do perfil
  const [userFoto, setUserFoto] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // Configurações de privacidade
  const [privacidadeConfig, setPrivacidadeConfig] = useState({
    dadosAnonimos: false,
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    if (userId) {
      carregarConfiguracoes();
    }
  }, [userId]);

  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      const [lembretesRes, perfilRes, versaoRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.USER_LEMBRETES}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.USER_PROFILE}?userId=${userId}`),
        axios.get(API_ENDPOINTS.VERSAO_MOBILE).catch(() => ({ data: { success: false } }))
      ]);
      
      // Carregar versão mobile
      if (versaoRes.data.success && versaoRes.data.versao) {
        setVersao(versaoRes.data.versao);
      } else {
        // Versão padrão em caso de erro
        setVersao({
          versao_mobile: 'M.1.1.01',
          versao_nome: 'Claricash Mobile'
        });
      }

      if (lembretesRes.data) {
        setLembretesConfig(prev => ({
          ...prev,
          lembretesAtivos: lembretesRes.data.lembretesAtivos ?? true,
          lembretesEmail: lembretesRes.data.lembretesEmail ?? true,
          lembretesWhatsApp: lembretesRes.data.lembretesWhatsApp ?? false, // Campo preparado para futuro
          lembretesDiasAntes: lembretesRes.data.lembretesDiasAntes || 5,
          lembretesHorario: lembretesRes.data.lembretesHorario || '18:15'
        }));
      }

      if (perfilRes.data) {
        console.log('📊 Dados do perfil recebidos (Mobile):', perfilRes.data);
        setFormData(prev => ({
          ...prev,
          nome: perfilRes.data.nome || '',
          email: perfilRes.data.email || '',
          telefone: perfilRes.data.telefone ? formatarTelefone(perfilRes.data.telefone) : ''
        }));
      }
      const fotoRes = await axios.get(`${API_ENDPOINTS.USER_FOTO}?userId=${userId}`);
      if (fotoRes.data?.foto) setUserFoto(fotoRes.data.foto);
      if (!perfilRes.data) {
        console.error('❌ Erro ao buscar perfil: resposta vazia');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarFoto = async () => {
    if (!userId) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão', 'É necessário permitir acesso à galeria para alterar a foto.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const uri = result.assets[0].uri;
      setUploadingFoto(true);
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      await axios.put(API_ENDPOINTS.USER_FOTO, { userId, foto: base64 });
      setUserFoto(base64);
      Alert.alert('Sucesso', 'Foto atualizada!');
    } catch (err) {
      console.error('Erro ao alterar foto:', err);
      Alert.alert('Erro', 'Não foi possível salvar a foto.');
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleSalvarPerfil = async () => {
    if (formData.novaSenha && formData.novaSenha !== formData.confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId,
        nome: formData.nome,
        email: formData.email,
        telefone: removerFormatacaoTelefone(formData.telefone), // Remove máscara antes de enviar
      };

      // Só incluir senhas se foram preenchidas
      if (formData.senhaAtual) {
        payload.senhaAtual = formData.senhaAtual;
      }
      if (formData.novaSenha) {
        payload.novaSenha = formData.novaSenha;
      }

      console.log('📤 Enviando atualização de perfil:', { userId, nome: payload.nome, email: payload.email });
      
      const response = await axios.put(API_ENDPOINTS.USER_PROFILE, payload);

      if (response.data) {
        console.log('📊 Perfil atualizado - resposta do servidor:', response.data);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        
        // Recarregar dados do servidor para garantir sincronização
        await carregarConfiguracoes();
        
        // Limpar campos de senha
        setFormData(prev => ({ ...prev, senhaAtual: '', novaSenha: '', confirmarSenha: '' }));
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      let errorMessage = 'Erro ao atualizar perfil';
      
      if (error.response) {
        // Erro com resposta do servidor
        errorMessage = error.response.data?.error || error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // Erro de rede (sem resposta)
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else {
        // Outro tipo de erro
        errorMessage = error.message || 'Erro desconhecido ao atualizar perfil';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarLembretes = async () => {
    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
      return;
    }

    // Validar dias antes do vencimento
    const dias = typeof lembretesConfig.lembretesDiasAntes === 'string' 
      ? parseInt(lembretesConfig.lembretesDiasAntes) 
      : lembretesConfig.lembretesDiasAntes;
    
    if (!dias || dias < 1) {
      Alert.alert('Erro', 'O número de dias antes do vencimento deve ser maior ou igual a 1');
      return;
    }

    // Garantir que dias seja um número válido
    const configToSave = {
      ...lembretesConfig,
      lembretesDiasAntes: dias
    };

    setLoading(true);
    try {
      console.log('📤 Enviando configurações de lembretes:', { userId, ...configToSave });
      
      const response = await axios.put(API_ENDPOINTS.USER_LEMBRETES, {
        userId,
        ...configToSave
      });

      if (response.data) {
        console.log('✅ Configurações salvas:', response.data);
        Alert.alert('Sucesso', 'Configurações de lembretes salvas!');
        // Recarregar configurações para garantir sincronização
        await carregarConfiguracoes();
      }
    } catch (error) {
      console.error('❌ Erro ao salvar lembretes:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      let errorMessage = 'Erro ao salvar configurações';
      
      if (error.response) {
        // Erro com resposta do servidor
        errorMessage = error.response.data?.error || error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`;
        
        // Se o erro for sobre a coluna WhatsApp não existir, mostrar mensagem específica
        // Mas só se realmente for esse o erro (não mostrar se for outro tipo de erro)
        if (errorMessage.includes('coluna') && (errorMessage.includes('does not exist') || errorMessage.includes('não foi criada'))) {
          Alert.alert(
            'Atenção', 
            'A coluna de WhatsApp precisa ser criada no banco de dados. Execute o script adicionar-coluna-whatsapp.js primeiro.'
          );
          setLoading(false);
          return;
        }
      } else if (error.request) {
        // Erro de rede (sem resposta)
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else {
        // Outro tipo de erro
        errorMessage = error.message || 'Erro desconhecido ao salvar configurações';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarPrivacidade = async () => {
    // Por enquanto, apenas mostra mensagem (privacidade pode não ter endpoint no backend ainda)
    Alert.alert('Info', 'Configurações de privacidade salvas!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Tabs de Navegação */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'perfil' && styles.tabActive]}
            onPress={() => setActiveTab('perfil')}
          >
            <Ionicons 
              name={activeTab === 'perfil' ? 'person' : 'person-outline'} 
              size={20} 
              color={activeTab === 'perfil' ? '#fff' : colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'perfil' && styles.tabTextActive]}>
              Perfil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'lembretes' && styles.tabActive]}
            onPress={() => setActiveTab('lembretes')}
          >
            <Ionicons 
              name={activeTab === 'lembretes' ? 'notifications' : 'notifications-outline'} 
              size={20} 
              color={activeTab === 'lembretes' ? '#fff' : colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'lembretes' && styles.tabTextActive]}>
              Lembretes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'privacidade' && styles.tabActive]}
            onPress={() => setActiveTab('privacidade')}
          >
            <Ionicons 
              name={activeTab === 'privacidade' ? 'shield' : 'shield-outline'} 
              size={20} 
              color={activeTab === 'privacidade' ? '#fff' : colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'privacidade' && styles.tabTextActive]}>
              Privacidade
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo das Tabs */}
        <View style={styles.tabContent}>
          {/* Tab Perfil */}
          {activeTab === 'perfil' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações do Perfil</Text>
              
              <View style={styles.fotoContainer}>
                <TouchableOpacity
                  onPress={handleAlterarFoto}
                  disabled={uploadingFoto}
                  style={styles.fotoButton}
                >
                  {userFoto ? (
                    <Image source={{ uri: userFoto.startsWith('data:') ? userFoto : `data:image/jpeg;base64,${userFoto}` }} style={styles.fotoImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.fotoPlaceholder}>
                      <Ionicons name="person" size={48} color={colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.fotoOverlay}>
                    {uploadingFoto ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="camera" size={24} color="#fff" />
                        <Text style={styles.fotoOverlayText}>Alterar foto</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome Completo:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nome}
                  onChangeText={(text) => setFormData({ ...formData, nome: text })}
                  placeholder="Nome completo"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="email@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefone:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.telefone}
                  onChangeText={(text) => {
                    // Aplica máscara enquanto digita
                    const telefoneFormatado = formatarTelefone(text);
                    setFormData({ ...formData, telefone: telefoneFormatado });
                  }}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  maxLength={15} // (00) 00000-0000 = 15 caracteres
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Senha Atual:</Text>
                <View style={styles.passwordInput}>
                  <TextInput
                    style={styles.passwordTextInput}
                    value={formData.senhaAtual}
                    onChangeText={(text) => setFormData({ ...formData, senhaAtual: text })}
                    placeholder="Digite sua senha atual"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={24} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nova Senha:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.novaSenha}
                  onChangeText={(text) => setFormData({ ...formData, novaSenha: text })}
                  placeholder="Deixe em branco para não alterar"
                  secureTextEntry={!showPassword}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirmar Nova Senha:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmarSenha}
                  onChangeText={(text) => setFormData({ ...formData, confirmarSenha: text })}
                  placeholder="Confirme a nova senha"
                  secureTextEntry={!showPassword}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSalvarPerfil}>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tab Lembretes */}
          {activeTab === 'lembretes' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Configurações de Lembretes</Text>
              
              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Ativar lembretes</Text>
                  <Switch
                    value={lembretesConfig.lembretesAtivos}
                    onValueChange={(value) => setLembretesConfig({ ...lembretesConfig, lembretesAtivos: value })}
                  />
                </View>
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Receber lembretes por email</Text>
                  <Switch
                    value={lembretesConfig.lembretesEmail}
                    onValueChange={(value) => setLembretesConfig({ ...lembretesConfig, lembretesEmail: value })}
                    disabled={!lembretesConfig.lembretesAtivos}
                  />
                </View>
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelContainer}>
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" style={styles.whatsappIcon} />
                    <Text style={styles.switchLabel}>Receber lembretes por WhatsApp</Text>
                  </View>
                  <Switch
                    value={lembretesConfig.lembretesWhatsApp}
                    onValueChange={(value) => setLembretesConfig({ ...lembretesConfig, lembretesWhatsApp: value })}
                    disabled={!lembretesConfig.lembretesAtivos}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Dias antes do vencimento:</Text>
                <TextInput
                  style={styles.input}
                  value={lembretesConfig.lembretesDiasAntes.toString()}
                  onChangeText={(text) => {
                    // Remover tudo que não é dígito
                    const numbers = text.replace(/\D/g, '');
                    // Se estiver vazio, definir como string vazia temporariamente
                    if (numbers === '') {
                      setLembretesConfig({ ...lembretesConfig, lembretesDiasAntes: 0 });
                      return;
                    }
                    // Converter para número e atualizar
                    const num = parseInt(numbers);
                    if (!isNaN(num)) {
                      setLembretesConfig({ ...lembretesConfig, lembretesDiasAntes: num });
                    }
                  }}
                  keyboardType="number-pad"
                  placeholder="5"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Horário dos lembretes:</Text>
                <TimePicker
                  value={lembretesConfig.lembretesHorario}
                  onChange={(time) => setLembretesConfig({ ...lembretesConfig, lembretesHorario: time })}
                  placeholder="Selecione o horário"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSalvarLembretes}>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Salvar Configurações</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tab Privacidade */}
          {activeTab === 'privacidade' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacidade e Dados</Text>
              
              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Compartilhar dados anônimos para melhorias</Text>
                  <Switch
                    value={privacidadeConfig.dadosAnonimos}
                    onValueChange={(value) => setPrivacidadeConfig({ ...privacidadeConfig, dadosAnonimos: value })}
                  />
                </View>
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Permitir analytics</Text>
                  <Switch
                    value={privacidadeConfig.analytics}
                    onValueChange={(value) => setPrivacidadeConfig({ ...privacidadeConfig, analytics: value })}
                  />
                </View>
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Receber emails de marketing</Text>
                  <Switch
                    value={privacidadeConfig.marketing}
                    onValueChange={(value) => setPrivacidadeConfig({ ...privacidadeConfig, marketing: value })}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSalvarPrivacidade}>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Salvar Configurações</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Botão de Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {versao && versao.versao_mobile ? (
            <Text style={styles.footerText}>Claricash {versao.versao_mobile}</Text>
          ) : (
            <Text style={styles.footerText}>Claricash v1.0.0</Text>
          )}
          <Text style={styles.footerText}>Liz Software</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fotoButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  fotoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  fotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoOverlayText: {
    color: '#fff',
    fontSize: 11,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordTextInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  passwordToggle: {
    padding: 12,
  },
  switchGroup: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  whatsappIcon: {
    marginRight: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logoutSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
