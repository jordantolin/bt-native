import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Text, Animated } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import CreateBubbleModal, { NewBubble } from '../components/CreateBubbleModal';
import type { BubbleData } from '../components/Bubble';

type OrbitBubble = {
  data: BubbleData;
  mesh: THREE.Mesh;
  angle: number;
  speed: number;
  labelPos: Animated.ValueXY;
};

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

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const orbitsRef = useRef<OrbitBubble[]>([]);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const [, setTick] = useState(0);

  const createOrbitBubble = (data: BubbleData): OrbitBubble => {
    const radius = 1 + Math.min(data.reflectionCount, 20) / 10;
    const color = new THREE.Color(`hsl(48,100%,${80 - data.reflectionCount * 2}%)`);
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.01, 0.01, 0.01);
    const labelPos = new Animated.ValueXY({ x: 0, y: 0 });
    return {
      data,
      mesh,
      angle: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.1,
      labelPos,
    };
  };

  const handleContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    sizeRef.current = { width, height };
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111');
    scene.fog = new THREE.Fog('#111', 100, 400);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 200;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const light = new THREE.PointLight(0xffffff, 1);
    scene.add(light);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    orbitsRef.current = bubbles.map((b) => {
      const ob = createOrbitBubble(b);
      scene.add(ob.mesh);
      return ob;
    });
    setTick((t) => t + 1);

    const vec = new THREE.Vector3();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      orbitsRef.current.forEach((o) => {
        if (o.mesh.scale.x < 1) {
          const s = Math.min(1, o.mesh.scale.x + 0.05);
          o.mesh.scale.set(s, s, s);
        }
        o.angle += o.speed * 0.01;
        const x = o.data.orbitRadius * Math.cos(o.angle);
        const z = o.data.orbitRadius * Math.sin(o.angle);
        const y = Math.sin(o.angle * 0.5) * 5;
        o.mesh.position.set(x, y, z);

        o.mesh.getWorldPosition(vec);
        vec.project(camera);
        const sx = (vec.x + 1) / 2 * sizeRef.current.width;
        const sy = (-vec.y + 1) / 2 * sizeRef.current.height;
        o.labelPos.setValue({ x: sx, y: sy });
      });
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  useEffect(() => {
    if (!sceneRef.current) return;
    const existing = new Set(orbitsRef.current.map((o) => o.data.id));
    bubbles.forEach((b) => {
      if (!existing.has(b.id)) {
        const ob = createOrbitBubble(b);
        sceneRef.current!.add(ob.mesh);
        orbitsRef.current.push(ob);
        setTick((t) => t + 1);
      }
    });
  }, [bubbles]);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

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
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={handleContextCreate}
        onLayout={(e) => {
          sizeRef.current = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}
      />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {orbitsRef.current.map((o) => (
          <Animated.Text
            key={o.data.id}
            style={[
              styles.label,
              {
                transform: [
                  { translateX: o.labelPos.x },
                  { translateY: o.labelPos.y },
                ],
              },
            ]}
          >
            {o.data.label}
          </Animated.Text>
        ))}
      </View>

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
  label: {
    position: 'absolute',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

