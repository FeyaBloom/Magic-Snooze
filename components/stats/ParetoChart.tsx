import React, { useMemo, memo } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/components/ThemeProvider';
import { useTextStyles } from '@/hooks/useTextStyles';
import { createCalendarStyles } from '@/styles/calendar';

type RoutineStat = { name: string; count: number };

interface ParetoChartProps {
  data: RoutineStat[];
  maxItems?: number;
  height?: number;
  onLabelPress?: (routine: RoutineStat) => void;
}

export const ParetoChart = memo(function ParetoChart({ data, maxItems = 6, height = 120, onLabelPress }: ParetoChartProps) {
  const { colors } = useTheme();
  const styles = useTextStyles();
  const calendarStyles = createCalendarStyles(colors);
  const { width: screenWidth } = useWindowDimensions();

  const sorted = useMemo(() => {
    const arr = [...data].sort((a, b) => b.count - a.count);
    return arr.slice(0, Math.max(1, Math.min(maxItems, arr.length)));
  }, [data, maxItems]);

  const maxCount = Math.max(1, ...sorted.map(d => d.count));

  // layout - адаптивная ширина
  const width = Math.min(screenWidth, 600);
  const leftPadding = 20;
  const rightPadding = 20;
  const bottomPadding = 20;
  const topPadding = 20;
  const chartW = width - leftPadding - rightPadding;
  const chartH = height - topPadding - bottomPadding;

  // scales
  const barW = Math.min(50, chartW / sorted.length * 0.8);
  const spacing = chartW / sorted.length;

  return (
    <View style={calendarStyles.card}>
      {/* Центрируем всю область графика */}
      <View style={{ alignItems: 'center' }}>
        <View style={{ width }}>
          <Svg width={width} height={height}>
            {/* Bars только визуальное соотношение */}
            {sorted.map((d, i) => {
              const x = leftPadding + i * spacing + (spacing - barW) / 2;
              const barHeight = (d.count / maxCount) * chartH;
              const y = topPadding + (chartH - barHeight);
              
              // Градиент яркости через opacity
              const opacity = 0.5 + (d.count / maxCount) * 0.5;
              
              return (
                <Rect
                  key={`b-${i}`}
                  x={x}
                  y={y}
                  width={barW}
                  height={barHeight}
                  rx={8}
                  fill={colors.secondary}
                  opacity={opacity}
                />
              );
            })}
            
            {/* Числа над столбиками */}
            {sorted.map((d, i) => {
              const barHeight = (d.count / maxCount) * chartH;
              const y = topPadding + (chartH - barHeight) - 4;
              const x = leftPadding + i * spacing + spacing / 2;
              
              return (
                <SvgText
                  key={`count-${i}`}
                  x={x}
                  y={y}
                  fill={colors.text}
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {d.count}
                </SvgText>
              );
            })}
          </Svg>

          {/* Labels под графиком - названия рутин */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 }}>
            {sorted.map((d, i) => (
              <TouchableOpacity
                key={`label-${i}`}
                style={{ alignItems: 'center', flex: 1, paddingHorizontal: 2 }}
                onPress={() => onLabelPress && onLabelPress(d)}
                activeOpacity={onLabelPress ? 0.7 : 1}
              >
                <Text
                  style={[
                    styles.caption,
                    {
                      color: colors.text,
                      fontSize: 10,
                      textAlign: 'center',
                    },
                  ]}
                  numberOfLines={3}
                >
                  {d.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
});
