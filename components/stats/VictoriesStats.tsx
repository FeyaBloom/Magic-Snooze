import React, { useState, useEffect, memo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles } from '@/styles/calendar';
import { Flower } from 'lucide-react-native';

interface VictoryCount {
  name: string;
  emoji: string;
  count: number;
}

interface VictoriesStatsProps {
  month: Date;
}

const VICTORY_TYPES: Record<string, string> = {
  'bed': '🛏️',
  'water': '💧',
  'breath': '🌬️',
  'patient': '🍎',
  'pet': '🌤',
  'sky': '😊',
  'smile': '❤️',
  'food': '⏸️',
};

// Маппинг старых переведенных текстов на ID для обратной совместимости
const LEGACY_VICTORY_MAPPING: Record<string, string> = {
  // Русский (старые)
  'Встал с кровати': 'bed',
  'Пил воду': 'water',
  'Упражнение на дыхание': 'breath',
  'Был терпелив': 'patient',
  'Погладил животное': 'pet',
  'Смотрел на небо': 'sky',
  'Улыбнулся': 'smile',
  'Поел здоровое': 'food',
  // Русский (новые)
  'Выспался': 'bed',
  'Выпил воды': 'water',
  'Подышал глубоко': 'breath',
  'Поел вовремя': 'patient',
  'Вышел на улицу': 'pet',
  'Пообщался': 'sky',
  'Порадовал себя': 'smile',
  'Сделал перерыв': 'food',
  // English (старые)
  'Got out of bed': 'bed',
  'Drank water': 'water',
  'Took a deep breath': 'breath',
  'Was patient': 'patient',
  'Pet an animal': 'pet',
  'Looked at the sky': 'sky',
  'Smiled at something': 'smile',
  'Ate something': 'food',
  // English (новые)
  'Slept well': 'bed',
  'Breathed deeply': 'breath',
  'Ate on time': 'patient',
  'Went outside': 'pet',
  'Had a talk': 'sky',
  'Treated myself': 'smile',
  'Took a break': 'food',
  // Español (старые)
  'Me levanté de la cama': 'bed',
  'Bebí agua': 'water',
  'Respiré profundamente': 'breath',
  'Fui paciente': 'patient',
  'Acaricié un animal': 'pet',
  'Miré el cielo': 'sky',
  'Sonreí por algo': 'smile',
  'Comí algo': 'food',
  // Español (nuevые)
  'Dormí bien': 'bed',
  'Respiré hondo': 'breath',
  'Comí a tiempo': 'patient',
  'Salí afuera': 'pet',
  'Charlé': 'sky',
  'Me mimé': 'smile',
  'Tomé un descanso': 'food',
  // Català (старые)
  'He sortit del llit': 'bed',
  'He begut aigua': 'water',
  'He respirat profundament': 'breath',
  'He tingut paciència': 'patient',
  'He acariciat un animal': 'pet',
  'He mirat el cel': 'sky',
  'He somrigut per alguna cosa': 'smile',
  'He menjat alguna cosa': 'food',
  // Català (nuevые)
  'Vaig dormir bé': 'bed',
  'Vaig beure aigua': 'water',
  'Vaig respirar profund': 'breath',
  'Vaig menjar a temps': 'patient',
  'Vaig sortir a fora': 'pet',
  'Vaig xarrar': 'sky',
  'Em vaig mimar': 'smile',
  'Vaig fer una pausa': 'food',
};

export const VictoriesStats = memo(function VictoriesStats({ month }: VictoriesStatsProps) {
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

      const victoryKeys: string[] = [];
      const dateStrings: string[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dateStrings.push(dateStr);
        victoryKeys.push(`victories_${dateStr}`);
      }

      const victoryPairs = await AsyncStorage.multiGet(victoryKeys);

      for (const [key, value] of victoryPairs) {
        if (!value) continue;
        const dayVictories: string[] = JSON.parse(value);
        dayVictories.forEach((victory) => {
          // Преобразовать старые тексты в ID если нужно
          const victoryId = LEGACY_VICTORY_MAPPING[victory] || victory;
          victoryMap[victoryId] = (victoryMap[victoryId] || 0) + 1;
        });
      }

      // Преобразовать в массив и показать ВСЕ (Victory Garden)
      const victoryArray = Object.entries(victoryMap)
        .map(([id, count]) => ({
          name: t(`today.${id}`),
          emoji: VICTORY_TYPES[id] || '🎉',
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
        <Flower size={24} color="#EC4899" />
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
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
                {renderGrowthPath(victory.count)}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});
