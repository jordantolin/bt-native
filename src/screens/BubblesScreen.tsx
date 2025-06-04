import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import Bubble from '../components/Bubble';
import FloatingButtons from '../components/FloatingButtons';
import CreateBubbleModal, { CreateBubbleData } from '../components/CreateBubbleModal';

const { width, height } = Dimensions.get('window');
const CENTER_X = width / 2;
const CENTER_Y = height / 2;
const BASE_SIZE = 40;
const DAY_MS = 24 * 60 * 60 * 1000;

type BubbleData = {
  id: string;
  name: string;
  topic: string;
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

export default function BubblesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [bubbles, setBubbles] = useState<BubbleData[]>(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: `bubble-${i}`,
      name: `Bubble ${i + 1}`,
      topic: 'Altro',
      createdAt: Date.now(),
    }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setBubbles((prev) => prev.filter((b) => Date.now() - b.createdAt <= DAY_MS));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const handleCreate = (data: CreateBubbleData) => {
    const newBubble: BubbleData = {
      id: `bubble-${Date.now()}`,
      name: data.name,
      topic: data.topic,
      createdAt: Date.now(),
    };
    setBubbles((prev) => [...prev, newBubble]);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          id={bubble.id}
          baseSize={BASE_SIZE}
          orbitCenter={{ x: CENTER_X, y: CENTER_Y }}
          colorForCount={interpolateColor}
          onPress={(id) => {
            setTimeout(() => navigation.navigate('Chat', { bubbleId: id }), 200);
          }}
        />
      ))}
      <CreateBubbleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreate}
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
    backgroundColor: '#111',
  },
});
