import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { createCalendarStyles } from '@/styles/calendar';

interface ProgressBarProps {
  percentage: number;
  label: string;
  icon: string;
  color?: string;
}

export function ProgressBar({
  percentage,
  label,
  icon,
  color,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const styles = useTextStyles();
  const barColor = color || colors.accent;

  return (
    <View style={{ marginBottom: 12, gap: 6 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
          <Text style={[styles.body, { color: colors.text, flex: 1 }]}>{label}</Text>
        </View>
        <Text style={[styles.caption, { color: colors.secondary, fontWeight: 'bold' }]}>
          {percentage}%
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 8,
          backgroundColor: colors.surface,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </View>
    </View>
  );
}

interface WeekCardProps {
  weekNumber: number;
  morningRate: number;
  eveningRate: number;
  overallRate: number;
  morningDays?: number;
  eveningDays?: number;
  totalDays?: number;
  tasksCompleted?: number;
  victoriesCount?: number;
  status: 'excellent' | 'good' | 'needsSupport';
  expanded?: boolean;
  onToggle?: () => void;
}

export function WeekCard({
  weekNumber,
  morningRate,
  eveningRate,
  overallRate,
  morningDays = 0,
  eveningDays = 0,
  totalDays = 5,
  tasksCompleted = 0,
  victoriesCount = 0,
  status,
  expanded = true,
  onToggle,
}: WeekCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);
  const statusLabel = t(`calendar.stats.status.${status}`);

  const getStatusColor = () => {
    switch (status) {
      case 'excellent':
        return colors.accent;
      case 'good':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const getMotivationalMessage = () => {
    if (overallRate >= 90) return t('calendar.stats.motivations.cosmic');
    if (overallRate >= 75) return t('calendar.stats.motivations.excellent');
    if (overallRate >= 50) return t('calendar.stats.motivations.good');
    if (overallRate >= 25) return t('calendar.stats.motivations.keep');
    return t('calendar.stats.motivations.believe');
  };

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[
        calendarStyles.rowCard,
        {
          borderTopWidth: 3,
          borderTopColor: getStatusColor(),
          borderLeftWidth: 0,
        },
      ]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: expanded ? 8 : 0,
        }}
      >
        <Text style={[styles.h2, { color: colors.primary }]}>
          {t('calendar.stats.week')} {weekNumber}
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.h2, { color: getStatusColor() }]}>{overallRate}%</Text>
          {expanded && (
            <Text style={[styles.caption, { color: getStatusColor(), fontSize: 11 }]}>
              {getMotivationalMessage()}
            </Text>
          )}
        </View>
      </View>

      {!expanded && (
        <Text style={[styles.caption, { color: colors.textSecondary, marginTop: 6 }]}>
          {statusLabel}
        </Text>
      )}

      {expanded && (
        <>
          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.secondary,
              opacity: 0.2,
              marginBottom: 12,
            }}
          />

          {/* Routines Chart */}
          <View style={{ gap: 8, marginBottom: 12 }}>
            {/* Morning */}
            <View style={{ gap: 4 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    flex: 1,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>☕</Text>
                  <Text style={[styles.body, { color: colors.text }]}>{t('calendar.stats.morning')}</Text>
                </View>
                <Text
                  style={[
                    styles.caption,
                    { color: colors.secondary, fontWeight: 'bold' },
                  ]}
                >
                  {morningDays}/{totalDays}
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: colors.secondary,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${morningRate}%`,
                    backgroundColor: colors.accent,
                  }}
                />
              </View>
            </View>

            {/* Evening */}
            <View style={{ gap: 4 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    flex: 1,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🌙</Text>
                  <Text style={[styles.body, { color: colors.text }]}>{t('calendar.stats.evening')}</Text>
                </View>
                <Text
                  style={[
                    styles.caption,
                    { color: colors.secondary, fontWeight: 'bold' },
                  ]}
                >
                  {eveningDays}/{totalDays}
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: colors.secondary,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${eveningRate}%`,
                    backgroundColor: colors.accent,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.secondary,
              opacity: 0.2,
              marginBottom: 12,
            }}
          />

          {/* Tasks & Victories Count */}
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              justifyContent: 'center',
            }}
          >
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 16 }}>📋</Text>
              <Text style={[styles.caption, { color: colors.secondary }]}>
                {t('calendar.stats.tasks')}
              </Text>
              <Text style={[styles.h2, { color: colors.primary }]}>
                {tasksCompleted}
              </Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 16 }}>✨</Text>
              <Text style={[styles.caption, { color: colors.secondary }]}>
                {t('calendar.stats.victories')}
              </Text>
              <Text style={[styles.h2, { color: colors.primary }]}>
                {victoriesCount}
              </Text>
            </View>
          </View>

        </>
      )}
    </TouchableOpacity>
  );
}
