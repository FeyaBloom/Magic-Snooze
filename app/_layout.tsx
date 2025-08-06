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
import {
  Coiny_400Regular
} from '@expo-google-fonts/coiny';

import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'ComicNeue-Regular': ComicNeue_400Regular,
    'ComicNeue-Bold': ComicNeue_700Bold,
    'CabinSketch-Regular': CabinSketch_400Regular,
    'CabinSketch-Bold': CabinSketch_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <I18nextProvider i18n={i18n}>
      <ThemeProvider>
       
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
         </Stack>
        
          <StatusBar style="auto" />
       
      </ThemeProvider>
        </I18nextProvider>
    </>
  );
}
