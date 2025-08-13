import React, { useState, useEffect, useMemo } from 'react';
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
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [stylesReady, setStylesReady] = useState(false);
  
  // Мемоизируем стили для предотвращения пересоздания
  const styles = useMemo(() => {
    if (!colors) return {};
    return createCalendarStyles(colors);
  }, [colors]);

  // Проверяем готовность стилей и colors
  useEffect(() => {
    if (colors && Object.keys(styles).length > 0) {
      // Используем requestAnimationFrame для гарантии готовности рендера
      requestAnimationFrame(() => {
        setStylesReady(true);
      });
    }
  }, [colors, styles]);

  useEffect(() => {
    if (onMonthChange && stylesReady) {
      onMonthChange(currentMonth);
    }
  }, [currentMonth, onMonthChange, stylesReady]);

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

  // Мемоизируем рендер календаря для оптимизации
  const calendarDays = useMemo(() => {
    if (!stylesReady || !styles.dayContainer) return [];

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
            activeOpacity={0.7}
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

    return daysArray;
  }, [currentMonth, selectedDate, customDayRenderer, styles, stylesReady, minDate, maxDate, onDateSelect]);

  const renderCalendar = () => {
    // split into 6 rows of 7 days
    const rows = [];
    for (let i = 0; i < 6; i++) {
      const week = calendarDays.slice(i * 7, i * 7 + 7);
      rows.push(
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {week}
        </View>
      );
    }

    return rows;
  };

  // Мемоизируем дни недели
  const weekDaysComponent = useMemo(() => {
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
  }, [styles.weekDayText]);

  const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const mapLocale: Record<string, string> = {
    en: 'en-US',
    ru: 'ru-RU',
    es: 'es-ES',
    // добавь другие при необходимости
  };

  // Мемоизируем название месяца
  const monthName = useMemo(() => {
    return capitalizeFirst(
      currentMonth.toLocaleDateString(mapLocale[i18n.language] || 'en-US', {
        month: 'long',
        year: 'numeric',
      })
    );
  }, [currentMonth, i18n.language]);

  // Показываем загрузку или пустой контейнер пока стили не готовы
  if (!stylesReady || !colors) {
    return (
      <View style={{ 
        height: 350, // примерная высота календаря
        justifyContent: 'center', 
        alignItems: 'center',
        opacity: 0.5 
      }}>
        <Text style={{ color: colors?.secondary || '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.calendarContainer, { alignItems: 'center' }]}>
      <View style={styles.monthHeader}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
          activeOpacity={0.7}
        >
          <ChevronRight size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {weekDaysComponent}
        </View>
      </View>
      
      <View style={[styles.daysContainer, { flexDirection: 'column', alignItems: 'center' }]}>
        {renderCalendar()}
      </View>
    </View>
  );
}