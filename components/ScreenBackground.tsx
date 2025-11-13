import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';

interface Props {
  tabName: string;
  children: ReactNode;
}

export function ScreenBackground({ tabName, children }: Props) {
  const { getTabGradient, currentTheme } = useTheme();
  const gradient = getTabGradient(tabName);

  const FloatingAnimation = () => {
    if (currentTheme === 'daydream') {
      return (
        <LottieView
          source={require('@/assets/animations/floating-cloud.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      );
    }
    if (currentTheme === 'nightforest') {
      return (
        <LottieView
          source={require('@/assets/animations/gentle-stars.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      );
    }
    return null;
  };

  return (
    <View style={styles.screenContainer}>
      <LinearGradient colors={gradient} style={styles.background} />
      <FloatingAnimation />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  animation: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: 'none',
  },
});