// components/ui/VictoryCelebration.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';
import ConfettiJSON from '@/assets/animations/confetti.json'; // ← убедись, что путь верный

interface Props {
  isVisible: boolean;
  x: number;
  y: number;
  onComplete: () => void;
  theme: 'daydream' | 'nightforest';
}

export const VictoryCelebration = ({
  isVisible,
  x,
  y,
  onComplete,
  theme,
}: Props) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.3)).current;

  // При появлении — плавно появляем + масштабируем
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  // Когда анимация закончится — вызываем onComplete
  const handleAnimationFinish = () => {
    if (isVisible) {
      // Задержка, чтобы конфетти "отлетело"
      setTimeout(onComplete, 500);
    }
  };

  if (!isVisible) return null;

  // Цвет конфетти под тему (через tint — работает в lottie-react-native)
  const tint = theme === 'daydream' 
    ? '#EC4899' // pink-500
    : '#FBBF24'; // amber-400

  return (
    <View
      style={[
        styles.container,
        {
          left: x - 150, // 300px / 2
          top: y - 150,
          opacity: opacity,
          transform: [{ scale: scale }],
        },
      ]}
      pointerEvents="none"
    >
      <LottieView
        source={ConfettiJSON}
        autoPlay
        loop={false}
        speed={1.2}
        onAnimationFinish={handleAnimationFinish}
        style={styles.animation}
        // 🌟 Tint — чтобы конфетти соответствовало теме!
        colorFilters={[
          { keypath: 'particles', color: tint },
          { keypath: 'stars', color: tint },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 300,
    height: 300,
    zIndex: 1000,
  },
  animation: {
    width: 300,
    height: 300,
  },
});