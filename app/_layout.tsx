import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { 
  Platform,
  AppState,
  Keyboard 
 } from 'react-native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { AppToastConfig} from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import '@/i18n';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {

const [fontsLoaded, fontError] = useFonts({
  'Cormorant_400Regular': require('../assets/fonts/Cormorant-Regular.ttf'),
    'Cormorant_500Medium': require('../assets/fonts/Cormorant-Medium.ttf'),
      'Cormorant_500Medium_Italic': require('../assets/fonts/Cormorant-MediumItalic.ttf'),
        'Cormorant_600SemiBold': require('../assets/fonts/Cormorant-SemiBold.ttf'),
          'Cormorant_700Bold': require('../assets/fonts/Cormorant-Bold.ttf'),
            'Nunito_400Regular': require('../assets/fonts/Nunito-Regular.ttf'),
              'Nunito_600SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
                'Nunito_700Bold': require('../assets/fonts/Nunito-Bold.ttf'),
                });



useEffect(() => {
    if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden');
    }
}, []);

  // Fix for edge-to-edge minimizing 
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        NavigationBar.setVisibilityAsync('hidden');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
  const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
    NavigationBar.setVisibilityAsync('hidden');
  });
  
  const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
    NavigationBar.setVisibilityAsync('hidden');
  });

  return () => {
    keyboardDidShow.remove();
    keyboardDidHide.remove();
  };
}, []);

useEffect(() => {
    if (fontsLoaded || fontError) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100); // Небольшая задержка для уверенности в загрузке на Android
    }
  }, [fontsLoaded, fontError]);

   useEffect(() => {
    // all data from LocalStorage to console
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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
    <StatusBar hidden={true} />
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