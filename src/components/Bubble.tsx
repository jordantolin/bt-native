import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export type BubbleProps = {
  id: string;
  orbitCenter: { x: number; y: number };
  orbitRadius: Animated.SharedValue<number>;
  angle: Animated.SharedValue<number>;
  size: Animated.SharedValue<number>;
  reflectionCount: Animated.SharedValue<number>;
  glow: Animated.SharedValue<number>;
  onPress: (id: string) => void;
  colorForCount: (count: number) => string;
};

export default function Bubble({
  id,
  orbitCenter,
  orbitRadius,
  angle,
  size,
  reflectionCount,
  glow,
  onPress,
  colorForCount,
}: BubbleProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const x = orbitCenter.x + orbitRadius.value * Math.cos(angle.value);
    const y = orbitCenter.y + orbitRadius.value * Math.sin(angle.value);
    const bubbleSize = size.value + glow.value;
    return {
      transform: [
        { translateX: x - bubbleSize / 2 },
        { translateY: y - bubbleSize / 2 },
      ],
      width: bubbleSize,
      height: bubbleSize,
      borderRadius: bubbleSize / 2,
      backgroundColor: colorForCount(reflectionCount.value),
      opacity: 0.85,
      position: 'absolute',
      shadowColor: '#FFD600',
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    };
  });

  return (
    <Pressable onPress={() => onPress(id)}>
      <Animated.View style={animatedStyle} />
    </Pressable>
  );
}
