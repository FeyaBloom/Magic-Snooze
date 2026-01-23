import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles } from '@/styles/calendar';
import { Flower2 } from 'lucide-react-native';

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

      // Преобразовать в массив и показать ВСЕ (Victory Garden)
      const victoryArray = Object.entries(victoryMap)
        .map(([name, count]) => ({
          name,
          emoji: VICTORY_TYPES[name] || '✨',
          count,
        }))
        .sort((a, b) => b.count - a.count); // Сортируем по количеству

      setVictories(victoryArray);
    } catch (error) {
      console.error('Error loading victories stats:', error);
    }
  };

  if (victories.length === 0) {
    return null;
  }

  const maxCount = Math.max(...victories.map((v) => v.count), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  // Функция для генерации визуализации роста с эмодзи и прогрессивными размерами
  const renderGrowthPath = (count: number) => {
    const plants: { emoji: string; size: number }[] = [];
    
    // 1-3: 🌱 8pt
    if (count >= 1) plants.push({ emoji: '🌱', size: 8 });
    
    // 4-6: + 🌱 12pt
    if (count >= 4) plants.push({ emoji: '🌱', size: 12 });
    
    // 7-9: + 🌿 16pt
    if (count >= 7) plants.push({ emoji: '🌿', size: 16 });
    
    // 10-12: + 🌿 20pt
    if (count >= 10) plants.push({ emoji: '🌿', size: 20 });
    
    // 13-15: + 🌷 24pt
    if (count >= 13) plants.push({ emoji: '🌷', size: 24 });
    
    // 16-18: + 🌷 28pt
    if (count >= 16) plants.push({ emoji: '🌷', size: 28 });
    
    // 19-21: + 🌺 30pt
    if (count >= 19) plants.push({ emoji: '🌺', size: 30 });
    
    // 22+: + 🌺 32pt
    if (count >= 22) plants.push({ emoji: '🌺', size: 32 });
    
    return plants.map((plant, index) => (
      <Text key={index} style={{ fontSize: plant.size, marginHorizontal: 1 }}>
        {plant.emoji}
      </Text>
    ));
  };

  return (
    <View style={calendarStyles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <Flower2 size={24} color={colors.primary} />
        <Text style={styles.h2}>
          {t('calendar.stats.victoryGarden')}
        </Text>
      </View>
      <Text style={[styles.caption, { marginBottom: 16, color: colors.secondary }]}>
        {t('calendar.stats.victoryGardenSubtitle')}
      </Text>
      
      {/* Lollipop chart с растениями */}
      <View style={{ gap: 12 }}>
        {victories.map((victory, index) => {
          return (
            <View key={index} style={{ gap: 4 }}>
              {/* Название победы и количество */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text
                  style={[
                    styles.body,
                    { color: colors.text, flex: 1 }
                  ]}
                  numberOfLines={1}
                >
                  {victory.emoji} {victory.name}
                </Text>
                <Text style={[styles.caption, { color: colors.secondary, marginLeft: 8 }]}>
                  {victory.count}×
                </Text>
              </View>
              
              {/* Визуализация роста растения */}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 4 }}>
                {renderGrowthPath(victory.count)}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
