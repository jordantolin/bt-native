import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
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
import BubbleComponent from '../components/Bubble';
import FloatingButtons from '../components/FloatingButtons';
import CreateBubbleModal from '../components/CreateBubbleModal';

const { width, height } = Dimensions.get('window');
const CENTER_X = width / 2;
const CENTER_Y = height / 2;
const BASE_SIZE = 40;
const DAY_MS = 24 * 60 * 60 * 1000;

type Bubble = {
  id: string;
  orbitCenter: { x: number; y: number };
  orbitRadius: Animated.SharedValue<number>;
  angle: Animated.SharedValue<number>;
  size: Animated.SharedValue<number>;
  reflectionCount: Animated.SharedValue<number>;
  glow: Animated.SharedValue<number>;
  createdAt: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bubbles'>;

function interpolateColor(count: number) {
  'worklet';
  const startR = 255;
  const startG = 249;
  const startB = 237;
  const endR = 255;
  const endG = 214;
  const endB = 0;
  const t = Math.min(count / 5, 1);
  const r = startR + (endR - startR) * t;
  const g = startG + (endG - startG) * t;
  const b = startB + (endB - startB) * t;
  return `rgb(${r}, ${g}, ${b})`;
}

function useCreateBubble(index: number): Bubble {
  const angle = useSharedValue(Math.random() * Math.PI * 2);
  const glow = useSharedValue(0);
  const orbitRadius = useSharedValue(60 + Math.random() * 100);
  const size = useSharedValue(BASE_SIZE);
  const reflectionCount = useSharedValue(0);

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
    orbitCenter: { x: CENTER_X, y: CENTER_Y },
    orbitRadius,
    angle,
    size,
    reflectionCount,
    glow,
    createdAt: Date.now(),
  };
}

function useBubbles(): Bubble[] {
  return Array.from({ length: 8 }, (_, i) => useCreateBubble(i));
}

export default function BubblesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const bubbles = useBubbles();
  const [modalVisible, setModalVisible] = useState(false);
  const [, setTick] = useState(0);

  // trigger rerenders to check expiration
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // simple collision avoidance
  useEffect(() => {
    const id = setInterval(() => {
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i];
          const b = bubbles[j];
          const ax = a.orbitCenter.x + a.orbitRadius.value * Math.cos(a.angle.value);
          const ay = a.orbitCenter.y + a.orbitRadius.value * Math.sin(a.angle.value);
          const bx = b.orbitCenter.x + b.orbitRadius.value * Math.cos(b.angle.value);
          const by = b.orbitCenter.y + b.orbitRadius.value * Math.sin(b.angle.value);
          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.size.value / 2 + b.size.value / 2;
          if (dist < minDist && dist > 0) {
            const force = (minDist - dist) * 0.15;
            const dirX = dx / dist;
            const dirY = dy / dist;
            const axNew = ax + dirX * force;
            const ayNew = ay + dirY * force;
            const bxNew = bx - dirX * force;
            const byNew = by - dirY * force;
            a.orbitRadius.value = Math.sqrt(
              Math.pow(axNew - a.orbitCenter.x, 2) +
                Math.pow(ayNew - a.orbitCenter.y, 2)
            );
            b.orbitRadius.value = Math.sqrt(
              Math.pow(bxNew - b.orbitCenter.x, 2) +
                Math.pow(byNew - b.orbitCenter.y, 2)
            );
            a.angle.value = Math.atan2(ayNew - a.orbitCenter.y, axNew - a.orbitCenter.x);
            b.angle.value = Math.atan2(byNew - b.orbitCenter.y, bxNew - b.orbitCenter.x);
          }
        }
      }
    }, 50);
    return () => clearInterval(id);
  }, [bubbles]);

  return (
    <View style={styles.container}>
      {bubbles.map((bubble) => {
        const isExpired = Date.now() - bubble.createdAt > DAY_MS;
        if (isExpired) {
          return null;
        }

        const animatedStyle = useAnimatedStyle(() => {
          const x =
            bubble.orbitCenter.x +
            bubble.orbitRadius.value * Math.cos(bubble.angle.value);
          const y =
            bubble.orbitCenter.y +
            bubble.orbitRadius.value * Math.sin(bubble.angle.value);
          const size = bubble.size.value + bubble.glow.value;
          return {
            transform: [
              { translateX: x - size / 2 },
              { translateY: y - size / 2 },
            ],
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: interpolateColor(bubble.reflectionCount.value),
            opacity: 0.85,
            position: 'absolute',
            shadowColor: '#FFD600',
            shadowOpacity: 0.4,
            shadowRadius: 6,
            elevation: 4,
          };
        });

        return (
          <BubbleComponent
            key={bubble.id}
            id={bubble.id}
            orbitCenter={bubble.orbitCenter}
            orbitRadius={bubble.orbitRadius}
            angle={bubble.angle}
            size={bubble.size}
            reflectionCount={bubble.reflectionCount}
            glow={bubble.glow}
            colorForCount={interpolateColor}
            onPress={() => {
              bubble.reflectionCount.value += 1;
              bubble.size.value =
                BASE_SIZE + bubble.reflectionCount.value * 8;
              bubble.glow.value = withSequence(
                withTiming(12, { duration: 120 }),
                withTiming(0, { duration: 200 })
              );
              setTimeout(() => {
                navigation.navigate('Chat', { bubbleId: bubble.id });
              }, 200);
            }}
          />
        );
      })}
      <CreateBubbleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={() => setModalVisible(false)}
      />
      <FloatingButtons
        onLeftPress={() => navigation.navigate('TopBubbles')}
        onRightPress={() => setModalVisible(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
});
