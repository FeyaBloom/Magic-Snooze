import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, DeviceEventEmitter, TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import CustomCalendar from '@/components/CustomCalendar';
import { DayDetailsModal } from '@/components/modals/DayDetailsModal';

// Hooks
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';

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

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export default function CalendarScreen() {
  const { t } = useTranslation();
  const textStyles = useTextStyles();
  const { colors, isMessyMode } = useTheme();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [progressData, setProgressData] = useState<Record<string, DailyProgress>>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const styles = createCalendarStyles(colors);

  const loadProgressData = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const progress: Record<string, DailyProgress> = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = getLocalDateString(date);
        const dayProgress = await AsyncStorage.getItem(`progress_${dateString}`);
        if (dayProgress) {
          progress[dateString] = JSON.parse(dayProgress);
        }
      }

      setProgressData(progress);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const getDayStatus = (dateString: string) => {
    const progress = progressData[dateString];
    if (!progress) return 'none';
    if (progress.snoozed) return 'snoozed';
    const totalTasks = progress.morningTotal + progress.eveningTotal;
    const completedTasks = progress.morningDone + progress.eveningDone;
    if (completedTasks === 0) return 'none';
    if (completedTasks === totalTasks) return 'complete';
    return 'partial';
  };

  const customDayRenderer = (
    date: Date,
    isCurrentMonth: boolean,
    isToday: boolean,
    isSelected: boolean,
    calendarStyles: any
  ) => {
    const dateString = getLocalDateString(date);
    const dayStatus = getDayStatus(dateString);

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
              dayStatus !== 'none' && calendarStyles.statusDayText,
            ]}
          >
            {date.getDate()}
          </Text>
        </View>
        {dayStatus !== 'none' && (
          <View style={calendarStyles.statusDot}>
            <Text style={calendarStyles.statusEmoji}>
              {dayStatus === 'complete' ? '🏆' : dayStatus === 'partial' ? '🌟' : '💤'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getMonthStats = () => {
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
      const status = getDayStatus(dateString);

      if (status !== 'none') {
        totalDays++;
        if (status === 'complete') completeDays++;
        else if (status === 'partial') partialDays++;
        else if (status === 'snoozed') snoozedDays++;
      }
    }

    return { completeDays, partialDays, snoozedDays, totalDays };
  };

  const monthStats = getMonthStats();

  useFocusEffect(
    useCallback(() => {
      loadProgressData();
    }, [])
  );

  useEffect(() => {
    loadProgressData();
  }, [currentMonth]);

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

    const listener = DeviceEventEmitter.addListener('dataReset', handleDataReset);
    return () => listener.remove();
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
          <View style={{ alignSelf: 'center', width: '100%', marginBottom: 24 }}>
            <CustomCalendar
              customDayRenderer={customDayRenderer}
              initialMonth={currentMonth}
              onMonthChange={(date) => setCurrentMonth(date)}
            />
          </View>

          {/* Legend */}
          <View style={[styles.legendContainer, { backgroundColor: colors.surface }]}>
            <Text
              style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('calendar.legendTitle')}
            </Text>
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.completeLegend]} />
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  {t('calendar.legend.complete')} 🏆
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.partialLegend]} />
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  {t('calendar.legend.partial')} 🌟
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.snoozedLegend]} />
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  {t('calendar.legend.snoozed')} 💤
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.noneLegend]} />
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  {t('calendar.legend.none')}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          {monthStats.totalDays > 0 && (
            <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
              <Text
                style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {t('calendar.stats.title')} ✨
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[textStyles.h2, { color: colors.primary }]}>
                    {monthStats.completeDays}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {t('calendar.stats.complete')}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[textStyles.h2, { color: colors.primary }]}>
                    {monthStats.partialDays}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {t('calendar.stats.partial')}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[textStyles.h2, { color: colors.primary }]}>
                    {monthStats.snoozedDays}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {t('calendar.stats.snoozed')}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[textStyles.h2, { color: colors.primary }]}>
                    {Math.round(
                      ((monthStats.completeDays + monthStats.partialDays) /
                        monthStats.totalDays) *
                        100
                    )}
                    %
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {t('calendar.stats.engagement')}
                  </Text>
                </View>
              </View>
            </View>
          )}
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