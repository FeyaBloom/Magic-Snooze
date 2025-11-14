// components/ContentContainer.tsx
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeProvider';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
  paddingHorizontal?: number;
  paddingVertical?: number;
}

export function ContentContainer({
  children,
  style,
  paddingHorizontal = 16,
  paddingVertical = 0,
}: Props) {
  const { isMessyMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          // Адаптивный padding
          paddingHorizontal,
          // На messyMode — чуть больше воздуха
          paddingVertical: isMessyMode ? paddingVertical + 8 : paddingVertical,
          // Учитываем notch / челку
          paddingTop: insets.top + paddingVertical,
          paddingBottom: insets.bottom + paddingVertical,
        },
        style, // ← внешний style имеет приоритет
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: 'center',
  },
});