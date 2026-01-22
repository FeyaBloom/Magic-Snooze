import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';
import { DailyProgress } from './useDailyProgress';

export interface MagicLevel {
  level: 'novice' | 'apprentice' | 'mage' | 'archmage';
  percentage: number;
}

export interface MonthlyStats {
  completeDays: number;
  partialDays: number;
  snoozedDays: number;
  totalDays: number;
  engagementPercentage: number;
  magicLevel: MagicLevel;
  totalVictories: number;
  morningCompletionRate: number; // % of days with full morning completion
  eveningCompletionRate: number; // % of days with full evening completion
}

const getMagicLevel = (percentage: number): MagicLevel => {
  if (percentage >= 75) {
    return { level: 'archmage', percentage };
  } else if (percentage >= 50) {
    return { level: 'mage', percentage };
  } else if (percentage >= 25) {
    return { level: 'apprentice', percentage };
  } else {
    return { level: 'novice', percentage };
  }
};

const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

export function useMonthlyStats() {
  const [stats, setStats] = useState<MonthlyStats>({
    completeDays: 0,
    partialDays: 0,
    snoozedDays: 0,
    totalDays: 0,
    engagementPercentage: 0,
    magicLevel: getMagicLevel(0),
    totalVictories: 0,
    morningCompletionRate: 0,
    eveningCompletionRate: 0,
  });

  const calculateStats = useCallback(async (date: Date = new Date()) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = getDaysInMonth(date);

      // Load one-time tasks once per calculation
      const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
      let tasks = tasksStr ? JSON.parse(tasksStr) : [];
      tasks = tasks.map((task: any) => {
        if (task.dueDate && typeof task.dueDate === 'string' && task.dueDate.includes('T')) {
          return { ...task, dueDate: getLocalDateString(new Date(task.dueDate)) };
        }
        return task;
      });

      let completeDays = 0;
      let partialDays = 0;
      let snoozedDays = 0;
      let totalVictories = 0;
      let morningFullDays = 0;
      let eveningFullDays = 0;
      const daysWithData: string[] = [];

      // Check each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = getLocalDateString(date);

        // Load day progress
        const progressKey = `progress_${dateStr}`;
        const progressData = await AsyncStorage.getItem(progressKey);

        let routineActivity: 'complete' | 'partial' | 'snoozed' | 'none' = 'none';
        let progress: DailyProgress | null = null;

        if (progressData) {
          progress = JSON.parse(progressData);

          if (progress?.snoozed) {
            routineActivity = 'snoozed';
          } else if (progress?.morningCompleted && progress?.eveningCompleted) {
            routineActivity = 'complete';
          } else if ((progress?.morningDone ?? 0) > 0 || (progress?.eveningDone ?? 0) > 0) {
            routineActivity = 'partial';
          }
        }

        // Загрузить победы дня
        const victoriesKey = `victories_${dateStr}`;
        const victoriesData = await AsyncStorage.getItem(victoriesKey);
        const dayVictories = victoriesData ? (JSON.parse(victoriesData) as string[]) : [];
        if (dayVictories.length) {
          totalVictories += dayVictories.length;
        }

        // Задачи, связанные с этим днем
        const hasTaskActivity = tasks.some((task: any) => {
          if (!task.completed) return false;
          if (task.dueDate) return task.dueDate === dateStr;
          return task.completedAt === dateStr;
        });

        const hasVictories = dayVictories.length > 0;

        // Финальная классификация дня
        if (routineActivity === 'complete') {
          completeDays += 1;
          morningFullDays += 1;
          eveningFullDays += 1;
          daysWithData.push(dateStr);
        } else if (routineActivity === 'snoozed') {
          snoozedDays += 1;
          daysWithData.push(dateStr);
        } else if (routineActivity === 'partial') {
          partialDays += 1;
          if (progress?.morningCompleted) morningFullDays += 1;
          if (progress?.eveningCompleted) eveningFullDays += 1;
          daysWithData.push(dateStr);
        } else {
          // Нет активности по рутинам. Если есть победы или задачи — считаем partial, чтобы совпадало с календарем.
          if (hasVictories || hasTaskActivity) {
            partialDays += 1;
            daysWithData.push(dateStr);
          }
        }
      }

      const totalDays = daysInMonth;
      const activeDays = daysWithData.length;
      const engagementPercentage =
        totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;
      const magicLevel = getMagicLevel(engagementPercentage);

      const morningCompletionRate =
        activeDays > 0 ? Math.round((morningFullDays / activeDays) * 100) : 0;
      const eveningCompletionRate =
        activeDays > 0 ? Math.round((eveningFullDays / activeDays) * 100) : 0;

      const newStats: MonthlyStats = {
        completeDays,
        partialDays,
        snoozedDays,
        totalDays,
        engagementPercentage,
        magicLevel,
        totalVictories,
        morningCompletionRate,
        eveningCompletionRate,
      };

      setStats(newStats);
      return newStats;
    } catch (error) {
      console.error('Error calculating monthly stats:', error);
      return stats;
    }
  }, []);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return { stats, calculateStats };
}
