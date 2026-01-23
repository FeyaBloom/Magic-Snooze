import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles } from '@/styles/calendar';

interface BadDayToolkitProps {
  weeklyRate: number; // Процент выполнения за неделю
  show: boolean; // Показывать ли toolkit
}

export function BadDayToolkit({ weeklyRate, show }: BadDayToolkitProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);

  // Показываем только когда недельный прогресс низкий
  if (!show || weeklyRate >= 40) {
    return null;
  }

  const microTasks = [
    { emoji: '💧', task: t('badDay.drinkWater') },
    { emoji: '🪟', task: t('badDay.openWindow') },
    { emoji: '🌬️', task: t('badDay.deepBreath') },
    { emoji: '☀️', task: t('badDay.lookOutside') },
    { emoji: '🎵', task: t('badDay.favoriteSound') },
  ];

  return (
    <View
      style={[
        calendarStyles.card,
        {
          backgroundColor: colors.surface,
          borderLeftWidth: 4,
          borderLeftColor: colors.secondary,
        },
      ]}
    >
      <Text style={[styles.h2, { color: colors.primary, marginBottom: 8 }]}>
        💜 {t('badDay.title')}
      </Text>
      <Text style={[styles.body, { color: colors.text, marginBottom: 16 }]}>
        {t('badDay.subtitle')}
      </Text>

      {/* Micro-tasks список */}
      <View style={{ gap: 12 }}>
        {microTasks.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: colors.surface,
              padding: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
            <Text style={[styles.body, { color: colors.text, flex: 1 }]}>
              {item.task}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={[
          styles.caption,
          {
            color: colors.secondary,
            marginTop: 16,
            textAlign: 'center',
            fontStyle: 'italic',
          },
        ]}
      >
        {t('badDay.youreEnough')}
      </Text>
    </View>
  );
}
