import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPreviousDay = (dateStr: string) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return getLocalDateString(date);
};

const getNextDay = (dateStr: string) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return getLocalDateString(date);
};

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  });

  const loadStreak = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('streakData');
      if (stored) {
        setStreak(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  }, []);

  const updateStreak = useCallback(async (dayHasActivity: boolean) => {
    try {
      const today = getLocalDateString();
      const stored = await AsyncStorage.getItem('streakData');
      let streakData: StreakData = stored
        ? JSON.parse(stored)
        : { currentStreak: 0, longestStreak: 0, lastActiveDate: null };

      // Проверить активность на основе всех источников (рутины, задачи, победы)
      let hasAnyActivity = dayHasActivity; // From progress/routines

      // Проверить задачи
      if (!hasAnyActivity) {
        const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
        if (tasksStr) {
          const tasks = JSON.parse(tasksStr);
          const completedToday = tasks.some((t: any) => {
            if (!t.completed) return false;
            if (t.completedAt === today) return true;
            if (t.dueDate === today) return true;
            return false;
          });
          if (completedToday) hasAnyActivity = true;
        }
      }

      // Проверить победы
      if (!hasAnyActivity) {
        const victoriesStr = await AsyncStorage.getItem(`victories_${today}`);
        if (victoriesStr) {
          hasAnyActivity = true;
        }
      }

      if (!hasAnyActivity) {
        // День без активности - серия разбита
        streakData.currentStreak = 0;
        streakData.lastActiveDate = null;
      } else {
        // День с активностью
        if (streakData.lastActiveDate === null) {
          // Первый день активности
          streakData.currentStreak = 1;
          streakData.lastActiveDate = today;
        } else {
          const yesterday = getPreviousDay(today);
          if (streakData.lastActiveDate === yesterday) {
            // Серия продолжается
            streakData.currentStreak += 1;
            streakData.lastActiveDate = today;
          } else if (streakData.lastActiveDate !== today) {
            // Разрыв в серии
            streakData.currentStreak = 1;
            streakData.lastActiveDate = today;
          }
        }

        // Обновить рекорд
        if (streakData.currentStreak > streakData.longestStreak) {
          streakData.longestStreak = streakData.currentStreak;
        }
      }

      await AsyncStorage.setItem('streakData', JSON.stringify(streakData));
      setStreak(streakData);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  // Функция для расчета максимального стрика за конкретный месяц
  const calculateMonthStreak = useCallback(async (targetMonth: Date) => {
    try {
      const year = targetMonth.getFullYear();
      const month = targetMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      let maxStreak = 0;
      let currentStreak = 0;

      // Проверить каждый день месяца
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const dateStr = getLocalDateString(d);
        let dayHasActivity = false;

        // Проверить рутины/прогресс
        const progressKey = `progress_${dateStr}`;
        const progress = await AsyncStorage.getItem(progressKey);
        if (progress) {
          const data = JSON.parse(progress);
          if (data.morningDone > 0 || data.eveningDone > 0 || data.snoozed) {
            dayHasActivity = true;
          }
        }

        // Проверить задачи
        if (!dayHasActivity) {
          const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
          if (tasksStr) {
            const tasks = JSON.parse(tasksStr);
            const completedToday = tasks.some((t: any) => {
              if (!t.completed) return false;
              if (t.completedAt === dateStr) return true;
              if (t.dueDate === dateStr) return true;
              return false;
            });
            if (completedToday) dayHasActivity = true;
          }
        }

        // Проверить победы
        if (!dayHasActivity) {
          const victoriesStr = await AsyncStorage.getItem(`victories_${dateStr}`);
          if (victoriesStr) {
            dayHasActivity = true;
          }
        }

        if (dayHasActivity) {
          currentStreak += 1;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      return maxStreak;
    } catch (error) {
      console.error('Error calculating month streak:', error);
      return 0;
    }
  }, []);

  return { streak, updateStreak, loadStreak, calculateMonthStreak };
}
