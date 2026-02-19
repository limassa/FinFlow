import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { BANCOS, getBancoById } from '../utils/banks';

export default function BankSelector({ value, onChange, placeholder = 'Selecione o banco', label }) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedBanco = value ? getBancoById(value) : null;

  const handleSelect = (banco) => {
    onChange(banco ? banco.id : '');
    setModalVisible(false);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.valueRow}>
          {selectedBanco && (
            <View style={[styles.badge, { backgroundColor: selectedBanco.cor }]}>
              <Text style={styles.badgeText}>{selectedBanco.abbr}</Text>
            </View>
          )}
          <Text style={[styles.text, !value && styles.placeholder]}>
            {selectedBanco ? selectedBanco.nome : placeholder}
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
              <Text style={styles.modalTitle}>Selecione o banco</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              <TouchableOpacity
                style={[styles.option, !value && styles.optionSelected]}
                onPress={() => handleSelect(null)}
              >
                <Text style={[styles.optionText, !value && styles.optionTextSelected]}>
                  {placeholder}
                </Text>
              </TouchableOpacity>
              {BANCOS.map((banco) => {
                const isSelected = value === banco.id;
                return (
                  <TouchableOpacity
                    key={banco.id}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(banco)}
                  >
                    <View style={styles.optionRow}>
                      <View style={[styles.badge, { backgroundColor: banco.cor }]}>
                        <Text style={styles.badgeText}>{banco.abbr}</Text>
                      </View>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {banco.nome}
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
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
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.placeholder,
  },
  badge: {
    width: 32,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
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
