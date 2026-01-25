import React, { useState, useMemo, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
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
  startDate?: string;
  endDate?: string;
  morningRate: number;
  eveningRate: number;
  overallRate: number;
  morningDays?: number;
  eveningDays?: number;
  totalDays?: number;
  tasksCompleted?: number;
  victoriesCount?: number;
  dailyActivity?: Array<{ 
    day: string; 
    hasActivity: boolean; 
    emoji: string;
    morningDone: number;
    eveningDone: number;
    totalRoutines: number;
    totalPlanned: number;
  }>; // Новая визуализация
  status: 'excellent' | 'good' | 'needsSupport';
  expanded?: boolean;
  onToggle?: () => void;
}

export const WeekCard = memo(function WeekCard({
  weekNumber,
  startDate,
  endDate,
  morningRate,
  eveningRate,
  overallRate,
  morningDays = 0,
  eveningDays = 0,
  totalDays = 5,
  tasksCompleted = 0,
  victoriesCount = 0,
  dailyActivity = [],
  status,
  expanded = true,
  onToggle,
}: WeekCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);
  const statusLabel = t(`calendar.stats.status.${status}`);
  const [svgWidth, setSvgWidth] = useState(0);

  const maxDataValue = useMemo(() => {
    return Math.max(...dailyActivity.map(d => d.totalRoutines), 0);
  }, [dailyActivity]);

  const maxRoutines = Math.max(maxDataValue + 1, 6);

  const chartData = useMemo(() => {
    if (svgWidth <= 0 || dailyActivity.length === 0) {
      return null;
    }

    const height = 110;
    const paddingTop = 20;
    const paddingBottom = 20;
    const paddingLeft = 40;
    const paddingRight = 40;
    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = dailyActivity.map((day, index) => {
      const x = paddingLeft + (index / (dailyActivity.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((day.totalRoutines / maxRoutines) * chartHeight);
      return { x, y, value: day.totalRoutines };
    });

    let pathData = '';
    if (points.length > 0) {
      pathData = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const x0 = i > 0 ? points[i - 1].x : points[i].x;
        const y0 = i > 0 ? points[i - 1].y : points[i].y;
        const x1 = points[i].x;
        const y1 = points[i].y;
        const x2 = points[i + 1].x;
        const y2 = points[i + 1].y;
        const x3 = i < points.length - 2 ? points[i + 2].x : x2;
        const y3 = i < points.length - 2 ? points[i + 2].y : y2;

        const cp1x = x1 + (x2 - x0) / 6;
        const cp1y = y1 + (y2 - y0) / 6;
        const cp2x = x2 - (x3 - x1) / 6;
        const cp2y = y2 - (y3 - y1) / 6;

        pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
      }
    }

    return { points, pathData };
  }, [svgWidth, dailyActivity, maxRoutines]);

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

  const getGrowthEmoji = () => {
    if (overallRate >= 75) return '🌳';
    if (overallRate >= 50) return '🌿';
    return '🌱';
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = start.toLocaleDateString(i18n.language, { month: 'short' });
    return `${startDay}-${endDay} ${month}`;
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
        <View>
          <Text style={[styles.h2, { color: colors.text }]}>
            {t('calendar.stats.week')} {weekNumber}
          </Text>
          {startDate && endDate && (
            <Text style={[styles.caption, { color: colors.secondary, marginTop: 2 }]}>
              {formatDateRange()}
            </Text>
          )}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 32 }}>{getGrowthEmoji()}</Text>
            <Text style={[styles.h2, { color: getStatusColor() }]}>{overallRate}%</Text>
          </View>
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

          {/* Daily Activity Celebration Wall */}
          {dailyActivity.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', gap: 4 }}>
                {dailyActivity.map((day, index) => {
                  // Определяем цвет квадратика по эмодзи
                  const getBackgroundColor = () => {
                    if (day.emoji === '🏆') return colors.accent; // Complete - зеленый
                    if (day.emoji === '⭐') return colors.secondary; // Partial - желтый
                    if (day.emoji === '💤') return colors.primary; // Snoozed - розовый
                    if (day.emoji === '💫') return colors.secondary; // Started - желтый
                    return colors.surface; // No activity - серый
                  };
                  
                  return (
                    <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: getBackgroundColor(),
                          opacity: day.hasActivity ? 1 : 0.3,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>
                          {day.hasActivity ? day.emoji : '·'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.secondary,
              opacity: 0.2,
              marginBottom: 12,
            }}
          />

          {/* Routines Chart - график кривой с точками */}
          {dailyActivity && dailyActivity.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <View 
                style={{ height: 140 }}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  if (width > 0 && !svgWidth) {
                    setSvgWidth(width);
                  }
                }}
              >
                {svgWidth > 0 && chartData && (
                  <>
                    <View style={{ height: 110, position: 'relative' }}>
                      <Svg height="110" width={svgWidth}>
                        <Path
                          d={chartData.pathData}
                          stroke={colors.accent}
                          strokeWidth="3"
                          fill="none"
                        />

                        {chartData.points.map((point, index) => {
                          const totalPlanned = dailyActivity[index].totalPlanned || 0;
                          const isDayComplete = totalPlanned > 0 && dailyActivity[index].totalRoutines >= totalPlanned;
                          const hasActivity = point.value > 0;
                          const glowColor = isDayComplete ? colors.accent : hasActivity ? colors.secondary : colors.primary;
                          return (
                            <React.Fragment key={index}>
                              {/* Внешнее свечение */}
                              <Circle
                                cx={point.x}
                                cy={point.y}
                                r="12"
                                fill={glowColor}
                                opacity="0.3"
                              />
                              {/* Среднее свечение */}
                              <Circle
                                cx={point.x}
                                cy={point.y}
                                r="8"
                                fill={glowColor}
                                opacity="0.5"
                              />
                              {/* Основная точка */}
                              <Circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill={glowColor}
                              />
                            </React.Fragment>
                          );
                        })}
                      </Svg>
                      
                      {/* Числа над точками */}
                      {dailyActivity.map((day, index) => {
                        const point = chartData.points[index];
                        return day.totalRoutines > 0 && point ? (
                          <Text
                            key={index}
                            style={[styles.caption, {
                              position: 'absolute',
                              left: point.x - 6,
                              top: point.y - 18,
                              color: colors.text,
                              fontSize: 10,
                              fontWeight: 'bold',
                            }]}
                          >
                            {day.totalRoutines}
                          </Text>
                        ) : null;
                      })}
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                      {dailyActivity.map((day, index) => (
                        <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                          <Text style={[styles.caption, { color: colors.textSecondary, fontSize: 10 }]}>
                            {day.day}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

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
});
