import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import ThreeDWorld from '../components/ThreeDWorld';
import FloatingButtons from '../components/FloatingButtons';
import CreateBubbleModal, { CreateBubbleData } from '../components/CreateBubbleModal';

const DAY_MS = 24 * 60 * 60 * 1000;

type BubbleData = {
  id: string;
  name: string;
  topic: string;
  reflectionCount: number;
  createdAt: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bubbles'>;

export default function BubblesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [bubbles, setBubbles] = useState<BubbleData[]>(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: `bubble-${i}`,
      name: `Bubble ${i + 1}`,
      topic: 'Altro',
      reflectionCount: 0,
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
      reflectionCount: 0,
      createdAt: Date.now(),
    };
    setBubbles((prev) => [...prev, newBubble]);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ThreeDWorld
        bubbles={bubbles.map((b) => ({
          id: b.id,
          name: b.name,
          reflectionCount: b.reflectionCount,
          onPress: (id) => {
            setBubbles((prev) =>
              prev.map((p) =>
                p.id === id ? { ...p, reflectionCount: p.reflectionCount + 1 } : p
              )
            );
            setTimeout(() => navigation.navigate('Chat', { bubbleId: id }), 200);
          },
        }))}
      />
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
