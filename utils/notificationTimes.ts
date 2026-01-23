import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключи для хранения настроек времени
const MORNING_NOTIFICATION_TIME_KEY = 'morningNotificationTime';
const EVENING_NOTIFICATION_TIME_KEY = 'eveningNotificationTime';

// Дефолтные значения совпадают с временем смены темы
export const DEFAULT_MORNING_HOUR = 7;  // 07:00 (совпадает с переходом в daydream)
export const DEFAULT_EVENING_HOUR = 19; // 19:00 (совпадает с переходом в nightforest)

export interface NotificationTime {
  hour: number;
  minute: number;
}

/**
 * Получает время для утренних уведомлений
 */
export const getMorningNotificationTime = async (): Promise<NotificationTime> => {
  try {
    const stored = await AsyncStorage.getItem(MORNING_NOTIFICATION_TIME_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error getting morning notification time:', error);
  }
  
  return {
    hour: DEFAULT_MORNING_HOUR,
    minute: 0,
  };
};

/**
 * Получает время для вечерних уведомлений
 */
export const getEveningNotificationTime = async (): Promise<NotificationTime> => {
  try {
    const stored = await AsyncStorage.getItem(EVENING_NOTIFICATION_TIME_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error getting evening notification time:', error);
  }
  
  return {
    hour: DEFAULT_EVENING_HOUR,
    minute: 0,
  };
};

/**
 * Сохраняет время для утренних уведомлений
 */
export const setMorningNotificationTime = async (time: NotificationTime): Promise<void> => {
  try {
    await AsyncStorage.setItem(MORNING_NOTIFICATION_TIME_KEY, JSON.stringify(time));
  } catch (error) {
    console.error('Error setting morning notification time:', error);
  }
};

/**
 * Сохраняет время для вечерних уведомлений
 */
export const setEveningNotificationTime = async (time: NotificationTime): Promise<void> => {
  try {
    await AsyncStorage.setItem(EVENING_NOTIFICATION_TIME_KEY, JSON.stringify(time));
  } catch (error) {
    console.error('Error setting evening notification time:', error);
  }
};

/**
 * Форматирует время для отображения
 */
export const formatTime = (time: NotificationTime): string => {
  const hour = time.hour.toString().padStart(2, '0');
  const minute = time.minute.toString().padStart(2, '0');
  return `${hour}:${minute}`;
};

/**
 * Парсит строку времени (HH:mm) в NotificationTime
 */
export const parseTime = (timeString: string): NotificationTime => {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
};

/**
 * Получает все настройки времени уведомлений
 */
export const getAllNotificationTimes = async () => {
  const [morning, evening] = await Promise.all([
    getMorningNotificationTime(),
    getEveningNotificationTime(),
  ]);
  
  return { morning, evening };
};
