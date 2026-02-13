import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLED_KEY = 'notificationsEnabled';
const TASKS_ENABLED_KEY = 'taskNotificationsEnabled';
const ROUTINES_ENABLED_KEY = 'routineNotificationsEnabled';

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [tasksEnabled, setTasksEnabled] = useState(true);
  const [routinesEnabled, setRoutinesEnabled] = useState(true);
  
  const isSupported = Device.isDevice && Platform.OS !== 'web';

  // Инициализация
  useEffect(() => {
    if (!isSupported) return;

    const init = async () => {
      // Настраиваем handler (новый формат)
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
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

      // Загружаем настройки вкл/выкл
      const enabled = await AsyncStorage.getItem(ENABLED_KEY);
      setIsEnabled(enabled === 'true');
      
      const tasksEnabledStr = await AsyncStorage.getItem(TASKS_ENABLED_KEY);
      setTasksEnabled(tasksEnabledStr === null ? true : tasksEnabledStr === 'true');
      
      const routinesEnabledStr = await AsyncStorage.getItem(ROUTINES_ENABLED_KEY);
      setRoutinesEnabled(routinesEnabledStr === null ? true : routinesEnabledStr === 'true');
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

  const toggleTasks = async (enabled: boolean) => {
    setTasksEnabled(enabled);
    await AsyncStorage.setItem(TASKS_ENABLED_KEY, enabled.toString());
  };

  const toggleRoutines = async (enabled: boolean) => {
    setRoutinesEnabled(enabled);
    await AsyncStorage.setItem(ROUTINES_ENABLED_KEY, enabled.toString());
  };

  return {
    isSupported,
    hasPermission,
    isEnabled,
    tasksEnabled,
    routinesEnabled,
    requestPermission,
    toggle,
    toggleTasks,
    toggleRoutines,
    shouldShow: isSupported && hasPermission && isEnabled,
    shouldShowTasks: isSupported && hasPermission && isEnabled && tasksEnabled,
    shouldShowRoutines: isSupported && hasPermission && isEnabled && routinesEnabled,
  };
};