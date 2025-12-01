// components/TinyVictoryTracker.tsx
import React, { useState, useRef } from 'react';
import { Text, TouchableOpacity, View, Animated } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { createVictoryStyles } from '@/styles/victories';
import { VictoryCelebration } from '@/components/ui/VictoryCelebration';

interface Props {
  onVictoryPress: (text: string) => Promise<string[]> | void;
  celebratedVictories?: string[];
}

export const TinyVictoryTracker = ({ onVictoryPress, celebratedVictories }: Props) => {
  const { colors, currentTheme } = useTheme();
  const { t } = useTranslation();
  const styles = createVictoryStyles(colors);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPos, setConfettiPos] = useState({ x: 0, y: 0 });
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const victories = [
    { text: t('today.bed'), emoji: '🛏️' },
    { text: t('today.water'), emoji: '💧' },
    { text: t('today.breath'), emoji: '🌬️' },
    { text: t('today.patient'), emoji: '😌' },
    { text: t('today.pet'), emoji: '🐱' },
    { text: t('today.sky'), emoji: '☁️' },
    { text: t('today.smile'), emoji: '😊' },
    { text: t('today.food'), emoji: '🍎' },
  ];

  const handlePressIn = (index: number) => {
    setActiveButton(index);
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start(() => setActiveButton(null));
  };

  const handleVictory = async (text: string, index: number, layout: { x: number; y: number; width: number; height: number }) => {
    try {
      await onVictoryPress(text);
    } catch (e) {
      console.error('Victory press error:', e);
    }
    
    const centerX = layout.x + layout.width / 2;
    const centerY = layout.y + layout.height / 2;
    setConfettiPos({ x: centerX, y: centerY });
    setShowConfetti(true);
  };

  return (
    <View style={styles.tinyVictoryContainer}>
      <Text style={styles.tinyVictoryTitle}>
        {t('today.Tiny Victories')} <Sparkles size={20} color={colors.primary} />
      </Text>
      <Text style={styles.tinyVictorySubtitle}>
        {t('today.Celebrate the small wins!')}
      </Text>
      
      <View style={styles.victoryGrid}>
        {victories.map((v, index) => (
          <VictoryButton
            key={index}
            victory={v}
            index={index}
            isActive={activeButton === index}
            scaleAnim={scaleAnim}
            onPressIn={() => handlePressIn(index)}
            onPressOut={handlePressOut}
            onVictory={(layout) => handleVictory(v.text, index, layout)}
            styles={styles}
            isDisabled={celebratedVictories?.includes(v.text)}
            colors={colors}
          />
        ))}
      </View>

      <VictoryCelebration
        isVisible={showConfetti}
        x={confettiPos.x}
        y={confettiPos.y}
        theme={currentTheme}
        onComplete={() => setShowConfetti(false)}
      />
    </View>
  );
};

// --- VictoryButton (уже с isDisabled) ---
interface VictoryButtonProps {
  victory: { text: string; emoji: string };
  index: number;
  isActive: boolean;
  scaleAnim: Animated.Value;
  onPressIn: () => void;
  onPressOut: () => void;
  onVictory: (layout: { x: number; y: number; width: number; height: number }) => void;
  styles: any;
  isDisabled?: boolean;
  colors: any;
}

const VictoryButton = ({
  victory,
  isActive,
  scaleAnim,
  onPressIn,
  onPressOut,
  onVictory,
  styles,
  isDisabled,
  colors,
}: VictoryButtonProps) => {
  const buttonRef = useRef<View>(null);

  const handleLayout = (e: any) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    onVictory({ x, y, width, height });
  };

  return (
    <TouchableOpacity
      ref={buttonRef}
      style={[{ transform: [{ scale: scaleAnim }] }]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLayout={handleLayout}
      activeOpacity={0.9}
      disabled={isDisabled}
    >
      <View style={[
        styles.victoryButton,
        isDisabled && {
          opacity: 0.5,
          backgroundColor: colors.surface,
        }
      ]}>
        <Text style={styles.victoryEmoji}>{victory.emoji}</Text>
        <Text style={styles.victoryText}>{victory.text}</Text>
      </View>
    </TouchableOpacity>
  );
};