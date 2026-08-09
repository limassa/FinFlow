import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import * as Notifications from 'expo-notifications';
import { ensureNotificationHandler, cancelEventoNotifications, EVENTO_NOTIFICATION_TYPE } from '../services/despesasNotifications';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const tiposEvento = [
  { value: 'geral', label: 'Geral', cor: '#4F46E5' },
  { value: 'lembrete', label: 'Lembrete', cor: '#F59E0B' },
  { value: 'compromisso', label: 'Compromisso', cor: '#10B981' },
  { value: 'vencimento', label: 'Vencimento', cor: '#EF4444' },
];
const coresEvento = ['#4F46E5', '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

const gerarHorarios = () => {
  const horarios = [];
  for (let h = 0; h < 24; h++) {
    horarios.push(`${String(h).padStart(2, '0')}:00`);
    horarios.push(`${String(h).padStart(2, '0')}:30`);
  }
  return horarios;
};
const HORARIOS = gerarHorarios();

async function agendarNotificacaoEvento(evento) {
  try {
    ensureNotificationHandler();
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const data = String(evento.evento_data || '').slice(0, 10);
    const hinicio = String(evento.evento_hora_inicio || '00:00').slice(0, 5);

    const lembreteDate = new Date(data + 'T' + hinicio + ':00');
    lembreteDate.setMinutes(lembreteDate.getMinutes() - 30);

    const agora = new Date();
    const segundos = Math.floor((lembreteDate.getTime() - agora.getTime()) / 1000);
    if (segundos <= 0) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Lembrete de evento',
        body: `${evento.evento_titulo || evento.evento_Titulo || 'Evento'} - ${data} às ${hinicio}`,
        data: {
          type: EVENTO_NOTIFICATION_TYPE,
          evento_id: evento.evento_id || evento.evento_Id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: segundos,
        repeats: false,
      },
    });
  } catch (err) {
    console.error('Erro ao agendar notificação:', err);
  }
}

async function agendarNotificacoesEventos(eventos) {
  try {
    await cancelEventoNotifications();
    const comLembrete = eventos.filter(
      e => (e.evento_lembrete || e.evento_Lembrete) !== false
    );
    let count = 0;
    for (const ev of comLembrete) {
      if (count >= 10) break;
      await agendarNotificacaoEvento(ev);
      count++;
    }
  } catch (err) {
    console.error('Erro ao agendar notificações:', err);
  }
}

