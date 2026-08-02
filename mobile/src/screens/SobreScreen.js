import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/theme';
import StoreBadges from '../components/StoreBadges';

const FEATURES = [
  'Registrar receitas e despesas.',
  'Gerenciar contas bancárias.',
  'Controlar cartões de crédito.',
  'Acompanhar contas a pagar e receber.',
  'Visualizar gráficos e relatórios.',
  'Criar orçamentos e metas financeiras.',
  'Utilizar calculadoras financeiras.',
  'Receber lembretes para não esquecer vencimentos.',
];

export default function SobreScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Sobre',
    });
  }, [navigation]);

  const handleEmailPress = () => {
    Linking.openURL('mailto:contatolizsoftware@gmail.com?subject=Contato Claricash');
  };

  const handleWhatsAppPress = () => {
    const phoneNumber = '5571981512769';
    const message = 'Olá! Gostaria de entrar em contato sobre o Claricash.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'WhatsApp não está instalado no dispositivo.');
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o ClariCash</Text>
          <Text style={styles.sectionText}>
            O ClariCash foi criado para ajudar pessoas e pequenos empreendedores a entender melhor sua vida financeira de forma simples, intuitiva e segura.
          </Text>
          <Text style={styles.sectionText}>
            Nossa missão é ajudar você a organizar sua vida financeira para tomar melhores decisões, economizar mais e conquistar seus objetivos.
          </Text>
          <Text style={styles.sectionText}>
            Não importa se você deseja controlar os gastos do dia a dia, organizar as contas da família ou administrar as finanças do seu negócio: o ClariCash foi desenvolvido para acompanhar você nessa jornada.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que você pode fazer com o ClariCash</Text>
          <View style={styles.featureList}>
            {FEATURES.map((item) => (
              <View key={item} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nosso compromisso</Text>
          <Text style={styles.sectionText}>
            Na Liz Software acreditamos que a tecnologia deve simplificar a vida das pessoas.
          </Text>
          <Text style={styles.sectionText}>
            Por isso desenvolvemos aplicativos intuitivos, seguros e em constante evolução, sempre ouvindo nossos usuários para oferecer a melhor experiência possível.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nosso propósito</Text>
          <Text style={styles.sectionText}>
            Acreditamos que organizar as finanças é o primeiro passo para conquistar sonhos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Baixe o app</Text>
          <Text style={styles.sectionText}>
            Leve o Claricash no celular e acompanhe suas finanças onde estiver.
          </Text>
          <StoreBadges style={styles.storeBadges} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desenvolvido por</Text>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo_nova.png')} style={styles.logoNova} resizeMode="contain" />
          </View>
          <Text style={styles.companyName}>Liz Software</Text>
          <Text style={styles.sectionText}>
            Desenvolvemos soluções digitais que ajudam pessoas e empresas a organizar melhor suas finanças, seus negócios e sua rotina.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fale Conosco</Text>

          <TouchableOpacity
            style={styles.enviarMensagemButton}
            onPress={() => navigation.navigate('FaleConosco')}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            <Text style={styles.enviarMensagemText}>Enviar Mensagem</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleEmailPress}>
            <Ionicons name="mail" size={24} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>contatolizsoftware@gmail.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleWhatsAppPress}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>Fale conosco pelo WhatsApp</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('https://claricash.com.br/privacy-policy')}
          >
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Política de Privacidade</Text>
              <Text style={styles.contactValue}>Como tratamos seus dados</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direitos Reservados</Text>
          <Text style={styles.copyright}>
            © 2026 Liz Software. Todos os direitos reservados.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  featureList: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
    lineHeight: 22,
  },
  storeBadges: {
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  logoWrap: {
    marginBottom: 12,
    alignItems: 'center',
  },
  logoNova: {
    width: 160,
    height: 56,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  enviarMensagemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  enviarMensagemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  copyright: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
