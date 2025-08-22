import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Sparkles, Star } from 'lucide-react-native';
import { Confetti, ConfettiMethods } from 'react-native-fast-confetti';
import { useTheme } from '@/components/ThemeProvider';
import { createMagicStyles } from '@/styles/magic';
import LottieView from 'lottie-react-native'; 
import FloatingCloudJSON from '@/assets/animations/floating-cloud.json'; 
import GentleStarsJSON from '@/assets/animations/gentle-stars.json'; 
import i18n from '@/i18n';

const { width: screenWidth } = Dimensions.get('window');
const { t } = i18n;

type Props = { onVictoryPress: (text: string) => void };

// ---- FLOATING BACKGROUNDS ----

  const FloatingCloud = () => (
  <LottieView
    source={FloatingCloudJSON}
    autoPlay
    loop
    style={[StyleSheet.absoluteFillObject, {zIndex: 1}]}
  />
);
const GentleStars = () => (
  <LottieView
    source={GentleStarsJSON}
    autoPlay
    loop
    style={[StyleSheet.absoluteFillObject, {zIndex: 1}]}
  />
);

export const FloatingBackground: React.FC<{ style?: any }> = ({ style }) => {
  const { currentTheme } = useTheme();
  if (currentTheme === 'daydream') return <FloatingCloud />;
  if (currentTheme === 'nightforest') return <GentleStars />;
  return null;
};


export const MagicalCheckbox = ({ completed, onPress, disabled }: any) => {
  const { colors } = useTheme();
  const styles = createMagicStyles(colors);
  const [sparkles, setSparkles] = useState([]);
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  
  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
       if (onPress) {
         onPress();
       }
    });
  };
  
  return (
    <View style={styles.checkboxContainer}>
      <TouchableOpacity
        style={[
          styles.magicalCheckbox,
          completed && styles.magicalCheckboxCompleted,
          disabled && styles.magicalCheckboxDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {completed && <Sparkles size={20} color={colors.accent} />}
        </Animated.View>
      </TouchableOpacity>     
    </View>
  );
};
// ---- TINY VICTORY W/ CONFETTI ----
export const TinyVictoryTracker: React.FC<Props> = ({ onVictoryPress }) => {
  const { colors } = useTheme();

  // твои пункты
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

  // центр каждой кнопки в координатах экрана (для "пушки")
  const [centers, setCenters] = useState<{ x: number; y: number }[]>(
    Array(victories.length).fill({ x: 0, y: 0 })
  );

  // оффсет грид-контейнера относительно экрана
  const gridOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const gridViewRef = useRef<View>(null);

  // ref на конфетти
  const confettiRef = useRef<ConfettiMethods>(null);

  // один раз запоминаем позицию грида в окне
  const onGridLayout = () => {
    gridViewRef.current?.measureInWindow?.((x, y) => {
      gridOffsetRef.current = { x, y };
    });
  };

  // для каждой кнопки считаем её центр с учётом оффсета грида
  const onButtonLayout = (index: number) => (e: LayoutChangeEvent) => {
    const offset = gridOffsetRef.current;
    const { x, y, width, height } = e.nativeEvent.layout;

    if (offset) {
      const cx = offset.x + x + width / 2;
      const cy = offset.y + y + height / 2;
      setCenters((prev) => {
        const next = [...prev];
        next[index] = { x: cx, y: cy };
        return next;
      });
    }
  };

  const handleVictory = (index: number, text: string) => {
    onVictoryPress(text);

    // мгновенно перезапускаем конфетти из центра конкретной кнопки
    const pos = centers[index];
    confettiRef.current?.restart({
      cannonsPositions: [{ x: pos.x, y: pos.y }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('today.Tiny Victories')} <Text>✨</Text>
      </Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>{t('today.Celebrate the small wins!')}</Text>

      <View ref={gridViewRef} onLayout={onGridLayout} style={styles.grid}>
        {victories.map((v, index) => (
          <TouchableOpacity
            key={index}
            onLayout={onButtonLayout(index)}
            style={[styles.button, { borderColor: colors.border }]}
            onPress={() => handleVictory(index, v.text)}
            activeOpacity={0.8}
          >
            <Text style={styles.emoji}>{v.emoji}</Text>
            <Text style={[styles.label, { color: colors.text }]}>{v.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Оверлей конфетти поверх всего, без захвата касаний */}
      <Confetti
        ref={confettiRef}
        autoplay={false}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        colors={['#FFD1DC', '#B8C1FF', '#C3F0FF', '#FFE5A1', '#E0B3FF']}
        fadeOutOnEnd
        sizeVariation={0.25}
        rotation={{ x: { min: Math.PI * 2, max: Math.PI * 10 }, z: { min: Math.PI * 2, max: Math.PI * 10 } }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { marginTop: 4, opacity: 0.7 },
  grid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    width: '30%',
    minWidth: 96,
    aspectRatio: 1.2,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  emoji: { fontSize: 26, marginBottom: 4 },
  label: { fontSize: 14, textAlign: 'center' },
});

// ---- SURPRISE PROMPT (NO CONFETTI) ----
export const SurprisePrompt = ({ onDismiss }: any) => {
  const { colors } = useTheme();
  const styles = createMagicStyles(colors);

  const prompts = [
     t('today.surprize1'),
     t('today.surprize2'),
     t('today.surprize3'),
     t('today.surprize4'),
     t('today.surprize5'),
     t('today.surprize6'),
     t('today.surprize7'),
     t('today.surprize8'),
  ];

  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);

  return (
    <View style={styles.promptOverlay}>
      <View style={styles.promptContainer}>
        <Star size={24} color={colors.accent} />
        <Text style={styles.promptText}>{currentPrompt}</Text>
        <View style={styles.promptButtons}>
          <TouchableOpacity style={styles.promptButton} onPress={onDismiss}>
            <Text style={styles.promptButtonText}>{t(`today.Maybelater`)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.promptButton, styles.promptButtonPrimary]} onPress={onDismiss}>
            <Text style={styles.promptButtonTextPrimary}>{t(`today.Letsdoit`)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
