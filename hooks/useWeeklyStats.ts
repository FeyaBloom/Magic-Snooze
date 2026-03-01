import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';
import { DailyProgress } from './useDailyProgress';
import { useTranslation } from 'react-i18next';

const parseLocalDateString = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export interface WeeklyStats {
  weekNumber: number;
  startDate: string;
  endDate: string;
  morningCompletionRate: number;
  eveningCompletionRate: number;
  overallRate: number;
  status: 'excellent' | 'good' | 'needsSupport';
  totalVictories: number;
  morningDays: number; // Actual days with morning completed
  eveningDays: number; // Actual days with evening completed
  totalDays: number; // Total days with any activity
  tasksCompleted: number; // Total completed tasks in the week
  dailyActivity: Array<{ 
    day: string; 
    hasActivity: boolean; 
    emoji: string;
    morningDone: number;
    eveningDone: number;
    totalRoutines: number;
    totalPlanned: number;
  }>;
}

const getWeeksInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstMonday = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  firstMonday.setDate(firstMonday.getDate() - daysToMonday);

  const weeks = [];
  let currentWeekStart = new Date(firstMonday);

  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      startDate: getLocalDateString(currentWeekStart),
      endDate: getLocalDateString(weekEnd),
    });

    currentWeekStart = new Date(weekEnd);
    currentWeekStart.setDate(currentWeekStart.getDate() + 1);
  }

  return weeks;
};

const getStatus = (overallRate: number): { status: 'excellent' | 'good' | 'needsSupport' } => {
  if (overallRate > 70) {
    return { status: 'excellent' };
  } else if (overallRate >= 40) {
    return { status: 'good' };
  } else {
    return { status: 'needsSupport' };
  }
};

