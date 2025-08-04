// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

// Локальные ресурсы
import en from './locales/en.json';
import ru from './locales/ru.json';
import es from './locales/es.json';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (cb: (lang: string) => void) => {
    const savedLang = await AsyncStorage.getItem('selectedLanguage');
    if (savedLang) {
      cb(savedLang);
      return;
    }
    const deviceLang =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings.AppleLocale ||
          NativeModules.SettingsManager?.settings.AppleLanguages?.[0]
        : NativeModules.I18nManager?.localeIdentifier;
    cb(deviceLang?.split('_')[0] || 'en');
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    await AsyncStorage.setItem('selectedLanguage', lng);
  },
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });

export default i18n;
