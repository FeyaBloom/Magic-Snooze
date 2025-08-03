import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Sparkles, Star } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '@/components/ThemeProvider';
import { createMagicStyles } from '@/styles/magic';
import LottieView from 'lottie-react-native'; 
import FloatingCloudJSON from '@/assets/animations/floating-cloud.json'; 
import GentleStarsJSON from '@/assets/animations/gentle-stars.json'; 

const { width: screenWidth } = Dimensions.get('window');

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


// ---- MAGIC SPARKLE ON CHECKBOX ----
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
       onPress();
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
  const styles = createMagicStyles(colors);
  const [confettiIndex, setConfettiIndex] = useState<number | null>(null);

  const victories = [
    { text: 'Got out of bed', emoji: '🛏️' },
    { text: 'Drank water', emoji: '💧' },
    { text: 'Took a deep breath', emoji: '🌬️' },
    { text: `Was patient`, emoji: '😌' },
    { text: 'Pet an animal', emoji: '🐱' },
    { text: 'Looked at the sky', emoji: '☁️' },
    { text: 'Smiled at something', emoji: '😊' },
    { text: 'Ate something', emoji: '🍎' },
  ];

  const handleVictory = (index:number, text: string) => {
    onVictoryPress(text);
    setConfettiIndex(index);
  };

  return (
    <View style={styles.tinyVictoryContainer}>
      <Text style={styles.tinyVictoryTitle}>Tiny Victories  <Sparkles size={20} color=colors.primary /></Text>
      <Text style={styles.tinyVictorySubtitle}>Celebrate the small wins!</Text>

      <View style={styles.victoryGrid}>
        {victories.map((v, index) => (
          <TouchableOpacity key={index} style={styles.victoryButton} onPress={() => handleVictory(index, v.text)}>
            <Text style={styles.victoryEmoji}>{v.emoji}</Text>
            <Text style={styles.victoryText}>{v.text}</Text>
        
            {confettiIndex === index && (
        <ConfettiCannon 
          key={index + `-` + Date.now()}
          count={20} 
          origin={{ x: screenWidth/2, y: -10 }} 
          fadeOut autoStart
          onAnimationEnd={() => setConfettiIndex(null)}
          />
      )}
          </TouchableOpacity>
        ))}
      </View>

      
    </View>
  );
};

// ---- SURPRISE PROMPT (NO CONFETTI) ----
export const SurprisePrompt = ({ onDismiss }: any) => {
  const { colors } = useTheme();
  const styles = createMagicStyles(colors);

  const prompts = [
    'Wanna write a poem instead of doing tasks? 📝',
    'Draw your to-do list as monsters! 👹',
    'What if you danced for 30 seconds? 💃',
    'Time to make a weird face in the mirror? 🤪',
    'How about humming your favorite song? 🎵',
    'Want to text someone you love? 💕',
    'Maybe stretch like a cat? 🐱',
    'Feel like making up a story about your day? 📚',
  ];

  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);

  return (
    <View style={styles.promptOverlay}>
      <View style={styles.promptContainer}>
        <Star size={24} color={colors.accent} />
        <Text style={styles.promptText}>{currentPrompt}</Text>
        <View style={styles.promptButtons}>
          <TouchableOpacity style={styles.promptButton} onPress={onDismiss}>
            <Text style={styles.promptButtonText}>Maybe later</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.promptButton, styles.promptButtonPrimary]} onPress={onDismiss}>
            <Text style={styles.promptButtonTextPrimary}>Let's do it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
