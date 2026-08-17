import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { formatarValor, formatarData } from '../utils/formatters';

// Configurar locale para português
LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt';

export default function CalendarioScreen() {
  const navigation = useNavigation();
  const { getUserId } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const userId = getUserId();
  const [loading, setLoading] = useState(true);
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Calendário Financeiro',
    });
  }, [navigation]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, colors.primary, colors.success, colors.error]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [receitasRes, despesasRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.RECEITAS}?userId=${userId}`),
        axios.get(`${API_ENDPOINTS.DESPESAS}?userId=${userId}`)
      ]);

      setReceitas(receitasRes.data || []);
      setDespesas(despesasRes.data || []);

      // Marcar datas com eventos
      const marked = {};
      
      receitasRes.data.forEach(receita => {
        if (receita.receita_data) {
          const date = receita.receita_data.split('T')[0];
          if (!marked[date]) {
            marked[date] = { dots: [] };
          }
          marked[date].dots.push({
            key: `receita-${receita.receita_id}`,
            color: colors.success
          });
        }
      });

      despesasRes.data.forEach(despesa => {
        if (despesa.despesa_data) {
          const date = despesa.despesa_data.split('T')[0];
          if (!marked[date]) {
            marked[date] = { dots: [] };
          }
          marked[date].dots.push({
            key: `despesa-${despesa.despesa_id}`,
            color: colors.error
          });
        }
      });

      // Marcar data selecionada
      if (selectedDate && !marked[selectedDate]) {
        marked[selectedDate] = {};
      }
      if (marked[selectedDate]) {
        marked[selectedDate].selected = true;
        marked[selectedDate].selectedColor = colors.primary;
      }

      setMarkedDates(marked);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    const newMarked = { ...markedDates };
    // Remover seleção anterior
    Object.keys(newMarked).forEach(date => {
      if (newMarked[date].selected) {
        delete newMarked[date].selected;
        delete newMarked[date].selectedColor;
      }
    });
    // Adicionar nova seleção
    if (!newMarked[day.dateString]) {
      newMarked[day.dateString] = { dots: [] };
    }
    newMarked[day.dateString] = {
      ...newMarked[day.dateString],
      selected: true,
      selectedColor: colors.primary
    };
    setMarkedDates(newMarked);
  };

  const receitasDoDia = receitas.filter(r => {
    const data = r.receita_data ? r.receita_data.split('T')[0] : '';
    return data === selectedDate;
  });

  const despesasDoDia = despesas.filter(d => {
    const data = d.despesa_data ? d.despesa_data.split('T')[0] : '';
    return data === selectedDate;
  });

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
        <View style={styles.calendarContainer}>
          <Calendar
            key={colors.background}
            current={selectedDate}
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType="multi-dot"
            theme={{
              backgroundColor: colors.card,
              calendarBackground: colors.card,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#fff',
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.placeholder,
              dotColor: colors.primary,
              selectedDotColor: '#fff',
              arrowColor: colors.primary,
              monthTextColor: colors.text,
              textDayFontWeight: '600',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
            locale="pt"
          />
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Receitas</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>Despesas</Text>
            </View>
          </View>
        </View>

        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>
            {formatarData(new Date(selectedDate))}
          </Text>

          {receitasDoDia.length === 0 && despesasDoDia.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhum evento neste dia</Text>
            </View>
          ) : (
            <>
              {receitasDoDia.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Receitas</Text>
                  {receitasDoDia.map(receita => (
                    <View key={receita.receita_id} style={styles.eventCard}>
                      <View style={[styles.eventIndicator, styles.receitaIndicator]} />
                      <View style={styles.eventContent}>
                        <Text style={styles.eventDescription}>{receita.receita_descricao}</Text>
                        <Text style={[styles.eventValue, styles.receitaValue]}>
                          {formatarValor(receita.receita_valor)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {despesasDoDia.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Despesas</Text>
                  {despesasDoDia.map(despesa => (
                    <View key={despesa.despesa_id} style={styles.eventCard}>
                      <View style={[styles.eventIndicator, styles.despesaIndicator]} />
                      <View style={styles.eventContent}>
                        <Text style={styles.eventDescription}>{despesa.despesa_descricao}</Text>
                        <Text style={[styles.eventValue, styles.despesaValue]}>
                          {formatarValor(despesa.despesa_valor)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
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
  calendarContainer: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  eventsContainer: {
    padding: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  receitaIndicator: {
    backgroundColor: colors.success,
  },
  despesaIndicator: {
    backgroundColor: colors.error,
  },
  eventContent: {
    flex: 1,
  },
  eventDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  receitaValue: {
    color: colors.success,
  },
  despesaValue: {
    color: colors.error,
  },
});
}
