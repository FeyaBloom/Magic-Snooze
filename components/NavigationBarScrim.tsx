import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeProvider';

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  const isValid = /^[0-9a-fA-F]{6}$/.test(full);
  if (!isValid) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const red = Number.parseInt(full.slice(0, 2), 16);
  const green = Number.parseInt(full.slice(2, 4), 16);
  const blue = Number.parseInt(full.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function NavigationBarScrim() {
  const insets = useSafeAreaInsets();
  const { currentTheme, colors } = useTheme();

  if (Platform.OS !== 'android' || insets.bottom === 0) {
    return null;
  }

  const bottomHeight = insets.bottom + 16;
  const strongAlpha = currentTheme === 'nightforest' ? 0.68 : 0.5;
  const start = hexToRgba(colors.surface, 0);
  const end = hexToRgba(colors.surface, strongAlpha);

  return (
    <View pointerEvents="none" style={[styles.container, { height: bottomHeight }]}> 
      <LinearGradient
        colors={[start, end]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
