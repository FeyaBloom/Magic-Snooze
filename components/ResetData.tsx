import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, DeviceEventEmitter, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/ThemeProvider';
import { useTextStyles } from '@/hooks/useTextStyles';
import { showToast } from '@/utils/toast';

interface ResetOption {
  id: string;
  titleKey: string;
  descriptionKey: string;
  keys: string[];
  pattern?: string[];
  destructive: boolean;
}

export default function ResetDataComponent() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const textStyles = useTextStyles();

  const [showResetModal, setShowResetModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [resetting, setResetting] = useState(false);

  const resetOptions: ResetOption[] = [
    {
      id: 'tasks',
      titleKey: 'reset.options.tasks.title',
      descriptionKey: 'reset.options.tasks.description',
      keys: ['oneTimeTasks'],
      destructive: true,
    },
    {
      id: 'routines',
      titleKey: 'reset.options.routines.title',
      descriptionKey: 'reset.options.routines.description',
      keys: ['morningRoutine', 'eveningRoutine'],
      destructive: true,
    },
    {
      id: 'notes',
      titleKey: 'reset.options.notes.title',
      descriptionKey: 'reset.options.notes.description',
      keys: ['personalNotes'],
      destructive: true,
    },
    {
      id: 'progress',
      titleKey: 'reset.options.progress.title',
      descriptionKey: 'reset.options.progress.description',
      keys: ['lastProgressDate'],
      pattern: ['progress_', 'victories_'],
      destructive: true,
    },
    {
      id: 'settings',
      titleKey: 'reset.options.settings.title',
      descriptionKey: 'reset.options.settings.description',
      keys: ['selectedLanguage', 'selectedTheme', 'messyMode', 'dashboard_focus_mode'],
      destructive: false,
    },
  ];

  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>(
    resetOptions.reduce((acc, option) => ({
      ...acc,
      [option.id]: option.destructive,
    }), {})
  );

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  const performReset = async () => {
    try {
      setResetting(true);

      const keysToDelete: string[] = [];
      const resetCategories: string[] = [];

      for (const option of resetOptions) {
        if (selectedOptions[option.id]) {
          keysToDelete.push(...option.keys);
          resetCategories.push(option.id);

          if (option.pattern) {
            const allKeys = await AsyncStorage.getAllKeys();
            for (const pattern of option.pattern) {
              const matchingKeys = allKeys.filter((key) => key.startsWith(pattern));
              keysToDelete.push(...matchingKeys);
            }
          }
        }
      }

      const uniqueKeys = [...new Set(keysToDelete)];

      if (uniqueKeys.length === 0) {
     showToast('info', t('reset.alerts.nothingSelected.title'),
          t('reset.alerts.nothingSelected.message')
        );
        return;
      }

      await AsyncStorage.multiRemove(uniqueKeys);

      DeviceEventEmitter.emit('dataReset', {
        categories: resetCategories,
        deletedKeys: uniqueKeys,
        timestamp: Date.now(),
      });

      setShowResetModal(false);
      showToast('success', 
        t('reset.alerts.success.title'),
        t('reset.alerts.success.message', { count: uniqueKeys.length }),
       // [{ text: t('common.confirm') }]
      );
    } catch (error) {
      console.error('Error resetting data:', error);
      showToast('error', t('reset.alerts.error.title'), t('reset.alerts.error.message'));
    } finally {
      setResetting(false);
    }
  };

  const confirmReset = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    
    if (selectedCount === 0) {
      showToast('info', t('reset.alerts.nothingSelected.title'),
        t('reset.alerts.nothingSelected.message')
      );
      return;
    }
    
    setShowConfirmDialog(true);
  };

  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          backgroundColor: '#EF4444',
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 12,
          marginTop: 24,
        }}
        onPress={() => setShowResetModal(true)}
      >
        <RotateCcw size={20} color="#FFFFFF" />
        <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
          {t('reset.button')}
        </Text>
      </TouchableOpacity>

      <Modal visible={showResetModal} animationType="fade" transparent={true}>
        <View
          style={{
            flex: 1,
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 0,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              width: '100%',
              maxWidth: 500,
              maxHeight: '85%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <AlertTriangle size={24} color="#EF4444" />
              <Text
                style={[
                  textStyles.h2,
                  { color: colors.text, marginLeft: 8 },
                ]}
              >
                {t('reset.modal.title')}
              </Text>
            </View>

            <Text style={[textStyles.body, { color: colors.textSecondary, marginBottom: 16 }]}>
              {t('reset.modal.subtitle')}
            </Text>

            <ScrollView style={{ marginBottom: 20 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                {resetOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={{
                      flexDirection: 'row',
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 2,
                      alignItems: 'center',
                      backgroundColor: selectedOptions[option.id]
                        ? colors.primary + '20'
                        : colors.background[0],
                      borderColor: selectedOptions[option.id]
                        ? colors.primary
                        : colors.surface,
                    }}
                    onPress={() => toggleOption(option.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[textStyles.body, { color: colors.text, fontWeight: '600' }]}>
                        {t(option.titleKey)}
                      </Text>
                      <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                        {t(option.descriptionKey)}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: selectedOptions[option.id] ? colors.primary : colors.textSecondary,
                        backgroundColor: selectedOptions[option.id] ? colors.primary : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selectedOptions[option.id] && (
                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: colors.background[0],
                }}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={[textStyles.button, { color: colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: '#EF4444',
                }}
                onPress={confirmReset}
                disabled={resetting}
              >
                <Trash2 size={16} color="#FFFFFF" />
                <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
                  {resetting ? t('reset.modal.deleting') : t('reset.modal.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal visible={showConfirmDialog} animationType="fade" transparent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              borderWidth: 2,
              borderColor: '#EF4444',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <AlertTriangle size={48} color="#EF4444" />
            </View>

            <Text
              style={[
                textStyles.h2,
                { color: colors.text, textAlign: 'center', marginBottom: 12 },
              ]}
            >
              {t('reset.confirm.title')}
            </Text>

            <Text
              style={[
                textStyles.body,
                { color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
              ]}
            >
              {t('reset.confirm.message', { 
                count: Object.values(selectedOptions).filter(Boolean).length 
              })}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: colors.background[0],
                }}
                onPress={() => setShowConfirmDialog(false)}
              >
                <Text style={[textStyles.button, { color: colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: '#EF4444',
                }}
                onPress={() => {
                  setShowConfirmDialog(false);
                  performReset();
                }}
                disabled={resetting}
              >
                <Trash2 size={16} color="#FFFFFF" />
                <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
                  {t('reset.confirm.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}