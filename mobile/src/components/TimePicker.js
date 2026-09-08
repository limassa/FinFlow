import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function TimePicker({ value, onChange, placeholder = 'Selecione o horário' }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [show, setShow] = useState(false);
  const [tempTime, setTempTime] = useState(null);
  const themeVariant = isDark ? 'dark' : 'light';

  const stringToTime = (timeString) => {
    if (!timeString) return new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  };

  const timeToString = (date) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate && onChange) {
      onChange(timeToString(selectedDate));
    }
  };

  const handleOpenPicker = () => {
    setTempTime(stringToTime(value));
    setShow(true);
  };

  const handleConfirm = () => {
    if (tempTime && onChange) {
      onChange(timeToString(tempTime));
    }
    setShow(false);
  };

  const currentDate = tempTime || stringToTime(value);

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={handleOpenPicker}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {Platform.OS === 'ios' && show && (
        <Modal
          visible={show}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShow(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.iosPickerButton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.iosPickerButton, styles.iosPickerButtonConfirm]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={currentDate}
                mode="time"
                display="spinner"
                themeVariant={themeVariant}
                textColor={colors.text}
                onChange={(event, selectedDate) => {
                  if (selectedDate && event.type !== 'dismissed') {
                    setTempTime(selectedDate);
                  }
                }}
                locale="pt-BR"
                is24Hour={true}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={currentDate}
          mode="time"
          display="default"
          themeVariant={themeVariant}
          onChange={handleChange}
          locale="pt-BR"
          is24Hour={true}
        />
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    input: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 48,
    },
    text: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    placeholder: {
      color: colors.placeholder,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    iosPickerContainer: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },
    iosPickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iosPickerButton: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    iosPickerButtonConfirm: {
      color: colors.primary,
    },
    iosPicker: {
      height: 200,
    },
  });
}
