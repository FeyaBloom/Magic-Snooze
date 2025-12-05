import { View, Text } from 'react-native';

export function AppToastConfig() {
  return {
    success: (props: any) => (
      <View style={{
        backgroundColor: '#FFFFFF', // Light surface fallback
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
        marginHorizontal: 20,
      }}>
        <Text style={{ color: '#000000', fontWeight: '600' }}>
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: '#6B7280' }}>{props.text2}</Text>}
      </View>
    ),

    error: (props: any) => (
      <View style={{
        backgroundColor: '#FFFFFF', // Light surface fallback
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        marginHorizontal: 20,
      }}>
        <Text style={{ color: '#000000', fontWeight: '600' }}>
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: '#6B7280' }}>{props.text2}</Text>}
      </View>
    ),

    info: (props: any) => (
      <View style={{
        backgroundColor: '#FFFFFF', // Light surface fallback
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#EC4899',
        marginHorizontal: 20,
      }}>
        <Text style={{ color: '#000000', fontWeight: '600' }}>
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: '#6B7280' }}>{props.text2}</Text>}
      </View>
    ),
  };
}