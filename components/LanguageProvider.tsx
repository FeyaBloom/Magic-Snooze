import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeProvider';
import { useTextStyles } from '@/hooks/useTextStyles';
import { createSettingsStyles } from '@/styles/settings';

type Language = 'en' | 'ca' | 'es' | 'ru';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
  showLanguageModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageCodes: Language[] = ['en', 'ca', 'es', 'ru'];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation();
  const { colors } = useTheme();
  const textStyles = useTextStyles();
  const styles = createSettingsStyles(colors);
  
  const [language, setLanguage] = useState<Language>('en');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedLanguage');
      if (saved && languageCodes.includes(saved as Language)) {
        setLanguage(saved as Language);
        await i18n.changeLanguage(saved);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const changeLanguage = async (lang: Language) => {
    try {
      setLanguage(lang);
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem('selectedLanguage', lang);
      setModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const showLanguageModal = () => {
    setModalVisible(true);
  };

  const languages = languageCodes.map((code) => ({
    code,
    flag: t(`languages.${code}.flag`),
    name: t(`languages.${code}.name`),
    nativeName: t(`languages.${code}.native`),
  }));

  const renderLanguageItem = ({ item }: { item: typeof languages[0] }) => {
    const isSelected = language === item.code;

    return (
      <TouchableOpacity
        style={[
          styles.languageOption,
          isSelected && styles.languageOptionSelected,
        ]}
        onPress={() => changeLanguage(item.code)}
        activeOpacity={0.7}
      >
        <Text style={styles.languageFlag}>{item.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[textStyles.body, isSelected && { color: colors.surface }]}>
            {item.name}
          </Text>
          <Text style={[textStyles.caption, isSelected && { color: colors.surface }]}>
            {item.nativeName}
          </Text>
        </View>
        {isSelected && <Check size={20} color={isSelected ? colors.surface : colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, showLanguageModal }}>
      {children}
      
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={[textStyles.h2, styles.modalTitle]}>
                {t('settings.language.selectLanguage')}
              </Text>
              
              <FlatList
                data={languages}
                keyExtractor={(item) => item.code}
                renderItem={renderLanguageItem}
                showsVerticalScrollIndicator={false}
              />

              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={textStyles.button}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}