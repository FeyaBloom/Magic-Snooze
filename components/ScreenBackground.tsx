import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';
import { StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface Props {
  tabName: string;
  children: ReactNode;
  style?: ViewStyle;
}

export function ScreenBackground({ tabName, children, style }: Props) {
  const { getTabGradient } = useTheme();
  const gradient = getTabGradient(tabName);

  return (
    <LinearGradient colors={gradient} style={[styles.container, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});