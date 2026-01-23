import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Проверяет, является ли устройство физическим (не эмулятором)
 */
export const isPhysicalDevice = (): boolean => {
  return Device.isDevice;
};

/**
 * Проверяет, поддерживаются ли уведомления на текущей платформе
 */
export const areNotificationsSupported = (): boolean => {
  // Веб и эмуляторы не поддерживают нативные уведомления
  if (Platform.OS === 'web' || !isPhysicalDevice()) {
    return false;
  }
  return true;
};

/**
 * Получает текущий статус разрешений на уведомления
 */
export const getNotificationPermissionStatus = async (): Promise<{
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}> => {
  if (!areNotificationsSupported()) {
    return { 
      granted: false, 
      canAskAgain: false, 
      status: 'undetermined' as Notifications.PermissionStatus 
    };
  }

  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  
  return {
    granted: status === 'granted',
    canAskAgain,
    status,
  };
};

/**
 * Запрашивает разрешение на уведомления у пользователя
 * Мягкий подход: не будет настойчиво просить, если пользователь отказал
 */
export const requestNotificationPermissions = async (): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> => {
  if (!areNotificationsSupported()) {
    return { granted: false, canAskAgain: false };
  }

  // Сначала проверим текущий статус
  const currentStatus = await getNotificationPermissionStatus();
  
  // Если уже разрешено, возвращаем true
  if (currentStatus.granted) {
    return { granted: true, canAskAgain: false };
  }

  // Если нельзя больше спрашивать (пользователь отклонил), не беспокоим
  if (!currentStatus.canAskAgain) {
    return { granted: false, canAskAgain: false };
  }

  // Запрашиваем разрешение
  const { status, canAskAgain } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return {
    granted: status === 'granted',
    canAskAgain,
  };
};

/**
 * Настраивает обработчик уведомлений по умолчанию
 * Для ADHD-friendly UX: показываем уведомления мягко
 */
export const setupNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false, // Без звука по умолчанию - меньше стресса
      shouldSetBadge: false,   // Без бейджей - меньше тревожности
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

/**
 * Настраивает каналы уведомлений для Android
 * Разные каналы для разных типов - пользователь может управлять каждым отдельно
 */
export const setupNotificationChannels = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  // Канал для напоминаний о задачах
  await Notifications.setNotificationChannelAsync('tasks', {
    name: 'Task Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#F59E0B',
    sound: null, // Без звука для мягкого подхода
    enableVibrate: true,
  });

  // Канал для ежедневных промптов (можно будет добавить позже)
  await Notifications.setNotificationChannelAsync('prompts', {
    name: 'Daily Prompts',
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [0, 100],
    lightColor: '#EC4899',
    sound: null,
    enableVibrate: false, // Совсем мягкие, без вибрации
  });

  // Канал для напоминаний о рутинах (можно будет добавить позже)
  await Notifications.setNotificationChannelAsync('routines', {
    name: 'Routine Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#8B5CF6',
    sound: null,
    enableVibrate: true,
  });
};
