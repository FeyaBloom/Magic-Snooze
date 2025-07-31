import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
}

export const CustomCalendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
}) => {
  const { colors } = useTheme();
  // Текущий месяц по выбранной дате или сегодняшнему дню
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selected ? new Date(selected) : new Date());

  React.useEffect(() => {
    if (selected) {
      setCurrentMonth(new Date(selected));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.toDateString()]); // обновляем месяц если выбрана новая дата

  const getDaysInMonth = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const days = [];
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }
    return { days, startDay: start.getDay() };
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const { days, startDay } = getDaysInMonth(currentMonth);

  return (
    <View style={[styles.calendarContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth}>
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: colors.text }]}>
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={nextMonth}>
          <ChevronRight size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {weekDays.map((day, idx) => (
          <Text key={idx} style={[styles.weekDay, { color: colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {Array(startDay)
          .fill(null)
          .map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
        {days.map((day, idx) => {
          const isSelected = selected && day.toDateString() === selected.toDateString();
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dayCell,
                isSelected && {
                  backgroundColor: colors.primary,
                  borderRadius: 999,
                },
              ]}
              onPress={() => onSelect(day)}
            >
              <Text
                style={{
                  color: isSelected ? '#fff' : colors.text,
                  textAlign: 'center',
                }}
              >
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomCalendar;

const styles = StyleSheet.create({
  calendarContainer: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});