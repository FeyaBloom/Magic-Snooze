import { View, Text } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

export function AppToastConfig() {
  const { colors } = useTheme();

  return {
    success: (props: any) => (
      <View style={{
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
        marginHorizontal: 20,
      }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: colors.textSecondary }}>{props.text2}</Text>}
      </View>
    ),

    error: (props: any) => (
      <View style={{
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        marginHorizontal: 20,
      }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: colors.textSecondary }}>{props.text2}</Text>}
      </View>
    ),

    info: (props: any) => (
      <View style={{
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        marginHorizontal: 20,
      }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: colors.textSecondary }}>{props.text2}</Text>}
      </View>
    ),
  };
}
