import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts, 
  Cormorant_400Regular,
  Cormorant_500Medium,
  Cormorant_500Medium_Italic,
  Cormorant_600SemiBold,
  Cormorant_700Bold,
} from '@expo-google-fonts/cormorant';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { AppToastConfig} from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import '@/i18n';

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cormorant_400Regular,
    Cormorant_500Medium,
    Cormorant_500Medium_Italic,
    Cormorant_600SemiBold,
    Cormorant_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      //NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Вывести все данные из LocalStorage в консоль (только для web/отладки)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      console.log('=== LocalStorage Contents ===');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          console.log(`${key}:`, value);
        }
      }
      console.log('=== End LocalStorage ===');
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
    <StatusBar style ="auto" translucent backgroundColor="transparent"/>
    <ThemeProvider>
      <LanguageProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <Toast config={AppToastConfig()} />
      </LanguageProvider>
    </ThemeProvider>
    </>
  );
}