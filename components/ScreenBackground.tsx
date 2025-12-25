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
      {/* background */}
      <LinearGradient
        colors={gradient}
        style={styles.gradient}
      />

      {/* animation between background and content*/}
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
    
    pointerEvents: 'none', 
  },
  animation: {
    flex: 1,
    opacity: 0.7, 
  },
});