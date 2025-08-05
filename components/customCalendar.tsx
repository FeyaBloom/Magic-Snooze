import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles, dayWidth } from '@/styles/calendar';
import i18n from '@/i18n';
const { t } = i18n;
interface CalendarProps {
  // Для выбора даты (модалка)
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  
  // Для кастомного рендеринга дней (CalendarTab с отметками)
  customDayRenderer?: (
    date: Date, 
    isCurrentMonth: boolean, 
    isToday: boolean, 
    isSelected: boolean,
    styles: any
  ) => React.ReactNode;
  
  // Управление
  initialMonth?: Date;
  onMonthChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
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
  customDayRenderer,
  initialMonth = new Date(),
  onMonthChange,
  minDate,
  maxDate,
}: CalendarProps) {
  const { colors } = useTheme();
  const styles = createCalendarStyles(colors);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  useEffect(() => {
    if (onMonthChange) {
      onMonthChange(currentMonth);
    }
  }, [currentMonth, onMonthChange]);

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

      if (customDayRenderer) {
        // Кастомный рендеринг (для CalendarTab с отметками) - дни НЕ кликабельные
        daysArray.push(
          <View key={dateString} style={[styles.dayContainer, { width: dayWidth }]}>
            {customDayRenderer(date, isCurrentMonth, isToday, !!isSelected, styles)}
          </View>
        );
      } else {
        // Стандартный рендеринг (для модалки с выбором)
        daysArray.push(
          <TouchableOpacity
            key={dateString}
            style={[styles.dayContainer, { width: dayWidth }]}
            onPress={() => handleDatePress(date)}
            disabled={disabled}
          >
            <View style={[
              styles.dayCell,
              !isCurrentMonth && styles.otherMonth,
              isToday && styles.today,
              isSelected && styles.selectedDay,
              disabled && styles.disabledDay,
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
          </TouchableOpacity>
        );
      }
    }

    // split into 6 rows of 7 days
    const rows = [];
    for (let i = 0; i < 6; i++) {
      const week = daysArray.slice(i * 7, i * 7 + 7);
      rows.push(
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {week}
        </View>
      );
    }

    return rows;
  };

  const renderWeekDays = () => {
    const weekDays = [
      t('common.Sun'), 
       t('common.Mon'),
       t('common.Tue'),
       t('common.Wed'),
       t('common.Thu'),
       t('common.Fri'),
       t('common.Sat'),
     ];
    return weekDays.map((day) => (
      <Text key={day} style={[styles.weekDayText, { width: dayWidth }]}>
        {day}
      </Text>
    ));
  };

  const monthName = currentMonth.toLocaleDateString(i18n.language, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={[styles.calendarContainer, { alignItems: 'center' }]}>
      <View style={styles.monthHeader}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <ChevronRight size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {renderWeekDays()}
        </View>
      </View>
      <View style={[styles.daysContainer, { flexDirection: 'row', justifyContent: 'center' }]}>
        {renderCalendar()}
      </View>
    </View>
  );
}