export default function AgendaScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const userId = getUserId();

  const [semanaRef, setSemanaRef] = useState(() => {
    const hoje = new Date();
    const diff = hoje.getDate() - hoje.getDay();
    return new Date(hoje.getFullYear(), hoje.getMonth(), diff);
  });
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [formEvento, setFormEvento] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    tipo: 'geral',
    cor: '#4F46E5',
    lembrete: true,
    lembrete_minutos: 30,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Agenda',
    });
  }, [navigation]);

  const getDiasDaSemana = () => {
    const dias = [];
    const inicio = new Date(semanaRef);
    const hojeYmd = (() => {
      const h = new Date();
      return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
    })();
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const data = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dias.push({
        data,
        label: diasSemana[i],
        dia: d.getDate(),
        mes: d.getMonth(),
        isToday: data === hojeYmd,
      });
    }
    return dias;
  };

  const dias = getDiasDaSemana();
  const dataInicio = dias[0]?.data;
  const dataFim = dias[6]?.data;

  useEffect(() => {
    ensureNotificationHandler();
  }, []);

  useEffect(() => {
    if (userId && dataInicio && dataFim) {
      carregarEventos();
    }
  }, [userId, dataInicio, dataFim]);

  const carregarEventos = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_ENDPOINTS.EVENTOS}?userId=${userId}&dataInicio=${dataInicio}&dataFim=${dataFim}`
      );
      const evs = res.data || [];
      setEventos(evs);
      agendarNotificacoesEventos(evs);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  const navegarSemana = (delta) => {
    setSemanaRef(prev => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() + delta * 7);
      return nova;
    });
  };

  const formatarSemana = () => {
    const i = dias[0];
    const f = dias[6];
    if (!i || !f) return '';
    return `${i.dia}/${i.mes + 1} - ${f.dia}/${f.mes + 1} ${semanaRef.getFullYear()}`;
  };

  const abrirModalSlot = (dia, horario) => {
    const [h, m] = horario.split(':').map(Number);
    let fimH = m === 30 ? h + 1 : h;
    let fimM = m === 30 ? 0 : 30;
    if (h === 23 && m === 30) {
      fimH = 23;
      fimM = 59;
    }
    const horaFim = `${String(fimH).padStart(2, '0')}:${String(fimM).padStart(2, '0')}`;
    setSlotSelecionado({ dia, horario });
    setFormEvento({
      titulo: '',
      descricao: '',
      data: dia.data,
      hora_inicio: horario,
      hora_fim: horaFim,
      tipo: 'geral',
      cor: '#4F46E5',
      lembrete: true,
      lembrete_minutos: 30,
    });
    setShowModal(true);
  };

  const salvarEvento = async () => {
    if (!formEvento.titulo.trim()) {
      Alert.alert('Atenção', 'Informe o título do evento.');
      return;
    }
    try {
      await axios.post(API_ENDPOINTS.EVENTOS, {
        usuario_id: userId,
        titulo: formEvento.titulo,
        descricao: formEvento.descricao || null,
        data: formEvento.data,
        hora_inicio: formEvento.hora_inicio || null,
        hora_fim: formEvento.hora_fim || null,
        tipo: formEvento.tipo,
        cor: formEvento.cor,
        lembrete: formEvento.lembrete,
        lembrete_minutos: formEvento.lembrete_minutos,
      });
      setShowModal(false);
      setSlotSelecionado(null);
      carregarEventos();
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      Alert.alert('Erro', 'Não foi possível criar o evento.');
    }
  };

  const getEventosNoSlot = (data, hora) => {
    return eventos.filter(e => {
      const ed = String(e.evento_data || '').slice(0, 10);
      if (ed !== data) return false;
      const hinicio = String(e.evento_hora_inicio || '').slice(0, 5);
      return hinicio && hinicio === hora;
    });
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navegarSemana(-1)} style={styles.btnNav}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Semana {formatarSemana()}</Text>
        <TouchableOpacity onPress={() => navegarSemana(1)} style={styles.btnNav}>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.diasHeader}>
        <View style={[styles.diaCol, styles.cornerCol]} />
        {dias.map(d => (
          <View key={d.data} style={[styles.diaCol, d.isToday && styles.diaColToday]}>
            <Text style={[styles.diaNome, d.isToday && styles.diaNomeToday]}>{d.label}</Text>
            <View style={[styles.diaNumeroWrap, d.isToday && styles.diaNumeroWrapToday]}>
              <Text style={[styles.diaNumero, d.isToday && styles.diaNumeroToday]}>
                {d.dia}/{d.mes + 1}
              </Text>
            </View>
            {d.isToday ? <Text style={styles.diaHojeLabel}>Hoje</Text> : null}
          </View>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={true}>
        {HORARIOS.map(horario => (
          <View key={horario} style={styles.slotRow}>
            <View style={styles.horaCell}>
              <Text style={styles.horaText}>{horario}</Text>
            </View>
            {dias.map(dia => {
              const evs = getEventosNoSlot(dia.data, horario);
              return (
                <TouchableOpacity
                  key={`${dia.data}-${horario}`}
                  style={[
                    styles.slotCell,
                    dia.isToday && styles.slotCellToday,
                    evs.length > 0 && styles.slotCellWithEvents,
                  ]}
                  onPress={() => abrirModalSlot(dia, horario)}
                  activeOpacity={0.7}
                >
                  {evs.length > 0 ? (
                    evs.map(ev => (
                      <View
                        key={ev.evento_id || ev.evento_Id}
                        style={[styles.eventPill, { backgroundColor: ev.evento_cor || ev.evento_Cor || '#4F46E5' }]}
                      >
                        <Text style={styles.eventPillText} numberOfLines={1}>
                          {ev.evento_titulo || ev.evento_Titulo}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.slotAdd}>+</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={[styles.modalContent, { borderTopColor: formEvento.cor }]} onPress={e => e.stopPropagation()}>
            <View style={[styles.modalHeader, { backgroundColor: formEvento.cor }]}>
              <Text style={styles.modalTitle}>Novo Evento</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                value={formEvento.titulo}
                onChangeText={t => setFormEvento({ ...formEvento, titulo: t })}
                placeholder="Ex: Reunião, Consulta..."
                placeholderTextColor={colors.placeholder}
              />
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formEvento.descricao}
                onChangeText={t => setFormEvento({ ...formEvento, descricao: t })}
                placeholder="Detalhes do evento..."
                placeholderTextColor={colors.placeholder}
                multiline
              />
              <Text style={styles.label}>Data</Text>
              <TextInput
                style={styles.input}
                value={formEvento.data}
                onChangeText={t => setFormEvento({ ...formEvento, data: t })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.placeholder}
              />
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>Hora Início</Text>
                  <TextInput
                    style={styles.input}
                    value={formEvento.hora_inicio}
                    onChangeText={t => setFormEvento({ ...formEvento, hora_inicio: t })}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
                <View style={styles.half}>
                  <Text style={styles.label}>Hora Fim</Text>
                  <TextInput
                    style={styles.input}
                    value={formEvento.hora_fim}
                    onChangeText={t => setFormEvento({ ...formEvento, hora_fim: t })}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              </View>
              <Text style={styles.label}>Tipo</Text>
              <View style={styles.tipoRow}>
                {tiposEvento.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.tipoBtn,
                      { backgroundColor: t.cor },
                      formEvento.tipo === t.value && styles.tipoBtnSelected,
                    ]}
                    onPress={() => setFormEvento({ ...formEvento, tipo: t.value, cor: t.cor })}
                  >
                    <Text style={styles.tipoBtnText}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Cor</Text>
              <View style={styles.coresRow}>
                {coresEvento.map(cor => (
                  <TouchableOpacity
                    key={cor}
                    style={[
                      styles.corBtn,
                      { backgroundColor: cor },
                      formEvento.cor === cor && styles.corBtnSelected,
                    ]}
                    onPress={() => setFormEvento({ ...formEvento, cor })}
                  />
                ))}
              </View>
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setFormEvento({ ...formEvento, lembrete: !formEvento.lembrete })}
                >
                  <Ionicons
                    name={formEvento.lembrete ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.checkboxLabel}>Lembrete</Text>
                </TouchableOpacity>
                {formEvento.lembrete && (
                  <View style={styles.lembreteMin}>
                    <Text style={styles.label}>Min antes</Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() => {
                        const opts = [5, 10, 15, 30, 60, 1440];
                        Alert.alert(
                          'Minutos antes',
                          'Selecione',
                          opts.map(m => ({
                            text: m < 60 ? `${m} min` : m === 60 ? '1 hora' : '1 dia',
                            onPress: () => setFormEvento({ ...formEvento, lembrete_minutos: m }),
                          }))
                        );
                      }}
                    >
                      <Text>{formEvento.lembrete_minutos < 60
                        ? `${formEvento.lembrete_minutos} min`
                        : formEvento.lembrete_minutos === 60 ? '1 hora' : '1 dia'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSave, { backgroundColor: formEvento.cor }]}
                onPress={salvarEvento}
              >
                <Text style={styles.btnSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.primary,
  },
  btnNav: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 14, color: '#fff', fontWeight: '600', flex: 1, textAlign: 'center' },
  diasHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 8,
  },
  diaCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  diaColToday: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
  },
  cornerCol: { flex: 0, width: 50 },
  diaNome: { fontSize: 10, color: 'rgba(255,255,255,0.9)' },
  diaNomeToday: { fontWeight: '700', color: '#fff' },
  diaNumeroWrap: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  diaNumeroWrapToday: {
    backgroundColor: colors.card,
  },
  diaNumero: { fontSize: 12, color: '#fff', fontWeight: '700' },
  diaNumeroToday: { color: colors.primary },
  diaHojeLabel: {
    marginTop: 2,
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  slotRow: {
    flexDirection: 'row',
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  horaCell: {
    width: 50,
    justifyContent: 'center',
    paddingLeft: 6,
    backgroundColor: colors.surface,
  },
  horaText: { fontSize: 11, color: colors.textSecondary },
  slotCell: {
    flex: 1,
    padding: 4,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    backgroundColor: colors.card,
  },
  slotCellToday: {
    backgroundColor: colors.primary + '18',
  },
  slotCellWithEvents: { justifyContent: 'flex-start' },
  slotAdd: { fontSize: 16, color: colors.placeholder, textAlign: 'center' },
  eventPill: {
    padding: 4,
    borderRadius: 4,
    marginBottom: 2,
  },
  eventPillText: { fontSize: 10, color: '#fff' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 400,
    borderTopWidth: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  modalBody: { padding: 20, maxHeight: 400 },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  textArea: { minHeight: 60 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  tipoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tipoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tipoBtnSelected: { borderWidth: 2, borderColor: colors.text },
  tipoBtnText: { color: '#fff', fontSize: 12 },
  coresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  corBtn: { width: 32, height: 32, borderRadius: 16 },
  corBtnSelected: { borderWidth: 2, borderColor: colors.text },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkboxLabel: { fontSize: 14, color: colors.text },
  lembreteMin: { flex: 1 },
  selectBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: colors.surface,
  },
  selectBtnText: { fontSize: 14, color: colors.text },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btnCancel: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnCancelText: { color: colors.textSecondary, fontWeight: '600' },
  btnSave: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSaveText: { color: '#fff', fontWeight: '600' },
});
}
