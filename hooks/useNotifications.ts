import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLED_KEY = 'notificationsEnabled';

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  
  const isSupported = Device.isDevice && Platform.OS !== 'web';

  // Инициализация
  useEffect(() => {
    if (!isSupported) return;

    const init = async () => {
      // Настраиваем handler (новый формат)
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Настраиваем канал для Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('tasks', {
          name: 'Task Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: null,
        });
      }

      // Проверяем permissions
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');

      // Загружаем настройку вкл/выкл
      const enabled = await AsyncStorage.getItem(ENABLED_KEY);
      setIsEnabled(enabled === 'true');
    };

    init();
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) return false;
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    if (granted) {
      setIsEnabled(true);
      await AsyncStorage.setItem(ENABLED_KEY, 'true');
    }
    return granted;
  };

  const toggle = async (enabled: boolean) => {
    setIsEnabled(enabled);
    await AsyncStorage.setItem(ENABLED_KEY, enabled.toString());
    if (!enabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  return {
    isSupported,
    hasPermission,
    isEnabled,
    requestPermission,
    toggle,
    shouldShow: isSupported && hasPermission && isEnabled,
  };
};