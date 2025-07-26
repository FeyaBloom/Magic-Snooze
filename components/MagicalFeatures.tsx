import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Sparkles, Heart, Star, Zap } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({ children, duration = 3000 }) => {
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(0.7);

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -20,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration / 4,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
};

interface MagicalCheckboxProps {
  completed: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const MagicalCheckbox: React.FC<MagicalCheckboxProps> = ({ completed, onPress, disabled }) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const scaleAnim = new Animated.Value(1);

  const createSparkles = () => {
    if (!completed) return;
    
    const newSparkles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
    }));
    
    setSparkles(newSparkles);
    
    setTimeout(() => setSparkles([]), 1000);
  };

  const handlePress = () => {
    if (disabled) return;
    
    // Bounce animation
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
    ]).start();

    onPress();
    
    if (!completed) {
      setTimeout(createSparkles, 150);
    }
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
          {completed && <Sparkles size={20} color="#FFFFFF" />} 
       
        </Animated.View>
      </TouchableOpacity>
      
      {sparkles.map((sparkle) => (
        <Animated.View
          key={sparkle.id}
          style={[
            styles.sparkle,
            {
              left: sparkle.x,
              top: sparkle.y,
            },
          ]}
        >
          <Sparkles size={12} color="#FFD700" />
        </Animated.View>
      ))}
    </View>
  );
};

interface TinyVictoryProps {
  onVictoryPress: (victory: string) => void;
}

export const TinyVictoryTracker: React.FC<TinyVictoryProps> = ({ onVictoryPress }) => {
  const victories = [
    { text: "Got out of bed", emoji: "🛏️" },
    { text: "Drank water", emoji: "💧" },
    { text: "Took a deep breath", emoji: "🌬️" },
    { text: "Didn't scream", emoji: "😌" },
    { text: "Pet an animal", emoji: "🐱" },
    { text: "Looked at the sky", emoji: "☁️" },
    { text: "Smiled at something", emoji: "😊" },
    { text: "Ate something", emoji: "🍎" },
  ];

  return (
    <View style={styles.tinyVictoryContainer}>
      <Text style={styles.tinyVictoryTitle}>Tiny Victories ✨</Text>
      <Text style={styles.tinyVictorySubtitle}>Celebrate the small wins!</Text>
      <View style={styles.victoryGrid}>
        {victories.map((victory, index) => (
          <TouchableOpacity
            key={index}
            style={styles.victoryButton}
            onPress={() => onVictoryPress(victory.text)}
          >
            <Text style={styles.victoryEmoji}>{victory.emoji}</Text>
            <Text style={styles.victoryText}>{victory.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

interface SurprisePromptProps {
  onDismiss: () => void;
}

export const SurprisePrompt: React.FC<SurprisePromptProps> = ({ onDismiss }) => {
  const prompts = [
    "Wanna write a poem instead of doing tasks? 📝",
    "Draw your to-do list as monsters! 👹",
    "What if you danced for 30 seconds? 💃",
    "Time to make a weird face in the mirror? 🤪",
    "How about humming your favorite song? 🎵",
    "Want to text someone you love? 💕",
    "Maybe stretch like a cat? 🐱",
    "Feel like making up a story about your day? 📚",
  ];

  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);

  return (
    <View style={styles.promptOverlay}>
      <View style={styles.promptContainer}>
        <FloatingElement>
          <Star size={24} color="#FFD700" />
        </FloatingElement>
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

const styles = StyleSheet.create({
  checkboxContainer: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  magicalCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  magicalCheckboxCompleted: {
    backgroundColor: '#F59E0B',
    borderColor: '#EC4899',
  },
  magicalCheckboxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  magicalCheckmark: {
    fontSize: 16,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 10,
  },
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
  victoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
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
  promptButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  promptButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  promptButtonPrimary: {
    backgroundColor: '#EC4899',
  },
  promptButtonText: {
    color: '#6B7280',
    fontFamily: 'ComicNeue-Regular',
  },
  promptButtonTextPrimary: {
    color: '#FFFFFF',
    fontFamily: 'ComicNeue-Regular',
  },
});