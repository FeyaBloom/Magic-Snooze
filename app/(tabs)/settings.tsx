import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useTextStyles } from '@/hooks/useTextStyles';
import { createSettingsStyles } from '@/styles/settings';
import { useTranslation } from 'react-i18next';
import { Languages, Paintbrush } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageModal } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';


function SettingsTabContent() {
  const { colors, toggleMessyMode, isMessyMode } = useTheme();
  const textStyles = useTextStyles();
    const router = useRouter();  
    const styles = createSettingsStyles(colors);
    const { t, i18n } = useTranslation();
    const currentLanguageCode = i18n.language;
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  const debugAsyncStorage = async () => {
  try {
    // Получаем все ключи
    const keys = await AsyncStorage.getAllKeys();
    console.log('=== ALL ASYNC STORAGE KEYS ===');
    console.log('Keys found:', keys);
    
    // Получаем все данные по ключам
    const stores = await AsyncStorage.multiGet(keys);
    
    console.log('\n=== ALL ASYNC STORAGE DATA ===');
    stores.forEach(([key, value]) => {
      console.log(`${key}:`, value);
      // Пытаемся распарсить JSON если возможно
      try {
        const parsed = JSON.parse(value || '{}');
        console.log(`${key} (parsed):`, parsed);
      } catch (e) {
        console.log(`${key} (raw string):`, value);
      }
      console.log('---');
    });
  } catch (error) {
    console.error('Error reading AsyncStorage:', error);
  }
};
  return (
    <ScreenBackground tabName="settings">
       <View style={{ flex: 1, zIndex: 1,  width: Platform.OS === 'android' ? '100%' : 600,
  alignSelf: Platform.OS === 'android' ? 'stretch' : 'center' }}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('settings.title')}</Text>

          <LanguageModal
            visible={languageModalVisible}
            onClose={() => setLanguageModalVisible(false)}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.appPreferences')}</Text>

            <View style={styles.row}>


  <View style={styles.leftContent}>
    
    <View>
      <Text style={styles.label}>
        {t('settings.messyMode.title')}
      </Text>
      <Text style={styles.description}>
        {t('settings.messyMode.description')}
      </Text>
    </View>
  </View>
  
  <Switch
    value={isMessyMode}
    onValueChange={toggleMessyMode}
    trackColor={{
      false: colors.surface,
      true: colors.primary
    }}
    thumbColor={isMessyMode ? colors.accent : colors.textSecondary}
  />
              <View>
      <Paintbrush color={colors.textSecondary} size={20} />
    </View>
</View>

            <TouchableOpacity
              style={styles.row}
              onPress={() => setLanguageModalVisible(true)}
            >
              <View>
                <Text style={styles.label}>{t('settings.language.title')}</Text>
                <Text style={styles.description}>
                 
                  {t('settings.language.currently')}:   {t(`languages.${currentLanguageCode}.flag`)} {currentLanguageCode.toUpperCase()}
                </Text>
              </View>
              <Languages color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>
        
      </ScrollView>
      </View>
    </ScreenBackground>
  );
}
export default function SettingsTab() {
  return <SettingsTabContent />;
}