// magicUI.tsx — version: not embarrassing

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Sparkles, Star } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '@/components/ThemeProvider';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ---- FLOATING BACKGROUNDS ----
export const FloatingBackground: React.FC = () => {
  const { theme } = useTheme();

  if (theme === 'daydream') {
    return <FloatingClouds />;
  } else if (theme === 'nightforest') {
    return <GentleStars />;
  } else {
    return null;
  }
};

const FloatingClouds = () => (
  <Animated.View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    {/* insert non-laggy floating cloud SVGs or light effects */}
  </Animated.View>
);

const GentleStars = () => (
  <Animated.View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    {/* insert subtle floating stars or twinkle effect */}
  </Animated.View>
);

// ---- MAGIC SPARKLE ON CHECKBOX ----
export const MagicalCheckbox = ({ completed, onPress, disabled }: any) => {
  const [sparkles, setSparkles] = useState([]);
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  const handlePress = () => {
    if (disabled) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!completed) triggerSparkles();
    });

    onPress();
  };

  const triggerSparkles = () => {
    const newSparkles = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 24 - 12,
      y: Math.random() * 24 - 12,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 1000);
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
          {completed && <Sparkles size={20} color="#f59e0b" />}
        </Animated.View>
      </TouchableOpacity>

      {sparkles.map((s) => (
        <Animated.View key={s.id} style={[styles.sparkle, { left: s.x, top: s.y }]}>
          <Sparkles size={12} color="#FFD700" />
        </Animated.View>
      ))}
    </View>
  );
};

// ---- TINY VICTORY W/ CONFETTI ----
export const TinyVictoryTracker = ({ onVictoryPress }: any) => {
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const victories = [
    { text: 'Got out of bed', emoji: '🛏️' },
    { text: 'Drank water', emoji: '💧' },
    { text: 'Took a deep breath', emoji: '🌬️' },
    { text: "Didn't scream", emoji: '😌' },
    { text: 'Pet an animal', emoji: '🐱' },
    { text: 'Looked at the sky', emoji: '☁️' },
    { text: 'Smiled at something', emoji: '😊' },
    { text: 'Ate something', emoji: '🍎' },
  ];

  const handleVictory = (text: string) => {
    onVictoryPress(text);
    setConfettiTrigger((prev) => prev + 1);
  };

  return (
    <View style={styles.tinyVictoryContainer}>
      <Text style={styles.tinyVictoryTitle}>Tiny Victories ✨</Text>
      <Text style={styles.tinyVictorySubtitle}>Celebrate the small wins!</Text>

      <View style={styles.victoryGrid}>
        {victories.map((v, index) => (
          <TouchableOpacity
            key={index}
            style={styles.victoryButton}
            onPress={() => handleVictory(v.text)}
          >
            <Text style={styles.victoryEmoji}>{v.emoji}</Text>
            <Text style={styles.victoryText}>{v.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {confettiTrigger > 0 && (
        <ConfettiCannon count={20} origin={{ x: screenWidth / 2, y: -10 }} fadeOut autoStart />
      )}
    </View>
  );
};

// ---- SURPRISE PROMPT (NO CONFETTI) ----
export const SurprisePrompt = ({ onDismiss }: any) => {
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
        <Star size={24} color="#FFD700" />
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

// ---- STYLES ----
const styles = StyleSheet.create({
  checkboxContainer: { position: 'relative', width: 32, height: 32 },
  magicalCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF50',
  },
  magicalCheckboxCompleted: {
    backgroundColor: '#FFFFFF50',
    borderColor: '#f59e0b50',
  },
  magicalCheckboxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  sparkle: { position: 'absolute', zIndex: 10 },
  tinyVictoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tinyVictoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'ComicNeue-Bold',
  },
  tinyVictorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'ComicNeue-Regular',
  },
  victoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  victoryButton: {
    width: '48%',
    backgroundColor: '#F3E5FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  victoryEmoji: { fontSize: 20, marginBottom: 4 },
  victoryText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'ComicNeue-Regular',
  },
  promptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  promptContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    maxWidth: 300,
  },
  promptText: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginVertical: 16,
    fontFamily: 'ComicNeue-Regular',
    lineHeight: 24,
  },
  promptButtons: { flexDirection: 'row', gap: 12 },
  promptButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  promptButtonPrimary: { backgroundColor: '#EC4899' },
  promptButtonText: { color: '#6B7280', fontFamily: 'ComicNeue-Regular' },
  promptButtonTextPrimary: { color: '#FFFFFF', fontFamily: 'ComicNeue-Regular' },
});
