import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useAnimatedProps,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

export type BubbleData = {
  id: string;
  label: string;
  reflectionCount: number;
  orbitRadius: number;
};

export type BubbleProps = {
  data: BubbleData;
  centerX: number;
  centerY: number;
  onPress: (id: string) => void;
};

export default function Bubble({
  data,
  centerX,
  centerY,
  onPress,
}: BubbleProps) {
  const angle = useSharedValue(Math.random() * Math.PI * 2);
  const glow = useSharedValue(0);

  const intensity = Math.min(1, data.reflectionCount / 10);
  const radius = 15 + Math.min(data.reflectionCount * 2, 35);
  const color = `rgba(255, 228, 107, ${0.3 + intensity * 0.7})`;

  useEffect(() => {
    const duration = 10000 + Math.random() * 5000;
    angle.value = withRepeat(
      withTiming(angle.value + Math.PI * 2, { duration }),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const r = radius + glow.value;
    const x = centerX + data.orbitRadius * Math.cos(angle.value) - r;
    const y = centerY + data.orbitRadius * Math.sin(angle.value) - r;
    return {
      position: "absolute",
      width: r * 2,
      height: r * 2,
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  const circleProps = useAnimatedProps(() => ({
    r: radius + glow.value,
  }));

  return (
    <Pressable
      onPress={() => {
        glow.value = withSequence(
          withTiming(8, { duration: 120 }),
          withTiming(0, { duration: 200 }),
        );
        setTimeout(() => onPress(data.id), 200);
      }}
    >
      <Animated.View style={animatedStyle}>
        <Svg width="100%" height="100%">
          <AnimatedCircle
            animatedProps={circleProps}
            cx="50%"
            cy="50%"
            fill={color}
            opacity={0.9}
          />
          <AnimatedSvgText
            x="50%"
            y="50%"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {data.label}
          </AnimatedSvgText>
        </Svg>
      </Animated.View>
    </Pressable>
  );
}
