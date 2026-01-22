import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useTextStyles } from '@/hooks/useTextStyles';
import { createCalendarStyles } from '@/styles/calendar';

interface RoutineStat {
  name: string;
  count: number;
}

interface MonthlyRoutineChartProps {
  routines: RoutineStat[];
}

export function MonthlyRoutineChart({ routines }: MonthlyRoutineChartProps) {
  const { colors } = useTheme();
  const styles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);
  const maxCount = Math.max(...routines.map(r => r.count), 1);

  return (
    <View style={calendarStyles.card}>
      <Text style={[styles.h2, { marginBottom: 16 }]}>📊 Статистика по рутинам за месяц</Text>
      {routines.length === 0 ? (
        <Text style={[styles.body, { color: colors.textSecondary }]}>Нет данных за месяц</Text>
      ) : (
        routines.map((routine, idx) => (
          <View key={routine.name} style={{ marginVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.body, { color: colors.text, minWidth: 120 }]}>{routine.name}</Text>
              <View style={{ flex: 1, height: 12, backgroundColor: colors.surface, borderRadius: 6, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${(routine.count / maxCount) * 100}%`, backgroundColor: colors.accent, borderRadius: 6 }} />
              </View>
              <Text style={[styles.caption, { color: colors.secondary, fontWeight: 'bold', minWidth: 32, textAlign: 'right' }]}>{routine.count}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
