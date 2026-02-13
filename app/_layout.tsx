import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, AppState, Keyboard, DeviceEventEmitter } from 'react-native';
import { Stack } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font';
import { AppToastConfig } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';
import { useRoutineNotifications } from '@/hooks/useRoutineNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@/i18n';

SplashScreen.preventAutoHideAsync();

function NotificationInitializer() {
  const { shouldShowTasks, shouldShowRoutines } = useNotifications();
  const [tasks, setTasks] = useState([]);

  // Загружаем задачи для уведомлений
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
        const allTasks = tasksStr ? JSON.parse(tasksStr) : [];
        setTasks(allTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();

    // Подписываемся на изменения задач в реальном времени
    const subscription = DeviceEventEmitter.addListener('tasksChanged', loadTasks);

    return () => {
      subscription.remove();
    };
  }, []);

  // Инициализация уведомлений
  useTaskNotifications(tasks, shouldShowTasks);
  useRoutineNotifications(shouldShowRoutines);

  return null;
}

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

  const [themeReady, setThemeReady] = useState(false);
  const handleThemeReady = useCallback(() => setThemeReady(true), []);

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
    if ((fontsLoaded || fontError) && themeReady) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
    }
  }, [fontsLoaded, fontError, themeReady]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar hidden={true} />
      <ThemeProvider onReady={handleThemeReady}>
        <LanguageProvider>
          <NotificationInitializer />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
          <Toast config={AppToastConfig()} />
        </LanguageProvider>
      </ThemeProvider>
    </>
  );
}