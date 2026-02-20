import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { getIconNameForTipo } from '../utils/categoryIcons';

/**
 * Select com ícones nas opções (categorias de receita/despesa/conta).
 * @param {string[]} options - Lista de opções (ex: tiposDespesa, tiposReceita)
 * @param {string} value - Valor selecionado
 * @param {function} onChange - (value) => void
 * @param {string} categoria - 'conta' | 'despesa' | 'receita'
 * @param {string} placeholder - Texto quando nada selecionado
 */
export default function SelectWithIcons({
  value,
  options = [],
  onChange,
  categoria = 'despesa',
  placeholder = 'Selecione',
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => (typeof opt === 'object' ? opt.value : opt) === value);
  const displayValue = selectedOption
    ? typeof selectedOption === 'object'
      ? selectedOption.label
      : selectedOption
    : placeholder;
  const selectedIconName = value ? getIconNameForTipo(value, categoria) : null;

  const handleSelect = (opt) => {
    const optValue = typeof opt === 'object' ? opt.value : opt;
    if (onChange) onChange(optValue);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.inputContent}>
          {selectedIconName && (
            <Ionicons
              name={selectedIconName}
              size={20}
              color={value ? colors.text : colors.textSecondary}
              style={styles.inputIcon}
            />
          )}
          <Text style={[styles.text, !value && styles.placeholder]}>
            {displayValue}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione uma opção</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => {
                const optValue = typeof option === 'object' ? option.value : option;
                const optLabel = typeof option === 'object' ? option.label : option;
                const isSelected = optValue === value;
                const iconName = getIconNameForTipo(optValue, categoria);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(option)}
                  >
                    <View style={styles.optionContent}>
                      <Ionicons
                        name={iconName}
                        size={20}
                        color={isSelected ? colors.primary : colors.textSecondary}
                        style={styles.optionIcon}
                      />
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {optLabel}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputIcon: {
    marginRight: 10,
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
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.surface,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
