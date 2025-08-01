import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles } from '@/styles/calendar';
import { FloatingBackground } from "@/components/MagicalFeatures";
import Calendar from '@/components/Calendar'; // Путь к новому компоненту

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

export default function CalendarTab() {
  const { colors } = useTheme();
  const styles = createCalendarStyles(colors);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [progressData, setProgressData] = useState<Record<string, DailyProgress>>({});

  useEffect(() => {
    loadProgressData();
  }, [currentMonth]);

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

  // Кастомный рендерер дней с отметками прогресса
  const customDayRenderer = (date: Date, isSelected: boolean, isToday: boolean, isCurrentMonth: boolean) => {
    const dateString = getLocalDateString(date);
    const dayStatus = getDayStatus(dateString);

    return (
      <View style={{ alignItems: 'center' }}>
        <View style={[
          styles.dayCell,
          !isCurrentMonth && styles.otherMonth,
          isToday && styles.today,
          dayStatus === 'complete' && styles.completeDay,
          dayStatus === 'partial' && styles.partialDay,
          dayStatus === 'snoozed' && styles.snoozedDay,
        ]}>
          <Text style={[
            styles.dayText,
            !isCurrentMonth && styles.otherMonthText,
            isToday && styles.todayText,
            dayStatus !== 'none' && styles.statusDayText,
          ]}>
            {date.getDate()}
          </Text>
        </View>
        {dayStatus !== 'none' && (
          <View style={styles.statusDot}>
            <Text style={styles.statusEmoji}>
              {dayStatus === 'complete' ? '🏆' : dayStatus === 'partial' ? '🌟' : '💤'}
            </Text>
          </View>
        )}
      </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.background} style={styles.gradient}>
        <FloatingBackground />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Journey 📅</Text>
            <Text style={styles.subtitle}>Every step counts, every day matters</Text>
          </View>

          <Calendar
            initialDate={currentMonth}
            showNavigation={true}
            showHeader={true}
            mode="full"
            customDayRenderer={customDayRenderer}
            onDateSelect={(date) => {
              // Здесь можно добавить логику при выборе даты, если нужно
              setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
            }}
          />

          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.completeLegend]} />
                <Text style={styles.legendText}>Complete Day 🏆</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.partialLegend]} />
                <Text style={styles.legendText}>Partial Day 🌟</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.snoozedLegend]} />
                <Text style={styles.legendText}>Rest Day 💤</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.noneLegend]} />
                <Text style={styles.legendText}>No Activity</Text>
              </View>
            </View>
          </View>

          {monthStats.totalDays > 0 && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Monthly Progress <Sparkles size={20} color={colors.text} /></Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{monthStats.completeDays}</Text>
                  <Text style={styles.statLabel}>Complete Days</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{monthStats.partialDays}</Text>
                  <Text style={styles.statLabel}>Partial Days</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{monthStats.snoozedDays}</Text>
                  <Text style={styles.statLabel}>Rest Days</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.round(((monthStats.completeDays + monthStats.partialDays) / monthStats.totalDays) * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>Engagement</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}