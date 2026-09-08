import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatarData } from '../utils/formatters';

export default function DatePicker({ value, onChange, placeholder = 'Selecione a data', mode = 'date' }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(null);
  const themeVariant = isDark ? 'dark' : 'light';

  const handleOpen = () => {
    setTempDate(value || new Date());
    setShow(true);
  };

  const handleConfirm = () => {
    const dateToSave = tempDate || value || new Date();
    if (onChange) {
      onChange(dateToSave);
    }
    setShow(false);
  };

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate && onChange) {
      onChange(selectedDate);
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    return formatarData(date);
  };

  const pickerValue = tempDate || value || new Date();

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={handleOpen}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? formatDateForInput(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
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
                value={pickerValue}
                mode={mode}
                display="spinner"
                themeVariant={themeVariant}
                textColor={colors.text}
                onChange={(event, selectedDate) => {
                  if (selectedDate && event.type !== 'dismissed') {
                    setTempDate(selectedDate);
                  }
                }}
                locale="pt-BR"
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display="default"
          themeVariant={themeVariant}
          onChange={handleChange}
          locale="pt-BR"
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
