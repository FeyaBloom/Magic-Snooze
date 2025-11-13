import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/ThemeProvider';

export default function TodayScreen() {
  const { colors, getTabGradient } = useTheme();
  const gradient = getTabGradient('calendar');

  return (
    <LinearGradient
      colors={gradient}
      style={styles.container}
    >
      <Text style={[styles.text, { color: colors.text }]}>
        📅 Calendar
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
});