import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react-native';
import i18n from '@/i18n';

interface ResetDataProps {
  colors: any;
  styles: any;
}

interface ResetOption {
  id: string;
  titleKey: string;
  descriptionKey: string;
  keys: string[];
  pattern?: string[];
  destructive: boolean;
}

const ResetDataComponent: React.FC<ResetDataProps> = ({ colors, styles }) => {
  const { t } = i18n;
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const resetOptions: ResetOption[] = [
    {
      id: 'tasks',
      titleKey: 'reset.options.tasks.title',
      descriptionKey: 'reset.options.tasks.description',
      keys: ['oneTimeTasks'],
      destructive: true
    },
    {
      id: 'routines',
      titleKey: 'reset.options.routines.title',
      descriptionKey: 'reset.options.routines.description',
      keys: ['morningRoutine', 'eveningRoutine'],
      destructive: true
    },
    {
      id: 'notes',
      titleKey: 'reset.options.notes.title',
      descriptionKey: 'reset.options.notes.description',
      keys: ['personalNotes'],
      destructive: true
    },
    {
      id: 'progress',
      titleKey: 'reset.options.progress.title',
      descriptionKey: 'reset.options.progress.description',
      keys: ['lastProgressDate'],
      pattern: ['progress_', 'victories_', 'progress_backup_'],
      destructive: true
    },
    {
      id: 'settings',
      titleKey: 'reset.options.settings.title',
      descriptionKey: 'reset.options.settings.description',
      keys: ['selectedLanguage', 'selectedTheme', 'messyMode'],
      destructive: false
    }
  ];

  const [selectedOptions, setSelectedOptions] = useState(
    resetOptions.reduce((acc, option) => ({
      ...acc,
      [option.id]: option.destructive
    }), {})
  );

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  const performReset = async () => {
    try {
      setResetting(true);
      
      const keysToDelete: string[] = [];
      
      for (const option of resetOptions) {
        if (selectedOptions[option.id]) {
          keysToDelete.push(...option.keys);
          
          if (option.pattern) {
            const allKeys = await AsyncStorage.getAllKeys();
            for (const pattern of option.pattern) {
              const matchingKeys = allKeys.filter(key => key.startsWith(pattern));
              keysToDelete.push(...matchingKeys);
            }
          }
        }
      }

      const uniqueKeys = [...new Set(keysToDelete)];
      
      if (uniqueKeys.length === 0) {
        Alert.alert(
          t('reset.alerts.nothingSelected.title'), 
          t('reset.alerts.nothingSelected.message')
        );
        return;
      }

      await AsyncStorage.multiRemove(uniqueKeys);
      
      setShowResetModal(false);
      Alert.alert(
        t('reset.alerts.success.title'),
        t('reset.alerts.success.message', { count: uniqueKeys.length }),
        [{ text: t('common.ok') }]
      );
      
      console.log('Deleted keys:', uniqueKeys);
      
    } catch (error) {
      console.error('Error resetting data:', error);
      Alert.alert(
        t('reset.alerts.error.title'), 
        t('reset.alerts.error.message')
      );
    } finally {
      setResetting(false);
    }
  };

  const confirmReset = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    
    Alert.alert(
      t('reset.confirm.title'),
      t('reset.confirm.message', { count: selectedCount }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('reset.confirm.delete'), 
          style: 'destructive',
          onPress: performReset 
        }
      ]
    );
  };

  const resetButtonStyles = {
    ...styles.resetButton,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    gap: 8
  };

  const modalStyles = {
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    },
    modalContent: {
 // backgroundColor: colors.background, // ← Уже есть
  borderRadius: 16,
  padding: 20,
  width: '100%',
  maxHeight: '80%',
  // Добавьте эти строки:
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
      backgroundColor: colors.surface || '#FFFFFF', // Белый как fallback
      opacity: 1,
  elevation: 8, // Для Android
},
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16
    },
    optionsContainer: {
      gap: 8,
      marginBottom: 20
    },
    optionItem: {
      flexDirection: 'row',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center'
    },
    optionContent: {
      flex: 1
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 2,
      color: colors.text
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center'
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold'
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center'
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: '500'
    },
    deleteButton: {
      backgroundColor: '#EF4444',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    deleteButtonText: {
      color: '#FFFFFF',
      fontWeight: '600'
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={resetButtonStyles}
        onPress={() => setShowResetModal(true)}
      >
        <RotateCcw size={20} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
          {t('reset.button')}
        </Text>
      </TouchableOpacity>

      <Modal 
        visible={showResetModal}
        animationType="slide"
        transparent={true}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.modalHeader}>
              <AlertTriangle size={24} color="#EF4444" />
              <Text style={modalStyles.modalTitle}>
                {t('reset.modal.title')}
              </Text>
            </View>
            
            <Text style={modalStyles.modalSubtitle}>
              {t('reset.modal.subtitle')}
            </Text>

            <View style={modalStyles.optionsContainer}>
              {resetOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    modalStyles.optionItem,
                    { 
                      backgroundColor: selectedOptions[option.id] 
                        ? colors.primary + '20' 
                        : colors.surface,
                      borderColor: selectedOptions[option.id] 
                        ? colors.primary 
                        : colors.border
                    }
                  ]}
                  onPress={() => toggleOption(option.id)}
                >
                  <View style={modalStyles.optionContent}>
                    <Text style={modalStyles.optionTitle}>
                      {t(option.titleKey)}
                    </Text>
                    <Text style={modalStyles.optionDescription}>
                      {t(option.descriptionKey)}
                    </Text>
                  </View>
                  <View style={[
                    modalStyles.checkbox,
                    selectedOptions[option.id] && { 
                      backgroundColor: colors.primary,
                      borderColor: colors.primary 
                    }
                  ]}>
                    {selectedOptions[option.id] && (
                      <Text style={modalStyles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={[modalStyles.modalButton, modalStyles.cancelButton]}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={modalStyles.cancelButtonText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[modalStyles.modalButton, modalStyles.deleteButton]}
                onPress={confirmReset}
                disabled={resetting}
              >
                <Trash2 size={16} color="#FFFFFF" />
                <Text style={modalStyles.deleteButtonText}>
                  {resetting ? t('reset.modal.deleting') : t('reset.modal.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ResetDataComponent;