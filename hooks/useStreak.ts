import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString, getPreviousDay, getNextDay } from '@/utils/dateUtils';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  freezeDaysAvailable: number;
  lastFreezeDate: string | null;
  freezeDates?: string[];
}

export interface StreakStatus {
  streak: number;
  status: 'ok' | 'freeze_available' | 'at_risk' | null;
  message?: string;
}

const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

// Проверка начала новой календарной недели (пн-вс)
const isNewCalendarWeek = (lastDate: string | null, currentDate: string): boolean => {
  if (!lastDate) return true;
  
  const last = parseLocalDate(lastDate);
  const current = parseLocalDate(currentDate);
  
  // Получаем понедельник недели для каждой даты
  const getMondayOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Корректируем для воскресенья
    return new Date(d.setDate(diff));
  };
  
  const lastMonday = getMondayOfWeek(last);
  const currentMonday = getMondayOfWeek(current);
  
  return currentMonday.getTime() > lastMonday.getTime();
};

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

      const completedTasksByDate: Record<string, number> = {};
      for (const t of allTasks) {
        if (!t.completed) continue;
        if (t.completedAt) {
          completedTasksByDate[t.completedAt] = (completedTasksByDate[t.completedAt] || 0) + 1;
        }
        if (t.dueDate) {
          completedTasksByDate[t.dueDate] = (completedTasksByDate[t.dueDate] || 0) + 1;
        }
      }

      const dateRange: string[] = [];
      let cursorForRange = earliestDate;
      while (cursorForRange <= today) {
        dateRange.push(cursorForRange);
        cursorForRange = getNextDay(cursorForRange);
      }

      const progressKeys = dateRange.map((d) => `progress_${d}`);
      const victoriesKeys = dateRange.map((d) => `victories_${d}`);

      const [progressPairs, victoriesPairs] = await Promise.all([
        AsyncStorage.multiGet(progressKeys),
        AsyncStorage.multiGet(victoriesKeys),
      ]);

      const progressByDate: Record<string, any> = {};
      for (const [key, value] of progressPairs) {
        if (!value) continue;
        const dateStr = key.replace('progress_', '');
        progressByDate[dateStr] = JSON.parse(value);
      }

      const victoriesByDate: Record<string, boolean> = {};
      for (const [key, value] of victoriesPairs) {
        if (!value) continue;
        const dateStr = key.replace('victories_', '');
        victoriesByDate[dateStr] = true;
      }

      const getDayInfo = async (dateStr: string, baseHasActivity = false) => {
        let hasAnyActivity = baseHasActivity;
        let isSnoozed = false;

        const progress = progressByDate[dateStr];
        if (progress) {
          isSnoozed = !!progress.snoozed;
          if (!hasAnyActivity) {
            if (progress.morningDone > 0 || progress.eveningDone > 0) {
              hasAnyActivity = true;
            }
          }
        }

        if (!hasAnyActivity) {
          const completedToday = (completedTasksByDate[dateStr] || 0) > 0;
          if (completedToday) hasAnyActivity = true;
        }

        if (!hasAnyActivity && victoriesByDate[dateStr]) {
          hasAnyActivity = true;
        }

        return { hasAnyActivity, isSnoozed };
      };

      let currentStreak = 0;
      let longestStreak = 0;
      let lastActiveDate: string | null = null;
      let freezeAvailable = 1;
      let lastFreezeDate: string | null = streakData.lastFreezeDate;
      const freezeDates: string[] = [];
      let previousDateInLoop: string | null = null;

      let cursorDate = earliestDate;
      while (cursorDate <= today) {
        // Reset freeze at the start of each calendar week (Monday),
        // regardless of whether today has activity.
        if (isNewCalendarWeek(previousDateInLoop, cursorDate)) {
          freezeAvailable = 1;
        }

        const info = await getDayInfo(cursorDate, cursorDate === today ? dayHasActivity : false);

        if (info.hasAnyActivity) {
          currentStreak += 1;
          lastActiveDate = cursorDate;
        } else if (info.isSnoozed) {
          // Снуз продолжает стрик
          currentStreak += 1;
        } else if (
          currentStreak > 0 &&
          freezeAvailable > 0 &&
          cursorDate !== today &&
          lastFreezeDate !== getPreviousDay(cursorDate)
        ) {
          // Используем заморозку
          freezeAvailable -= 1;
          lastFreezeDate = cursorDate;
          freezeDates.push(cursorDate);
          // Заморозка сохраняет стрик, но не добавляет день к счетчику
        } else if (cursorDate !== today) {
          // Прошлый день без активности/заморозки/снуза - ломаем стрик
          currentStreak = 0;
        }
        // Если cursorDate === today и нет активности/заморозки - НЕ ломаем стрик,
        // дадим юзеру время до конца дня

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }

        previousDateInLoop = cursorDate;
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

  // Получить статус стрика для UI (учитывает сегодняшний день)
  const getStreakStatus = useCallback(async (): Promise<StreakStatus> => {
    try {
      const today = getLocalDateString();
      
      // Проверяем есть ли активность сегодня
      const progressKey = `progress_${today}`;
      const progress = await AsyncStorage.getItem(progressKey);
      let hasActivityToday = false;
      
      if (progress) {
        const data = JSON.parse(progress);
        if (data.morningDone > 0 || data.eveningDone > 0 || data.snoozed) {
          hasActivityToday = true;
        }
      }
      
      if (!hasActivityToday) {
        const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
        if (tasksStr) {
          const tasks = JSON.parse(tasksStr);
          const completedToday = tasks.some((t: any) => 
            t.completed && t.completedAt === today
          );
          if (completedToday) hasActivityToday = true;
        }
      }
      
      if (!hasActivityToday) {
        const victoriesStr = await AsyncStorage.getItem(`victories_${today}`);
        if (victoriesStr) hasActivityToday = true;
      }
      
      // Если есть активность - всё ок
      if (hasActivityToday) {
        return {
          streak: streak.currentStreak,
          status: 'ok',
        };
      }
      
      // Нет активности сегодня - проверяем заморозку
      if (streak.freezeDaysAvailable > 0) {
        return {
          streak: streak.currentStreak,
          status: 'freeze_available',
          message: '❄️ Можно пропустить - заморозим',
        };
      } else {
        return {
          streak: streak.currentStreak,
          status: 'at_risk',
          message: '⚠️ Стрик под угрозой!',
        };
      }
    } catch (error) {
      console.error('Error getting streak status:', error);
      return {
        streak: streak.currentStreak,
        status: null,
      };
    }
  }, [streak]);

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

      const storedStreak = await AsyncStorage.getItem('streakData');
      const parsedStreak = storedStreak ? JSON.parse(storedStreak) : {};
      const freezeDatesSet = new Set<string>(Array.isArray(parsedStreak.freezeDates) ? parsedStreak.freezeDates : []);

      const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
      const allTasks = tasksStr ? JSON.parse(tasksStr) : [];
      const completedTasksByDate: Record<string, number> = {};
      for (const task of allTasks) {
        if (!task.completed) continue;
        if (task.completedAt) {
          completedTasksByDate[task.completedAt] = (completedTasksByDate[task.completedAt] || 0) + 1;
        }
        if (task.dueDate) {
          completedTasksByDate[task.dueDate] = (completedTasksByDate[task.dueDate] || 0) + 1;
        }
      }

      const monthDates: string[] = [];
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        monthDates.push(getLocalDateString(d));
      }

      const [progressPairs, victoriesPairs] = await Promise.all([
        AsyncStorage.multiGet(monthDates.map((dateStr) => `progress_${dateStr}`)),
        AsyncStorage.multiGet(monthDates.map((dateStr) => `victories_${dateStr}`)),
      ]);

      const progressByDate: Record<string, any> = {};
      for (const [key, value] of progressPairs) {
        if (!value) continue;
        progressByDate[key.replace('progress_', '')] = JSON.parse(value);
      }

      const victoriesByDate: Record<string, boolean> = {};
      for (const [key, value] of victoriesPairs) {
        if (!value) continue;
        victoriesByDate[key.replace('victories_', '')] = true;
      }

      let maxStreak = 0;
      let currentStreak = 0;

      for (const dateStr of monthDates) {
        let dayHasActivity = false;

        const progress = progressByDate[dateStr];
        if (progress) {
          if (progress.morningDone > 0 || progress.eveningDone > 0 || progress.snoozed) {
            dayHasActivity = true;
          }
        }

        if (!dayHasActivity) {
          dayHasActivity = (completedTasksByDate[dateStr] || 0) > 0;
        }

        if (!dayHasActivity && victoriesByDate[dateStr]) dayHasActivity = true;

        if (dayHasActivity) {
          currentStreak += 1;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else if (freezeDatesSet.has(dateStr)) {
          // A freeze preserves the streak but does not increase the streak counter.
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

  return { 
    streak, 
    updateStreak, 
    loadStreak, 
    calculateMonthStreak,
    getStreakStatus, // Новый метод для UI
  };
}
