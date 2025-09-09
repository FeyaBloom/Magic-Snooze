import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useFonts } from 'expo-font';
import {
  Comfortaa_400Regular,
  Comfortaa_500Medium
} from '@expo-google-fonts/comfortaa';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'useInsertionEffect must not schedule updates',
]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  // Ваши оригинальные названия + Comfortaa + Coiny
  const [fontsLoaded, fontError] = useFonts({
    'ComicNeue-Regular': Comfortaa_400Regular,
    'ComicNeue-Bold': Comfortaa_500Medium,
    'CabinSketch-Regular': require('@/assets/fonts/Coiny-Cyrillic.ttf'), // возвращаем Coiny
    'CabinSketch-Bold': require('@/assets/fonts/Coiny-Cyrillic.ttf'),

    // Правильные названия для нового использования
    'Comfortaa_400Regular': Comfortaa_400Regular,
    'Comfortaa_500Medium': Comfortaa_500Medium,
    'Coiny_400Regular': require('@/assets/fonts/Coiny-Cyrillic.ttf'),
  });

  // Загружаем сохраненный язык при инициализации приложения
  const loadInitialLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && ['en', 'ru', 'es'].includes(savedLanguage)) {
        await i18n.changeLanguage(savedLanguage);
        console.log(`Loaded language: ${savedLanguage}`);
      }
    } catch (error) {
      console.error('Error loading initial language:', error);
    }
  };

  // ✅ Функция для настройки навигационной панели
  const setupNavigationBar = async () => {
    if (Platform.OS === 'android') {
      try {
        await NavigationBar.setVisibilityAsync('hidden'); // полностью скрывает
   //     await NavigationBar.setBackgroundColorAsync('transparent');
     //   await NavigationBar.setButtonStyleAsync('light'); // или 'dark'
      } catch (error) {
        console.warn('NavigationBar setup failed:', error);
      }
    }
  };

  useEffect(() => {
    // Загружаем язык при старте приложения
    loadInitialLanguage();
    
    // ✅ Настраиваем навигационную панель
    setupNavigationBar();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // ✅ Показываем лоадер пока шрифты не загружены
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar hidden />
        </ThemeProvider>
      </I18nextProvider>
    </>
  );
}