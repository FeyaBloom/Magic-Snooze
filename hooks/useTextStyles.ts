import { useMemo } from 'react';
import { TextStyle } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { typography } from '@/styles/typography';

export function useTextStyles() {
  const { colors } = useTheme();

  return useMemo(() => ({
    h1: { ...typography.h1, color: colors.text } as TextStyle,
    h2: { ...typography.h2, color: colors.text } as TextStyle,
    quote: { ...typography.quote, color: colors.textSecondary } as TextStyle,
    button: { ...typography.button, color: colors.surface } as TextStyle,
    body: { ...typography.body, color: colors.text } as TextStyle,
    caption: { ...typography.caption, color: colors.textSecondary } as TextStyle,
  }), [colors]);
}