import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FloatingBackground } from "@/components/MagicalFeatures";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useFonts } from 'expo-font';
import {
  Comfortaa_400Regular,
  Comfortaa_500Medium
} from '@expo-google-fonts/comfortaa';
import * as SplashScreen from 'expo-splash-screen';

// Предотвращаем автоскрытие splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    // Comfortaa для основного текста
    'Comfortaa_400Regular': Comfortaa_400Regular,
    'Comfortaa_500Medium': Comfortaa_500Medium,
    
    // Coiny для заголовков - попробуйте разные пути:
    'Coiny_400Regular': require('@/assets/fonts/Coiny-Cyrillic.ttf'),
    
    // Оставляем старые названия для совместимости (если используются где-то)
    'ComicNeue-Regular': Comfortaa_400Regular,
    'ComicNeue-Bold': Comfortaa_500Medium,
    'CabinSketch-Regular': require('@/assets/fonts/Coiny-Cyrillic.ttf'),
    'CabinSketch-Bold': require('@/assets/fonts/Coiny-Cyrillic.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Добавляем небольшую задержку и обработку ошибок
      setTimeout(async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('SplashScreen hide error:', error);
        }
      }, 100);
    }
  }, [fontsLoaded, fontError]);

  // Показываем загрузку пока шрифты не готовы
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#000' // чтобы видеть что происходит
      }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Если ошибка загрузки шрифтов - все равно показываем приложение
  if (fontError) {
    console.warn('Font loading error:', fontError);
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <FloatingBackground />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </I18nextProvider>
  );
}