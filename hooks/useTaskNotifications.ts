import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scheduleNotification,
  cancelNotificationsByRelatedId,
} from '../utils/notificationScheduler';
import { formatDate } from '../utils/dateUtils';
import { getMorningNotificationTime, getEveningNotificationTime } from '../utils/notificationTimes';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string;
  completedAt?: string;
}

const TASK_NOTIFICATION_DAYS_KEY = 'taskNotificationDays';
const DEFAULT_NOTIFICATION_DAYS = [3, 1]; // 3 дня до и 1 день до

/**
 * Хук для управления уведомлениями о задачах
 * Отслеживает задачи с датами и создает напоминания
 */
export const useTaskNotifications = (
  tasks: Task[],
  shouldShowNotifications: boolean
) => {
  const { t, i18n } = useTranslation();

  /**
   * Получает настройки: за сколько дней напоминать
   */
  const getNotificationDays = useCallback(async (): Promise<number[]> => {
    try {
      const stored = await AsyncStorage.getItem(TASK_NOTIFICATION_DAYS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATION_DAYS;
    } catch (error) {
      console.error('Error getting notification days:', error);
      return DEFAULT_NOTIFICATION_DAYS;
    }
  }, []);

  /**
   * Сохраняет настройки: за сколько дней напоминать
   */
  const setNotificationDays = useCallback(async (days: number[]) => {
    try {
      await AsyncStorage.setItem(TASK_NOTIFICATION_DAYS_KEY, JSON.stringify(days));
    } catch (error) {
      console.error('Error setting notification days:', error);
    }
  }, []);

  /**
   * Создает текст уведомления в зависимости от дней до дедлайна
   */
  const getNotificationText = useCallback(
    (task: Task, daysUntil: number, locale: string): { title: string; body: string } => {
      const taskText = task.text.length > 50 ? task.text.substring(0, 47) + '...' : task.text;
      const formattedDate = task.dueDate ? formatDate(task.dueDate, locale) : '';

      if (daysUntil === 0) {
        // Сегодня дедлайн
        return {
          title: t('notifications.taskDueToday'),
          body: `${taskText} 🌸`,
        };
      } else if (daysUntil === 1) {
        // Завтра дедлайн
        return {
          title: t('notifications.taskDueTomorrow'),
          body: `${taskText} ✨`,
        };
      } else {
        // Несколько дней до дедлайна
        return {
          title: t('notifications.taskDueSoon'),
          body: t('notifications.taskDueInDays', {
            task: taskText,
            days: daysUntil,
            date: formattedDate,
          }),
        };
      }
    },
    [t]
  );

  /**
   * Планирует уведомления для одной задачи
   */
  const scheduleTaskNotifications = useCallback(
    async (task: Task) => {
      if (!task.dueDate || task.completed || !shouldShowNotifications) {
        return;
      }

      try {
        // Получаем настройки за сколько дней напоминать
        const notificationDays = await getNotificationDays();
        
        // Получаем настроенное время для уведомлений
        const [morningTime, eveningTime] = await Promise.all([
          getMorningNotificationTime(),
          getEveningNotificationTime(),
        ]);

        // Парсим дату задачи
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(morningTime.hour, morningTime.minute, 0, 0); // Утреннее время

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Планируем уведомление на день дедлайна (утреннее время)
        const dueDateNotificationTime = new Date(dueDate);
        if (dueDateNotificationTime > now) {
          const { title, body } = getNotificationText(task, 0, i18n.language);
          await scheduleNotification(title, body, dueDateNotificationTime, 'task', task.id);
        }

        // Планируем уведомления за N дней до дедлайна
        for (const days of notificationDays) {
          const notificationDate = new Date(dueDate);
          notificationDate.setDate(notificationDate.getDate() - days);

          // За 1 день - вечернее время, за N дней - утреннее
          if (days === 1) {
            notificationDate.setHours(eveningTime.hour, eveningTime.minute, 0, 0);
          } else {
            notificationDate.setHours(morningTime.hour, morningTime.minute, 0, 0);
          }

          // Проверяем что дата в будущем
          if (notificationDate > new Date()) {
            const { title, body } = getNotificationText(task, days, i18n.language);
            await scheduleNotification(title, body, notificationDate, 'task', task.id);
          }
        }
      } catch (error) {
        console.error('Error scheduling task notifications:', error);
      }
    },
    [shouldShowNotifications, getNotificationDays, getNotificationText, i18n.language]
  );

  /**
   * Отменяет все уведомления для задачи
   */
  const cancelTaskNotifications = useCallback(async (taskId: string) => {
    try {
      await cancelNotificationsByRelatedId(taskId, 'task');
    } catch (error) {
      console.error('Error canceling task notifications:', error);
    }
  }, []);

  /**
   * Обновляет уведомления для всех задач
   * Вызывается при изменении списка задач
   */
  const updateAllTaskNotifications = useCallback(async () => {
    if (!shouldShowNotifications) {
      return;
    }

    try {
      // Отменяем все существующие уведомления о задачах
      const tasksWithDates = tasks.filter(t => t.dueDate && !t.completed);
      const taskIds = new Set(tasksWithDates.map(t => t.id));

      // Отменяем старые уведомления для задач, которые больше не актуальны
      // (будет выполнено при следующей очистке)

      // Планируем новые уведомления для всех актуальных задач
      for (const task of tasksWithDates) {
        await cancelTaskNotifications(task.id); // Сначала отменяем старые
        await scheduleTaskNotifications(task);   // Потом создаем новые
      }
    } catch (error) {
      console.error('Error updating all task notifications:', error);
    }
  }, [tasks, shouldShowNotifications, cancelTaskNotifications, scheduleTaskNotifications]);

  /**
   * Обработчик изменения задачи
   */
  const handleTaskChange = useCallback(
    async (task: Task) => {
      // Сначала отменяем все существующие уведомления для этой задачи
      await cancelTaskNotifications(task.id);

      // Если задача завершена или удалена dueDate, больше ничего не делаем
      if (task.completed || !task.dueDate) {
        return;
      }

      // Планируем новые уведомления
      await scheduleTaskNotifications(task);
    },
    [cancelTaskNotifications, scheduleTaskNotifications]
  );

  /**
   * Обработчик удаления задачи
   */
  const handleTaskDelete = useCallback(
    async (taskId: string) => {
      await cancelTaskNotifications(taskId);
    },
    [cancelTaskNotifications]
  );

  // При изменении настроек или задач, обновляем уведомления
  useEffect(() => {
    if (shouldShowNotifications) {
      updateAllTaskNotifications();
    }
  }, [tasks, shouldShowNotifications]); // Пересоздаем уведомления при изменении задач

  return {
    scheduleTaskNotifications,
    cancelTaskNotifications,
    updateAllTaskNotifications,
    handleTaskChange,
    handleTaskDelete,
    getNotificationDays,
    setNotificationDays,
  };
};
