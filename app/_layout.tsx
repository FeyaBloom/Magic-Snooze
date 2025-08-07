import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/components/ThemeProvider';
import {FloatingBackground} from "@/components/MagicalFeatures"
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useFonts } from 'expo-font';
import {
  Comfortaa_400Regular,
  Comfortaa_500Medium
} from '@expo-google-fonts/comfortaa';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);
  
if (Platform.OS === 'android') {
    NavigationBar.setBackgroundColorAsync('transparent');
    NavigationBar.setButtonStyleAsync('light'); // или 'dark'
  
};

  if (!fontsLoaded && !fontError) {
    return null; // как у вас было
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