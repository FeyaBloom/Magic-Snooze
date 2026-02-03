import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export const useTaskNotifications = (tasks: Task[], enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const schedule = async () => {
      // Отменяем все старые уведомления
      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();

      for (const task of tasks) {
        if (task.completed || !task.dueDate) continue;

        const dueDate = new Date(task.dueDate);
        const taskShort = task.text.length > 50 
          ? task.text.substring(0, 47) + '...' 
          : task.text;

        // За 3 дня в 9:00
        const remind3 = new Date(dueDate);
        remind3.setDate(remind3.getDate() - 3);
        remind3.setHours(9, 0, 0, 0);
        
        if (remind3 > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Task due in 3 days',
              body: taskShort,
            },
            trigger: {
              channelId: 'tasks',
              date: remind3,
            } as Notifications.NotificationTriggerInput,
          });
        }

        // За 1 день в 19:00
        const remind1 = new Date(dueDate);
        remind1.setDate(remind1.getDate() - 1);
        remind1.setHours(19, 0, 0, 0);
        
        if (remind1 > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Task due tomorrow',
              body: taskShort,
            },
            trigger: {
              channelId: 'tasks',
              date: remind1,
            } as Notifications.NotificationTriggerInput,
          });
        }

        // В день дедлайна в 9:00
        const remindToday = new Date(dueDate);
        remindToday.setHours(9, 0, 0, 0);
        
        if (remindToday > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Task due today!',
              body: taskShort,
            },
            trigger: {
              channelId: 'tasks',
              date: remindToday,
            } as Notifications.NotificationTriggerInput,
          });
        }
      }
    };

    schedule();
  }, [tasks, enabled]);
};