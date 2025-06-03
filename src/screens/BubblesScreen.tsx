import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const { width, height } = Dimensions.get('window');
const CENTER_X = width / 2;
const CENTER_Y = height / 2;

type Bubble = {
  id: string;
  radius: number;
  orbitRadius: number;
  color: string;
  angle: Animated.SharedValue<number>;
  glow: Animated.SharedValue<number>;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bubbles'>;

function useCreateBubble(index: number): Bubble {
  const angle = useSharedValue(Math.random() * Math.PI * 2);
  const glow = useSharedValue(0);

  const duration = 10000 + Math.random() * 5000;

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(angle.value + Math.PI * 2, {
        duration,
      }),
      -1,
      false
    );
  }, []);

  return {
    id: `bubble-${index}`,
    radius: 20 + Math.random() * 20,
    orbitRadius: 60 + Math.random() * 100,
    color: '#ffe46b',
    angle,
    glow,
  };
}

function useBubbles(): Bubble[] {
  return Array.from({ length: 8 }, (_, i) => useCreateBubble(i));
}

export default function BubblesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const bubbles = useBubbles();

  return (
    <View style={styles.container}>
      {bubbles.map((bubble) => {
        const animatedStyle = useAnimatedStyle(() => {
          const x = CENTER_X + bubble.orbitRadius * Math.cos(bubble.angle.value);
          const y = CENTER_Y + bubble.orbitRadius * Math.sin(bubble.angle.value);
          return {
            transform: [{ translateX: x - bubble.radius }, { translateY: y - bubble.radius }],
            width: bubble.radius * 2 + bubble.glow.value,
            height: bubble.radius * 2 + bubble.glow.value,
            borderRadius: bubble.radius + bubble.glow.value,
            backgroundColor: bubble.color,
            opacity: 0.9,
            position: 'absolute',
          };
        });

        return (
          <Pressable
            key={bubble.id}
            onPress={() => {
              bubble.glow.value = withSequence(
                withTiming(12, { duration: 120 }),
                withTiming(0, { duration: 200 })
              );
              setTimeout(() => {
                navigation.navigate('Chat', { bubbleId: bubble.id });
              }, 200);
            }}
          >
            <Animated.View style={animatedStyle} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
});
