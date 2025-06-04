import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

export type BubbleProps = {
  id: string;
  orbitCenter: { x: number; y: number };
  baseSize: number;
  initialReflection?: number;
  onPress: (id: string) => void;
  colorForCount: (count: number) => string;
};

export default function Bubble({
  id,
  orbitCenter,
  baseSize,
  initialReflection = 0,
  onPress,
  colorForCount,
}: BubbleProps) {
  const angle = useSharedValue(Math.random() * Math.PI * 2);
  const orbitRadius = useSharedValue(60 + Math.random() * 100);
  const size = useSharedValue(baseSize + initialReflection * 8);
  const reflectionCount = useSharedValue(initialReflection);
  const glow = useSharedValue(0);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(angle.value + Math.PI * 2, { duration: 12000 }),
      -1,
      false
    );
  }, []);

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
    <Pressable
      onPress={() => {
        reflectionCount.value += 1;
        size.value = baseSize + reflectionCount.value * 8;
        glow.value = withSequence(
          withTiming(12, { duration: 120 }),
          withTiming(0, { duration: 200 })
        );
        onPress(id);
      }}
    >
      <Animated.View style={animatedStyle} />
    </Pressable>
  );
}
