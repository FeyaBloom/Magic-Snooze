import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import { useTheme } from '@/components/ThemeProvider';
import { useTextStyles } from '@/hooks/useTextStyles';
import { createCalendarStyles } from '@/styles/calendar';
import { ParetoChart } from '@/components/stats/ParetoChart';
import { BubbleChart } from '@/components/stats/BubbleChart';
import { LollipopChart } from '@/components/stats/LollipopChart';


type RoutineKind = 'morning' | 'evening';

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ChartsPreview() {
  const [month] = useState(new Date());
  const [morning, setMorning] = useState<RoutineStat[]>([]);
  const [evening, setEvening] = useState<RoutineStat[]>([]);
  const [tooltip, setTooltip] = useState<{ name: string } | null>(null);

  const { colors } = useTheme();
  const styles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);

  useEffect(() => {
    (async () => {
      const year = month.getFullYear();
      const m = month.getMonth();
      const days = new Date(year, m + 1, 0).getDate();
      const mapMorning: Record<string, number> = {};
      const mapEvening: Record<string, number> = {};

      for (let d = 1; d <= days; d++) {
        const date = new Date(year, m, d);
        const dateStr = getLocalDateString(date);
        const raw = await AsyncStorage.getItem(`progress_${dateStr}`);
        if (!raw) continue;
        try {
          const progress = JSON.parse(raw);
          const collect = (arr?: any[], map?: Record<string, number>) => {
            if (!Array.isArray(arr) || !map) return;
            arr.forEach((r) => {
              if (r && r.text && r.completed) {
                map[r.text] = (map[r.text] || 0) + 1;
              }
            });
          };
          collect(progress.morningRoutines, mapMorning);
          collect(progress.eveningRoutines, mapEvening);
        } catch {}
      }

      const arrMorning = Object.entries(mapMorning)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      const arrEvening = Object.entries(mapEvening)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      setMorning(arrMorning);
      setEvening(arrEvening);
    })();
  }, [month]);

  return (
    <ScreenLayout tabName="calendar">
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <ContentContainer paddingHorizontal={20} paddingVertical={20}>
            <View style={{ position: 'relative' }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.h1, { textAlign: 'center', color: colors.text }]}>Сравнение графиков</Text>
                <Text style={[styles.body, { textAlign: 'center', color: colors.textSecondary }]}>Данные: топ-5 рутин за месяц (отдельно утро/вечер)</Text>
              </View>

          {morning.length === 0 && evening.length === 0 ? (
            <View style={calendarStyles.card}>
              <Text style={[styles.body, { color: colors.textSecondary }]}>Нет данных за текущий месяц</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.h2, { marginTop: 8 }]}>Утренние рутины (Pareto, топ-5)</Text>
              <View style={{ alignItems: 'center' }}>
                <ParetoChart
                  data={morning}
                  maxItems={5}
                  onLabelPress={(routine) => setTooltip({ name: routine.name })}
                />
              </View>

              <Text style={[styles.h2, { marginTop: 8 }]}>Вечерние рутины (Pareto, топ-5)</Text>
              <View style={{ alignItems: 'center' }}>
                <ParetoChart
                  data={evening}
                  maxItems={5}
                  onLabelPress={(routine) => setTooltip({ name: routine.name })}
                />
              </View>
            </>
          )}

            {tooltip && (
              <TouchableWithoutFeedback onPress={() => setTooltip(null)}>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 900,
                  }}
                />
              </TouchableWithoutFeedback>
            )}

            {tooltip && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1001,
                }}
                pointerEvents="none"
              >
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 12,
                    shadowColor: colors.secondary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                    elevation: 3,
                    minWidth: 160,
                    maxWidth: 260,
                  }}
                >
                  <Text style={[styles.body, { color: colors.text, textAlign: 'center' }]}>{tooltip.name}</Text>
                </View>
              </View>
            )}
            </View>
          </ContentContainer>
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}
