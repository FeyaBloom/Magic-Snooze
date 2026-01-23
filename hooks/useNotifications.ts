import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setupNotificationHandler,
  setupNotificationChannels,
  requestNotificationPermissions,
  getNotificationPermissionStatus,
  areNotificationsSupported,
} from '../utils/notificationPermissions';
import {
  cancelAllNotifications,
  cleanupExpiredNotifications,
} from '../utils/notificationScheduler';

const NOTIFICATIONS_ENABLED_KEY = 'notificationsEnabled';
const TASK_NOTIFICATIONS_KEY = 'taskNotificationsEnabled';

/**
 * Базовый хук для управления системой уведомлений
 * ADHD-friendly подход: все опционально, пользователь контролирует
 */
export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [taskNotificationsEnabled, setTaskNotificationsEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Загружает настройки из AsyncStorage
   */
  const loadSettings = useCallback(async () => {
    try {
      const [enabled, taskEnabled] = await Promise.all([
        AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY),
        AsyncStorage.getItem(TASK_NOTIFICATIONS_KEY),
      ]);

      setIsEnabled(enabled === 'true');
      setTaskNotificationsEnabled(taskEnabled !== 'false'); // По умолчанию true
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  /**
   * Проверяет состояние разрешений
   */
  const checkPermissions = useCallback(async () => {
    const { granted } = await getNotificationPermissionStatus();
    setHasPermission(granted);
  }, []);

  /**
   * Инициализация системы уведомлений
   */
  const initialize = useCallback(async () => {
    // Проверяем поддержку
    const supported = areNotificationsSupported();
    setIsSupported(supported);

    if (!supported) {
      setIsInitialized(true);
      return;
    }

    // Настраиваем обработчик
    setupNotificationHandler();

    // Настраиваем каналы для Android
    await setupNotificationChannels();

    // Загружаем настройки
    await loadSettings();

    // Проверяем разрешения
    await checkPermissions();

    // Очищаем устаревшие уведомления
    await cleanupExpiredNotifications();

    setIsInitialized(true);
  }, [loadSettings, checkPermissions]);

  /**
   * Запрашивает разрешение у пользователя (мягко)
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    const { granted } = await requestNotificationPermissions();
    setHasPermission(granted);

    // Если получили разрешение, автоматически включаем уведомления
    if (granted && !isEnabled) {
      await toggleNotifications(true);
    }

    return granted;
  }, [isSupported, isEnabled]);

  /**
   * Включает/выключает все уведомления
   */
  const toggleNotifications = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled.toString());
      setIsEnabled(enabled);

      // Если выключаем, отменяем все уведомления
      if (!enabled) {
        await cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  }, []);

  /**
   * Включает/выключает уведомления для задач
   */
  const toggleTaskNotifications = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(TASK_NOTIFICATIONS_KEY, enabled.toString());
      setTaskNotificationsEnabled(enabled);
    } catch (error) {
      console.error('Error toggling task notifications:', error);
    }
  }, []);

  /**
   * Проверяет, должны ли показываться уведомления
   */
  const shouldShowNotifications = useCallback((): boolean => {
    return isSupported && hasPermission && isEnabled;
  }, [isSupported, hasPermission, isEnabled]);

  /**
   * Проверяет, должны ли показываться уведомления для задач
   */
  const shouldShowTaskNotifications = useCallback((): boolean => {
    return shouldShowNotifications() && taskNotificationsEnabled;
  }, [shouldShowNotifications, taskNotificationsEnabled]);

  // Инициализация при монтировании
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // Состояние
    isSupported,
    hasPermission,
    isEnabled,
    taskNotificationsEnabled,
    isInitialized,

    // Методы
    requestPermission,
    toggleNotifications,
    toggleTaskNotifications,
    shouldShowNotifications,
    shouldShowTaskNotifications,
    checkPermissions,
  };
};
