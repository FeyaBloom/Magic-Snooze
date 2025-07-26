import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { FloatingCloud, GentleStars } from '@/components/MagicalFeatures';

export default function AppBackground() {
  const { theme } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme === 'daydream' && <FloatingCloud />}
      {theme === 'nightforest' && <GentleStars />}
    </View>
  );
}
