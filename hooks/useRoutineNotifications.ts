import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { getLocalDateString } from '@/utils/dateUtils';

export const useRoutineNotifications = (enabled: boolean) => {
  const { t } = useTranslation();
  const lastCheckDate = useRef<string>('');

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
      const minutes = now.getMinutes();
      
      // Проверяем только в 20:00 (с погрешностью в минуту)
      if (hours !== 20 || minutes > 1) {
        return;
      }

      const today = getLocalDateString();
      
      // Если уже проверяли сегодня - не проверяем снова
      if (lastCheckDate.current === today) {
        return;
      }
      
      lastCheckDate.current = today;

      // Проверяем активность
      const hasActivity = await checkDailyActivity();
      
      // Если есть активность - не отправляем уведомление
      if (hasActivity) {
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
        trigger: null, // Отправляем сразу
      });
    } catch (error) {
      console.error('Error checking and notifying:', error);
    }
  };

  useEffect(() => {
    if (!enabled) return;

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