import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { colors } from '../theme/theme';

export default function CustomDrawerContent(props) {
  const { user, getUserId } = useAuth();
  const userId = getUserId();
  const [userFoto, setUserFoto] = useState(null);
  const userNome = user?.usuario_nome || user?.nome || '';

  useEffect(() => {
    if (userId) {
      axios.get(`${API_ENDPOINTS.USER_FOTO}?userId=${userId}`)
        .then(res => { if (res.data?.foto) setUserFoto(res.data.foto); })
        .catch(() => {});
    }
  }, [userId]);

  const abrirConfiguracoes = () => {
    props.navigation.navigate('Configuracoes');
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <TouchableOpacity style={styles.fotoWrapper} onPress={abrirConfiguracoes} activeOpacity={0.8}>
          {userFoto ? (
            <Image
              source={{ uri: userFoto.startsWith('data:') ? userFoto : `data:image/jpeg;base64,${userFoto}` }}
              style={styles.foto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Text style={styles.fotoPlaceholderText}>?</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.userLabel} numberOfLines={1}>
          {userNome || 'Usuário'}
        </Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  fotoWrapper: {
    marginBottom: 8,
  },
  foto: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  fotoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoPlaceholderText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  userLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '100%',
  },
});
