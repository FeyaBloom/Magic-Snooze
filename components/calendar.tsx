import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

interface CustomCalendarHeaderProps {
  onPrev: () => void;
  onNext: () => void;
  monthLabel: string;
}

const CustomCalendarHeader: React.FC<CustomCalendarHeaderProps> = ({ onPrev, onNext, monthLabel }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onPrev} style={styles.navButton}>
        <ChevronLeft size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerText, { color: colors.text }]}>{monthLabel}</Text>
      <TouchableOpacity onPress={onNext} style={styles.navButton}>
        <ChevronRight size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};



export default CustomCalendarHeader;


const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface Props {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export const CustomCalendar: React.FC<Props> = ({ selectedDate, onSelect }) => {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = React.useState(new Date(selectedDate));

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
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prev);
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
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
          const isSelected =
            day.toDateString() === selectedDate.toDateString();

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

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  navButton: {
    padding: 4,
  },
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