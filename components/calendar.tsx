import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  showNavigation?: boolean;
  showHeader?: boolean;
  mode?: 'full' | 'compact';
  minDate?: Date;
  maxDate?: Date;
  customDayRenderer?: (date: Date, isSelected: boolean, isToday: boolean, isCurrentMonth: boolean) => React.ReactNode;
  initialDate?: Date;
}

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Calendar({
  selectedDate,
  onDateSelect,
  showNavigation = true,
  showHeader = true,
  mode = 'full',
  minDate,
  maxDate,
  customDayRenderer,
  initialDate = new Date(),
}: CalendarProps) {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(initialDate);

  const screenWidth = Dimensions.get('window').width;
  const dayWidth = mode === 'compact' ? 
    (screenWidth - 80) / 7 : // Для модалки - меньше padding
    (screenWidth - 40) / 7;  // Для полной версии

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDatePress = (date: Date) => {
    if (isDateDisabled(date) || !onDateSelect) return;
    onDateSelect(date);
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
      const isSelected = selectedDate && getLocalDateString(date) === getLocalDateString(selectedDate);
      const disabled = isDateDisabled(date);

      daysArray.push(
        <TouchableOpacity
          key={dateString}
          style={[
            styles.dayContainer,
            { width: dayWidth },
            disabled && styles.disabledDay,
          ]}
          onPress={() => handleDatePress(date)}
          disabled={disabled}
        >
          {customDayRenderer ? (
            customDayRenderer(date, !!isSelected, isToday, isCurrentMonth)
          ) : (
            <View style={[
              styles.dayCell,
              !isCurrentMonth && styles.otherMonth,
              isToday && styles.today,
              isSelected && styles.selectedDay,
              disabled && styles.disabledDayCell,
            ]}>
              <Text style={[
                styles.dayText,
                !isCurrentMonth && styles.otherMonthText,
                isToday && styles.todayText,
                isSelected && styles.selectedDayText,
                disabled && styles.disabledDayText,
              ]}>
                {date.getDate()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const styles = {
    container: {
      backgroundColor: colors.cardBackground,
      borderRadius: mode === 'compact' ? 12 : 16,
      padding: mode === 'compact' ? 12 : 16,
      marginVertical: mode === 'compact' ? 8 : 16,
    },
    monthHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 16,
    },
    navButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    monthTitle: {
      fontSize: mode === 'compact' ? 18 : 20,
      fontWeight: '600' as const,
      color: colors.text,
    },
    weekDaysContainer: {
      flexDirection: 'row' as const,
      marginBottom: 8,
    },
    weekDayText: {
      textAlign: 'center' as const,
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      paddingVertical: 8,
    },
    daysContainer: {
      gap: 4,
    },
    dayContainer: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      height: dayWidth * 0.9,
    },
    dayCell: {
      width: dayWidth * 0.8,
      height: dayWidth * 0.8,
      borderRadius: (dayWidth * 0.8) / 2,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: 'transparent',
    },
    dayText: {
      fontSize: mode === 'compact' ? 14 : 16,
      fontWeight: '500' as const,
      color: colors.text,
    },
    otherMonth: {
      opacity: 0.3,
    },
    otherMonthText: {
      color: colors.textSecondary,
    },
    today: {
      backgroundColor: colors.primary + '20',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    todayText: {
      color: colors.primary,
      fontWeight: '700' as const,
    },
    selectedDay: {
      backgroundColor: colors.primary,
    },
    selectedDayText: {
      color: '#FFFFFF',
      fontWeight: '700' as const,
    },
    disabledDay: {
      opacity: 0.3,
    },
    disabledDayCell: {
      backgroundColor: colors.surface + '50',
    },
    disabledDayText: {
      color: colors.textSecondary,
    },
  };

  return (
    <View style={styles.container}>
      {showHeader && showNavigation && (
        <View style={styles.monthHeader}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <ChevronLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
      
      {showHeader && !showNavigation && (
        <Text style={[styles.monthTitle, { textAlign: 'center', marginBottom: 16 }]}>
          {monthName}
        </Text>
      )}

      <View style={styles.weekDaysContainer}>{renderWeekDays()}</View>
      <View style={styles.daysContainer}>{renderCalendar()}</View>
    </View>
  );
}