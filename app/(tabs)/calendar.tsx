import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  SafeAreaView,
  DeviceEventEmitter,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles } from '@/styles/calendar';
import { FloatingBackground } from "@/components/MagicalFeatures";
import CustomCalendar from '@/components/customCalendar';
import { useTranslation } from 'react-i18next';

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

function CalendarTabContent() {
  // ✅ 1. TODOS los hooks de librerías primero
  const route = useRoute();
  const { t } = useTranslation();
  const { colors, getTabGradient } = useTheme();

  // ✅ 2. TODOS los useState juntos
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [progressData, setProgressData] = useState<Record<string, DailyProgress>>({});

  // ✅ 3. Variables derivadas (no hooks)
  const gradient = getTabGradient(route.name);
  const styles = createCalendarStyles(colors);

  // ✅ 4. Funciones auxiliares
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

      console.log('Loaded progress data for calendar:', Object.keys(progress).length, 'days');
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

  const customDayRenderer = (date: Date, isCurrentMonth: boolean, isToday: boolean, isSelected: boolean, calendarStyles: any) => {
    const dateString = getLocalDateString(date);
    const dayStatus = getDayStatus(dateString);

    return (
      <>
        <View style={[
          calendarStyles.dayCell,
          !isCurrentMonth && calendarStyles.otherMonth,
          isToday && calendarStyles.today,
          dayStatus === 'complete' && calendarStyles.completeDay,
          dayStatus === 'partial' && calendarStyles.partialDay,
          dayStatus === 'snoozed' && calendarStyles.snoozedDay,
        ]}>
          <Text style={[
            calendarStyles.dayText,
            isCurrentMonth ? { color: colors.text } : calendarStyles.otherMonthText,
            isToday && calendarStyles.todayText,
            dayStatus !== 'none' && calendarStyles.statusDayText,
          ]}>
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
      </>
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

  // ✅ 5. Variables calculadas
  const monthStats = getMonthStats();

  // ✅ 6. TODOS los useEffect AL FINAL (en orden correcto)
  // useFocusEffect primero
  useFocusEffect(
    useCallback(() => {
      loadProgressData();
    }, []) // Sin dependencias de currentMonth aquí
  );

  // useEffect para cambio de mes
  useEffect(() => {
    loadProgressData();
  }, [currentMonth]);

  // useEffect para listener de eventos - AL FINAL
  useEffect(() => {
    const handleDataReset = (data: { categories: string[], deletedKeys: string[], timestamp: number }) => {
      console.log('CalendarTab received data reset event:', data);
      
      if (data.categories.includes('progress') || data.categories.includes('routines')) {
        console.log('Resetting calendar data...');
        setProgressData({});
        loadProgressData();
      }
    };

    const listener = DeviceEventEmitter.addListener('dataReset', handleDataReset);
    
    return () => {
      listener.remove();
    };
  }, []); // Sin dependencias para que sea estable

  // ✅ 7. JSX Return
  return (
    <SafeAreaView style={styles.container}>
      <View style={{
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <LinearGradient colors={gradient} style={styles.gradient}>
          <FloatingBackground />
        </LinearGradient>
      </View>

      <View style={{ 
        flex: 1, 
        zIndex: 1,  
        width: Platform.OS === 'android' ? '100%' : 600,
        alignSelf: Platform.OS === 'android' ? 'stretch' : 'center' 
      }}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text 
              style={styles.title}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('calendar.title')}
            </Text>
            <Text 
              style={styles.subtitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('calendar.subtitle')}
            </Text>
          </View>

          <View style={{ alignSelf: 'center', width: '90%', marginHorizontal: 24 }}>
            <CustomCalendar        
              customDayRenderer={customDayRenderer}
              initialMonth={currentMonth}
              onMonthChange={(date) => {
                setCurrentMonth(date);
              }}
            />
          </View>

          <View style={styles.legendContainer}>
            <Text 
              style={styles.legendTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('calendar.legendTitle')}
            </Text>
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.completeLegend]} />
                <Text style={styles.legendText}>{t('calendar.legend.complete')}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.partialLegend]} />
                <Text style={styles.legendText}>{t('calendar.legend.partial')}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.snoozedLegend]} />
                <Text style={styles.legendText}>{t('calendar.legend.snoozed')}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.noneLegend]} />
                <Text style={styles.legendText}>{t('calendar.legend.none')}</Text>
              </View>
            </View>
          </View>

          {monthStats.totalDays > 0 && (
            <View style={styles.statsContainer}>
              <Text 
                style={styles.statsTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {t('calendar.stats.title')} <Sparkles size={20} color={colors.text} />
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{monthStats.completeDays}</Text>
                  <Text style={styles.statLabel}>{t('calendar.stats.complete')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{monthStats.partialDays}</Text>
                  <Text style={styles.statLabel}>{t('calendar.stats.partial')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{monthStats.snoozedDays}</Text>
                  <Text style={styles.statLabel}>{t('calendar.stats.snoozed')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.round(((monthStats.completeDays + monthStats.partialDays) / monthStats.totalDays) * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>{t('calendar.stats.engagement')}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ✅ Export default AL FINAL
export default function CalendarTab() {
  return <CalendarTabContent />;
}