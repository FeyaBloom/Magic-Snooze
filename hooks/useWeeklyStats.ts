import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';
import { DailyProgress } from './useDailyProgress';

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
  }>;
}

const getWeeksInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(firstSunday.getDate() - firstDay.getDay());

  const weeks = [];
  let currentWeekStart = new Date(firstSunday);

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
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);

  const calculateWeeklyStats = useCallback(async (date: Date = new Date()) => {
    try {
      const weeks = getWeeksInMonth(date);
      const stats: WeeklyStats[] = [];

      // Загрузить все задачи для подсчета
      const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
      const allTasks = tasksStr ? JSON.parse(tasksStr) : [];

      for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
        const { startDate, endDate } = weeks[weekIdx];
        const start = new Date(startDate);
        const end = new Date(endDate);

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
        }> = [];

        // Собрать все дни в неделе
        for (let d = new Date(start); d <= end; ) {
          daysToCheck.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }

        // Проверить каждый день
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (const dayDate of daysToCheck) {
          const dateStr = getLocalDateString(dayDate);
          const progressKey = `progress_${dateStr}`;
          const progressData = await AsyncStorage.getItem(progressKey);
          
          let hasActivity = false;
          let dayEmoji = '·';
          let morningDone = 0;
          let eveningDone = 0;
          let totalRoutines = 0;

          if (progressData) {
            const progress: DailyProgress = JSON.parse(progressData);
            if (!progress.snoozed) {
              hasActivity = true;
              totalDaysInWeek += 1;
              
              morningDone = progress.morningDone || 0;
              eveningDone = progress.eveningDone || 0;
              totalRoutines = morningDone + eveningDone;
              
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
            } else {
              dayEmoji = '💤';
              hasActivity = true;
            }
          }

          // Добавляем информацию о дне
          const dayName = dayNames[dayDate.getDay()];
          dailyActivity.push({
            day: dayName,
            hasActivity,
            emoji: dayEmoji,
            morningDone,
            eveningDone,
            totalRoutines,
          });

          // Загрузить победы
          const victoriesKey = `victories_${dateStr}`;
          const victoriesData = await AsyncStorage.getItem(victoriesKey);
          if (victoriesData) {
            const victories: string[] = JSON.parse(victoriesData);
            totalVictories += victories.length;
          }

          // Подсчитать завершенные задачи на этот день
          const dayCompletedTasks = allTasks.filter((task: any) => {
            if (!task.completed) return false;
            if (task.dueDate === dateStr) return true;
            if (task.completedAt === dateStr) return true;
            return false;
          }).length;
          tasksCompleted += dayCompletedTasks;
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
  }, []);

  return { weeklyStats, calculateWeeklyStats };
}
