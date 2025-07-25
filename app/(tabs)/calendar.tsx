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

const { width: screenWidth } = Dimensions.get('window');
const dayWidth = (screenWidth - 40) / 7;

export default function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [progressData, setProgressData] = useState<Record<string, DailyProgress>>({});

  useEffect(() => {
    loadProgressData();
  }, [currentMonth]);

  const loadProgressData = async () => {
    try {
      const getLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

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
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
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
    const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let d = new Date(startDate); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateString = getLocalDateString(d);
      const isCurrentMonth = d.getMonth() === month;
      const isToday = d.getTime() === today.getTime();
      const dayStatus = getDayStatus(dateString);
      
      days.push(
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
              (dayStatus === 'complete' || dayStatus === 'partial' || dayStatus === 'snoozed') && styles.statusDayText,
            ]}>
              {d.getDate()}
            </Text>
          </View>
          {dayStatus !== 'none' && (
            <View style={styles.statusDot}>
              <Text style={styles.statusEmoji}>
                {dayStatus === 'complete' ? '✨' : dayStatus === 'partial' ? '🌟' : '💤'}
              </Text>
            </View>
          )}
        </View>
      );
    }
    
    return days;
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
    const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

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
    year: 'numeric' 
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F3E5FF', '#E5F3FF', '#FFE5E5']}
        style={styles.gradient}
      >
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
                <ChevronLeft size={24} color="#8B5CF6" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{monthName}</Text>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('next')}
              >
                <ChevronRight size={24} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {renderWeekDays()}
            </View>

            <View style={styles.daysContainer}>
              {renderCalendar()}
            </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3E5FF',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCell: {
    width: dayWidth * 0.8,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  otherMonth: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: '#9CA3AF',
  },
  today: {
    backgroundColor: '#8B5CF6',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  completeDay: {
    backgroundColor: '#EC4899',
  },
  partialDay: {
    backgroundColor: '#F59E0B',
  },
  snoozedDay: {
    backgroundColor: '#8B5CF6',
  },
  statusDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  statusEmoji: {
    fontSize: 12,
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  completeLegend: {
    backgroundColor: '#EC4899',
  },
  partialLegend: {
    backgroundColor: '#F59E0B',
  },
  snoozedLegend: {
    backgroundColor: '#8B5CF6',
  },
  noneLegend: {
    backgroundColor: '#E5E7EB',
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});