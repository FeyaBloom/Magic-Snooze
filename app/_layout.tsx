import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider, useLanguage } from '@/components/LanguageProvider';
import {FloatingBackground} from "@/components/MagicalFeatures"


import { useFonts } from 'expo-font';
import {
  ComicNeue_400Regular,
  ComicNeue_700Bold
} from '@expo-google-fonts/comic-neue';
import {
  CabinSketch_400Regular,
  CabinSketch_700Bold
} from '@expo-google-fonts/cabin-sketch';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const AppContent = ({ children }) => {
  const { isLoading } = useLanguage();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  return children;
};

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
      <ThemeProvider>
        <LanguageProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        
          <StatusBar style="auto" />
        </LanguageProvider>
      </ThemeProvider>
    </>
  );
}
