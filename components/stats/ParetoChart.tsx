import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Svg, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/components/ThemeProvider';
import { useTextStyles } from '@/hooks/useTextStyles';
import { createCalendarStyles } from '@/styles/calendar';

type RoutineStat = { name: string; count: number };

interface ParetoChartProps {
  data: RoutineStat[];
  maxItems?: number; // limit categories (top-N)
  height?: number;
  originOffset?: { x: number; y: number };
  onLabelPress?: (routine: RoutineStat, position: { x: number; y: number }) => void;
}

export function ParetoChart({ data, maxItems = 6, height = 220, originOffset, onLabelPress }: ParetoChartProps) {
  const { colors } = useTheme();
  const styles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);

  const sorted = useMemo(() => {
    const arr = [...data].sort((a, b) => b.count - a.count);
    return arr.slice(0, Math.max(1, Math.min(maxItems, arr.length)));
  }, [data, maxItems]);

  const total = sorted.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(1, ...sorted.map(d => d.count));

  // layout
  const width = 340; // card inner drawing width; responsive enough for phone
  const leftPadding = 36; // for Y ticks (counts)
  const rightPadding = 32; // for right % axis
  const bottomPadding = 48; // for X labels
  const topPadding = 16;
  const chartW = width - leftPadding - rightPadding;
  const chartH = height - topPadding - bottomPadding;

  // scales
  const barW = chartW / sorted.length * 0.7;
  const gap = chartW / sorted.length * 0.3;

  const yCount = (v: number) => topPadding + chartH * (1 - v / maxCount);
  const yPct = (p: number) => topPadding + chartH * (1 - p / 100);


  // ticks
  const countTicks = 4; // 0..maxCount
  const pctTicks = [0, 25, 50, 75, 100];

  const truncate = (s: string, n = 8) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

  return (
    <View style={calendarStyles.card}>
      <Svg width={width} height={height}>
        {/* grid lines for counts */}
        {Array.from({ length: countTicks + 1 }).map((_, i) => {
          const v = (maxCount / countTicks) * i;
          const y = yCount(v);
          return (
            <Line
              key={`g-${i}`}
              x1={leftPadding}
              y1={y}
              x2={leftPadding + chartW}
              y2={y}
              stroke={colors.secondary + '40'}
              strokeWidth={1}
            />
          );
        })}

        {/* bars */}
        {sorted.map((d, i) => {
          const x = leftPadding + i * (barW + gap) + gap * 0.5;
          const h = total === 0 ? 0 : chartH * (d.count / maxCount);
          const y = topPadding + (chartH - h);
          return (
            <Rect
              key={`b-${i}`}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={6}
              fill={colors.accent}
              opacity={0.9}
            />
          );
        })}

        {/* cumulative line удалена по просьбе пользователя */}

        {/* left axis labels (counts) */}
        {Array.from({ length: countTicks + 1 }).map((_, i) => {
          const v = Math.round((maxCount / countTicks) * i);
          const y = yCount(v);
          return (
            <SvgText
              key={`yl-${i}`}
              x={leftPadding - 6}
              y={y + 4}
              fontSize={10}
              fill={colors.textSecondary}
              textAnchor="end"
            >
              {v}
            </SvgText>
          );
        })}

        {/* right axis labels (% ticks) */}
        {pctTicks.map((p, i) => (
          <SvgText
            key={`pr-${i}`}
            x={leftPadding + chartW + 4}
            y={yPct(p) + 4}
            fontSize={10}
            fill={colors.textSecondary}
          >
            {p}%
          </SvgText>
        ))}

        {/* x labels */}
        {sorted.map((d, i) => {
          const x = leftPadding + i * (barW + gap) + gap * 0.5 + barW / 2;
          const y = height - 16;
          return (
            <SvgText
              key={`xl-${i}`}
              x={x}
              y={y}
              fontSize={10}
              fill={colors.text}
              textAnchor="middle"
              onPress={onLabelPress ? () => onLabelPress(d, { x: (originOffset?.x || 0) + x, y: (originOffset?.y || 0) + y - 8 }) : undefined}
            >
              {truncate(d.name)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
