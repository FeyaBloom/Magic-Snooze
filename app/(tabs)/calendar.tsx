import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, DeviceEventEmitter, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';
import { Coffee, Moon, CalendarDays, Trophy } from 'lucide-react-native';

// Components
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import CustomCalendar from '@/components/CustomCalendar';
import { DayDetailsModal } from '@/components/modals/DayDetailsModal';
import { StatsDashboard } from '@/components/stats/StatsDashboard';
import { WeekCard } from '@/components/stats/ProgressBar';
import { VictoriesStats } from '@/components/stats/VictoriesStats';
import { Achievements } from '@/components/stats/Achievements';
import { ParetoChart } from '@/components/stats/ParetoChart';

// Hooks
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useStreak } from '@/hooks/useStreak';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';

// Styles
import { createCalendarStyles } from '@/styles/calendar';
import { TOUCHABLE_CONFIG } from '@/styles/touchable';

interface DailyProgress {
  date: string;
  morningCompleted: boolean;
  eveningCompleted: boolean;
  morningTotal: number;
  eveningTotal: number;
  morningDone: number;
  eveningDone: number;
  snoozed: boolean;
}

export default function CalendarScreen() {
  const { t } = useTranslation();
  const textStyles = useTextStyles();
  const { colors, isMessyMode } = useTheme();
  const calendarStyles = createCalendarStyles(colors);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [progressData, setProgressData] = useState<Record<string, DailyProgress>>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [victoriesData, setVictoriesData] = useState<Record<string, string[]>>({});
  const [tasksData, setTasksData] = useState<any[]>([]);
  const [morningTooltip, setMorningTooltip] = useState<{ name: string } | null>(null);
  const [eveningTooltip, setEveningTooltip] = useState<{ name: string } | null>(null);

  const handleMonthChange = useCallback((date: Date) => {
    setCurrentMonth(date);
  }, []);

  const handleOpenDay = useCallback((date: Date) => {
    setSelectedDay(date);
    setShowDayDetails(true);
  }, []);

  const handleMorningLabelPress = useCallback((routine: { name: string }) => {
    setMorningTooltip({ name: routine.name });
  }, []);

  const handleEveningLabelPress = useCallback((routine: { name: string }) => {
    setEveningTooltip({ name: routine.name });
  }, []);

  const handleCloseMorningTooltip = useCallback(() => {
    setMorningTooltip(null);
  }, []);

  const handleCloseEveningTooltip = useCallback(() => {
    setEveningTooltip(null);
  }, []);

  const handleCloseTooltip = useCallback(() => {
    setMorningTooltip(null);
    setEveningTooltip(null);
  }, []);

  const activeTooltip = morningTooltip || eveningTooltip;

  // Определить текущую неделю
  const getCurrentWeekIndex = () => {
    const now = new Date();
    // Сбросить время для корректного сравнения дат
    now.setHours(0, 0, 0, 0);

    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstMonday = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    firstMonday.setDate(firstMonday.getDate() - daysToMonday);
    firstMonday.setHours(0, 0, 0, 0);

    let weekIdx = 0;
    let currentWeekStart = new Date(firstMonday);

    while (currentWeekStart <= lastDay) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Check if today is in this week
      if (now >= currentWeekStart && now <= weekEnd) {
        return weekIdx;
      }

      currentWeekStart = new Date(weekEnd);
      currentWeekStart.setDate(currentWeekStart.getDate() + 1);
      weekIdx += 1;
    }
    return 0; // Fallback
  };

  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([getCurrentWeekIndex()]));

  const [monthStreak, setMonthStreak] = useState(0);
  const styles = createCalendarStyles(colors);

  // Calcular si el mes actual es el mes actual (para evitar duplicación)
  const isViewingCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      currentMonth.getFullYear() === now.getFullYear() &&
      currentMonth.getMonth() === now.getMonth()
    );
  }, [currentMonth]);
  const { streak, updateStreak, loadStreak, calculateMonthStreak } = useStreak();
  const { stats: monthlyStats, calculateStats: calculateMonthlyStats } = useMonthlyStats();
  const { weeklyStats, calculateWeeklyStats } = useWeeklyStats();

  const tasksByDate = useMemo(() => {
    const completed: Record<string, number> = {};
    const planned: Record<string, number> = {};

    for (const task of tasksData) {
      if (task.completed) {
        const date = task.dueDate ? task.dueDate : task.completedAt;
        if (date) {
          completed[date] = (completed[date] || 0) + 1;
        }
      } else if (task.dueDate) {
        planned[task.dueDate] = (planned[task.dueDate] || 0) + 1;
      }
    }

    return { completed, planned };
  }, [tasksData]);

  const completedTasksCount = useMemo(() => {
    return Object.values(tasksByDate.completed).reduce((sum, val) => sum + val, 0);
  }, [tasksByDate]);

  const loadProgressData = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const progress: Record<string, DailyProgress> = {};
      const victories: Record<string, string[]> = {};

      const progressKeys: string[] = [];
      const victoriesKeys: string[] = [];

      // Load progress and victories for each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = getLocalDateString(date);
        progressKeys.push(`progress_${dateString}`);
        victoriesKeys.push(`victories_${dateString}`);
      }

      const [progressPairs, victoriesPairs] = await Promise.all([
        AsyncStorage.multiGet(progressKeys),
        AsyncStorage.multiGet(victoriesKeys),
      ]);

      for (const [key, value] of progressPairs) {
        if (!value) continue;
        const dateString = key.replace('progress_', '');
        progress[dateString] = JSON.parse(value);
      }

      for (const [key, value] of victoriesPairs) {
        if (!value) continue;
        const dateString = key.replace('victories_', '');
        victories[dateString] = JSON.parse(value);
      }

      // Load tasks (global, will filter by date when needed)
      const tasksStr = await AsyncStorage.getItem('oneTimeTasks');
      let tasks = tasksStr ? JSON.parse(tasksStr) : [];

      // Migration: convert dueDate from ISO format to YYYY-MM-DD
      tasks = tasks.map((task: any) => {
        if (task.dueDate && task.dueDate.includes('T')) {
          return { ...task, dueDate: getLocalDateString(new Date(task.dueDate)) };
        }
        return task;
      });

      setProgressData(progress);
      setVictoriesData(victories);
      setTasksData(tasks);

      // Update monthly and weekly stats
      await calculateMonthlyStats(currentMonth);
      await calculateWeeklyStats(currentMonth);
      await loadStreak();

      if (!isViewingCurrentMonth) {
        const mStreak = await calculateMonthStreak(currentMonth);
        setMonthStreak(mStreak);
      } else {
        setMonthStreak(0);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const getDayStatus = (dateString: string) => {
    const progress = progressData[dateString];
    const hasRoutines = progress && !progress.snoozed;

    if (progress?.snoozed) return 'snoozed';

    // Check routine completion
    const routineActivity = (() => {
      if (!progress) return 'none';
      const totalTasks = progress.morningTotal + progress.eveningTotal;
      const completedTasks = progress.morningDone + progress.eveningDone;
      if (totalTasks === 0 || completedTasks === 0) return 'none';
      if (completedTasks === totalTasks) return 'complete';
      return 'partial';
    })();

    // Check victories activity
    const hasVictories = victoriesData[dateString]?.length > 0;

    const completedTasksThisDay = tasksByDate.completed[dateString] || 0;
    const plannedTasksThisDay = tasksByDate.planned[dateString] || 0;

    // Determine final status based on all activity types
    if (routineActivity !== 'none') {
      // If routines have activity, use routine status
      return routineActivity;
    }

    if (hasVictories || completedTasksThisDay > 0) {
      // Если нет активности по рутинам, но есть победы/задачи — partial
      return 'partial';
    }

    // No activity of any kind
    return 'none';
  };

  // Мемоизировать статусы всех дней месяца
  const dayStatusesCache = useMemo(() => {
    const cache: Record<string, string> = {};
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = getLocalDateString(date);
      cache[dateString] = getDayStatus(dateString);
    }

    return cache;
  }, [progressData, victoriesData, tasksData, currentMonth]);

  const customDayRenderer = useCallback((
    date: Date,
    isCurrentMonth: boolean,
    isToday: boolean,
    isSelected: boolean,
    calendarStyles: any
  ) => {
    const dateString = getLocalDateString(date);
    const dayStatus = dayStatusesCache[dateString] || 'none';

    // Тепловая карта: интенсивность цвета зависит от завершенности
    const getHeatmapOpacity = () => {
      if (dayStatus === 'complete') return 1; // 100%
      if (dayStatus === 'partial') return 0.7; // 70%
      if (dayStatus === 'snoozed') return 0.5; // 50% (полупрозрачное)
      return 0.3; // No activity - еле видно
    };

    return (
      <TouchableOpacity
        onPress={() => handleOpenDay(date)}
        style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
        activeOpacity={0.7}
      >
        <View
          style={[
            calendarStyles.dayCell,
            !isCurrentMonth && calendarStyles.otherMonth,
            isToday && calendarStyles.today,
            dayStatus === 'complete' && calendarStyles.completeDay,
            dayStatus === 'partial' && calendarStyles.partialDay,
            dayStatus === 'snoozed' && calendarStyles.snoozedDay,
          ]}
        >
          <Text
            style={[
              calendarStyles.dayText,
              isCurrentMonth ? { color: colors.text } : calendarStyles.otherMonthText,
              isToday && calendarStyles.todayText,
            ]}
          >
            {date.getDate()}
          </Text>
        </View>
        {/* Tasks indicator */}
        {(() => {
          const dateString = getLocalDateString(date);
          const isFrozenDay = (streak.freezeDates || []).includes(dateString);

          // Check for completed tasks
          const completedTask = (tasksByDate.completed[dateString] || 0) > 0;

          // Check for planned (not completed) tasks
          const plannedTask = (tasksByDate.planned[dateString] || 0) > 0;

          // Show completed task icon if any, otherwise show planned task icon
          const icon = completedTask ? '✅' : plannedTask ? '📋' : null;
          const freezeIcon = isFrozenDay ? '🧊' : null;

          return icon || freezeIcon ? (
            <View style={[calendarStyles.taskIcon, { flexDirection: 'row', alignItems: 'center' }]}> 
              {freezeIcon && (
                <Text style={[calendarStyles.taskIconText, { marginRight: icon ? 2 : 0 }]}>{freezeIcon}</Text>
              )}
              {icon && <Text style={calendarStyles.taskIconText}>{icon}</Text>}
            </View>
          ) : null;
        })()}
      </TouchableOpacity>
    );
  }, [dayStatusesCache, tasksByDate, streak.freezeDates, colors.text, handleOpenDay]);

  const toggleWeekExpanded = useCallback((weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber - 1)) {
        next.delete(weekNumber - 1);
      } else {
        next.add(weekNumber - 1);
      }
      return next;
    });
  }, []);

  const weeklyStatsContent = useMemo(() => {
    return weeklyStats
      .filter((week) => {
        // Показываем только недели с данными
        return week.totalDays > 0 || week.tasksCompleted > 0 || week.totalVictories > 0;
      })
      .map((week) => (
        <WeekCard
          key={week.weekNumber}
          weekNumber={week.weekNumber}
          startDate={week.startDate}
          endDate={week.endDate}
          morningRate={week.morningCompletionRate}
          eveningRate={week.eveningCompletionRate}
          overallRate={week.overallRate}
          morningDays={week.morningDays}
          eveningDays={week.eveningDays}
          totalDays={week.totalDays}
          tasksCompleted={week.tasksCompleted}
          victoriesCount={week.totalVictories}
          dailyActivity={week.dailyActivity}
          status={week.status}
          expanded={expandedWeeks.has(week.weekNumber - 1)}
          onToggle={() => toggleWeekExpanded(week.weekNumber)}
        />
      ));
  }, [weeklyStats, expandedWeeks, toggleWeekExpanded]);

  const monthlyRoutineStats = useMemo(() => {
    if (isViewingCurrentMonth) {
      return { morningArr: [], eveningArr: [] };
    }

    const morningStats: Record<string, number> = {};
    const eveningStats: Record<string, number> = {};

    Object.values(progressData).forEach((progress: any) => {
      if (progress.morningRoutines) {
        progress.morningRoutines.forEach((r: any) => {
          if (r.completed) {
            morningStats[r.text] = (morningStats[r.text] || 0) + 1;
          }
        });
      }
      if (progress.eveningRoutines) {
        progress.eveningRoutines.forEach((r: any) => {
          if (r.completed) {
            eveningStats[r.text] = (eveningStats[r.text] || 0) + 1;
          }
        });
      }
    });

    const morningArr = Object.entries(morningStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const eveningArr = Object.entries(eveningStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { morningArr, eveningArr };
  }, [progressData, isViewingCurrentMonth]);

  const monthlyRoutineSection = useMemo(() => {
    if (isViewingCurrentMonth) {
      return null;
    }

    const { morningArr, eveningArr } = monthlyRoutineStats;

    return (
      <View>
        {morningArr.length > 0 && (
          <>
            <View style={calendarStyles.sectionHeaderWithIconVertical}>
              <Coffee size={24} color="#F59E0B" />
              <Text style={textStyles.h2}>{t('calendar.stats.morningRoutines')}</Text>
            </View>
            <ParetoChart data={morningArr} maxItems={5} onLabelPress={handleMorningLabelPress} />
          </>
        )}
        {eveningArr.length > 0 && (
          <>
            <View style={calendarStyles.sectionHeaderWithIconVertical}>
              <Moon size={24} color="#6366F1" />
              <Text style={textStyles.h2}>{t('calendar.stats.eveningRoutines')}</Text>
            </View>
            <ParetoChart data={eveningArr} maxItems={5} onLabelPress={handleEveningLabelPress} />
          </>
        )}
      </View>
    );
  }, [
    isViewingCurrentMonth,
    monthlyRoutineStats,
    calendarStyles.sectionHeaderWithIconVertical,
    textStyles.h2,
    t,
    handleMorningLabelPress,
    handleEveningLabelPress,
  ]);

  // Мемоизировать месячные статы тоже
  const monthlyStatsMemo = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let completeDays = 0;
    let partialDays = 0;
    let snoozedDays = 0;
    let totalDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = getLocalDateString(date);
      const status = dayStatusesCache[dateString] || 'none';

      if (status !== 'none') {
        totalDays++;
        if (status === 'complete') completeDays++;
        else if (status === 'partial') partialDays++;
        else if (status === 'snoozed') snoozedDays++;
      }
    }

    return { completeDays, partialDays, snoozedDays, totalDays };
  }, [dayStatusesCache, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      setCurrentMonth(new Date());
    }, [])
  );

  useEffect(() => {
    loadProgressData();
  }, [currentMonth]);

  // Actualizar semana expandida cuando el mes cambia
  useEffect(() => {
    if (isViewingCurrentMonth) {
      setExpandedWeeks(new Set([getCurrentWeekIndex()]));
    } else {
      setExpandedWeeks(new Set([]));
    }
  }, [currentMonth, isViewingCurrentMonth]);

  useEffect(() => {
    const handleDataReset = (data: {
      categories: string[];
      deletedKeys: string[];
      timestamp: number;
    }) => {
      if (data.categories.includes('progress') || data.categories.includes('routines')) {
        setProgressData({});
        loadProgressData();
      }
    };

    const handleTasksChanged = () => {
      loadProgressData();
    };

    const handleProgressChanged = () => {
      loadProgressData();
    };

    const resetListener = DeviceEventEmitter.addListener('dataReset', handleDataReset);
    const tasksListener = DeviceEventEmitter.addListener('tasksChanged', handleTasksChanged);
    const progressListener = DeviceEventEmitter.addListener('progressChanged', handleProgressChanged);

    return () => {
      resetListener.remove();
      tasksListener.remove();
      progressListener.remove();
    };
  }, []);

  return (
    <ScreenLayout tabName="calendar" scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ContentContainer paddingHorizontal={20} paddingVertical={20}>
          {/* Header */}
          <View style={{ marginBottom: isMessyMode ? 32 : 24 }}>
            <Text
              style={[
                textStyles.h1,
                { color: colors.text, textAlign: 'center', marginBottom: 8 },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('calendar.title')}
            </Text>
            <Text
              style={[
                textStyles.body,
                { color: colors.textSecondary, textAlign: 'center', opacity: 0.9 },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('calendar.subtitle')}
            </Text>
          </View>

          {/* Calendar */}
          <View style={{ alignSelf: 'center', width: '100%', marginBottom: 14 }}>
            <CustomCalendar
              customDayRenderer={customDayRenderer}
              initialMonth={currentMonth}
              onMonthChange={handleMonthChange}
            />
          </View>

          {/* New: Stats Dashboard */}
          <StatsDashboard
            streak={streak}
            magicLevel={monthlyStats.magicLevel}
            completeDays={monthlyStats.completeDays}
            partialDays={monthlyStats.partialDays}
            snoozedDays={monthlyStats.snoozedDays}
            totalVictories={monthlyStats.totalVictories}
            monthStreak={monthStreak}
            isCurrentMonth={isViewingCurrentMonth}
            completedTasks={completedTasksCount}
          />

          {/* Статистика: недели или месячный график по рутинам */}
          {isViewingCurrentMonth && (
            <View style={{ marginVertical: 16 }}>
              <View style={calendarStyles.sectionHeaderWithIcon}>
                <CalendarDays size={24} color="#10B981" />
                <Text style={textStyles.h2}>{t('calendar.stats.weeklyStats')}</Text>
              </View>
              {weeklyStatsContent}
            </View>
          )}

          {monthlyRoutineSection}

          {activeTooltip && (
            <>
              <TouchableWithoutFeedback onPress={handleCloseTooltip}>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 900,
                  }}
                />
              </TouchableWithoutFeedback>
              <View style={calendarStyles.tooltipContainer}>
                <View style={calendarStyles.tooltip}>
                  <Text style={[textStyles.body, { color: colors.text, textAlign: 'center' }]}>{activeTooltip.name}</Text>
                </View>
              </View>
            </>
          )}

          {/* New: Victories Stats */}
          <VictoriesStats month={currentMonth} />

          {/* New: Achievements */}
          <Achievements
            streak={streak}
            completeDays={monthlyStats.completeDays}
            totalVictories={monthlyStats.totalVictories}
          />
        </ContentContainer>
      </ScrollView>

      <DayDetailsModal
        visible={showDayDetails}
        date={selectedDay}
        onClose={() => setShowDayDetails(false)}
      />
    </ScreenLayout>
  );
}