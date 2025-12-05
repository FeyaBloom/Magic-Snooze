import { View, Text } from 'react-native';

// Create a default toast configuration that doesn't depend on theme context
// This avoids calling useTheme at the time of function definition
export function AppToastConfig() {
  // Return a default configuration with light theme colors as fallback
  return {
    success: (props: any) => (
      <View style={{
        backgroundColor: '#FFFFFF', // Light surface fallback
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981', // Success green
        marginHorizontal: 20,
      }}>
        <Text style={{ color: '#6d6d6d', fontWeight: '600' }}> {/* Light text fallback */}
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: '#6B7280' }}>{props.text2}</Text>} {/* Light secondary text fallback */}
      </View>
    ),

    error: (props: any) => (
      <View style={{
        backgroundColor: '#FFFFFF', // Light surface fallback
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444', // Error red
        marginHorizontal: 20,
      }}>
        <Text style={{ color: '#6d6d6d', fontWeight: '600' }}> {/* Light text fallback */}
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: '#6B7280' }}>{props.text2}</Text>} {/* Light secondary text fallback */}
      </View>
    ),

    info: (props: any) => (
      <View style={{
        backgroundColor: '#FFFFFF', // Light surface fallback
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#EC4899', // Default primary
        marginHorizontal: 20,
      }}>
        <Text style={{ color: '#6d6d6d', fontWeight: '600' }}> {/* Light text fallback */}
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: '#6B7280' }}>{props.text2}</Text>} {/* Light secondary text fallback */}
      </View>
    ),
  };
}
