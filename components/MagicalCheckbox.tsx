import React from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface MagicalCheckboxProps {
  completed: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
}

export function MagicalCheckbox({ 
  completed, 
  onPress, 
  disabled = false,
  size = 24 
}: MagicalCheckboxProps) {
  const animatedValue = React.useRef(new Animated.Value(completed ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: completed ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  }, [completed]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const backgroundColor = completed 
    ? '#bcaa55' // completed
    : 'transparent';

  const borderColor = disabled 
    ? '#94A3B8' + '50' 
    : completed 
      ? '#bcaa55'
      : '#94A3B8';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 4,
            backgroundColor,
            borderColor,
            borderWidth: 2,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale }],
          },
        ]}
      >
        {completed && (
          <Check 
            size={size * 0.6} 
            color="#FFFFFF" 
            strokeWidth={3}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});