import React, { useState, useEffect, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { StreakData } from '@/hooks/useStreak';
import { MagicLevel } from '@/hooks/useMonthlyStats';
import { createCalendarStyles } from '@/styles/calendar';

type FocusMetric = 'streak' | 'magic' | 'victories' | 'all';

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

export const StatsDashboard = memo(function StatsDashboard({
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
  const [focusMode, setFocusMode] = useState<FocusMetric>('all');

  // Загрузка сохраненного режима при монтировании
  useEffect(() => {
    const loadFocusMode = async () => {
      try {
        const saved = await AsyncStorage.getItem('dashboard_focus_mode');
        if (saved && ['streak', 'magic', 'victories', 'all'].includes(saved)) {
          setFocusMode(saved as FocusMetric);
        }
      } catch (error) {
        console.error('Failed to load focus mode:', error);
      }
    };
    loadFocusMode();
  }, []);

  // Сохранение режима при изменении
  const updateFocusMode = async (mode: FocusMetric) => {
    setFocusMode(mode);
    try {
      await AsyncStorage.setItem('dashboard_focus_mode', mode);
    } catch (error) {
      console.error('Failed to save focus mode:', error);
    }
  };

  const getStreakEmojis = (count: number) => {
    const flames = Math.ceil(count / 7);
    return '🔥'.repeat(Math.min(flames, 5));
  };

  const getStreakDisplay = () => {
    const baseEmojis = getStreakEmojis(isCurrentMonth ? streak.currentStreak : monthStreak);
    // Показываем замороженное пламя если есть freeze days
    if (isCurrentMonth && streak.freezeDaysAvailable > 0) {
      return baseEmojis + '🧊';
    }
    return baseEmojis;
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

  const renderFocusMetric = () => {
    switch (focusMode) {
      case 'streak':
        return (
          <View style={[calendarStyles.card, { padding: 24, alignItems: 'center' }]}>
            <Text style={[textStyles.caption, { color: colors.secondary, marginBottom: 8 }]}> 
              {isCurrentMonth ? t('calendar.stats.currentStreak') : t('calendar.stats.monthMaxStreak')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: isCurrentMonth ? 72 : 56, color: colors.primary, fontWeight: 'bold' }}>
                {isCurrentMonth ? streak.currentStreak : monthStreak}
              </Text>
              <Text style={{ fontSize: isCurrentMonth ? 48 : 36 }}>{getStreakDisplay()}</Text>
            </View>
            <Text style={[textStyles.body, { color: colors.secondary, marginTop: 8 }]}> 
              {t('calendar.stats.record')}: {streak.longestStreak} {t('calendar.stats.days')}
            </Text>
            {isCurrentMonth && streak.freezeDaysAvailable > 0 && (
              <Text style={[textStyles.caption, { color: colors.accent, marginTop: 8 }]}> 
                🧊 {t('calendar.stats.freezeAvailable')}
              </Text>
            )}
          </View>
        );
      
      case 'magic':
        return (
          <View style={[calendarStyles.card, { padding: 24, alignItems: 'center' }]}>
            <Text style={[textStyles.caption, { color: colors.secondary, marginBottom: 8 }]}>
              {t('calendar.stats.level')}
            </Text>
            <Text style={{ fontSize: 64, color: getMagicLevelColor(), fontWeight: 'bold', marginVertical: 12 }}>
              {levelLabel}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, height: 12, backgroundColor: colors.surface, borderRadius: 6, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${magicLevel.percentage}%`, backgroundColor: getMagicLevelColor() }} />
              </View>
              <Text style={[textStyles.h2, { color: getMagicLevelColor() }]}>
                {magicLevel.percentage}%
              </Text>
            </View>
          </View>
        );
      
      case 'victories':
        return (
          <View style={[calendarStyles.card, { padding: 24, alignItems: 'center' }]}>
            <Text style={[textStyles.caption, { color: colors.secondary, marginBottom: 8 }]}>
              {t('calendar.stats.victories')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 72, color: colors.primary, fontWeight: 'bold' }}>
                {totalVictories}
              </Text>
              <Text style={{ fontSize: 48 }}>✨</Text>
            </View>
            <Text style={[textStyles.body, { color: colors.secondary, marginTop: 8 }]}>
              {t('calendar.stats.celebrateSmallWins')}
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={{ gap: 16, marginBottom: 16 }}>
      {/* Focus Mode Toggle */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <TouchableOpacity
          onPress={() => updateFocusMode('all')}
          style={[
            calendarStyles.compactCard,
            { paddingVertical: 8, paddingHorizontal: 12 },
            focusMode === 'all' && { backgroundColor: colors.accent, opacity: 1 }
          ]}
        >
          <Text style={[textStyles.caption, { color: focusMode === 'all' ? colors.background[0] : colors.text }]}>
            {t('calendar.stats.focusAll')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => updateFocusMode('streak')}
          style={[
            calendarStyles.compactCard,
            { paddingVertical: 8, paddingHorizontal: 12 },
            focusMode === 'streak' && { backgroundColor: colors.primary, opacity: 1 }
          ]}
        >
          <Text style={[textStyles.caption, { color: focusMode === 'streak' ? colors.background[0] : colors.text }]}>
            🔥 {t('calendar.stats.focusStreak')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => updateFocusMode('magic')}
          style={[
            calendarStyles.compactCard,
            { paddingVertical: 8, paddingHorizontal: 12 },
            focusMode === 'magic' && { backgroundColor: getMagicLevelColor(), opacity: 1 }
          ]}
        >
          <Text style={[textStyles.caption, { color: focusMode === 'magic' ? colors.background[0] : colors.text }]}>
            ✨ {t('calendar.stats.focusMagic')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => updateFocusMode('victories')}
          style={[
            calendarStyles.compactCard,
            { paddingVertical: 8, paddingHorizontal: 12 },
            focusMode === 'victories' && { backgroundColor: colors.secondary, opacity: 1 }
          ]}
        >
          <Text style={[textStyles.caption, { color: focusMode === 'victories' ? colors.background[0] : colors.text }]}>
            🎉 {t('calendar.stats.focusVictories')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Focus Mode Display */}
      {focusMode !== 'all' && renderFocusMetric()}

      {/* Серия & Уровень - показывается только в режиме 'all' */}
      {focusMode === 'all' && (
        <>
          <View style={calendarStyles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[textStyles.caption, { color: colors.secondary }]}> 
              {isCurrentMonth ? t('calendar.stats.currentStreak') : t('calendar.stats.monthMaxStreak')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Text style={[isCurrentMonth ? textStyles.h1 : textStyles.h2, { color: colors.primary }]}> 
                {isCurrentMonth ? streak.currentStreak : monthStreak}
              </Text>
              <Text style={{ fontSize: 24 }}>{getStreakDisplay()}</Text>
            </View>
            <Text style={[textStyles.caption, { color: colors.secondary, marginTop: 4 }]}> 
              {t('calendar.stats.record')}: {streak.longestStreak} {t('calendar.stats.days')}
              {isCurrentMonth && streak.freezeDaysAvailable > 0 ? ` · ${t('calendar.stats.freezeAvailable')}` : ''}
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
        </>
      )}
    </View>
  );
});
