import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { createSettingsStyles } from '@/styles/settings';
import {
  Globe,
  Heart,
  Languages,
//  LogIn,
  Paintbrush,
} from 'lucide-react-native';
import { FloatingBackground } from '@/components/MagicalFeatures';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { LanguageModal } from '@/components/LanguageModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ResetDataComponent from '@/components/ResetDataComponent';

function SettingsTabContent() {
  const { colors, toggleMessyMode, isMessyMode } = useTheme();
  const { t } = useTranslation();
  const styles = createSettingsStyles(colors);
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
    <SafeAreaView style={styles.container}>
              {/* Фон и анимация под контентом */}
              <View style={{
                ...StyleSheet.absoluteFillObject,
                zIndex: 0,
                pointerEvents: 'none', // не мешает кликам
              }}>
                <LinearGradient
  colors={
    Array.isArray(colors.background) &&
    colors.background.length >= 2 &&
    colors.background.every(c => typeof c === 'string')
      ? (colors.background as [string, string, ...string[]])
      : ['#ffffff', '#eeeeee']
  }
  style={styles.gradient}
>
  <FloatingBackground />
</LinearGradient>
              </View>
        
              {/* Основной контент поверх */}
              <View style={{ flex: 1, zIndex: 1,  width: Platform.OS === 'android' ? '100%' : 600,
  alignSelf: Platform.OS === 'android' ? 'stretch' : 'center' }}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('settings.title')}</Text>

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

          <View style={styles.section}>
           {/* <Text style={styles.sectionTitle}>{t('settings.account')}</Text>*/}

            {/* <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.label}>{t('settings.connectGoogle.title')}</Text>
                <Text style={styles.description}>
                  {t('settings.connectGoogle.description')}
                </Text>
              </View>
              <LogIn color={colors.textSecondary} size={20} />
            </TouchableOpacity> */}


            
           <ResetDataComponent colors={colors} styles={styles} />
{/*
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.label}>{t('settings.manageProfile.title')}</Text>
                <Text style={styles.description}>
                  {t('settings.manageProfile.description')}
                </Text>
              </View>
              <User2 color={colors.textSecondary} size={20} />
            </TouchableOpacity>
            */}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.contactSupport')}</Text>

            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://portfolio-feya-bloom.webflow.io/')}
            >
              <View>
                <Text style={styles.label}>{t('settings.contactCreator.title')}</Text>
                <Text style={styles.description}>
                  {t('settings.contactCreator.description')}
                </Text>
              </View>
              <Globe color={colors.textSecondary} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://www.buymeacoffee.com/feyabloom')}
            >
              <View>
                <Text style={styles.label}>{t('settings.supportApp.title')}</Text>
                <Text style={styles.description}>
                  {t('settings.supportApp.description')}
                </Text>
              </View>
              <Heart color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          <LanguageModal
            visible={languageModalVisible}
            onClose={() => setLanguageModalVisible(false)}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
// ✅ Export default AL FINAL
export default function SettingsTab() {
  return <SettingsTabContent />;
}