import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { TOUCHABLE_CONFIG } from '@/styles/touchable';

interface RoutineFormModalProps {
  visible: boolean;
  title: string;
  value: string;
  placeholder: string;
  saveLabel: string;
  cancelLabel: string;
  colors: any;
  textStyles: any;
  styles: any;
  onChangeText: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export function RoutineFormModal({
  visible,
  title,
  value,
  placeholder,
  saveLabel,
  cancelLabel,
  colors,
  textStyles,
  styles,
  onChangeText,
  onClose,
  onSave,
  onDelete,
}: RoutineFormModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0}
        style={styles.modalOverlay}
      >
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
          onPress={Keyboard.dismiss}
        />

        <View>
          <View style={styles.modalContent}>
            {onDelete ? (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onDelete}
                hitSlop={{ top: 8, right: 8, bottom: 16, left: 16 }}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            ) : null}

            <Text style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}>
              {title}
            </Text>

            <TextInput
              style={[styles.textInput, { maxHeight: 150 }]}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              value={value}
              onChangeText={onChangeText}
              multiline
              autoFocus
              blurOnSubmit={false}
              scrollEnabled
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary + 50 }]}
                onPress={onClose}
                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
              >
                <Text style={[textStyles.button, { color: colors.text }]}>
                  {cancelLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={onSave}
                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
              >
                <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
                  {saveLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}