import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключ для хранения запланированных уведомлений
const SCHEDULED_NOTIFICATIONS_KEY = 'scheduledNotifications';

// Типы уведомлений
export type NotificationType = 'task' | 'routine' | 'prompt';

// Интерфейс для отслеживания запланированных уведомлений
export interface ScheduledNotification {
  id: string;                    // Системный ID от Expo
  type: NotificationType;        // Тип уведомления
  relatedId?: string;            // ID связанной сущности (например, taskId)
  scheduledFor: number;          // Timestamp когда должно показаться
  title: string;                 // Заголовок
  body: string;                  // Текст
}

/**
 * Получает все запланированные уведомления из хранилища
 */
export const getScheduledNotifications = async (): Promise<ScheduledNotification[]> => {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Сохраняет запланированные уведомления в хранилище
 */
const saveScheduledNotifications = async (notifications: ScheduledNotification[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving scheduled notifications:', error);
  }
};

/**
 * Добавляет уведомление в список запланированных
 */
const addScheduledNotification = async (notification: ScheduledNotification): Promise<void> => {
  const scheduled = await getScheduledNotifications();
  scheduled.push(notification);
  await saveScheduledNotifications(scheduled);
};

/**
 * Удаляет уведомление из списка запланированных
 */
const removeScheduledNotification = async (notificationId: string): Promise<void> => {
  const scheduled = await getScheduledNotifications();
  const filtered = scheduled.filter(n => n.id !== notificationId);
  await saveScheduledNotifications(filtered);
};

/**
 * Планирует локальное уведомление
 */
export const scheduleNotification = async (
  title: string,
  body: string,
  trigger: Date,
  type: NotificationType,
  relatedId?: string,
  channelId: string = 'tasks'
): Promise<string | null> => {
  try {
    // Проверяем, что дата в будущем
    if (trigger.getTime() <= Date.now()) {
      console.warn('Cannot schedule notification in the past');
      return null;
    }

    // Планируем уведомление
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type, relatedId },
        sound: false, // Без звука для мягкого UX
      },
      trigger: {
        channelId,
        date: trigger,
      },
    });

    // Сохраняем в наше хранилище для отслеживания
    await addScheduledNotification({
      id: notificationId,
      type,
      relatedId,
      scheduledFor: trigger.getTime(),
      title,
      body,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Отменяет запланированное уведомление
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    await removeScheduledNotification(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

/**
 * Отменяет все уведомления связанные с определенной сущностью
 * Например, все уведомления для конкретной задачи
 */
export const cancelNotificationsByRelatedId = async (
  relatedId: string,
  type?: NotificationType
): Promise<void> => {
  try {
    const scheduled = await getScheduledNotifications();
    const toCancel = scheduled.filter(
      n => n.relatedId === relatedId && (!type || n.type === type)
    );

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.id);
      await removeScheduledNotification(notification.id);
    }
  } catch (error) {
    console.error('Error canceling notifications by related ID:', error);
  }
};

/**
 * Отменяет все уведомления определенного типа
 */
export const cancelNotificationsByType = async (type: NotificationType): Promise<void> => {
  try {
    const scheduled = await getScheduledNotifications();
    const toCancel = scheduled.filter(n => n.type === type);

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.id);
      await removeScheduledNotification(notification.id);
    }
  } catch (error) {
    console.error('Error canceling notifications by type:', error);
  }
};

/**
 * Отменяет ВСЕ запланированные уведомления
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await saveScheduledNotifications([]);
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

/**
 * Очищает устаревшие уведомления из хранилища
 * (те, которые уже должны были показаться)
 */
export const cleanupExpiredNotifications = async (): Promise<void> => {
  try {
    const scheduled = await getScheduledNotifications();
    const now = Date.now();
    const active = scheduled.filter(n => n.scheduledFor > now);
    await saveScheduledNotifications(active);
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
  }
};

/**
 * Получает все активные уведомления от системы
 */
export const getAllScheduledNotificationsFromSystem = async (): Promise<
  Notifications.NotificationRequest[]
> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting all scheduled notifications:', error);
    return [];
  }
};
