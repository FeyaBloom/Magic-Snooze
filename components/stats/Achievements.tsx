import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles } from '@/styles/calendar';
import { StreakData } from '@/hooks/useStreak';

interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}

interface AchievementsProps {
  streak: StreakData;
  completeDays: number;
  totalVictories: number;
}

export function Achievements({
  streak,
  completeDays,
  totalVictories,
}: AchievementsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);

  const achievements = useMemo<Achievement[]>(() => {
    return [
      {
        id: 'first-step',
        name: t('calendar.achievements.firstStep.name'),
        description: t('calendar.achievements.firstStep.description'),
        emoji: '👣',
        unlocked: completeDays >= 1,
      },
      {
        id: 'week-warrior',
        name: t('calendar.achievements.weekWarrior.name'),
        description: t('calendar.achievements.weekWarrior.description'),
        emoji: '⚔️',
        unlocked: streak.currentStreak >= 7,
      },
      {
        id: 'month-master',
        name: t('calendar.achievements.monthMaster.name'),
        description: t('calendar.achievements.monthMaster.description'),
        emoji: '🗓️',
        unlocked: completeDays >= 30,
      },
      {
        id: 'magic-collector',
        name: t('calendar.achievements.magicCollector.name'),
        description: t('calendar.achievements.magicCollector.description'),
        emoji: '✨',
        unlocked: totalVictories >= 50,
      },
      {
        id: 'unstoppable',
        name: t('calendar.achievements.unstoppable.name'),
        description: t('calendar.achievements.unstoppable.description'),
        emoji: '🔥',
        unlocked: streak.currentStreak >= 14,
      },
      {
        id: 'legend',
        name: t('calendar.achievements.legend.name'),
        description: t('calendar.achievements.legend.description'),
        emoji: '👑',
        unlocked: completeDays >= 100,
      },
      {
        id: 'record-holder',
        name: t('calendar.achievements.recordHolder.name'),
        description: t('calendar.achievements.recordHolder.description'),
        emoji: '🏆',
        unlocked: streak.longestStreak >= 30,
      },
      {
        id: 'victory-collector',
        name: t('calendar.achievements.victoryCollector.name'),
        description: t('calendar.achievements.victoryCollector.description'),
        emoji: '🎁',
        unlocked: totalVictories >= 100,
      },
    ];
  }, [streak, completeDays, totalVictories, t]);

  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);
  const unlockedCount = unlockedAchievements.length;

  // Если нет разблокированных достижений - не показываем
  if (unlockedCount === 0) return null;

  return (
    <View style={calendarStyles.card}>
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.h2}>
          {t('calendar.stats.achievements')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {unlockedAchievements.map((achievement) => (
          <View
            key={achievement.id}
            style={{
              flex: 1,
              minWidth: '30%',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {/* Badge */}
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.accent,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: colors.primary,
              }}
            >
              <Text style={{ fontSize: 24 }}>{achievement.emoji}</Text>
            </View>

            {/* Label */}
            <Text
              style={[
                styles.caption,
                {
                  color: colors.text,
                  textAlign: 'center',
                  fontSize: 11,
                },
              ]}
              numberOfLines={2}
            >
              {achievement.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
