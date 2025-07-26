import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { FloatingBackground } from '@/components/MagicalFeatures';

export default function AppBackground() {
  const { theme } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <FloatingBackground />
    </View>
  );
}