export function useWeeklyStats() {
  const { t, i18n } = useTranslation();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);

  const calculateWeeklyStats = useCallback(async (date: Date = new Date()) => {
    try {
      const weeks = getWeeksInMonth(date);
      const stats: WeeklyStats[] = [];

      // Загрузить все задачи для подсчета
      const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
      const allTasks = tasksStr ? JSON.parse(tasksStr) : [];

      // Предзагрузить прогресс и победы по всему отображаемому диапазону недель
      const progressKeys: string[] = [];
      const victoriesKeys: string[] = [];

      const rangeStart = parseLocalDateString(weeks[0].startDate);
      const rangeEnd = parseLocalDateString(weeks[weeks.length - 1].endDate);

      for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = getLocalDateString(d);
        progressKeys.push(`progress_${dateStr}`);
        victoriesKeys.push(`victories_${dateStr}`);
      }

      const [progressPairs, victoriesPairs] = await Promise.all([
        AsyncStorage.multiGet(progressKeys),
        AsyncStorage.multiGet(victoriesKeys),
      ]);

      const progressByDate: Record<string, DailyProgress | null> = {};
      for (const [key, value] of progressPairs) {
        if (!value) continue;
        const dateStr = key.replace('progress_', '');
        progressByDate[dateStr] = JSON.parse(value);
      }

      const victoriesByDate: Record<string, string[]> = {};
      for (const [key, value] of victoriesPairs) {
        if (!value) continue;
        const dateStr = key.replace('victories_', '');
        victoriesByDate[dateStr] = JSON.parse(value);
      }

      const tasksCompletedByDate: Record<string, number> = {};
      for (const task of allTasks) {
        if (!task.completed) continue;
        if (task.dueDate) {
          tasksCompletedByDate[task.dueDate] = (tasksCompletedByDate[task.dueDate] || 0) + 1;
        }
        if (task.completedAt) {
          tasksCompletedByDate[task.completedAt] = (tasksCompletedByDate[task.completedAt] || 0) + 1;
        }
      }

      for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
        const { startDate, endDate } = weeks[weekIdx];
        const start = parseLocalDateString(startDate);
        const end = parseLocalDateString(endDate);

        let morningFullDays = 0;
        let eveningFullDays = 0;
        let totalDaysInWeek = 0;
        let totalVictories = 0;
        let tasksCompleted = 0;
        const daysToCheck: Date[] = [];
        const dailyActivity: Array<{ 
          day: string; 
          hasActivity: boolean; 
          emoji: string;
          morningDone: number;
          eveningDone: number;
          totalRoutines: number;
          totalPlanned: number;
        }> = [];

        // Собрать все дни в неделе
        for (let d = new Date(start); d <= end; ) {
          daysToCheck.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }

        // Проверить каждый день
        const dayNames = [
          t('common.Mon'),
          t('common.Tue'),
          t('common.Wed'),
          t('common.Thu'),
          t('common.Fri'),
          t('common.Sat'),
          t('common.Sun'),
        ];
        for (const dayDate of daysToCheck) {
          const dateStr = getLocalDateString(dayDate);
          const progress = progressByDate[dateStr];

          let hasActivity = false;
          let dayEmoji = '·';
          let morningDone = 0;
          let eveningDone = 0;
          let totalRoutines = 0;
          let totalPlanned = 0;

          if (progress) {
            if (progress.snoozed) {
              dayEmoji = '💤';
              hasActivity = true;
            } else {
              morningDone = progress.morningDone || 0;
              eveningDone = progress.eveningDone || 0;
              totalRoutines = morningDone + eveningDone;
              totalPlanned = (progress.morningTotal || 0) + (progress.eveningTotal || 0);

              if (totalRoutines > 0) {
                hasActivity = true;
                totalDaysInWeek += 1;

                if (progress.morningCompleted) {
                  morningFullDays += 1;
                }
                if (progress.eveningCompleted) {
                  eveningFullDays += 1;
                }

                // Определяем эмодзи дня
                if (progress.morningCompleted && progress.eveningCompleted) {
                  dayEmoji = '🏆';
                } else if (progress.morningCompleted || progress.eveningCompleted) {
                  dayEmoji = '⭐';
                } else {
                  dayEmoji = '💫';
                }
              }
            }
          }

          // Загрузить победы
          const dayVictories = victoriesByDate[dateStr] || [];
          if (dayVictories.length) {
            totalVictories += dayVictories.length;
          }

          // Подсчитать завершенные задачи на этот день
          const dayCompletedTasks = tasksCompletedByDate[dateStr] || 0;
          tasksCompleted += dayCompletedTasks;

          if (!hasActivity && (dayVictories.length > 0 || dayCompletedTasks > 0)) {
            hasActivity = true;
            totalDaysInWeek += 1;
            dayEmoji = '💫';
          }

          // Добавляем информацию о дне
          const dayIndex = (dayDate.getDay() + 6) % 7;
          const dayName = dayNames[dayIndex];
          dailyActivity.push({
            day: dayName,
            hasActivity,
            emoji: dayEmoji,
            morningDone,
            eveningDone,
            totalRoutines,
            totalPlanned,
          });
        }

        const morningRate =
          totalDaysInWeek > 0
            ? Math.round((morningFullDays / totalDaysInWeek) * 100)
            : 0;
        const eveningRate =
          totalDaysInWeek > 0
            ? Math.round((eveningFullDays / totalDaysInWeek) * 100)
            : 0;
        const overallRate = Math.round((morningRate + eveningRate) / 2);

        const { status } = getStatus(overallRate);

        stats.push({
          weekNumber: weekIdx + 1,
          startDate,
          endDate,
          morningCompletionRate: morningRate,
          eveningCompletionRate: eveningRate,
          overallRate,
          status,
          totalVictories,
          morningDays: morningFullDays,
          eveningDays: eveningFullDays,
          totalDays: totalDaysInWeek,
          tasksCompleted,
          dailyActivity,
        });
      }

      setWeeklyStats(stats);
      return stats;
    } catch (error) {
      console.error('Error calculating weekly stats:', error);
      return [];
    }
  }, [t, i18n.language]);

  return { weeklyStats, calculateWeeklyStats };
}
