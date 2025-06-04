import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Text, Animated } from 'react-native';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import CreateBubbleModal, { NewBubble } from '../components/CreateBubbleModal';
import Bubble3D from '../components/Bubble3D';
import type { BubbleData } from '../components/Bubble';

const BASE_ORBIT = 60;
const ORBIT_STEP = 50;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bubbles'>;

export default function BubblesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { supabase } = useAuth();

  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(''));
  };

  useEffect(() => {
    const loadBubbles = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('bubbles')
        .select('id, name, reflectionCount, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Errore caricamento bolle:', error);
        return;
      }
      const withOrbit = (data ?? []).map((item, idx) => ({
        id: item.id as string,
        label: (item as any).name ?? (item as any).label ?? item.id,
        reflectionCount: (item as any).reflectionCount ?? 0,
        orbitRadius:
          BASE_ORBIT + idx * ORBIT_STEP + Math.random() * ORBIT_STEP * 0.4,
      }));
      setBubbles(withOrbit);
    };

    loadBubbles();

    const channel = supabase
      .channel('bubbles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bubbles' },
        (payload) => {
          const item: any = payload.new;
          const since = Date.now() - 24 * 60 * 60 * 1000;
          if (new Date(item.created_at).getTime() < since) return;
          setBubbles((prev) => {
            if (prev.some((b) => b.id === item.id)) return prev;
            return [
              ...prev,
              {
                id: item.id as string,
                label: item.label ?? item.name ?? item.id,
                reflectionCount: item.reflectionCount ?? 0,
                orbitRadius:
                  BASE_ORBIT +
                  prev.length * ORBIT_STEP +
                  Math.random() * ORBIT_STEP * 0.4,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Canvas
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        camera={{ position: [0, 0, 200], fov: 60 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#111"]} />
        <fog attach="fog" args={["#111", 100, 400]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={1} />
        <OrbitControls makeDefault enablePan enableZoom enableRotate maxPolarAngle={Math.PI} minPolarAngle={0} />
        {bubbles.map((bubble) => (
          <Bubble3D
            key={bubble.id}
            data={bubble}
            onPress={(id) => navigation.navigate('Chat', { bubbleId: id })}
          />
        ))}
      </Canvas>

      <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addText}>+</Text>
      </Pressable>

      <CreateBubbleModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(b: NewBubble) => {
          setBubbles((prev) => {
            if (prev.some((x) => x.id === b.id)) return prev;
            return [
              ...prev,
              {
                id: b.id,
                label: b.name,
                reflectionCount: b.reflectionCount ?? 0,
                orbitRadius:
                  BASE_ORBIT + prev.length * ORBIT_STEP + Math.random() * ORBIT_STEP * 0.4,
              },
            ];
          });
          showToast('Bolla creata!');
        }}
      />

      {toast ? (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  addButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffe46b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: '#111',
    fontSize: 32,
    lineHeight: 32,
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toastText: {
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

