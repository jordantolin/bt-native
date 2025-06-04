import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import Bubble, { BubbleData } from '../components/Bubble';

const { width, height } = Dimensions.get('window');
const CENTER_X = width / 2;
const CENTER_Y = height / 2;
const BASE_ORBIT = 60;
const ORBIT_STEP = 50;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bubbles'>;

export default function BubblesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { supabase } = useAuth();
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);

  useEffect(() => {
    const loadBubbles = async () => {
      const { data, error } = await supabase
        .from('bubbles')
        .select('id, reflectionCount, label');
      if (error) {
        console.error('Errore caricamento bolle:', error);
        return;
      }
      const withOrbit = (data ?? []).map((item, idx) => ({
        id: item.id as string,
        label: (item as any).label ?? item.id,
        reflectionCount: item.reflectionCount ?? 0,
        orbitRadius: BASE_ORBIT + idx * ORBIT_STEP,
      }));
      setBubbles(withOrbit);
    };

    loadBubbles();
  }, []);

  return (
    <View style={styles.container}>
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          data={bubble}
          centerX={CENTER_X}
          centerY={CENTER_Y}
          onPress={(id) => navigation.navigate('Chat', { bubbleId: id })}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
});
