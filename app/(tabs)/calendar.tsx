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
  
  // Определить текущую неделю
  const getCurrentWeekIndex = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstSunday = new Date(firstDay);
    firstSunday.setDate(firstSunday.getDate() - firstDay.getDay());

    let weekIdx = 0;
    let currentWeekStart = new Date(firstSunday);

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

  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  
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
  const { stats: monthlyStats, calculateStats: calculateMonthlyStats } =
    useMonthlyStats();
  const { weeklyStats, calculateWeeklyStats } = useWeeklyStats();

  const loadProgressData = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const progress: Record<string, DailyProgress> = {};
      const victories: Record<string, string[]> = {};

      // Load progress and victories for each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = getLocalDateString(date);
        
        const dayProgress = await AsyncStorage.getItem(`progress_${dateString}`);
        if (dayProgress) {
          progress[dateString] = JSON.parse(dayProgress);
        }

        const dayVictories = await AsyncStorage.getItem(`victories_${dateString}`);
        if (dayVictories) {
          victories[dateString] = JSON.parse(dayVictories);
        }
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

    // Check completed tasks - prioritize dueDate if exists, otherwise use completedAt
    const completedTasksThisDay = tasksData.filter(task => {
      if (!task.completed) return false;
      // If task has dueDate, show it only on dueDate
      if (task.dueDate) return task.dueDate === dateString;
      // If no dueDate, show it on completedAt
      return task.completedAt === dateString;
    }).length;

    // Check planned (not completed) tasks with dueDate
    const plannedTasksThisDay = tasksData.filter(task => {
      if (task.completed) return false;
      // Show planned tasks only on their dueDate
      return task.dueDate === dateString;
    }).length;

    // Determine final status based on all activity types
    if (routineActivity !== 'none') {
      // If routines have activity, use routine status
      return routineActivity;
    }

    if (hasVictories || completedTasksThisDay > 0) {
      // If no routine activity but has victories or completed tasks → partial
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

  const customDayRenderer = (
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
        onPress={() => {
          setSelectedDay(date);
          setShowDayDetails(true);
        }}
        style={{ width: '100%', height: '100%' }}
        activeOpacity={0.7}
      >
        <View
          style={[
            calendarStyles.dayCell,
            !isCurrentMonth && calendarStyles.otherMonth,
            isToday && calendarStyles.today,
            !isToday && dayStatus === 'complete' && calendarStyles.completeDay,
            !isToday && dayStatus === 'partial' && calendarStyles.partialDay,
            !isToday && dayStatus === 'snoozed' && calendarStyles.snoozedDay,
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
          
          // Check for completed tasks
          const completedTask = tasksData.find(task => {
            if (!task.completed) return false;
            if (task.dueDate) return task.dueDate === dateString;
            return task.completedAt === dateString;
          });
          
          // Check for planned (not completed) tasks
          const plannedTask = tasksData.find(task => {
            if (task.completed) return false;
            return task.dueDate === dateString;
          });
          
          // Show completed task icon if any, otherwise show planned task icon
          const icon = completedTask ? '✅' : plannedTask ? '📋' : null;
          
          return icon ? (
            <View style={calendarStyles.taskIcon}>
              <Text style={calendarStyles.taskIconText}>{icon}</Text>
            </View>
          ) : null;
        })()}
      </TouchableOpacity>
    );
  };

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
      loadProgressData();
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
      setExpandedWeeks(new Set([])); // No expandir ninguna semana para meses pasados
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
    <ScreenLayout tabName="calendar">
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
              onMonthChange={(date) => setCurrentMonth(date)}
            />
          </View>

          {/* New: Stats Dashboard */}
          {(() => {
            const completedTasksCount = tasksData.filter(t => t.completed).length;
            return (
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
            );
          })()}

          {/* Статистика: недели или месячный график по рутинам */}
          {isViewingCurrentMonth && (
                <View style={{ marginVertical: 16 }}>
                  <View style={calendarStyles.sectionHeaderWithIcon}>
                    <CalendarDays size={24} color="#10B981" />
                    <Text style={textStyles.h2}>{t('calendar.stats.weeklyStats')}</Text>
                  </View>
                  {weeklyStats.map((week) => (
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
                      onToggle={() => {
                        const newExpanded = new Set(expandedWeeks);
                        if (newExpanded.has(week.weekNumber - 1)) {
                          newExpanded.delete(week.weekNumber - 1);
                        } else {
                          newExpanded.add(week.weekNumber - 1);
                        }
                        setExpandedWeeks(newExpanded);
                      }}
                    />
                  ))}
                </View>
              )}

          {!isViewingCurrentMonth && (() => {
                  // Собрать статистику по рутинам за месяц (отдельно утро и вечер)
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
                  
                  return (
                    <View>
                      {morningArr.length > 0 && (
                        <>
                          <View style={calendarStyles.sectionHeaderWithIconVertical}>
                            <Coffee size={24} color="#F59E0B" />
                            <Text style={textStyles.h2}>{t('calendar.stats.morningRoutines')}</Text>
                          </View>
                          <ParetoChart data={morningArr} maxItems={5} onLabelPress={(routine) => setMorningTooltip({ name: routine.name })} />
                          {morningTooltip && (
                            <>
                              <TouchableWithoutFeedback onPress={() => setMorningTooltip(null)}>
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
                                  <Text style={[textStyles.body, { color: colors.text, textAlign: 'center' }]}>{morningTooltip.name}</Text>
                                </View>
                              </View>
                            </>
                          )}
                        </>
                      )}
                      {eveningArr.length > 0 && (
                        <>
                          <View style={calendarStyles.sectionHeaderWithIconVertical}>
                            <Moon size={24} color="#8B5CF6" />
                            <Text style={textStyles.h2}>{t('calendar.stats.eveningRoutines')}</Text>
                          </View>
                          <ParetoChart data={eveningArr} maxItems={5} onLabelPress={(routine) => setEveningTooltip({ name: routine.name })} />
                          {eveningTooltip && (
                            <>
                              <TouchableWithoutFeedback onPress={() => setEveningTooltip(null)}>
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
                                  <Text style={[textStyles.body, { color: colors.text, textAlign: 'center' }]}>{eveningTooltip.name}</Text>
                                </View>
                              </View>
                            </>
                          )}
                        </>
                      )}
                    </View>
                  );
                })()}
          
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