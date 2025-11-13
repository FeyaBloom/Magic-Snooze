import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';
import { ContentContainer } from './ContentContainer';

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
    <LinearGradient colors={gradient} style={styles.container}>
      <FloatingAnimation />
      <ContentContainer>
        {children}
      </ContentContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  animation: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    pointerEvents: 'none',
  },
});