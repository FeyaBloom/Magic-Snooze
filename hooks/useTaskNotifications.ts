import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export const useTaskNotifications = (tasks: Task[], enabled: boolean) => {
  // Используем ref чтобы не планировать уведомления при каждом рендере
  const lastTasksHash = useRef<string>('');
  const scheduleLock = useRef(false);

  const NOTIFICATION_IDS_KEY = 'taskNotificationIds';

  useEffect(() => {
    if (!enabled) return;

    // Создаем хеш из задач чтобы понять изменились ли они реально
    const tasksHash = tasks
      .filter(t => !t.completed && t.dueDate)
      .map(t => `${t.id}:${t.dueDate}:${t.completed}`)
      .sort()
      .join('|');

    // Если ничего не изменилось - не перепланируем
    if (tasksHash === lastTasksHash.current) {
      return;
    }

    lastTasksHash.current = tasksHash;

    const schedule = async () => {
      if (scheduleLock.current) return;
      scheduleLock.current = true;
      try {
        const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
        const previousMap: Record<string, string[]> = stored ? JSON.parse(stored) : {};
        const nextMap: Record<string, string[]> = {};

        const now = new Date();
        const minFutureTime = new Date(now.getTime() + 10 * 60 * 1000); // Минимум через 10 минут

        const activeTasks = tasks.filter(task => !task.completed && task.dueDate);
        const activeIds = new Set(activeTasks.map(task => task.id));

        // Отменяем уведомления для удаленных/завершенных задач
        await Promise.all(
          Object.entries(previousMap)
            .filter(([taskId]) => !activeIds.has(taskId))
            .flatMap(([, ids]) => ids.map(id => Notifications.cancelScheduledNotificationAsync(id)))
        );
        for (const task of activeTasks) {
          const previousIds = previousMap[task.id] ?? [];
          if (previousIds.length) {
            await Promise.all(previousIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
          }

          const dueDate = new Date(task.dueDate + 'T00:00:00'); // Явно парсим как локальную дату
          const taskShort = task.text.length > 50 
            ? task.text.substring(0, 47) + '...' 
            : task.text;

          const newIds: string[] = [];

          // За 3 дня в 7:00
          const remind3 = new Date(dueDate);
          remind3.setDate(remind3.getDate() - 3);
          remind3.setHours(7, 0, 0, 0);
          
          if (remind3 > minFutureTime) {
            const id = await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Task due in 3 days',
                body: taskShort,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: remind3,
                channelId: 'tasks',
              },
            });
            newIds.push(id);
          }

          // За 1 день в 19:00
          const remind1 = new Date(dueDate);
          remind1.setDate(remind1.getDate() - 1);
          remind1.setHours(19, 0, 0, 0);
          
          if (remind1 > minFutureTime) {
            const id = await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Task due tomorrow',
                body: taskShort,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: remind1,
                channelId: 'tasks',
              },
            });
            newIds.push(id);
          }

          // В день дедлайна в 7:00
          const remindToday = new Date(dueDate);
          remindToday.setHours(7, 0, 0, 0);
          
          if (remindToday > minFutureTime) {
            const id = await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Task due today!',
                body: taskShort,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: remindToday,
                channelId: 'tasks',
              },
            });
            newIds.push(id);
          }

          if (newIds.length) {
            nextMap[task.id] = newIds;
          }
        }

        await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(nextMap));
      } finally {
        scheduleLock.current = false;
      }
    };

    // Задержка чтобы не спамить при быстрых изменениях
    const timeout = setTimeout(() => {
      schedule();
    }, 500);

    return () => clearTimeout(timeout);
  }, [tasks, enabled]);
};