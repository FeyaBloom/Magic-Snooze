import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

function ThemedToast({
  type,
  text1,
  text2,
}: {
  type: 'success' | 'error' | 'info';
  text1?: string;
  text2?: string;
}) {
  const { colors } = useTheme();

  const borderLeftColor =
    type === 'success'
      ? colors.accent
      : type === 'error'
      ? colors.primary
      : colors.secondary;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor,
        marginHorizontal: 20,
        // @ts-ignore
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Text style={{ color: colors.text, fontWeight: '600' }}>{text1}</Text>
      {text2 && <Text style={{ color: colors.textSecondary }}>{text2}</Text>}
    </View>
  );
}

export function AppToastConfig() {
  return {
    success: (props: any) => <ThemedToast type="success" text1={props.text1} text2={props.text2} />,
    error: (props: any) => <ThemedToast type="error" text1={props.text1} text2={props.text2} />,
    info: (props: any) => <ThemedToast type="info" text1={props.text1} text2={props.text2} />,
  };
}