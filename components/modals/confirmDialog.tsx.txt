import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
export const ConfirmDialog = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = t('common.yes'),
  cancelText = t('common.no'),
}: {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}) => {
  const currentLanguageCode = i18n.language;
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, { backgroundColor: colors.secondary }]}>
              <Text style={styles.buttonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 12,
    fontFamily: 'CabinSketch-Regular'
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'ComicNeue-Regular',
    textAlign: `center`,
    lineHeight: 24
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'ComicNeue-Regular'
  },
});