import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { getLocalDateString } from '@/utils/dateUtils';

const LAST_ROUTINE_REMINDER_DATE_KEY = 'lastRoutineReminderDate';
const ROUTINE_REMINDER_ID_KEY = 'routineReminderNotificationId';
const ROUTINE_REMINDER_FOR_DATE_KEY = 'routineReminderForDate';

export const useRoutineNotifications = (enabled: boolean) => {
  const { t } = useTranslation();
  const lastCheckDate = useRef<string>('');

  const cancelPlannedReminder = async () => {
    try {
      const scheduledId = await AsyncStorage.getItem(ROUTINE_REMINDER_ID_KEY);
      if (scheduledId) {
        await Notifications.cancelScheduledNotificationAsync(scheduledId);
      }
      await AsyncStorage.multiRemove([ROUTINE_REMINDER_ID_KEY, ROUTINE_REMINDER_FOR_DATE_KEY]);
    } catch (error) {
      console.error('Error canceling planned reminder:', error);
    }
  };

  // Проверка активности за день
  const checkDailyActivity = async (): Promise<boolean> => {
    try {
      const today = getLocalDateString();
      
      // Проверяем прогресс рутин
      const progressKey = `progress_${today}`;
      const progress = await AsyncStorage.getItem(progressKey);
      if (progress) {
        const data = JSON.parse(progress);
        if (data.morningDone > 0 || data.eveningDone > 0 || data.snoozed) {
          return true;
        }
      }
      
      // Проверяем выполненные задачи
      const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
      if (tasksStr) {
        const tasks = JSON.parse(tasksStr);
        const completedToday = tasks.some((t: any) => 
          t.completed && (t.completedAt === today || t.dueDate === today)
        );
        if (completedToday) return true;
      }
      
      // Проверяем победы
      const victoriesStr = await AsyncStorage.getItem(`victories_${today}`);
      if (victoriesStr) {
        const victories = JSON.parse(victoriesStr);
        if (victories.length > 0) return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking daily activity:', error);
      return false;
    }
  };

  // Проверка наличия заморозки
  const checkFreezeAvailable = async (): Promise<boolean> => {
    try {
      const streakStr = await AsyncStorage.getItem('streakData');
      if (streakStr) {
        const streak = JSON.parse(streakStr);
        return (streak.freezeDaysAvailable || 0) > 0;
      }
      return false;
    } catch (error) {
      console.error('Error checking freeze:', error);
      return false;
    }
  };

  // Проверка и отправка уведомления
  const checkAndNotify = async () => {
    try {
      const now = new Date();
      const hours = now.getHours();

      const today = getLocalDateString();
      const reminderAt = new Date(now);
      reminderAt.setHours(20, 0, 0, 0);

      const [scheduledId, scheduledForDate, lastSentDate] = await AsyncStorage.multiGet([
        ROUTINE_REMINDER_ID_KEY,
        ROUTINE_REMINDER_FOR_DATE_KEY,
        LAST_ROUTINE_REMINDER_DATE_KEY,
      ]).then(entries => entries.map(([, value]) => value));

      // Если уже проверяли сегодня - не проверяем снова
      // До 20:00 нужно периодически проверять, чтобы отменить запланированное при появлении активности
      if (lastCheckDate.current === today && now >= reminderAt) {
        return;
      }
      
      lastCheckDate.current = today;

      // Проверяем активность
      const hasActivity = await checkDailyActivity();
      
      // Если есть активность - не отправляем уведомление
      if (hasActivity) {
        if (scheduledForDate === today) {
          await cancelPlannedReminder();
        }
        return;
      }

      // До 20:00: планируем уведомление на 20:00, чтобы сработало даже при закрытом приложении
      if (now < reminderAt) {
        if (scheduledForDate === today && scheduledId) {
          return;
        }

        await cancelPlannedReminder();

        const hasFreezeAvailable = await checkFreezeAvailable();
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: t('notifications.routineReminder'),
            body: hasFreezeAvailable
              ? t('notifications.routineReminderWithFreeze')
              : t('notifications.routineReminderNoFreeze'),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderAt,
            channelId: 'tasks',
          },
        });

        await AsyncStorage.multiSet([
          [ROUTINE_REMINDER_ID_KEY, id],
          [ROUTINE_REMINDER_FOR_DATE_KEY, today],
        ]);
        return;
      }

      // После 20:00: если уже было запланировано на сегодня, не дублируем
      if (scheduledForDate === today) {
        return;
      }

      if (lastSentDate === today) {
        return;
      }

      // Нет активности - отправляем уведомление
      const hasFreezeAvailable = await checkFreezeAvailable();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.routineReminder'),
          body: hasFreezeAvailable 
            ? t('notifications.routineReminderWithFreeze')
            : t('notifications.routineReminderNoFreeze'),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(Date.now() + 1000),
          channelId: 'tasks',
        },
      });

      await AsyncStorage.setItem(LAST_ROUTINE_REMINDER_DATE_KEY, today);
    } catch (error) {
      console.error('Error checking and notifying:', error);
    }
  };

  useEffect(() => {
    if (!enabled) {
      cancelPlannedReminder();
      return;
    }

    // Проверяем каждую минуту
    const interval = setInterval(() => {
      checkAndNotify();
    }, 60 * 1000);

    // Проверяем сразу при монтировании
    checkAndNotify();

    return () => {
      clearInterval(interval);
    };
  }, [enabled, t]);
};