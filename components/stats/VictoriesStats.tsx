import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles } from '@/styles/calendar';

interface VictoryCount {
  name: string;
  emoji: string;
  count: number;
}

interface VictoriesStatsProps {
  month: Date;
}

const VICTORY_TYPES: Record<string, string> = {
  'Встал с кровати': '🛏️',
  'Пил воду': '💧',
  'Упражнение на дыхание': '🌬️',
  'Был терпелив': '😌',
  'Погладил животное': '🐱',
  'Смотрел на небо': '☁️',
  'Улыбнулся': '😊',
  'Поел здоровое': '🍎',
};

export function VictoriesStats({ month }: VictoriesStatsProps) {
  const { t } = useTranslation();
  const [victories, setVictories] = useState<VictoryCount[]>([]);
  const { colors } = useTheme();
  const styles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);

  useEffect(() => {
    loadVictoriesStats();
  }, [month]);

  const loadVictoriesStats = async () => {
    try {
      const year = month.getFullYear();
      const monthNum = month.getMonth();
      const daysInMonth = new Date(year, monthNum + 1, 0).getDate();

      const victoryMap: Record<string, number> = {};

      // Загрузить все победы за месяц
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const victoriesData = await AsyncStorage.getItem(`victories_${dateStr}`);

        if (victoriesData) {
          const dayVictories: string[] = JSON.parse(victoriesData);
          dayVictories.forEach((victory) => {
            victoryMap[victory] = (victoryMap[victory] || 0) + 1;
          });
        }
      }

      // Преобразовать в массив и отсортировать
      const victoryArray = Object.entries(victoryMap)
        .map(([name, count]) => ({
          name,
          emoji: VICTORY_TYPES[name] || '✨',
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // Топ-3 победы

      setVictories(victoryArray);
    } catch (error) {
      console.error('Error loading victories stats:', error);
    }
  };

  if (victories.length === 0) {
    return null;
  }

  const maxCount = Math.max(...victories.map((v) => v.count), 1);

  return (
    <View style={calendarStyles.card}>
      <Text style={[styles.h2, { marginBottom: 16 }]}>
        {t('calendar.stats.topVictories')}
      </Text>
      {victories.map((victory, index) => {
        const percentage = Math.round((victory.count / maxCount) * 100);

        return (
          <View key={index} style={{ marginVertical: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text
                style={[styles.body, { color: colors.text, minWidth: 120 }]}
                numberOfLines={1}
              >
                {victory.emoji} {victory.name}
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 12,
                  backgroundColor: colors.surface,
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: colors.accent,
                    borderRadius: 6,
                  }}
                />
              </View>
              <Text
                style={{
                  ...styles.caption,
                  color: colors.secondary,
                  fontWeight: 'bold',
                  minWidth: 32,
                  textAlign: 'right',
                }}
              >
                {victory.count}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
