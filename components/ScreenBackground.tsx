// components/ScreenBackground.tsx
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';
import { useTheme } from './ThemeProvider';

interface Props {
  tabName: string;
}

export function ScreenBackground({ tabName }: Props) {
  const { getTabGradient, currentTheme } = useTheme();
  const gradient = getTabGradient(tabName);

  return (
    <View style={styles.container}>
      {/* Фон */}
      <LinearGradient
        colors={gradient}
        style={styles.gradient}
      />

      {/* Анимация — поверх фона, но НЕ поверх контента */}
      <View style={styles.animationContainer}>
        {currentTheme === 'daydream' ? (
          <LottieView
            source={require('@/assets/animations/floating-cloud.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        ) : (
          <LottieView
            source={require('@/assets/animations/gentle-stars.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  animationContainer: {
    ...StyleSheet.absoluteFillObject,
    // ← НИКАКОГО zIndex здесь! Пусть будет 0 по умолчанию
    pointerEvents: 'none', // 🔑 КРИТИЧНО: не блокировать тапы!
  },
  animation: {
    flex: 1,
    opacity: 0.7, // ← чуть прозрачнее — не отвлекает
  },
});