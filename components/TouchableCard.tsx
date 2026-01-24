import React, { useState } from 'react';
import { TouchableOpacity, ViewStyle, StyleProp, Animated } from 'react-native';
import { TOUCHABLE_CONFIG } from '@/styles/touchable';

interface TouchableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeOpacity?: number;
}

export function TouchableCard({
  children,
  onPress,
  style,
  disabled = false,
  activeOpacity = TOUCHABLE_CONFIG.activeOpacity,
}: TouchableCardProps) {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: TOUCHABLE_CONFIG.pressScale,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={activeOpacity}
      disabled={disabled}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}
