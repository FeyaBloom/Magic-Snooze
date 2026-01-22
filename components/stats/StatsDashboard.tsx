import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { StreakData } from '@/hooks/useStreak';
import { MagicLevel } from '@/hooks/useMonthlyStats';
import { createCalendarStyles } from '@/styles/calendar';

interface StatsDashboardProps {
  streak: StreakData;
  magicLevel: MagicLevel;
  completeDays: number;
  partialDays: number;
  snoozedDays: number;
  totalVictories: number;
  completedTasks?: number; // Выполненные одноразовые задачи
  monthStreak?: number; // Стрик за конкретный месяц
  isCurrentMonth?: boolean; // Текущий ли месяц
}

export function StatsDashboard({
  streak,
  magicLevel,
  completeDays,
  partialDays,
  snoozedDays,
  totalVictories,
  completedTasks = 0,
  monthStreak = 0,
  isCurrentMonth = true,
}: StatsDashboardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const textStyles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);

  const getStreakEmojis = (count: number) => {
    const flames = Math.ceil(count / 7);
    return '🔥'.repeat(Math.min(flames, 5));
  };

  const getMagicLevelColor = () => {
    switch (magicLevel.level) {
      case 'archmage':
        return '#FFD700'; // Gold
      case 'mage':
        return colors.accent;
      case 'apprentice':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const levelLabel = t(`calendar.stats.levels.${magicLevel.level}`);

  return (
    <View style={{ gap: 16, marginBottom: 16 }}>
      {/* Серия & Уровень */}
      <View style={calendarStyles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[textStyles.caption, { color: colors.secondary }]}>
              {isCurrentMonth ? t('calendar.stats.currentStreak') : t('calendar.stats.monthMaxStreak')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Text style={[textStyles.h1, { color: colors.primary }]}>
                {isCurrentMonth ? streak.currentStreak : monthStreak}
              </Text>
              <Text style={{ fontSize: 24 }}>{getStreakEmojis(isCurrentMonth ? streak.currentStreak : monthStreak)}</Text>
            </View>
            <Text style={[textStyles.caption, { color: colors.secondary, marginTop: 4 }]}>
              {isCurrentMonth ? `${t('calendar.stats.record')}: ${streak.longestStreak} ${t('calendar.stats.days')}` : t('calendar.stats.days')}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[textStyles.caption, { color: colors.secondary }]}>
              {t('calendar.stats.level')}
            </Text>
            <Text style={[textStyles.h2, { color: getMagicLevelColor(), marginTop: 4 }]}>
              {levelLabel}
            </Text>
            <Text style={[textStyles.caption, { color: colors.secondary, marginTop: 4 }]}>
              {magicLevel.percentage}%
            </Text>
          </View>
        </View>
      </View>

      {/* Первая строка: Complete, Partial, Snoozed */}
      <View style={calendarStyles.statCardRow}>
        <View style={[calendarStyles.compactCard, calendarStyles.accentBorder, calendarStyles.statCard]}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>🏆</Text>
          <Text style={[textStyles.h2, { color: colors.primary }]}>
            {completeDays}
          </Text>
          <Text style={[textStyles.caption, { color: colors.secondary, marginTop: 2 }]}>
            {t('calendar.stats.complete')}
          </Text>
        </View>

        <View style={[calendarStyles.compactCard, calendarStyles.secondaryBorder, calendarStyles.statCard]}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>🌟</Text>
          <Text style={[textStyles.h2, { color: colors.primary }]}>
            {partialDays}
          </Text>
          <Text style={[textStyles.caption, { color: colors.secondary, marginTop: 2 }]}>
            {t('calendar.stats.partial')}
          </Text>
        </View>

        <View style={[calendarStyles.compactCard, calendarStyles.primaryBorder, calendarStyles.statCard]}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>💤</Text>
          <Text style={[textStyles.h2, { color: colors.primary }]}>
            {snoozedDays}
          </Text>
          <Text style={[textStyles.caption, { color: colors.secondary, marginTop: 2 }]}>
            {t('calendar.stats.snoozed')}
          </Text>
        </View>
      </View>

      {/* Вторая строка: Tasks, Victories */}
      <View style={[calendarStyles.statCardRow, {justifyContent: 'space-between'}]}>
        <View style={[calendarStyles.compactCard, calendarStyles.statCard]}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>✅️</Text>
          <Text style={[textStyles.h2, { color: colors.primary }]}>
            {completedTasks}
          </Text>
          <Text style={[textStyles.caption, { color: colors.secondary, marginTop: 2 }]}>
            {t('calendar.stats.tasks')}
          </Text>
        </View>

        <View style={[calendarStyles.compactCard, calendarStyles.statCard]}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>✨</Text>
          <Text style={[textStyles.h2, { color: colors.primary }]}>
            {totalVictories}
          </Text>
          <Text style={[textStyles.caption, { color: colors.secondary, marginTop: 2 }]}>
            {t('calendar.stats.victories')}
          </Text>
        </View>
      </View>
    </View>
  );
}
