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
  Image,
  Linking,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOffline } from '../context/OfflineContext';
import { API_ENDPOINTS } from '../config/api';
import { colors } from '../theme/theme';
import { formatarTelefone, removerFormatacaoTelefone } from '../utils/formatters';
import TimePicker from '../components/TimePicker';
import { syncDespesasNaoPagasNotifications } from '../services/despesasNotifications';

export default function ConfiguracoesScreen() {
  const navigation = useNavigation();
  const { user, logout, getUserId } = useAuth();
  const { preference, setPreference, colors: themeColors, isDark } = useTheme();
  const { enabled: offlineEnabled, setEnabled: setOfflineEnabled, lastSyncedAt, clearCache, isOnline } = useOffline();
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
    lembretesEmail: false,
    lembretesDiasAntes: 0,
    lembretesHorario: '18:15'
  });

  const [notifPrefs, setNotifPrefs] = useState({
    contas_a_vencer: true,
    contas_vencidas: true,
    metas_financeiras: true,
    resumo_mensal: true,
    resumo_semanal: true,
    dicas_economia: true,
  });

  const NOTIF_PREF_OPTIONS = [
    { key: 'contas_a_vencer', label: 'Contas a vencer' },
    { key: 'contas_vencidas', label: 'Contas vencidas' },
    { key: 'metas_financeiras', label: 'Metas Financeiras' },
    { key: 'resumo_mensal', label: 'Resumo Mensal' },
    { key: 'resumo_semanal', label: 'Resumo Semanal' },
    { key: 'dicas_economia', label: 'Dicas de Economia' },
  ];

  const allNotifSelected = NOTIF_PREF_OPTIONS.every((opt) => !!notifPrefs[opt.key]);

  const setAllNotifPrefs = (value) => {
    const next = {};
    NOTIF_PREF_OPTIONS.forEach((opt) => {
      next[opt.key] = value;
    });
    setNotifPrefs(next);
  };

  const handleToggleLembretesAtivos = (value) => {
    setLembretesConfig((prev) => ({ ...prev, lembretesAtivos: value }));
    if (!value) setAllNotifPrefs(false);
  };

  // Versão do sistema
  const [versao, setVersao] = useState(null);

  // Foto do perfil
  const [userFoto, setUserFoto] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // Configurações de privacidade
  const [privacidadeConfig, setPrivacidadeConfig] = useState({
    melhorarClaricash: false,
    novidadesOfertas: false,
  });
  const [excluirTexto, setExcluirTexto] = useState('');
  const [showExcluirConfirm, setShowExcluirConfirm] = useState(false);

  useEffect(() => {
    if (userId) {
      carregarConfiguracoes();
    }
  }, [userId]);

  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      const [lembretesRes, perfilRes, versaoRes, notifPrefsRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.USER_LEMBRETES}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.USER_PROFILE}?userId=${userId}`),
        axios.get(API_ENDPOINTS.VERSAO_MOBILE).catch(() => ({ data: { success: false } })),
        axios.get(`${API_ENDPOINTS.USER_NOTIFICACOES_PREFS}?userId=${userId}`).catch(() => ({ data: null })),
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
        const diasCarregados = lembretesRes.data.lembretesDiasAntes;
        setLembretesConfig(prev => ({
          ...prev,
          lembretesAtivos: lembretesRes.data.lembretesAtivos ?? true,
          lembretesEmail: !!lembretesRes.data.lembretesEmail,
          lembretesDiasAntes:
            diasCarregados === 0 || diasCarregados === '0'
              ? 0
              : Number.isFinite(Number(diasCarregados))
                ? Number(diasCarregados)
                : 0,
          lembretesHorario: lembretesRes.data.lembretesHorario || '18:15'
        }));
      }

      try {
        const savedPriv = await AsyncStorage.getItem(`claricash_privacidade_${userId}`);
        if (savedPriv) {
          const parsed = JSON.parse(savedPriv);
          setPrivacidadeConfig({
            melhorarClaricash: !!(parsed.melhorarClaricash ?? parsed.dadosAnonimos ?? parsed.analytics),
            novidadesOfertas: !!(parsed.novidadesOfertas ?? parsed.marketing),
          });
        }
      } catch (_) { /* ignorar */ }

      if (notifPrefsRes.data?.prefs) {
        setNotifPrefs(prev => ({ ...prev, ...notifPrefsRes.data.prefs }));
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
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      let base64 = asset.base64;

      // Fallback: se base64 não veio, tenta via FileSystem legacy (SDK 54+)
      if (!base64 && asset.uri) {
        try {
          const FileSystem = require('expo-file-system/legacy');
          base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (fsErr) {
          console.error('Fallback FileSystem falhou:', fsErr);
        }
      }

      if (!base64) {
        Alert.alert('Erro', 'Não foi possível ler a imagem selecionada.');
        return;
      }

      const mime = asset.mimeType || 'image/jpeg';
      const dataUri = base64.startsWith('data:') ? base64 : `data:${mime};base64,${base64}`;

      setUploadingFoto(true);
      await axios.put(API_ENDPOINTS.USER_FOTO, { userId, foto: dataUri });
      setUserFoto(dataUri);
      Alert.alert('Sucesso', 'Foto atualizada!');
    } catch (err) {
      console.error('Erro ao alterar foto:', err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Não foi possível salvar a foto.';
      Alert.alert('Erro', msg);
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

    // Validar dias antes do vencimento (0 = só no dia do vencimento)
    const dias = typeof lembretesConfig.lembretesDiasAntes === 'string' 
      ? parseInt(lembretesConfig.lembretesDiasAntes, 10) 
      : lembretesConfig.lembretesDiasAntes;
    
    if (dias === null || dias === undefined || Number.isNaN(dias) || dias < 0) {
      Alert.alert('Erro', 'O número de dias deve ser 0 ou maior (0 = só no dia do vencimento)');
      return;
    }

    // Garantir que dias seja um número válido
    const configToSave = {
      lembretesAtivos: lembretesConfig.lembretesAtivos,
      lembretesEmail: !!lembretesConfig.lembretesEmail,
      lembretesDiasAntes: dias,
      lembretesHorario: lembretesConfig.lembretesHorario,
      lembretesWhatsApp: false,
    };

    setLoading(true);
    try {
      console.log('📤 Enviando configurações de lembretes:', { userId, ...configToSave });
      
      await Promise.all([
        axios.put(API_ENDPOINTS.USER_LEMBRETES, {
          userId,
          ...configToSave
        }),
        axios.put(API_ENDPOINTS.USER_NOTIFICACOES_PREFS, {
          userId,
          prefs: notifPrefs,
        }),
      ]);

      console.log('✅ Configurações salvas');
      await syncDespesasNaoPagasNotifications(userId);
      Alert.alert('Sucesso', 'Configurações de notificações salvas!');
      await carregarConfiguracoes();
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
    try {
      await AsyncStorage.setItem(
        `claricash_privacidade_${userId}`,
        JSON.stringify(privacidadeConfig)
      );
      Alert.alert('Sucesso', 'Preferências de privacidade salvas!');
    } catch (_) {
      Alert.alert('Erro', 'Não foi possível salvar as preferências.');
    }
  };

  const handleExcluirConta = () => {
    Alert.alert(
      '⚠️ Excluir sua conta?',
      'Esta ação é permanente.\n\nSua conta e os dados financeiros associados serão excluídos conforme nossa Política de Exclusão de Conta e Dados.\n\nEssa ação não poderá ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir minha conta',
          style: 'destructive',
          onPress: () => setShowExcluirConfirm(true),
        },
      ]
    );
  };

  const handleExcluirContaDefinitivo = async () => {
    if (excluirTexto.trim().toUpperCase() !== 'EXCLUIR') {
      Alert.alert('Atenção', 'Digite EXCLUIR para confirmar.');
      return;
    }
    setLoading(true);
    try {
      await axios.delete(API_ENDPOINTS.USER_EXCLUIR, {
        data: { userId, confirmacao: 'EXCLUIR' },
      });
      setShowExcluirConfirm(false);
      Alert.alert('Conta excluída', 'Sua conta foi excluída com sucesso.', [
        {
          text: 'OK',
          onPress: () => logout(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Erro',
        error.response?.data?.error || 'Não foi possível excluir a conta.'
      );
    } finally {
      setLoading(false);
    }
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
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView style={styles.content}>
        {/* Tabs de Navegação */}
        <View style={[styles.tabsContainer, { backgroundColor: themeColors.surface }]}>
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
              Notificações
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
              <Text style={styles.sectionTitle}>Aparência</Text>
              <Text style={styles.helperText}>
                Use o tema do celular ou escolha claro/escuro manualmente.
              </Text>
              <View style={styles.themeRow}>
                {[
                  { key: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
                  { key: 'light', label: 'Claro', icon: 'sunny-outline' },
                  { key: 'dark', label: 'Escuro', icon: 'moon-outline' },
                ].map((opt) => {
                  const active = preference === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.themeOption,
                        active && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                      ]}
                      onPress={() => setPreference(opt.key)}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={18}
                        color={active ? '#fff' : themeColors.text}
                      />
                      <Text style={[styles.themeOptionText, active && { color: '#fff' }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[styles.helperText, { marginBottom: 20 }]}>
                Atual: {isDark ? 'escuro' : 'claro'}
                {preference === 'system' ? ' (seguindo o celular)' : ''}
              </Text>

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
              <Text style={styles.sectionTitle}>Configurações de Notificações</Text>
              
              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Ativar lembretes</Text>
                  <Switch
                    value={lembretesConfig.lembretesAtivos}
                    onValueChange={handleToggleLembretesAtivos}
                  />
                </View>
                <Text style={styles.helperText}>
                  Com lembretes ativos e permissão do sistema, o app notifica no horário configurado as despesas em aberto que estão na janela de lembrete (ver “Dias antes” abaixo).
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Tipos de notificação</Text>
              <Text style={styles.helperText}>
                Selecione as notificações que deseja receber
              </Text>
              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { fontWeight: '700' }]}>Marcar Todos</Text>
                  <Switch
                    value={allNotifSelected}
                    disabled={!lembretesConfig.lembretesAtivos}
                    onValueChange={(value) => {
                      setAllNotifPrefs(value);
                      if (value) {
                        setLembretesConfig((prev) => ({ ...prev, lembretesAtivos: true }));
                      }
                    }}
                  />
                </View>
              </View>
              {NOTIF_PREF_OPTIONS.map((opt) => (
                <View key={opt.key} style={styles.switchGroup}>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>{opt.label}</Text>
                    <Switch
                      value={!!notifPrefs[opt.key]}
                      disabled={!lembretesConfig.lembretesAtivos}
                      onValueChange={(value) =>
                        setNotifPrefs((prev) => ({ ...prev, [opt.key]: value }))
                      }
                    />
                  </View>
                </View>
              ))}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Antecedência do lembrete:</Text>
                <TextInput
                  style={styles.input}
                  value={lembretesConfig.lembretesDiasAntes.toString()}
                  onChangeText={(text) => {
                    // Remover tudo que não é dígito
                    const numbers = text.replace(/\D/g, '');
                    // Se estiver vazio, definir como 0
                    if (numbers === '') {
                      setLembretesConfig({ ...lembretesConfig, lembretesDiasAntes: 0 });
                      return;
                    }
                    // Converter para número e atualizar
                    const num = parseInt(numbers, 10);
                    if (!isNaN(num)) {
                      setLembretesConfig({ ...lembretesConfig, lembretesDiasAntes: num });
                    }
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                />
                <Text style={styles.helperText}>
                  0 = só no dia do vencimento. Ex.: 5 = avisa a partir de 5 dias antes até o vencimento.
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 8 }]}>📧 Notificações por e-mail</Text>
              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { flex: 1, paddingRight: 12 }]}>
                    Receber lembretes de vencimentos por e-mail
                  </Text>
                  <Switch
                    value={!!lembretesConfig.lembretesEmail}
                    disabled={!lembretesConfig.lembretesAtivos}
                    onValueChange={(value) =>
                      setLembretesConfig((prev) => ({ ...prev, lembretesEmail: value }))
                    }
                  />
                </View>
                <Text style={styles.helperText}>
                  O e-mail é enviado na antecedência informada em “Dias antes”, no horário configurado.
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Horário das Notificações:</Text>
                <TimePicker
                  value={lembretesConfig.lembretesHorario}
                  onChange={(time) => setLembretesConfig({ ...lembretesConfig, lembretesHorario: time })}
                  placeholder="Selecione o horário"
                />
                <Text style={styles.helperText}>
                  Horário em que a notificação do celular e o e-mail de lembrete são disparados.
                </Text>
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
              <Text style={styles.sectionTitle}>Modo offline</Text>
              <Text style={styles.helperText}>
                Quando ativo, o app guarda despesas e receitas já carregadas para consulta sem internet.
                Inclusões e edições ainda precisam de conexão.
              </Text>
              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>
                    {isOnline ? 'Online' : 'Sem conexão'} — cache {offlineEnabled ? 'ligado' : 'desligado'}
                  </Text>
                  <Switch
                    value={offlineEnabled}
                    onValueChange={(value) => setOfflineEnabled(value)}
                  />
                </View>
              </View>
              {lastSyncedAt ? (
                <Text style={styles.helperText}>
                  Última sincronização:{' '}
                  {new Date(lastSyncedAt).toLocaleString('pt-BR')}
                </Text>
              ) : (
                <Text style={styles.helperText}>Ainda não há dados em cache.</Text>
              )}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.textSecondary, marginBottom: 24 }]}
                onPress={() => {
                  Alert.alert(
                    'Limpar cache',
                    'Remover dados salvos no aparelho?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Limpar',
                        style: 'destructive',
                        onPress: async () => {
                          await clearCache();
                          Alert.alert('Pronto', 'Cache offline limpo.');
                        },
                      },
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Limpar cache offline</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Privacidade e Dados</Text>

              <TouchableOpacity
                style={styles.privacyPolicyLink}
                onPress={() => Linking.openURL('https://claricash.com.br/privacy-policy')}
              >
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
                <View style={styles.privacyPolicyLinkText}>
                  <Text style={styles.privacyPolicyLinkTitle}>Política de Privacidade</Text>
                  <Text style={styles.privacyPolicyLinkSubtitle}>Leia nossa política de privacidade.</Text>
                </View>
                <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.privacyPolicyLink}
                onPress={() => Linking.openURL('https://claricash.com.br/terms-of-use')}
              >
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                <View style={styles.privacyPolicyLinkText}>
                  <Text style={styles.privacyPolicyLinkTitle}>Termos de Uso</Text>
                  <Text style={styles.privacyPolicyLinkSubtitle}>Leia os termos de uso do Claricash.</Text>
                </View>
                <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Experiência e melhorias</Text>
              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.switchLabel}>Ajudar a melhorar o Claricash</Text>
                    <Text style={styles.helperText}>
                      Permitir o uso de informações anônimas sobre o uso do aplicativo para melhorar nossos recursos.
                    </Text>
                  </View>
                  <Switch
                    value={!!privacidadeConfig.melhorarClaricash}
                    onValueChange={(value) =>
                      setPrivacidadeConfig({ ...privacidadeConfig, melhorarClaricash: value })
                    }
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Comunicação</Text>
              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.switchLabel}>Receber novidades e ofertas</Text>
                    <Text style={styles.helperText}>
                      Receba novidades, dicas e informações sobre o Claricash.
                    </Text>
                  </View>
                  <Switch
                    value={!!privacidadeConfig.novidadesOfertas}
                    onValueChange={(value) =>
                      setPrivacidadeConfig({ ...privacidadeConfig, novidadesOfertas: value })
                    }
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSalvarPrivacidade}>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Salvar preferências</Text>
              </TouchableOpacity>

              <Text style={[styles.sectionTitle, { marginTop: 24, color: colors.error }]}>Seus dados</Text>
              <Text style={styles.helperText}>
                Exclui sua conta e os dados associados, observadas as hipóteses legais de conservação.
              </Text>
              <TouchableOpacity
                style={[styles.privacyPolicyLink, { marginTop: 8 }]}
                onPress={() => Linking.openURL('https://claricash.com.br/account-deletion-policy')}
              >
                <Ionicons name="document-outline" size={22} color={colors.primary} />
                <View style={styles.privacyPolicyLinkText}>
                  <Text style={styles.privacyPolicyLinkTitle}>Política de Exclusão de Conta e Dados</Text>
                  <Text style={styles.privacyPolicyLinkSubtitle}>Saiba o que acontece ao excluir</Text>
                </View>
                <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.error, marginTop: 12 }]}
                onPress={handleExcluirConta}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Excluir Conta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Modal
          visible={showExcluirConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowExcluirConfirm(false)}
        >
          <View style={styles.excluirModalOverlay}>
            <View style={[styles.excluirModalCard, { backgroundColor: themeColors.card || '#fff' }]}>
              <Text style={[styles.excluirModalTitle, { color: colors.error }]}>
                🔴 Confirmação final
              </Text>
              <Text style={[styles.helperText, { marginBottom: 12 }]}>
                Digite EXCLUIR para confirmar.
              </Text>
              <TextInput
                style={[styles.input, { marginBottom: 16 }]}
                value={excluirTexto}
                onChangeText={setExcluirTexto}
                placeholder="EXCLUIR"
                autoCapitalize="characters"
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.saveButton, { flex: 1, backgroundColor: colors.textSecondary }]}
                  onPress={() => {
                    setShowExcluirConfirm(false);
                    setExcluirTexto('');
                  }}
                >
                  <Text style={styles.saveButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, { flex: 1, backgroundColor: colors.error }]}
                  onPress={handleExcluirContaDefinitivo}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? 'Excluindo...' : 'Excluir definitivamente'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
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
  privacyPolicyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyPolicyLinkText: {
    flex: 1,
  },
  privacyPolicyLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  privacyPolicyLinkSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
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
  excluirModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  excluirModalCard: {
    borderRadius: 14,
    padding: 20,
  },
  excluirModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
});
