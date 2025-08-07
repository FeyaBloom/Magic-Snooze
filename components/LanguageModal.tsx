import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

const languageCodes = ['en', 'ru', 'es',];

export const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const currentLanguage = i18n.language;

  const languages = languageCodes.map((code) => ({
    code,
    flag: t(`languages.${code}.flag`),
    name: t(`languages.${code}.name`),
    nativeName: t(`languages.${code}.native`)
  }));

  const handleLanguageSelect = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    onClose();
  };

  const renderLanguageItem = ({ item }) => {
    const isSelected = currentLanguage === item.code;

    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          {
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.primary : colors.surface,
          },
          isSelected && { backgroundColor: colors.primary + '10' },
        ]}
        onPress={() => handleLanguageSelect(item.code)}
        activeOpacity={0.7}
      >
        <View style={styles.languageContent}>
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.languageText}>
            <Text style={[styles.languageName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.languageNative, { color: colors.textSecondary }]}>
              {item.nativeName}
            </Text>
          </View>
          {isSelected && <Check size={20} color={colors.primary} />}
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modal: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      shadowColor: '#ccc',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 22,      
      color: colors.text,
      fontFamily: 'CabinSketch-Bold',
    },
    languageList: {
      maxHeight: 300,
    },
    languageItem: {
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 2,
      overflow: 'hidden',
    },
    languageContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    flag: {
      fontSize: 28,
      marginRight: 16,
    },
    languageText: {
      flex: 1,
    },
    languageName: {
      fontSize: 18,
      fontWeight: '600',
      fontFamily: 'ComicNeue-Bold',
      marginBottom: 2,
    },
    languageNative: {
      fontSize: 14,
      fontFamily: 'ComicNeue-Regular',
    },
    closeButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      marginTop: 20,
    },
    closeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'ComicNeue-Bold',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('settings.language.selectLanguage')}
            </Text>
          </View>

          <FlatList
            data={languages}
            keyExtractor={(item) => item.code}
            renderItem={renderLanguageItem}
            style={styles.languageList}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>
              {t('common.close')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
