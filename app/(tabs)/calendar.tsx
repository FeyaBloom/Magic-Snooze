import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles, dayWidth } from '@/styles/calendar';
import {FloatingBackground} from '@/components/MagicalFeatures ';

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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
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

  const renderCalendar = () => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysArray = [];

  // total 42 cells (6 weeks x 7 days)
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1);
    date.setDate(i - startDay + 1);

    const dateString = getLocalDateString(date);
    const isCurrentMonth = date.getMonth() === month;
    const isToday = getLocalDateString(date) === getLocalDateString(today);
    const dayStatus = getDayStatus(dateString);

    daysArray.push(
      <View key={dateString} style={[styles.dayContainer, { width: dayWidth }]}>
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
  }

  // split into 6 rows of 7 days
  const rows = [];
  for (let i = 0; i < 6; i++) {
    const week = daysArray.slice(i * 7, i * 7 + 7);
    rows.push(
      <View key={i} style={{ flexDirection: 'row' }}>
        {week}
      </View>
    );
  }

  return rows;
};


  const renderWeekDays = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekDays.map((day) => (
      <Text key={day} style={[styles.weekDayText, { width: dayWidth }]}>
        {day}
      </Text>
    ));
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
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.background} style={styles.gradient}>
          <FloatingBackground />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Journey 📅</Text>
            <Text style={styles.subtitle}>Every step counts, every day matters</Text>
          </View>

          <View style={styles.calendarContainer}>
            <View style={styles.monthHeader}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('prev')}
              >
                <ChevronLeft size={24} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{monthName}</Text>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('next')}
              >
                <ChevronRight size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>{renderWeekDays()}</View>
            <View style={styles.daysContainer}>{renderCalendar()}</View>
          </View>

          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.completeLegend]} />
                <Text style={styles.legendText}>Complete Day ✨</Text>
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
              <Text style={styles.statsTitle}>Monthly Progress</Text>
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
