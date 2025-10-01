import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { setStatusBarHidden } from 'expo-status-bar';
import { View, ActivityIndicator, Platform, LogBox } from 'react-native';
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

LogBox.ignoreLogs([
  'useInsertionEffect must not schedule updates',
]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // ✅ 1. TODOS los hooks primero (en el mismo orden SIEMPRE)
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'ComicNeue-Regular': Comfortaa_400Regular,
    'ComicNeue-Bold': Comfortaa_500Medium,
    'CabinSketch-Regular': require('@/assets/fonts/Coiny-Cyrillic.ttf'),
    'CabinSketch-Bold': require('@/assets/fonts/Coiny-Cyrillic.ttf'),
    'Comfortaa_400Regular': Comfortaa_400Regular,
    'Comfortaa_500Medium': Comfortaa_500Medium,
    'Coiny_400Regular': require('@/assets/fonts/Coiny-Cyrillic.ttf'),
  });

  // ✅ 2. Funciones auxiliares (NO hooks)
  const loadInitialLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && ['en', 'ru', 'es', 'ca'].includes(savedLanguage)) {
        await i18n.changeLanguage(savedLanguage);
        console.log(`Loaded language: ${savedLanguage}`);
      }
    } catch (error) {
      console.error('Error loading initial language:', error);
    }
  };

  const setupFullscreen = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('Включаю fullscreen режим...');
        setStatusBarHidden(true, 'fade');
        await NavigationBar.setVisibilityAsync('hidden');
        console.log('Оба элемента скрыты');
      } catch (error) {
        console.warn('Fullscreen setup failed:', error);
      }
    }
  };

  // ✅ 3. TODOS los useEffect AL FINAL - COMBINADOS EN UNO SOLO
  useEffect(() => {
    // Carga inicial del idioma
    loadInitialLanguage();
    
    // Setup de fuentes y fullscreen
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      setupFullscreen();
    }
  }, [fontsLoaded, fontError]); // ✅ Dependencias claras

  // ✅ 4. Early return DESPUÉS de todos los hooks
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ✅ 5. JSX Return
  return (
    <ThemeProvider>
    <I18nextProvider i18n={i18n}>
      
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      
    </I18nextProvider>
    </ThemeProvider>
  );
}