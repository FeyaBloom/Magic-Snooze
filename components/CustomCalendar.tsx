import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles, calculateDayWidth } from '@/styles/calendar';
import { useTranslation } from 'react-i18next';


const LeftArrow = ({ color }: { color: string }) =>
  Platform.OS === 'web'
    ? <Text style={{ fontSize: 24, color, lineHeight: 38}}>{'\u2039'}</Text>
    : <ChevronLeft size={24} color={color} />;

const RightArrow = ({ color }: { color: string }) =>
  Platform.OS === 'web'
    ? <Text style={{ fontSize: 24, color, lineHeight: 38 }}>{'\u203A'}</Text>
    : <ChevronRight size={24} color={color} />;



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

  // НОВОЕ: контроль размеров для разных контекстов
  containerWidth?: number; // ширина контейнера для расчета размера дней
  maxWidth?: number; // максимальная ширина всего календаря
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
  containerWidth, 
  maxWidth, // для общего ограничения
}: CalendarProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [stylesReady, setStylesReady] = useState(false);

  // Вычисляем актуальный размер дня для конкретного контейнера
  const dayWidth = useMemo(() => {
    return calculateDayWidth(containerWidth);
  }, [containerWidth]);

  // Вычисляем высоту дня - для модалок делаем меньше
  const dayHeight = useMemo(() => {
    const isModal = containerWidth && containerWidth < 400;
    return isModal ? dayWidth * 0.75 : dayWidth; // в модалке высота = 70% от ширины
  }, [dayWidth, containerWidth]);

  // Мемоизируем стили
  const styles = useMemo(() => {
    if (!colors) return null;
    return createCalendarStyles(colors);
  }, [colors]);

  // Проверяем готовность стилей и colors
  useEffect(() => {
    if (colors && styles) {
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
    if (!stylesReady || !styles) return [];

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
          <View key={dateString} style={[styles.dayContainer, { width: dayWidth, height: dayHeight }]}>
            {customDayRenderer(date, isCurrentMonth, isToday, !!isSelected, styles)}
          </View>
        );
      } else {
        // Стандартный рендеринг (для модалки с выбором)
        daysArray.push(
          <TouchableOpacity
            key={dateString}
            style={[styles.dayContainer, { width: dayWidth, height: dayHeight }]}
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
  }, [currentMonth, selectedDate, customDayRenderer, styles, stylesReady, minDate, maxDate, onDateSelect, dayWidth, dayHeight]);

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
    if (!styles) return null;

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
  }, [styles, dayWidth]);

  const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const mapLocale: Record<string, string> = {
    en: 'en-US',
    ru: 'ru-RU',
    es: 'es-ES',
    ca: 'ca-ES',
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

  // Показываем загрузку пока стили не готовы
  if (!stylesReady || !colors || !styles) {
    return (
      <View style={{ 
        height: dayHeight * 6 + 120, // 6 рядов дней + заголовки
        justifyContent: 'center', 
        alignItems: 'center',
        opacity: 0.5 
      }}>
        <Text style={{ color: colors?.secondary || '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.calendarContainer, 
      { 
        alignItems: 'center',
        width: '100%',
        ...(maxWidth && { maxWidth: maxWidth })
      }
    ]}>
      <View style={styles.monthHeader} >
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
          activeOpacity={0.7}
        >
          <LeftArrow color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}
        numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
                {monthName}</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
          activeOpacity={0.7}
        >
          <RightArrow color={colors.secondary} />
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