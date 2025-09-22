import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Sparkles, Star } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { createMagicStyles } from '@/styles/magic';
import LottieView from 'lottie-react-native'; 
import ConfettiJSON from '@/assets/animations/confetti.json';
import FloatingCloudJSON from '@/assets/animations/floating-cloud.json'; 
import GentleStarsJSON from '@/assets/animations/gentle-stars.json'; 
import i18n from '@/i18n';
const { t } = i18n;

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
  //const [sparkles, setSparkles] = useState([]);
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

export const TinyVictoryTracker = ({ onVictoryPress }: any) => {
  const { colors } = useTheme();
  const [animationKey, setAnimationKey] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false); // новое состояние
  const styles = createMagicStyles(colors);
  
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
 
  const handleVictory = (text: string, e: any) => {
    onVictoryPress(text);
    const { pageX, pageY } = e.nativeEvent;
    setPos({ x: pageX, y: pageY });
    setAnimationKey(Date.now());
    setShowConfetti(true); // показываем конфетти
  };


  return (
    <View style={styles.tinyVictoryContainer}>
      <Text style={styles.tinyVictoryTitle}>
        {t('today.Tiny Victories')} <Sparkles size={20} color={colors.primary} />
      </Text>
      <Text style={styles.tinyVictorySubtitle}>{t('today.Celebrate the small wins!')}</Text>
      
      <View style={styles.victoryGrid}>
        {victories.map((v, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.victoryButton} 
            onPress={(e) => handleVictory(v.text, e)}
          >
            <Text style={styles.victoryEmoji}>{v.emoji}</Text>
            <Text style={styles.victoryText}>{v.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showConfetti && (
        <LottieView
          key={animationKey}
          source={ConfettiJSON}
          autoPlay
          loop={false}
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            left: pos.x - 250,
            top: pos.y - 350,
            pointerEvents: 'none',
            zIndex: 1000
          }}
          onAnimationFinish={() => setShowConfetti(false)} // скрываем после завершения
        />
      )}
    </View>
  );
};

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
