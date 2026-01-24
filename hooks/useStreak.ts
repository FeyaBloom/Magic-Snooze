import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString, getPreviousDay, getNextDay } from '@/utils/dateUtils';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  freezeDaysAvailable: number; // Grace days для ADHD поддержки
  lastFreezeDate: string | null; // Когда был использован последний freeze
  freezeDates?: string[]; // Даты, когда был использован freeze
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    freezeDaysAvailable: 1,
    lastFreezeDate: null,
    freezeDates: [],
  });

  const loadStreak = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('streakData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setStreak({
          freezeDates: [],
          ...parsed,
        });
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
        : { 
            currentStreak: 0, 
            longestStreak: 0, 
            lastActiveDate: null,
            freezeDaysAvailable: 1,
            lastFreezeDate: null,
            freezeDates: [],
          };

      const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
      const allTasks = tasksStr ? JSON.parse(tasksStr) : [];

      const getDayInfo = async (dateStr: string, baseHasActivity = false) => {
        let hasAnyActivity = baseHasActivity;
        let isSnoozed = false;

        const progressStr = await AsyncStorage.getItem(`progress_${dateStr}`);
        if (progressStr) {
          const progress = JSON.parse(progressStr);
          isSnoozed = !!progress.snoozed;
          if (!hasAnyActivity) {
            if (progress.morningDone > 0 || progress.eveningDone > 0) {
              hasAnyActivity = true;
            }
          }
        }

        if (!hasAnyActivity) {
          const completedToday = allTasks.some((t: any) => {
            if (!t.completed) return false;
            if (t.completedAt === dateStr) return true;
            if (t.dueDate === dateStr) return true;
            return false;
          });
          if (completedToday) hasAnyActivity = true;
        }

        if (!hasAnyActivity) {
          const victoriesStr = await AsyncStorage.getItem(`victories_${dateStr}`);
          if (victoriesStr) {
            hasAnyActivity = true;
          }
        }

        return { hasAnyActivity, isSnoozed };
      };

      // Обновить freeze days каждую неделю
      const checkAndRefreshFreezeDays = () => {
        if (!streakData.lastFreezeDate) {
          return;
        }
        const lastFreezeDate = new Date(streakData.lastFreezeDate);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastFreezeDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 7) {
          streakData.freezeDaysAvailable = Math.min(1, streakData.freezeDaysAvailable + 1);
          streakData.lastFreezeDate = today;
        }
      };

      checkAndRefreshFreezeDays();

      const allKeys = await AsyncStorage.getAllKeys();
      const dateKeys = allKeys
        .filter((key) => key.startsWith('progress_') || key.startsWith('victories_'))
        .map((key) => key.split('_')[1])
        .filter(Boolean) as string[];

      const taskDates = allTasks
        .filter((t: any) => t.completed || t.dueDate)
        .flatMap((t: any) => [t.completedAt, t.dueDate].filter(Boolean))
        .map((d: string) => getLocalDateString(new Date(d)));

      const allDates = [...dateKeys, ...taskDates, today].filter(Boolean);
      const earliestDate = allDates.sort()[0] || today;

      let currentStreak = 0;
      let longestStreak = 0;
      let lastActiveDate: string | null = null;
      let freezeAvailable = 1;
      let lastFreezeDate: string | null = null;
      const freezeDates: string[] = [];

      let cursorDate = earliestDate;
      while (cursorDate <= today) {
        const info = await getDayInfo(cursorDate, cursorDate === today ? dayHasActivity : false);

        if (lastFreezeDate) {
          const lastFreezeDateObj = new Date(lastFreezeDate);
          const cursorDateObj = new Date(cursorDate);
          const daysDiff = Math.floor((cursorDateObj.getTime() - lastFreezeDateObj.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 7) {
            freezeAvailable = Math.min(1, freezeAvailable + 1);
            lastFreezeDate = cursorDate;
          }
        }

        if (info.hasAnyActivity) {
          currentStreak += 1;
          lastActiveDate = cursorDate;
        } else if (info.isSnoozed) {
          currentStreak += 1;
        } else if (cursorDate === today) {
          currentStreak = 0;
        } else if (currentStreak > 0 && freezeAvailable > 0) {
          freezeAvailable -= 1;
          lastFreezeDate = cursorDate;
          freezeDates.push(cursorDate);
          currentStreak += 1;
        } else {
          currentStreak = 0;
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }

        cursorDate = getNextDay(cursorDate);
      }

      streakData.currentStreak = currentStreak;
      streakData.longestStreak = longestStreak;
      streakData.lastActiveDate = lastActiveDate;
      streakData.freezeDaysAvailable = freezeAvailable;
      streakData.lastFreezeDate = lastFreezeDate;
      streakData.freezeDates = freezeDates;

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
